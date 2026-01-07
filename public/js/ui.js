// Cart and Wishlist Management
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

    window.addToCart = function(productId, productName, price, imageUrl) {
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
            showNotification(`Increased quantity of "${productName}" in cart!`, 'success');
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: price,
                image: imageUrl,
                quantity: 1
            });
            showNotification(`"${productName}" added to cart!`, 'success');
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    window.toggleWishlist = function(productId, productName, imageUrl) {
        const existingIndex = wishlist.findIndex(item => item.id === productId);
        
        if (existingIndex > -1) {
            wishlist.splice(existingIndex, 1);
            showNotification(`"${productName}" removed from wishlist`, 'info');
        } else {
            wishlist.push({
                id: productId,
                name: productName,
                image: imageUrl
            });
            showNotification(`"${productName}" added to wishlist!`, 'success');
        }
        
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistCount();
        markWishlistItems();
    }

    window.markWishlistItems = function() {
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const productId = btn.dataset.productId;
            const icon = btn.querySelector('.wishlist-icon');
            
            if (wishlist.some(item => item.id === productId)) {
                icon.classList.add('fill-red-500', 'text-red-500');
                icon.classList.remove('text-gray-400');
            } else {
                icon.classList.remove('fill-red-500', 'text-red-500');
                icon.classList.add('text-gray-400');
            }
        });
    }

    function showNotification(message, type = 'success') {
        const colors = {
            success: 'bg-green-500',
            info: 'bg-blue-500',
            error: 'bg-red-500'
        };
        
        const notification = document.createElement('div');
        notification.className = `fixed top-24 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-2xl z-50 transform transition-all duration-300`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }, 2500);
    }

    window.toggleSearch = function() {
        const searchBar = document.getElementById('search-bar');
        const searchInput = document.getElementById('search-input');
        searchBar.classList.toggle('hidden');
        if (!searchBar.classList.contains('hidden')) {
            searchInput.focus();
        } else {
            searchInput.value = '';
            if (window.allProducts) {
                window.displayProducts(window.allProducts);
            }
        }
    }

    window.openCart = function() {
        if (cart.length === 0) {
            showNotification('Your cart is empty', 'info');
            return;
        }
        
        const modal = document.getElementById('cart-modal');
        const sidebar = document.getElementById('cart-sidebar');
        
        modal.classList.remove('hidden');
        setTimeout(() => {
            sidebar.classList.remove('translate-x-full');
        }, 10);
        
        renderCartItems();
        document.body.style.overflow = 'hidden';
    }

    window.closeCart = function() {
        const modal = document.getElementById('cart-modal');
        const sidebar = document.getElementById('cart-sidebar');
        
        sidebar.classList.add('translate-x-full');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 300);
    }

    function renderCartItems() {
        const container = document.getElementById('cart-items');
        const subtotalEl = document.getElementById('cart-subtotal');
        
        if (cart.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-8">Your cart is empty</p>';
            subtotalEl.textContent = '$0.00';
            return;
        }
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        
        container.innerHTML = cart.map(item => `
            <div class="flex gap-4 bg-gray-50 p-4 rounded-lg">
                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg" onerror="this.src='https://via.placeholder.com/80x80'">
                <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-900 truncate">${item.name}</h4>
                    <p class="text-sm text-gray-600 mt-1">$${item.price}</p>
                    <div class="flex items-center gap-3 mt-2">
                        <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})" class="w-8 h-8 flex items-center justify-center bg-white border rounded-lg hover:bg-gray-100 transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
                        </button>
                        <span class="font-semibold w-8 text-center">${item.quantity}</span>
                        <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})" class="w-8 h-8 flex items-center justify-center bg-white border rounded-lg hover:bg-gray-100 transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        </button>
                    </div>
                </div>
                <button onclick="removeFromCart('${item.id}')" class="text-gray-400 hover:text-red-500 transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
        `).join('');
    }

    window.updateCartQuantity = function(productId, newQuantity) {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }
        
        const item = cart.find(i => i.id === productId);
        if (item) {
            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCartItems();
            updateCartCount();
        }
    }

    window.removeFromCart = function(productId) {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
        updateCartCount();
        showNotification('Item removed from cart', 'info');
        
        if (cart.length === 0) {
            closeCart();
        }
    }

    window.proceedToCheckout = function() {
        // Build cart summary for inquiry
        const cartItems = cart.map(item => `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`).join('\n');
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Open inquiry modal with cart details
        closeCart();
        document.getElementById('inquiry-product-name').value = 'Checkout - Multiple Items';
        document.getElementById('inquiry-product-display').value = 'Checkout - Multiple Items';
        document.querySelector('[name="message"]').value = `I would like to purchase the following items:\n\n${cartItems}\n\nTotal: $${total.toFixed(2)}`;
        document.getElementById('inquiry-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    window.subscribeNewsletter = function(event) {
        event.preventDefault();
        const email = event.target.querySelector('input[type="email"]').value;
        showNotification(`Thank you for subscribing, ${email}!`, 'success');
        event.target.reset();
    }

    window.openWishlist = function() {
        if (wishlist.length === 0) {
            showNotification('Your wishlist is empty', 'info');
            return;
        }
        alert('Wishlist modal - building after cart!');
    }

    window.searchProducts = function(query) {
        if (!window.allProducts) return; 
        
        const searchTerm = query.toLowerCase().trim();
        
        if (searchTerm === '') {
            window.displayProducts(window.allProducts);
            return;
        }

        const filtered = window.allProducts.filter(product => {
            return product.name.toLowerCase().includes(searchTerm) ||
                   (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                   (product.category && product.category.toLowerCase().includes(searchTerm));
        });

        window.displayProducts(filtered);
    }

    function updateCartCount() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        const badge = document.getElementById('cart-count');
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    function updateWishlistCount() {
        const count = wishlist.length;
        const badge = document.getElementById('wishlist-count');
        const mobileBadge = document.getElementById('wishlist-count-mobile');
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
            if (mobileBadge) mobileBadge.textContent = count;
        } else {
            badge.classList.add('hidden');
            if (mobileBadge) mobileBadge.textContent = '0';
        }
    }

    // Rotating Word Effect
    const rotatingWords = ['For Every Home', 'For Every Space', 'For Every Story', 'For Every Moment'];
    let wordIndex = 0;

    function rotateWord() {
        const wordElement = document.getElementById('rotating-word');
        if (!wordElement) return; 
        
        wordElement.style.opacity = '0';
        wordElement.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            wordIndex = (wordIndex + 1) % rotatingWords.length;
            wordElement.textContent = rotatingWords[wordIndex];
            wordElement.style.opacity = '1';
            wordElement.style.transform = 'translateY(0)';
        }, 300);
    }

    // Initialize on page load
    window.addEventListener('DOMContentLoaded', () => {
        updateCartCount();
        updateWishlistCount();
        
        const wordElement = document.getElementById('rotating-word');
        if (wordElement) {
            wordElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            setInterval(rotateWord, 3000);
        }
    });
// Scroll Reveal Animation
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed')
            }
        })
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    })

    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el)
    })
}

// 3D Card Tilt Effect
function init3DCards() {
    document.querySelectorAll('.product-card-3d').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            
            const centerX = rect.width / 2
            const centerY = rect.height / 2
            
            const rotateX = (y - centerY) / 20
            const rotateY = (centerX - x) / 20
            
            card.style.setProperty('--rotate-x', `${rotateX}deg`)
            card.style.setProperty('--rotate-y', `${rotateY}deg`)
        })
        
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--rotate-x', '0deg')
            card.style.setProperty('--rotate-y', '0deg')
        })
    })
}

// Magnetic Button Effect
function initMagnetic() {
    document.querySelectorAll('.magnetic').forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect()
            const x = e.clientX - rect.left - rect.width / 2
            const y = e.clientY - rect.top - rect.height / 2
            
            el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`
        })
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)'
        })
    })
}

// Parallax scroll effect for hero (optional enhancement)
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset
    const parallaxElements = document.querySelectorAll('.parallax-bg')
    
    parallaxElements.forEach(el => {
        const speed = 0.5
        el.style.transform = `translateY(${scrolled * speed}px)`
    })
})

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    initScrollReveal()
})
// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    initScrollReveal()
    
    // === ADD THIS HERO 3D TILT CODE HERE ===
    const heroImage = document.querySelector('.image-3d-tilt');
    const heroContainer = document.querySelector('.hero-image-container');
    
    if (heroContainer && heroImage) {
        heroContainer.addEventListener('mousemove', (e) => {
            const rect = heroContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 30;
            const rotateY = (centerX - x) / 30;
            
            heroImage.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        
        heroContainer.addEventListener('mouseleave', () => {
            heroImage.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    }
    // === END OF HERO 3D TILT CODE ===
})
