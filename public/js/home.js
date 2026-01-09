import { supabase } from './lib/supabase.js'

// Elements
const featuredGrid = document.getElementById('featured-products-grid')
const categoryShowcase = document.getElementById('category-showcase')
const testimonialsContainer = document.getElementById('testimonials-slider')

async function initHome() {
    loadFeaturedProducts()
    loadCategoryShowcase()
    loadFeaturedTestimonials()
    initStatsCounter()
}

// Load products marked as featured
async function loadFeaturedProducts() {
    if (!featuredGrid) return

    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_featured', true)
            .limit(6)

        if (error) throw error

        if (!products || products.length === 0) {
            featuredGrid.innerHTML = '<p class="col-span-full text-center text-gray-400 py-10">No featured masterpieces at the moment.</p>'
            return
        }

        featuredGrid.innerHTML = products.map(product => `
            <div class="product-card group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col scroll-reveal">
                <div class="relative aspect-[4/5] overflow-hidden cursor-pointer" onclick="goToProduct('${product.id}')">
                    <img src="${product.image_url}" alt="${product.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                    <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span class="bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform">View Masterpiece</span>
                    </div>
                </div>
                <div class="p-6 flex-grow flex flex-col text-center">
                    <h3 class="text-lg font-medium text-gray-900 mb-2">${product.name}</h3>
                    <p class="text-amber-700 font-semibold mb-4">$${product.price}</p>
                    <button onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image_url}')" 
                        class="mt-auto w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-amber-700 transition active:scale-95">
                        Add to Collection
                    </button>
                </div>
            </div>
        `).join('')

        // Initialize reveal animations for new items
        if (window.initScrollReveal) window.initScrollReveal()
    } catch (err) {
        console.error('Error loading featured products:', err)
    }
}

// Load categories for visual grid
async function loadCategoryShowcase() {
    if (!categoryShowcase) return

    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true })
            .limit(4)

        if (error) throw error

        categoryShowcase.innerHTML = categories.map(cat => `
            <div class="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer scroll-reveal" onclick="goToCategory('${cat.id}')">
                <img src="${cat.image_url || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80'}" alt="${cat.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
                    <h3 class="text-2xl font-light mb-2">${cat.name}</h3>
                    <p class="text-sm text-gray-300 font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300">Explore Collection →</p>
                </div>
            </div>
        `).join('')

        // Initialize reveal animations for new items
        if (window.initScrollReveal) window.initScrollReveal()
    } catch (err) {
        console.error('Error loading categories:', err)
    }
}

// Load featured testimonials
async function loadFeaturedTestimonials() {
    if (!testimonialsContainer) return

    try {
        const { data: testimonials, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('is_featured', true)
            .limit(5)

        if (error) throw error

        if (!testimonials || testimonials.length === 0) {
            testimonialsContainer.innerHTML = '<p class="text-center text-gray-400">Voices of our patrons will appear here soon.</p>'
            return
        }

        const dotsContainer = document.getElementById('testimonial-dots')

        testimonialsContainer.innerHTML = testimonials.map(t => `
            <div class="testimonial-slide min-w-full px-4 md:px-20 text-center">
                <div class="flex justify-center mb-6">
                    <div class="flex text-amber-500 text-xl">
                        ${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}
                    </div>
                </div>
                <p class="text-xl md:text-2xl font-light text-gray-700 italic mb-8 leading-relaxed">"${t.review_text}"</p>
                <div class="flex flex-col items-center">
                    <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mb-4 border-2 border-amber-100">
                        <img src="${t.customer_photo_url || 'https://via.placeholder.com/64'}" alt="${t.customer_name}" class="w-full h-full object-cover">
                    </div>
                    <h4 class="text-gray-900 font-medium">${t.customer_name}</h4>
                    <p class="text-amber-800 text-xs tracking-widest uppercase mt-1">Authentic Patron</p>
                </div>
            </div>
        `).join('')

        // Dots
        if (dotsContainer) {
            dotsContainer.innerHTML = testimonials.map((_, i) => `
                <button class="testimonial-dot w-2 h-2 rounded-full bg-amber-200 transition-all ${i === 0 ? 'bg-amber-800 w-4' : ''}" 
                        onclick="scrollToSlide(${i})"></button>
            `).join('')
        }

        // Simple Carousel Logic
        let currentSlide = 0
        window.scrollToSlide = (index) => {
            currentSlide = index
            testimonialsContainer.scrollTo({
                left: testimonialsContainer.offsetWidth * currentSlide,
                behavior: 'smooth'
            })
            // Update dots
            document.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
                dot.classList.toggle('bg-amber-800', i === index)
                dot.classList.toggle('w-4', i === index)
                dot.classList.toggle('bg-amber-200', i !== index)
                dot.classList.toggle('w-2', i !== index)
            })
        }

        setInterval(() => {
            scrollToSlide((currentSlide + 1) % testimonials.length)
        }, 8000)

    } catch (err) {
        console.error('Error loading testimonials:', err)
    }
}

// Stats counter animation
function initStatsCounter() {
    const statsSection = document.getElementById('impact-stats')
    if (!statsSection) return

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            animateCounters()
            observer.disconnect()
        }
    }, { threshold: 0.5 })

    observer.observe(statsSection)
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const updateCount = () => {
            const targetAttr = counter.getAttribute('data-target');
            if (!targetAttr || targetAttr === '0') {
                // If data isn't loaded yet, check again in a bit
                setTimeout(updateCount, 100);
                return;
            }

            const target = +targetAttr;
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const update = () => {
                current += step;
                if (current < target) {
                    counter.innerText = Math.round(current);
                    requestAnimationFrame(update);
                } else {
                    counter.innerText = target + (counter.getAttribute('data-suffix') || '');
                }
            };
            update();
        };
        updateCount();
    });
}

// Navigation helpers
window.goToProduct = (id) => {
    window.location.href = `product-detail.html?id=${id}`
}

window.goToCategory = (id) => {
    window.location.href = `products.html?category=${id}`
}

// Start
initHome()
