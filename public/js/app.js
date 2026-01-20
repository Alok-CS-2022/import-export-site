import { loadSiteContent } from './content-loader.js';
import { countries } from './countries.js';

// Immediate population for any existing selects
populateCountryCodes();

// Global State
let currentUser = null;
let currentProduct = null;
window.allProducts = [];
let allProducts = [];
let allCategories = new Set();

// Mobile Menu Logic
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // 1. LOAD SITE CONTENT FIRST
    await loadSiteContent();

    // 2. AUTH INITIALIZATION - Using API endpoints now
    // Auth is handled via login.html and API endpoints
    currentUser = null; // Will be set by login system
    updateAuthUI();

    // 3. APP INITIALIZATION
    loadProducts();
    updateCartCount();
    updateWishlistCount();
    populateCountryCodes();
});

function populateCountryCodes() {
    const selects = document.querySelectorAll('select[name="country_code"]');
    if (selects.length === 0) return;

    const optionsHtml = countries.map(c => `
        <option value="${c.code}" ${c.code === '+977' ? 'selected' : ''}>
            ${c.flag} ${c.code}
        </option>
    `).join('');

    selects.forEach(select => {
        select.innerHTML = optionsHtml;
    });
}

// AUTH: Update Header
function updateAuthUI() {
    const hiddenMDNav = document.querySelector('.hidden.md\\:flex.items-center.space-x-6');
    if (!hiddenMDNav) return;

    const userName = currentUser?.email?.split('@')[0] || 'User';

    // HTML for Logged In vs Logged Out
    const authHtml = currentUser
        ? `<div class="relative group ml-4">
             <button class="text-gray-700 hover:text-amber-700 font-medium flex items-center gap-1 focus:outline-none">
                <span class="text-amber-800 font-semibold">${userName}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
             </button>
             <div class="absolute right-0 mt-0 pt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:block py-1 z-50">
                <a href="profile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50">My Orders</a>
                <button onclick="window.handleLogout()" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign Out</button>
             </div>
           </div>`
        : `<a href="login.html" class="ml-4 bg-amber-700 text-white px-5 py-2 rounded-full hover:bg-amber-800 transition shadow-md text-sm font-medium">Login</a>`;

    // Replace or Append
    const existingAuth = document.getElementById('auth-nav-item');
    if (existingAuth) existingAuth.remove();

    const div = document.createElement('div');
    div.id = 'auth-nav-item';
    div.innerHTML = authHtml;
    hiddenMDNav.appendChild(div);
}

// AUTH: Logout
window.handleLogout = async () => {
    // Clear any local auth state
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    showToast("Logged out successfully");
    setTimeout(() => window.location.href = 'index.html', 500);
};

// Mock data for testing when API is not available
const mockProducts = [
    { id: '1', name: 'Hand-Hammered Singing Bowl', price: 450, category: 'Singing Bowls', description: 'Ancient resonance for healing and meditation.', image_url: 'https://images.unsplash.com/photo-1599458319801-443b73259966?w=800&q=80' },
    { id: '2', name: 'Mandala Thangka Painting', price: 1200, category: 'Thangka Art', description: 'Intricate spiritual geometry and paintings.', image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80' },
    { id: '3', name: 'Gilded Buddha Statue', price: 2800, category: 'Buddha Statues', description: 'Hand-carved Shakyamuni Buddha with gold leaf.', image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80' },
    { id: '4', name: 'Turquoise Silver Ring', price: 150, category: 'Artisan Jewelry', description: 'Ethnic jewelry from the heart of Kathmandu.', image_url: 'https://images.unsplash.com/photo-1626014303757-646637e90952?w=800&q=80' }
];

// CORE: Load Products
async function loadProducts() {
    const grid = document.getElementById('products-catalog');
    if (!grid) return;

    // Skeleton Loading
    const skeletonHTML = Array(3).fill(0).map(() => `
        <div class="skeleton-card bg-gray-200 h-96 rounded-2xl animate-pulse"></div>
    `).join('');
    grid.innerHTML = skeletonHTML;

    try {
        console.log('Attempting to load products from API...');
        const response = await fetch('/api/products');
        const data = await response.json();

        if (!response.ok) {
            console.warn('API failed, using mock data:', data.error);
            throw new Error(data.error || 'API not available');
        }

        console.log('Products loaded from API:', data.length);
        window.allProducts = data;
        allProducts = data;

        allCategories.clear();
        data.forEach(product => {
            if (product.category) {
                allCategories.add(product.category);
            }
        });

        buildCategoryButtons();
        displayProducts(data);
    } catch (err) {
        console.warn('API failed, falling back to mock data:', err.message);
        // Use mock data for testing
        window.allProducts = mockProducts;
        allProducts = mockProducts;

        allCategories.clear();
        mockProducts.forEach(product => {
            if (product.category) {
                allCategories.add(product.category);
            }
        });

        buildCategoryButtons();
        displayProducts(mockProducts);
    }
}

function buildCategoryButtons() {
    const container = document.getElementById('category-filters');
    if (!container) return;

    let buttonsHTML = `
        <button onclick="filterByCategory('all')"
                class="filter-chip active px-4 py-2 border border-gray-200 rounded-full text-sm text-left hover:border-amber-500 transition">
            All Collection
        </button>
    `;

    allCategories.forEach(category => {
        buttonsHTML += `
            <button onclick="filterByCategory('${escapeHtml(category)}')"
                    class="filter-chip px-4 py-2 border border-gray-200 rounded-full text-sm text-left hover:border-amber-500 transition">
                ${escapeHtml(category)}
            </button>
        `;
    });

    container.innerHTML = buttonsHTML;
}

window.filterByCategory = function (category, categoryName) {
    // If we are on catalog page, defer to catalog.js logic
    if (window.catalogFilterByCategory) {
        return window.catalogFilterByCategory(category, categoryName);
    }

    document.querySelectorAll('.filter-chip').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target && event.target.classList.contains('filter-chip')) {
        event.target.classList.add('active');
    }

    if (category === 'all') {
        displayProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category === category);
        displayProducts(filtered);
    }
}

window.displayProducts = function (products) {
    const grid = document.getElementById('products-catalog');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center text-gray-500 text-sm sm:text-base">No products in this category yet.</p>';
        return;
    }

    grid.innerHTML = products.map((product, index) => {
        const isFeatured = index % 7 === 0 && index !== 0;
        const cardClasses = isFeatured ? 'md:col-span-2 lg:col-span-2' : '';

        return `
        <div class="scroll-reveal ${cardClasses}">
            <div class="product-card-3d product-glow group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer h-full"
                 data-product-id="${product.id}">
                
                <div class="image-zoom-container relative ${isFeatured ? 'aspect-[16/9]' : 'aspect-square'} bg-gradient-to-br from-stone-50 to-stone-100 overflow-hidden">
                    <img src="${escapeHtml(product.image_url)}" 
                         alt="${escapeHtml(product.name)}" 
                         class="image-zoom w-full h-full object-cover"
                         onerror="this.src='https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=800&fit=crop&q=90'">
                    
                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <button onclick="event.stopPropagation(); toggleWishlist('${product.id}', '${escapeHtml(product.name).replace(/'/g, "\'")}', '${escapeHtml(product.image_url)}')" 
                            class="wishlist-btn magnetic absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300 z-20"
                            data-product-id="${product.id}">
                        <svg class="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors wishlist-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                    </button>
                    
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <button onclick='window.openProductDetail(${JSON.stringify(product).replace(/'/g, "&#39;")})' 
                                class="magnetic bg-white text-gray-900 px-8 py-3 rounded-full font-normal text-sm shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                            View Details
                        </button>
                    </div>
                </div>

                <div class="p-6 ${isFeatured ? 'lg:p-8' : ''}">
                    <div class="text-center">
                        <p class="text-xs tracking-widest uppercase text-amber-700 mb-2 font-light">
                            ${escapeHtml(product.category)}
                        </p>
                        
                        <h3 class="font-light text-gray-900 ${isFeatured ? 'text-2xl lg:text-3xl' : 'text-lg'} mb-3 leading-tight group-hover:text-amber-800 transition-colors duration-300"
                            onclick='window.openProductDetail(${JSON.stringify(product).replace(/'/g, "&#39;")})'>
                            ${escapeHtml(product.name)}
                        </h3>

                        <p class="text-xl font-bold text-amber-800 mb-4">${product.price ? `$${product.price.toFixed(2)}` : ''}</p>

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
        `;
    }).join('');

    // UI Helpers (defined if ui.js loaded)
    if (window.initScrollReveal) initScrollReveal();
    if (window.init3DCards) init3DCards();
    if (window.initMagnetic) initMagnetic();
    if (window.markWishlistItems) markWishlistItems();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.openProductDetail = function (product) {
    currentProduct = product;
    document.getElementById('detail-product-name').textContent = product.name;
    const imgEl = document.getElementById('detail-product-image');
    if (imgEl) {
        imgEl.src = product.image_url;
        imgEl.alt = product.name;
    }
    document.getElementById('detail-product-category').textContent = product.category;
    document.getElementById('detail-product-description').textContent = product.description;

    const priceInfoEl = document.getElementById('detail-product-price-info');
    const quoteBtn = document.getElementById('request-quote-btn');
    const cartBtn = document.getElementById('add-to-cart-btn');

    if (product.price) {
        priceInfoEl.innerHTML = `
            <p class="text-3xl font-bold text-amber-800">$${product.price.toFixed(2)}</p>
            <p class="text-sm text-gray-500">plus shipping & taxes</p>
        `;
        quoteBtn.classList.add('hidden');
        cartBtn.classList.remove('hidden');
    } else {
        priceInfoEl.innerHTML = `
            <p class="text-lg font-semibold text-gray-700">Custom Pricing</p>
            <p class="text-sm text-gray-500">Each piece is unique. Request a quote for pricing.</p>
        `;
        quoteBtn.classList.remove('hidden');
        cartBtn.classList.add('hidden');
    }

    document.getElementById('product-detail-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

window.requestQuoteFromDetail = function () {
    if (!currentProduct) return;
    closeProductDetail();
    setTimeout(() => {
        openInquiryModal(currentProduct.name, currentProduct.id);
    }, 300);
}

window.addToCartFromDetail = function () {
    if (!currentProduct) return;
    addToCart(
        currentProduct.id,
        currentProduct.name,
        currentProduct.price,
        currentProduct.image_url
    );
    setTimeout(() => {
        closeProductDetail();
    }, 1000);
}

window.closeProductDetail = function () {
    document.getElementById('product-detail-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    currentProduct = null;
}

window.openInquiryModal = function (productName, productId) {
    document.getElementById('inquiry-form').reset();
    document.getElementById('form-message').classList.add('hidden');
    document.getElementById('inquiry-product-name').value = productName;
    document.getElementById('inquiry-product-display').value = productName;
    document.getElementById('inquiry-form').dataset.productId = productId;

    // Auto-fill logged in user email
    if (currentUser?.email) {
        const emailField = document.querySelector('input[name="customer_email"]');
        if (emailField) emailField.value = currentUser.email;
    }

    document.getElementById('inquiry-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    populateCountryCodes();
}

window.closeInquiryModal = function () {
    document.getElementById('inquiry-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// CHECKOUT LOGIC (SECURED)
window.proceedToCheckout = function () {
    if (window.cart.length === 0) {
        showToast("Your cart is empty!", "error");
        return;
    }

    // AUTH CHECK
    if (!currentUser) {
        showToast("Please login first to submit an inquiry", "warning");
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    const modal = document.getElementById('inquiry-modal');
    const displayInput = document.getElementById('inquiry-product-display');
    const nameInput = document.getElementById('inquiry-product-name');

    const itemsDescription = window.cart.map(item => `${item.name} (x${item.quantity})`).join(', ');
    const totalAmount = window.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    displayInput.value = `Bulk Order: ${window.cart.length} items`;
    nameInput.value = JSON.stringify({
        summary: itemsDescription,
        items: window.cart,
        total: totalAmount
    });

    if (currentUser?.email) {
        const emailInput = document.querySelector('input[name="customer_email"]');
        if (emailInput) emailInput.value = currentUser.email;
    }

    closeCart();
    modal.classList.remove('hidden');
    populateCountryCodes();
}

// Inquiry Form Submit
const inquiryForm = document.getElementById('inquiry-form');
if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const messageDiv = document.getElementById('form-message');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        messageDiv.classList.add('hidden');

        const formData = new FormData(e.target);
        const countryCode = formData.get('country_code');
        const phoneNumber = formData.get('customer_phone');

        // Handle complex product structure if it's a bulk order
        let itemsData = null;
        try {
            const rawProd = document.getElementById('inquiry-product-name').value;
            // Try to parse if it's JSON (bulk order)
            if (rawProd.startsWith('{')) {
                const parsed = JSON.parse(rawProd);
                itemsData = JSON.stringify(parsed.items);
            } else {
                itemsData = JSON.stringify([{
                    name: rawProd,
                    message: formData.get('message')
                }]);
            }
        } catch (e) {
            itemsData = JSON.stringify([{
                name: document.getElementById('inquiry-product-name').value,
                message: formData.get('message')
            }]);
        }

        const inquiry = {
            customer_name: formData.get('customer_name'),
            customer_email: formData.get('customer_email'),
            customer_phone: phoneNumber ? `${countryCode} ${phoneNumber}` : null,
            product_name: document.getElementById('inquiry-product-display').value, // Use display name for readability
            message: formData.get('message'),
            items: itemsData,
            total_amount: 0, // Should use calculated amount if possible
            status: 'pending'
        };

        // Add User ID if logged in
        // Note: Logic for adding user_id should be in API based on token
        // But we can send it here if needed, or rely on API to extract from token

        try {
            console.log('Submitting inquiry:', inquiry);

            // Get Token from localStorage
            const token = localStorage.getItem('authToken');

            console.log('Auth session:', token ? 'authenticated' : 'not authenticated');

            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            console.log('Making API call to /api/inquiry...');
            const response = await fetch('/api/inquiry', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(inquiry)
            });

            console.log('API response status:', response.status);
            const result = await response.json();
            console.log('API response:', result);

            if (!response.ok) {
                throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            messageDiv.textContent = 'Thank you! Your inquiry has been sent successfully. We will get back to you soon.';
            messageDiv.className = 'p-4 rounded-xl text-sm bg-green-100 text-green-700';
            messageDiv.classList.remove('hidden');
            contactForm.reset();

            if (window.showToast) window.showToast('Inquiry sent successfully!');

        } catch (err) {
            console.error('Contact Form Error:', err);
            // For testing, show a mock success message
            console.log('API failed, showing mock success for testing');
            messageDiv.textContent = '[TEST MODE] Inquiry would be sent. API not implemented yet.';
            messageDiv.className = 'p-4 rounded-xl text-sm bg-yellow-100 text-yellow-700';
            messageDiv.classList.remove('hidden');
            contactForm.reset();
        }

            messageDiv.textContent = 'Thank you! Your inquiry has been submitted successfully.';
            messageDiv.className = 'mx-4 sm:mx-6 mb-4 p-3 rounded-lg bg-green-100 text-green-700 text-sm';
            messageDiv.classList.remove('hidden');

            // Clear Cart if it was a bulk order
            if (document.getElementById('inquiry-product-display').value.includes('Bulk Order')) {
                window.cart = [];
                updateCartCount();
                localStorage.removeItem('cart');
            }

            setTimeout(() => closeInquiryModal(), 2000);
        } catch (err) {
            console.error('Inquiry submission error:', err);
            messageDiv.textContent = err.message || 'Error submitting inquiry. Please try again.';
            messageDiv.className = 'mx-4 sm:mx-6 mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm';
            messageDiv.classList.remove('hidden');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Modal Closers
const inqModal = document.getElementById('inquiry-modal');
if (inqModal) {
    inqModal.addEventListener('click', (e) => {
        if (e.target.id === 'inquiry-modal') closeInquiryModal();
    });
}

const prodModal = document.getElementById('product-detail-modal');
if (prodModal) {
    prodModal.addEventListener('click', (e) => {
        if (e.target.id === 'product-detail-modal') closeProductDetail();
    });
}

// Toast Notification
window.showToast = function (message, type = 'success') {
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

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
