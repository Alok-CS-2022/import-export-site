import { supabase } from './lib/supabase.js'

// Elements
const featuredGrid = document.getElementById('featured-products-grid')
const categoryShowcase = document.getElementById('category-showcase')
const testimonialsContainer = document.getElementById('testimonials-slider')

async function initHome() {
    loadFeaturedProducts()
    loadCategoryShowcase()
    loadHeritageSlider()
    loadFeaturedTestimonials()
    initStatsCounter()
}

// Load products for the heritage spotlight slider
async function loadHeritageSlider() {
    const slider = document.getElementById('heritage-mini-slider')
    if (!slider) return

    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .limit(10)

        if (error) throw error

        const productHTML = products.map(product => `
            <div class="mini-marquee-card cursor-pointer" onclick="window.location.href='product-detail.html?id=${product.id}'">
                <img src="${product.image_url}" alt="${product.name}" class="w-12 h-12 rounded-lg object-cover shadow-sm">
                <div class="min-w-0">
                    <h4 class="text-[10px] sm:text-xs font-semibold text-white truncate">${product.name}</h4>
                    <p class="text-[10px] sm:text-xs text-amber-500 font-medium">$${product.price}</p>
                </div>
            </div>
        `).join('')

        // Duplicate for seamless infinite loop
        slider.innerHTML = productHTML + productHTML
    } catch (err) {
        console.error('Error loading heritage slider:', err)
    }
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
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <h3 class="text-2xl font-light mb-2">${cat.name}</h3>
                    <p class="text-sm text-gray-300 font-light">Explore Collection →</p>
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
    const container = document.getElementById('testimonials-grid')
    if (!container) return

    try {
        const { data: testimonials, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('is_featured', true)
            .limit(2)

        if (error) throw error

        if (testimonials && testimonials.length > 0) {
            container.innerHTML = testimonials.map(t => `
                <div class="p-8 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-500 scroll-reveal">
                    <div class="flex text-amber-500 mb-4">
                        ${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}
                    </div>
                    <p class="text-gray-700 italic mb-6 leading-relaxed">"${t.review_text}"</p>
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full overflow-hidden bg-amber-50 flex items-center justify-center text-amber-800 font-bold border border-amber-100">
                            ${t.customer_photo_url ? `<img src="${t.customer_photo_url}" alt="${t.customer_name}" class="w-full h-full object-cover">` : t.customer_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <h4 class="text-gray-900 font-medium">${t.customer_name}</h4>
                            <p class="text-amber-800 text-xs tracking-widest uppercase">Verified Collector</p>
                        </div>
                    </div>
                </div>
            `).join('')
        }
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
        const targetAttr = counter.getAttribute('data-target');
        if (!targetAttr) return;

        const target = parseFloat(targetAttr);
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 2000;
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = progress * target;
            counter.innerText = (target % 1 === 0 ? Math.floor(current) : current.toFixed(1)) + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.innerText = target + suffix;
            }
        };

        requestAnimationFrame(update);
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
