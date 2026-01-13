import { supabase } from '../lib/supabase.js'

// Elements
const featuredGrid = document.getElementById('featured-products-grid')
const categoryShowcase = document.getElementById('category-showcase')
const testimonialsContainer = document.getElementById('testimonials-slider')

async function initHome() {
    loadFeaturedProducts()
    loadHeritageSlider()
    loadCategoryShowcase()  // ADD THIS LINE
    loadFeaturedTestimonials()
    initStatsCounter()
}

// Load products for the heritage spotlight slider
async function loadHeritageSlider() {
    const container = document.getElementById('heritage-carousel')
    if (!container) return

    try {
        // Try to get featured products first, then fallback to any 5 products
        let { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_featured', true)
            .limit(5)

        if (!error && products && products.length > 0) {
            renderHeritageSlides(products);
        } else {
            // Fallback: try latest products if no featured
            const { data: latest, error: latestError } = await supabase.from('products').select('*').limit(5);
            if (!latestError && latest && latest.length > 0) {
                renderHeritageSlides(latest);
            }
            // If still no products, we just leave the default placeholder already in HTML
        }
    } catch (err) {
        console.error('Error loading heritage slider:', err);
        // On error, let the static placeholder show
    }
}

function renderHeritageSlides(products) {
    const container = document.getElementById('heritage-carousel');
    if (!container || !products.length) return;

    container.innerHTML = products.map(product => `
        <div class="bg-[#1C1C1C] rounded-[3rem] overflow-hidden flex flex-col lg:flex-row items-stretch min-h-[500px]">
            <div class="lg:w-5/12 relative min-h-[300px] lg:min-h-full">
                <img src="${product.image_url}" alt="${product.name}" class="absolute inset-0 w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent lg:hidden"></div>
            </div>
            <div class="lg:w-7/12 p-8 lg:p-16 flex flex-col justify-center">
                <div class="max-w-xl">
                    <span class="text-amber-500 font-medium tracking-widest uppercase text-xs sm:text-sm">Artisan Heritage</span>
                    <h2 class="text-3xl lg:text-5xl font-light text-white mt-4 mb-6 leading-tight">${product.name}</h2>
                    <p class="text-gray-400 font-light text-sm sm:text-base mb-10 leading-relaxed line-clamp-4">
                        ${product.description || 'Discover this authentic masterpiece directly from the heart of the Himalayas. Every piece supports local artisan communities and keeps ancient traditions alive.'}
                    </p>
                    <div class="flex flex-wrap items-center gap-6">
                        <a href="product-detail.html?id=${product.id}" class="inline-block bg-amber-600 text-white px-8 py-4 rounded-full hover:bg-amber-700 transition shadow-lg text-sm sm:text-base font-medium">View Masterpiece</a>
                        <div class="flex flex-col">
                            <span class="text-xs text-amber-500/60 uppercase tracking-widest">Investment</span>
                            <span class="text-2xl font-light text-amber-200">$${product.price}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Add the owl-carousel class and init
    container.classList.add('owl-carousel');

    if (typeof $ !== 'undefined' && $.fn.owlCarousel) {
        $(container).owlCarousel({
            items: 1,
            loop: products.length > 1,
            autoplay: products.length > 1,
            autoplayTimeout: 6000,
            autoplayHoverPause: true,
            nav: false,
            dots: true,
            smartSpeed: 1000,
            animateOut: 'fadeOut'
        });
    }
}

// Load categories from content management
async function loadCategoryShowcase() {
    const container = document.getElementById('category-showcase');
    if (!container) return;

    // Check if categories are loaded from content management
    if (window.contentCategories && window.contentCategories.length > 0) {
        const categories = window.contentCategories.slice(0, 4); // Max 4 categories
        container.innerHTML = categories.map(cat => `
            <div class="group cursor-pointer scroll-reveal" onclick="goToCategory('${escapeHtml(cat.id || '')}')">
                <div class="aspect-square rounded-3xl overflow-hidden mb-6 shadow-md group-hover:shadow-2xl transition-all duration-500">
                    <img src="${escapeHtml(cat.imageUrl || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=90')}" 
                        alt="${escapeHtml(cat.name || '')}"
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onerror="this.src='https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=90'">
                </div>
                <h3 class="text-xl font-light text-gray-900 group-hover:text-amber-800 transition-colors text-center">${escapeHtml(cat.name || '')}</h3>
            </div>
        `).join('');
        if (window.initScrollReveal) window.initScrollReveal();
        return;
    }

    // Fallback: try to load from database
    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('display_order')
            .limit(4);

        if (error) throw error;

        if (categories && categories.length > 0) {
            container.innerHTML = categories.map(cat => `
                <div class="group cursor-pointer scroll-reveal" onclick="goToCategory('${cat.id}')">
                    <div class="aspect-square rounded-3xl overflow-hidden mb-6 shadow-md group-hover:shadow-2xl transition-all duration-500">
                        <img src="${cat.image_url || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=90'}" 
                            alt="${cat.name}"
                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onerror="this.src='https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=90'">
                    </div>
                    <h3 class="text-xl font-light text-gray-900 group-hover:text-amber-800 transition-colors text-center">${cat.name}</h3>
                </div>
            `).join('');
            if (window.initScrollReveal) window.initScrollReveal();
        }
    } catch (err) {
        console.error('Error loading categories:', err);
    }
}

// Load products marked as featured
async function loadFeaturedProducts() {
    if (!featuredGrid) return

    const defaultProducts = [
        { id: '1', name: 'Masterpiece Mandala Thangka', price: 1200, image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80' },
        { id: '2', name: 'Hand-Hammered Full Moon Singing Bowl', price: 450, image_url: 'https://images.unsplash.com/photo-1599458319801-443b73259966?w=800&q=80' },
        { id: '3', name: 'Gilded Shakyamuni Buddha Statue', price: 2800, image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80' }
    ];

    const renderProducts = (products) => {
        featuredGrid.innerHTML = products.map(product => `
            <div class="product-card group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col scroll-reveal hover:shadow-xl transition-all duration-500">
                <div class="relative aspect-[4/5] overflow-hidden cursor-pointer" onclick="goToProduct('${product.id}')">
                    <img src="${product.image_url}" alt="${product.name}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110">
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span class="bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">View Masterpiece</span>
                    </div>
                </div>
                <div class="p-6 flex-grow flex flex-col text-center">
                    <h3 class="text-lg font-light text-gray-900 mb-2">${product.name}</h3>
                    <div class="w-8 h-px bg-amber-200 mx-auto mb-4 transition-all duration-500 group-hover:w-16"></div>
                    <p class="text-amber-800 font-semibold mb-5">$${product.price}</p>
                    <button onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image_url}')" 
                        class="mt-auto w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-amber-700 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        Add to Collection
                    </button>
                </div>
            </div>
        `).join('')
        if (window.initScrollReveal) window.initScrollReveal()
    }

    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_featured', true)
            .limit(6)

        if (error) throw error

        if (!products || products.length === 0) {
            renderProducts(defaultProducts)
        } else {
            renderProducts(products)
        }
    } catch (err) {
        console.warn('Supabase fetch failed, using fallback products:', err)
        renderProducts(defaultProducts)
    }
}

// Load featured testimonials
async function loadFeaturedTestimonials() {
    const container = document.getElementById('testimonials-grid')
    if (!container) return

    // Check if testimonials are loaded from content management
    if (window.contentTestimonials && window.contentTestimonials.length > 0) {
        container.innerHTML = window.contentTestimonials.map(t => `
            <div class="p-8 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-500 scroll-reveal">
                <div class="flex text-amber-500 mb-4">
                    ${'★'.repeat(t.rating || 5)}${'☆'.repeat(5 - (t.rating || 5))}
                </div>
                <p class="text-gray-700 italic mb-6 leading-relaxed">"${escapeHtml(t.reviewText || '')}"</p>
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full overflow-hidden bg-amber-50 flex items-center justify-center text-amber-800 font-bold border border-amber-100">
                        ${t.customerPhotoUrl ? `<img src="${escapeHtml(t.customerPhotoUrl)}" alt="${escapeHtml(t.customerName)}" class="w-full h-full object-cover">` : (t.customerName || '').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <h4 class="text-gray-900 font-medium">${escapeHtml(t.customerName || '')}</h4>
                        <p class="text-amber-800 text-xs tracking-widest uppercase">Verified Collector</p>
                    </div>
                </div>
            </div>
        `).join('');
        if (window.initScrollReveal) window.initScrollReveal();
        return;
    }

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

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
