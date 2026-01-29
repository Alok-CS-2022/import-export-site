// ============================================
// MAIN APP.JS - CORRECTED VERSION
// ============================================

// ==================== SUPABASE INITIALIZATION ====================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://tpvqolkzcbbzlqlzchwc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdnFvbGt6Y2JiemxxbHpjaHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNjA0MjgsImV4cCI6MjA4MTkzNjQyOH0.AU6ieHN1TSUHgSu7qfvkekvmMySDPJb2zOId4Oy7CeY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabase = supabase;

console.log('✓ Supabase initialized:', !!supabase);

let currentUser = null;
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', async () => {
    console.log('App initializing...');
    initMobileMenu();
    await loadProductsFromSupabase();
    updateCartCount();
    setupEventListeners();
});

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
}

async function loadProductsFromSupabase() {
    const productsGrid = document.getElementById('products-catalog');
    const featuredGrid = document.getElementById('featured-products-grid');
    
    if (!productsGrid && !featuredGrid) return;
    
    if (productsGrid) {
        productsGrid.innerHTML = '<div class="col-span-full text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div><p class="mt-4 text-gray-600">Loading products...</p></div>';
    }
    
    try {
        console.log('Loading products from Supabase...');
        
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });
        
        if (error) throw error;
        
        products = data || [];
        console.log(`✓ Loaded ${products.length} products from Supabase`);
        
        if (productsGrid) {
            displayProductsInGrid(products, productsGrid);
        }
        
        if (featuredGrid) {
            const featured = products.filter(p => p.is_featured).slice(0, 6);
            displayProductsInGrid(featured.length > 0 ? featured : products.slice(0, 6), featuredGrid);
        }
        
    } catch (error) {
        console.error('❌ Failed to load products:', error);
        
        const errorHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-gray-600 mb-4">Unable to load products</p>
                <p class="text-sm text-gray-500 mb-4">${error.message}</p>
                <button onclick="location.reload()" class="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg hover:bg-amber-200">
                    Reload Page
                </button>
            </div>
        `;
        
        if (productsGrid) productsGrid.innerHTML = errorHTML;
        if (featuredGrid) featuredGrid.innerHTML = errorHTML;
    }
}

function displayProductsInGrid(products, container) {
    if (!container || !products || !products.length) {
        if (container) {
            container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">No products available</div>';
        }
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
            <div class="aspect-square bg-gray-100 overflow-hidden">
                <img src="${product.image_url || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80'}" 
                     alt="${escapeHtml(product.name)}" 
                     class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                     onerror="this.src='https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80'">
            </div>
            <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-medium text-gray-900 truncate">${escapeHtml(product.name)}</h3>
                    ${product.price ? `<span class="text-amber-700 font-bold">$${product.price}</span>` : ''}
                </div>
                ${product.description ? `<p class="text-sm text-gray-600 mb-3 line-clamp-2">${escapeHtml(product.description)}</p>` : ''}
                <div class="flex gap-2">
                    <button onclick="addToCart('${product.id}', '${escapeHtml(product.name)}', ${product.price || 0}, '${product.image_url}')" 
                            class="flex-1 bg-amber-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition">
                        Add to Cart
                    </button>
                    <button onclick="viewProductDetail('${product.id}')" 
                            class="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:border-amber-500 transition">
                        Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function addToCart(productId, productName, price, imageUrl) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            image: imageUrl,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`${productName} added to cart`, 'success');
    
    if (window.innerWidth < 768) {
        openCart();
    }
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    
    document.querySelectorAll('#cart-count').forEach(el => {
        if (count > 0) {
            el.textContent = count;
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
}

function openCart() {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    
    const itemsContainer = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('cart-subtotal');
    
    if (itemsContainer) {
        if (cart.length === 0) {
            itemsContainer.innerHTML = '<p class="text-center text-gray-500 py-8">Your cart is empty</p>';
        } else {
            itemsContainer.innerHTML = cart.map(item => `
                <div class="flex gap-4 p-4 bg-white rounded-lg border">
                    <img src="${item.image}" alt="${escapeHtml(item.name)}" class="w-20 h-20 object-cover rounded">
                    <div class="flex-1">
                        <h4 class="font-medium">${escapeHtml(item.name)}</h4>
                        <p class="text-amber-700 font-bold">$${item.price} × ${item.quantity}</p>
                        <div class="flex items-center gap-2 mt-2">
                            <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})" class="w-8 h-8 flex items-center justify-center border rounded">−</button>
                            <span class="w-8 text-center">${item.quantity}</span>
                            <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})" class="w-8 h-8 flex items-center justify-center border rounded">+</button>
                            <button onclick="removeFromCart('${item.id}')" class="ml-4 text-sm text-red-600 hover:text-red-800">Remove</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
    
    if (subtotalEl) {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

function updateCartQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        openCart();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    openCart();
}

async function viewProductDetail(productId) {
    try {
        let product = products.find(p => p.id === productId);
        
        if (!product) {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();
            
            if (error) throw error;
            product = data;
        }
        
        if (!product) {
            showToast('Product not found', 'error');
            return;
        }
        
        openProductDetailModal(product);
        
    } catch (error) {
        console.error('Error loading product details:', error);
        showToast('Could not load product details', 'error');
    }
}

function openProductDetailModal(product) {
    const modal = document.getElementById('product-detail-modal');
    if (!modal) return;
    
    document.getElementById('detail-product-name').textContent = product.name;
    document.getElementById('detail-product-image').src = product.image_url || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80';
    document.getElementById('detail-product-description').textContent = product.description || 'No description available.';
    
    const priceInfo = document.getElementById('detail-product-price-info');
    if (product.price) {
        priceInfo.innerHTML = `
            <p class="text-2xl font-bold text-amber-800">$${product.price}</p>
            <p class="text-sm text-gray-600">Plus shipping & taxes</p>
        `;
    } else {
        priceInfo.innerHTML = `
            <p class="text-lg font-semibold text-gray-700">Custom Pricing</p>
            <p class="text-sm text-gray-600">Contact us for a quote</p>
        `;
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeProductDetail() {
    const modal = document.getElementById('product-detail-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

function setupContactForm() {
    const form = document.getElementById('contact-page-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            const inquiry = {
                customer_name: formData.get('customer_name'),
                customer_email: formData.get('customer_email'),
                customer_phone: formData.get('customer_phone') || '',
                message: formData.get('message'),
                status: 'new'
            };
            
            const { error } = await supabase
                .from('inquiries')
                .insert([inquiry]);
            
            if (error) throw error;
            
            showToast('Message sent successfully! We will contact you soon.', 'success');
            form.reset();
            
        } catch (error) {
            console.error('Contact form error:', error);
            showToast('Failed to send message. Please try again.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container fixed bottom-4 right-4 z-50';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type} bg-white border-l-4 px-4 py-3 rounded shadow-lg mb-2 transform translate-x-full transition-transform duration-300`;
    
    if (type === 'success') toast.style.borderLeftColor = '#10B981';
    if (type === 'error') toast.style.borderLeftColor = '#EF4444';
    if (type === 'warning') toast.style.borderLeftColor = '#F59E0B';
    
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function setupEventListeners() {
    document.querySelectorAll('[onclick="closeCart()"]').forEach(btn => {
        btn.addEventListener('click', closeCart);
    });
    
    document.querySelectorAll('[onclick="closeProductDetail()"]').forEach(btn => {
        btn.addEventListener('click', closeProductDetail);
    });
    
    setupContactForm();
}

window.addToCart = addToCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.viewProductDetail = viewProductDetail;
window.closeProductDetail = closeProductDetail;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.showToast = showToast;

console.log('✓ App.js loaded successfully');
