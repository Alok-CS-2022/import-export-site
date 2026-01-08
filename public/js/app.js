

        let currentProduct = null
        window.allProducts = []
        let allProducts = []
        let allCategories = new Set()

        const mobileMenuBtn = document.getElementById('mobile-menu-btn')
        const mobileMenu = document.getElementById('mobile-menu')
        
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden')
        })

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden')
            })
        })

        async function loadProducts() {
            const grid = document.getElementById('products-grid')
            
            // Show Skeleton Loading State
            const skeletonHTML = Array(6).fill(0).map(() => `
                <div class="bg-white rounded-xl overflow-hidden shadow-lg h-full border border-gray-100">
                    <div class="aspect-square skeleton w-full"></div>
                    <div class="p-6 space-y-3">
                        <div class="h-3 skeleton w-1/3 rounded-full"></div>
                        <div class="h-6 skeleton w-3/4 rounded-lg"></div>
                        <div class="h-4 skeleton w-1/2 rounded-full"></div>
                        <div class="pt-4 flex gap-2">
                            <div class="h-10 skeleton flex-1 rounded-lg"></div>
                            <div class="h-10 skeleton flex-1 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            `).join('');
            grid.innerHTML = skeletonHTML;
            
            try {
                const response = await fetch('/api/products');
                const data = await response.json();

                if (!response.ok) {
                    grid.innerHTML = `<p class="col-span-full text-center text-red-500 text-sm sm:text-base">Error loading products: ${data.error}. Please try again later.</p>`;
                    return;
                }

                if (!data || data.length === 0) {
                    grid.innerHTML = '<p class="col-span-full text-center text-gray-500 text-sm sm:text-base">No products available yet. Check back soon!</p>';
                    return;
                }
                window.allProducts = data
                allProducts = data
                
                allCategories.clear()
                data.forEach(product => {
                    if (product.category) {
                        allCategories.add(product.category)
                    }
                })
                
                buildCategoryButtons()
                displayProducts(data)
            } catch (err) {
                console.error('Error loading products:', err)
                grid.innerHTML = '<p class="col-span-full text-center text-red-500">Error loading products.</p>'
            }
        }

        function buildCategoryButtons() {
            const container = document.getElementById('category-container')
            
            let buttonsHTML = `
                <button onclick="filterByCategory('all')" 
                        class="category-btn active px-4 sm:px-6 py-2 rounded-full font-medium text-sm sm:text-base transition">
                    All Products
                </button>
            `
            
            allCategories.forEach(category => {
                buttonsHTML += `
                    <button onclick="filterByCategory('${escapeHtml(category)}')" 
                            class="category-btn px-4 sm:px-6 py-2 rounded-full font-medium text-sm sm:text-base transition">
                        ${escapeHtml(category)}
                    </button>
                `
            })
            
            container.innerHTML = buttonsHTML
        }

        window.filterByCategory = function(category) {
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active')
            })
            event.target.classList.add('active')
            
            if (category === 'all') {
                displayProducts(allProducts)
            } else {
                const filtered = allProducts.filter(p => p.category === category)
                displayProducts(filtered)
            }
        }

window.displayProducts = function(products) {
    const grid = document.getElementById('products-grid')
    
    if (products.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center text-gray-500 text-sm sm:text-base">No products in this category yet.</p>'
        return
    }

    grid.innerHTML = products.map((product, index) => {
        // Determine if this should be a featured large card (every 7th item)
        const isFeatured = index % 7 === 0 && index !== 0
        const cardClasses = isFeatured ? 'md:col-span-2 lg:col-span-2' : ''
        
        return `
        <div class="scroll-reveal ${cardClasses}">
            <div class="product-card-3d product-glow group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer h-full"
                 data-product-id="${product.id}">
                
                <!-- Image Container with Zoom Effect -->
                <div class="image-zoom-container relative ${isFeatured ? 'aspect-[16/9]' : 'aspect-square'} bg-gradient-to-br from-stone-50 to-stone-100 overflow-hidden">
                    <img src="${escapeHtml(product.image_url)}" 
                         alt="${escapeHtml(product.name)}" 
                         class="image-zoom w-full h-full object-cover"
                         onerror="this.src='https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=800&fit=crop&q=90'">
                    
                    <!-- Gradient Overlay on Hover -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <!-- Floating Wishlist Heart -->
                    <button onclick="event.stopPropagation(); toggleWishlist('${product.id}', '${escapeHtml(product.name).replace(/'/g, "\'")}', '${escapeHtml(product.image_url)}')" 
                            class="wishlist-btn magnetic absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300 z-20"
                            data-product-id="${product.id}">
                        <svg class="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors wishlist-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                    </button>
                    
                    <!-- Hover: View Details Button (Animated) -->
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <button onclick='window.openProductDetail(${JSON.stringify(product).replace(/'/g, "&#39;")})' 
                                class="magnetic bg-white text-gray-900 px-8 py-3 rounded-full font-normal text-sm shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                            View Details
                        </button>
                    </div>
                </div>

                <!-- Product Info -->
                <div class="p-6 ${isFeatured ? 'lg:p-8' : ''}">
                    <div class="text-center">
                        <!-- Category -->
                        <p class="text-xs tracking-widest uppercase text-amber-700 mb-2 font-light">
                            ${escapeHtml(product.category)}
                        </p>
                        
                        <!-- Product Name -->
                        <h3 class="font-light text-gray-900 ${isFeatured ? 'text-2xl lg:text-3xl' : 'text-lg'} mb-3 leading-tight group-hover:text-amber-800 transition-colors duration-300"
                            onclick='window.openProductDetail(${JSON.stringify(product).replace(/'/g, "&#39;")})'>
                            ${escapeHtml(product.name)}
                        </h3>

                        <p class="text-xl font-bold text-amber-800 mb-4">${product.price ? `$${product.price.toFixed(2)}` : ''}</p>

                        <!-- Description (only for featured) -->
                        ${isFeatured ? `
                        <p class="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed font-light">
                            ${escapeHtml(product.description)}
                        </p>
                        ` : ''}

                        <div class="flex flex-col sm:flex-row gap-2">
                            <button onclick='window.addToCart("${product.id}", "${escapeHtml(product.name).replace(/'/g, "\\'")}", ${product.price}, "${escapeHtml(product.image_url)}")'
                                    class="magnetic flex-1 bg-amber-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-800 transition">
                                Add to Cart
                            </button>
                            <!-- View Link -->
                            <button onclick='window.openProductDetail(${JSON.stringify(product).replace(/'/g, "&#39;")})' 
                                    class="magnetic flex-1 inline-flex items-center justify-center gap-2 text-sm text-amber-700 hover:text-amber-900 font-normal transition-all duration-300 group/link">
                                <span>Details</span>
                                <svg class="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `
    }).join('')
    
    // Initialize scroll animations
    initScrollReveal()
    
    // Initialize 3D card tilt
    init3DCards()
    
    // Initialize magnetic effect
    initMagnetic()
    
    // Mark wishlist items
    markWishlistItems()
}

        function escapeHtml(text) {
            const div = document.createElement('div')
            div.textContent = text
            return div.innerHTML
        }

        window.openProductDetail = function(product) {
            currentProduct = product
            document.getElementById('detail-product-name').textContent = product.name
            document.getElementById('detail-product-image').src = product.image_url
            document.getElementById('detail-product-image').alt = product.name
            document.getElementById('detail-product-category').textContent = product.category
            document.getElementById('detail-product-description').textContent = product.description

            const priceInfoEl = document.getElementById('detail-product-price-info');
            if (product.price) {
                priceInfoEl.innerHTML = `
                    <p class="text-3xl font-bold text-amber-800">$${product.price.toFixed(2)}</p>
                    <p class="text-sm text-gray-500">plus shipping & taxes</p>
                `;
                document.getElementById('request-quote-btn').classList.add('hidden');
                document.getElementById('add-to-cart-btn').classList.remove('hidden');
            } else {
                priceInfoEl.innerHTML = `
                    <p class="text-lg font-semibold text-gray-700">Custom Pricing</p>
                    <p class="text-sm text-gray-500">Each piece is unique. Request a quote for pricing.</p>
                `;
                document.getElementById('request-quote-btn').classList.remove('hidden');
                document.getElementById('add-to-cart-btn').classList.add('hidden');
            }

            document.getElementById('product-detail-modal').classList.remove('hidden')
            document.body.style.overflow = 'hidden'
        }
        window.requestQuoteFromDetail = function() {
    if (!currentProduct) return
    
    // Close detail modal
    closeProductDetail()
    
    // Open inquiry modal with product info
    setTimeout(() => {
        openInquiryModal(currentProduct.name, currentProduct.id)
    }, 300)
}

window.addToCartFromDetail = function() {
    if (!currentProduct) return
    
    // Add to cart
    addToCart(
        currentProduct.id, 
        currentProduct.name, 
        currentProduct.price, 
        currentProduct.image_url
    )
    
    // Close modal after short delay
    setTimeout(() => {
        closeProductDetail()
    }, 1000)
}

        window.closeProductDetail = function() {
            document.getElementById('product-detail-modal').classList.add('hidden')
            document.body.style.overflow = 'auto'
            currentProduct = null
        }

        window.openInquiryModal = function(productName, productId) {
            document.getElementById('inquiry-form').reset()
            document.getElementById('form-message').classList.add('hidden')
            document.getElementById('inquiry-product-name').value = productName
            document.getElementById('inquiry-product-display').value = productName
            document.getElementById('inquiry-form').dataset.productId = productId
            document.getElementById('inquiry-modal').classList.remove('hidden')
            document.body.style.overflow = 'hidden'
        }

        window.closeInquiryModal = function() {
            document.getElementById('inquiry-modal').classList.add('hidden')
            document.body.style.overflow = 'auto'
        }

        async function sendEmailNotification(inquiryData) {
            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        access_key: '73d9e375-263c-4e70-b07e-9245f6a0feed',
                        subject: `New Product Inquiry - ${inquiryData.product_name}`,
                        from_name: 'Import From Nepal Website',
                        email: inquiryData.customer_email,
                        name: inquiryData.customer_name,
                        message: `
New inquiry received!

Customer Name: ${inquiryData.customer_name}
Email: ${inquiryData.customer_email}
Phone: ${inquiryData.customer_phone || 'Not provided'}
Product: ${inquiryData.product_name}

Message:
${inquiryData.message}

---
Received at: ${new Date().toLocaleString()}`.trim()
                    })
                })
                const result = await response.json()
                console.log(result.success ? '✅ Email sent' : '❌ Email failed')
            } catch (err) {
                console.error('Email error:', err)
            }
        }

        document.getElementById('inquiry-form').addEventListener('submit', async (e) => {
            e.preventDefault()

            const submitBtn = e.target.querySelector('button[type="submit"]')
            const messageDiv = document.getElementById('form-message')
            const originalText = submitBtn.textContent
            
            submitBtn.textContent = 'Sending...'
            submitBtn.disabled = true
            messageDiv.classList.add('hidden')

            const formData = new FormData(e.target)
            const countryCode = formData.get('country_code')
            const phoneNumber = formData.get('customer_phone')
            
            const inquiry = {
                customer_name: formData.get('customer_name'),
                customer_email: formData.get('customer_email'),
                customer_phone: phoneNumber ? `${countryCode} ${phoneNumber}` : null,
                product_name: document.getElementById('inquiry-product-name').value,
                message: formData.get('message'),
                items: JSON.stringify([{
                    name: document.getElementById('inquiry-product-name').value,
                    message: formData.get('message')
                }]),
                total_amount: 0,
                status: 'pending'
            }

            try {
                const response = await fetch('/api/inquiry', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(inquiry)
                });

                const result = await response.json();

                if (!response.ok) {
                    messageDiv.textContent = 'Error: ' + (result.error || 'Failed to submit inquiry.')
                    messageDiv.className = 'mx-4 sm:mx-6 mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm'
                    messageDiv.classList.remove('hidden')
                    return
                }

                // If email notification is handled server-side, remove this call
                // sendEmailNotification(inquiry); 

                messageDiv.textContent = 'Thank you! Your inquiry has been submitted successfully.'
                messageDiv.className = 'mx-4 sm:mx-6 mb-4 p-3 rounded-lg bg-green-100 text-green-700 text-sm'
                messageDiv.classList.remove('hidden')
                
                setTimeout(() => closeInquiryModal(), 2000)
            } catch (err) {
                console.error('Inquiry submission error:', err);
                messageDiv.textContent = 'Error submitting inquiry. Please try again.'
                messageDiv.className = 'mx-4 sm:mx-6 mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm'
                messageDiv.classList.remove('hidden')
            } finally {
                submitBtn.textContent = originalText
                submitBtn.disabled = false
            }
        })

        document.getElementById('inquiry-modal').addEventListener('click', (e) => {
            if (e.target.id === 'inquiry-modal') closeInquiryModal()
        })

        document.getElementById('product-detail-modal').addEventListener('click', (e) => {
            if (e.target.id === 'product-detail-modal') closeProductDetail()
        })

        loadProducts()

        // Toast Notification System
        window.showToast = function(message, type = 'success') {
            let container = document.querySelector('.toast-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'toast-container';
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            
            let icon = '';
            if (type === 'success') icon = '<svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
            if (type === 'error') icon = '<svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
            if (type === 'warning') icon = '<svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';

            toast.innerHTML = `
                ${icon}
                <div class="flex-1 text-sm font-medium text-gray-800">${message}</div>
            `;

            container.appendChild(toast);

            // Trigger animation
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });

            // Remove after 3 seconds
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
