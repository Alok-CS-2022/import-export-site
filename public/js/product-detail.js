// All data now loaded through APIs

// Elements
const detailContainer = document.getElementById('product-detail-container')
const relatedContainer = document.getElementById('related-products')
const breadcrumbCurrent = document.getElementById('breadcrumb-current')

// Get ID from URL
const urlParams = new URLSearchParams(window.location.search)
const productId = urlParams.get('id')

async function initProductDetail() {
    if (!productId) {
        window.location.href = 'products.html'
        return
    }

    try {
        // Fetch Product
        const response = await fetch(`/api/products/${productId}`)
        if (!response.ok) {
            if (response.status === 404) throw new Error('Product not found')
            throw new Error('Failed to load product')
        }
        
        const product = await response.json()

        renderProduct(product)
        loadRelatedProducts(product.category_id, product.id)

        // Update Meta Tags (Title)
        document.title = `${product.name} | Import From Nepal`
        breadcrumbCurrent.textContent = product.name
    } catch (err) {
        console.error('Error:', err)
        detailContainer.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <p class="text-red-500 text-xl mb-6">Masterpiece not found in our current archives.</p>
                <a href="products.html" class="bg-amber-700 text-white px-8 py-3 rounded-xl hover:bg-amber-800 transition">Back to Catalog</a>
            </div>
        `
    }
}

function renderProduct(product) {
    const categoryName = product.category_name || 'Artisan Work'

    detailContainer.innerHTML = `
        <!-- Image Showcase -->
        <div class="space-y-6">
            <div class="premium-shadow rounded-3xl overflow-hidden bg-white aspect-square flex items-center justify-center">
                <img src="${product.image_url}" alt="${product.name}" class="w-full h-full object-cover">
            </div>
            ${product.is_featured ? `
                <div class="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
                    <span class="text-xl">⭐</span>
                    <p class="text-amber-900 text-sm font-light">This is a <strong>Featured Selection</strong> - hand-picked for its exceptional craftsmanship.</p>
                </div>
            ` : ''}
        </div>

        <!-- Information -->
        <div class="flex flex-col">
            <span class="text-amber-700 font-semibold tracking-widest uppercase text-xs mb-4">${categoryName}</span>
            <h1 class="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight">${product.name}</h1>
            
            <div class="flex items-center gap-6 mb-8">
                <span class="text-3xl font-semibold text-amber-700">$${product.price}</span>
                <div class="h-8 w-px bg-gray-200"></div>
                <div class="flex items-center text-green-600 text-sm font-medium">
                    <span class="mr-1">●</span> Available for Import
                </div>
            </div>

            <div class="prose prose-amber max-w-none text-gray-600 font-light leading-relaxed mb-10 text-lg">
                ${product.description.split('\n').map(p => `<p class="mb-4">${p}</p>`).join('')}
            </div>

            <div class="mt-auto space-y-4">
                <button onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image_url}')" 
                    class="w-full bg-gray-900 text-white py-5 rounded-2xl font-medium shadow-xl hover:bg-amber-700 transition transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    Add to Collection
                </button>
                <button onclick="openProductInquiry('${product.name}')" class="w-full bg-white border-2 border-gray-900 text-gray-900 py-5 rounded-2xl font-medium hover:bg-gray-50 transition flex items-center justify-center gap-3">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    Direct Inquiry
                </button>
            </div>

            <!-- Trust Signals -->
            <div class="grid grid-cols-2 gap-4 mt-12 pt-12 border-t border-gray-100">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">⛰️</div>
                    <div>
                        <p class="text-xs font-semibold text-gray-900 uppercase tracking-tighter">Authentic</p>
                        <p class="text-[10px] text-gray-500">Direct From Source</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">🔨</div>
                    <div>
                        <p class="text-xs font-semibold text-gray-900 uppercase tracking-tighter">Handcrafted</p>
                        <p class="text-[10px] text-gray-500">Master Artisanly</p>
                    </div>
                </div>
            </div>
        </div>
    `
}

async function loadRelatedProducts(categoryId, currentId) {
    try {
        const response = await fetch(`/api/products?category=${categoryId}&limit=4`)
        if (!response.ok) throw new Error('Failed to load related products')
        
        const allRelated = await response.json()
        
        // Filter out current product from related products
        const related = allRelated.filter(p => p.id !== currentId).slice(0, 4)

        if (!related || related.length === 0) {
            relatedContainer.innerHTML = `<p class="text-gray-400 font-light">Explore our other categories for more treasures.</p>`
            return
        }

        relatedContainer.innerHTML = related.map(p => `
            <div class="related-card group cursor-pointer" onclick="goToProduct('${p.id}')">
                <div class="aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 mb-4">
                    <img src="${p.image_url}" alt="${p.name}" class="w-full h-full object-cover transition-transform duration-500">
                </div>
                <h3 class="text-gray-900 font-medium line-clamp-1 group-hover:text-amber-700 transition">${p.name}</h3>
                <p class="text-amber-700 font-semibold">$${p.price}</p>
            </div>
        `).join('')
    } catch (err) {
        console.error('Related error:', err)
    }
}

window.goToProduct = (id) => {
    window.location.href = `product-detail.html?id=${id}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

window.openProductInquiry = (name) => {
    const messageField = document.getElementById('inquiry-message')
    if (messageField) {
        messageField.value = `Hello, I am interested in the "${name}". Could you please provide more information about importing this masterpiece?`
    }
    openInquiryModal()
}

// Start
initProductDetail()
