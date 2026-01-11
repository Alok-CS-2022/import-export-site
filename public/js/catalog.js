import { supabase } from '../lib/supabase.js'

// State management
let allProducts = []
let filteredProducts = []
let categories = []
let currentCategory = 'all'
let searchQuery = ''
let sortBy = 'newest'

// DOM Elements
const productsGrid = document.getElementById('products-catalog')
const categoryFilters = document.getElementById('category-filters')
const searchInput = document.getElementById('catalog-search')
const sortSelect = document.getElementById('sort-select')
const activeFiltersLabel = document.getElementById('active-filters')
const currentCategoryName = document.getElementById('current-category-name')

// Initialize
async function initCatalog() {
    await loadCategories()
    await loadProducts()
    setupEventListeners()
}

// Load Categories
async function loadCategories() {
    const defaultCategories = [
        { id: 'singing-bowls', name: 'Singing Bowls' },
        { id: 'thangkas', name: 'Thangka Art' },
        { id: 'statues', name: 'Buddha Statues' },
        { id: 'jewelry', name: 'Artisan Jewelry' }
    ];

    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true })

        if (error) throw error
        categories = (data && data.length > 0) ? data : defaultCategories;
        renderCategoryFilters()
    } catch (err) {
        console.warn('Supabase categories fetch failed, using fallbacks:', err)
        categories = defaultCategories;
        renderCategoryFilters()
    }
}

// Render Category Filters
function renderCategoryFilters() {
    const html = categories.map(cat => `
        <button onclick="filterByCategory('${cat.id}', '${cat.name}')" 
            class="filter-chip px-5 py-2.5 border border-stone-200 rounded-2xl text-sm font-light hover:border-amber-500 hover:text-amber-800 transition-all duration-300
            ${currentCategory === cat.id ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm' : 'bg-white text-gray-600'}">
            ${cat.name}
        </button>
    `).join('')

    const container = document.getElementById('category-filters');
    if (container) {
        container.innerHTML = `
            <button onclick="filterByCategory('all', 'All Collection')" 
                class="filter-chip px-5 py-2.5 border border-stone-200 rounded-2xl text-sm font-light hover:border-amber-500 hover:text-amber-800 transition-all duration-300
                ${currentCategory === 'all' ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm' : 'bg-white text-gray-600'}">
                All Collection
            </button>
        ` + html
    }
}

// Load Products
async function loadProducts() {
    const defaultProducts = [
        { id: '1', name: 'Hand-Hammered Singing Bowl', price: 450, category_id: 'singing-bowls', description: 'Ancient resonance for healing and meditation.', image_url: 'https://images.unsplash.com/photo-1599458319801-443b73259966?w=800&q=80' },
        { id: '2', name: 'Mandala Thangka Painting', price: 1200, category_id: 'thangkas', description: 'Intricate spiritual geometry on cotton canvas.', image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80' },
        { id: '3', name: 'Gilded Buddha Statue', price: 2800, category_id: 'statues', description: 'Hand-carved Shakyamuni Buddha with gold leaf.', image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80' },
        { id: '4', name: 'Turquoise Silver Ring', price: 150, category_id: 'jewelry', description: 'Ethnic jewelry from the heart of Kathmandu.', image_url: 'https://images.unsplash.com/photo-1626014303757-646637e90952?w=800&q=80' }
    ];

    try {
        productsGrid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                <div class="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
                <p class="text-lg font-light italic">Curating artisan treasures...</p>
            </div>
        `

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        allProducts = (data && data.length > 0) ? data : defaultProducts;

        // Handle initial category from URL
        const urlParams = new URLSearchParams(window.location.search);
        const catId = urlParams.get('category');
        if (catId && catId !== 'all') {
            const cat = categories.find(c => c.id === catId);
            filterByCategory(catId, cat ? cat.name : 'Collection');
        } else {
            applyFilters();
        }
    } catch (err) {
        console.warn('Supabase products fetch failed, using fallbacks:', err)
        allProducts = defaultProducts;
        applyFilters();
    }
}

// Apply Filters, Search and Sort
function applyFilters() {
    filteredProducts = allProducts.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category_id === currentCategory
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesCategory && matchesSearch
    })

    if (sortBy === 'price-low') {
        filteredProducts.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
        filteredProducts.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'name') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
    } else {
        filteredProducts.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    }

    renderProducts()
}

// Render Products to Grid
function renderProducts() {
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-32 text-gray-400 bg-white rounded-[3rem] border border-dashed border-gray-200">
                <p class="text-xl font-light">The artisans are still crafting more items for this ritual.</p>
                <button onclick="resetFilters()" class="mt-6 px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-amber-800 transition shadow-lg">Clear All Filters</button>
            </div>
        `
        return
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card group bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 flex flex-col hover:shadow-2xl transition-all duration-500">
            <div class="relative aspect-square overflow-hidden cursor-pointer" onclick="goToProduct('${product.id}')">
                <img src="${product.image_url}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                ${product.is_featured ? '<span class="absolute top-6 left-6 bg-amber-600/90 backdrop-blur-md text-white text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Masterpiece</span>' : ''}
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span class="bg-white text-gray-900 px-8 py-3 rounded-full text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">View Creation</span>
                </div>
            </div>
            <div class="p-8 flex-grow flex flex-col">
                <div class="mb-4">
                    <h3 class="text-xl font-light text-gray-900 line-clamp-1 mb-1">${product.name}</h3>
                    <div class="h-0.5 w-6 bg-amber-200 transition-all duration-500 group-hover:w-16"></div>
                </div>
                <p class="text-gray-500 text-sm font-light line-clamp-2 mb-6 flex-grow leading-relaxed">${product.description || 'Authentic handcrafted heritage from the Himalayas.'}</p>
                <div class="flex items-center justify-between mt-auto pt-6 border-t border-stone-50">
                    <span class="text-2xl font-light text-amber-800">$${product.price}</span>
                    <button onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image_url}')" 
                        class="bg-gray-900 text-white p-3.5 rounded-2xl hover:bg-amber-700 transition shadow-xl active:scale-90 group/btn">
                        <svg class="w-6 h-6 transform group-hover/btn:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('')

    if (window.initScrollReveal) window.initScrollReveal()
}

// Primary Filter Function
window.catalogFilterByCategory = (id, name) => {
    currentCategory = id
    const label = document.getElementById('active-filters');
    const nameLabel = document.getElementById('current-category-name');

    if (id === 'all') {
        if (label) label.classList.add('hidden')
    } else {
        if (nameLabel) nameLabel.textContent = name || 'Collection'
        if (label) label.classList.remove('hidden')
    }
    renderCategoryFilters()
    applyFilters()
}

// Handle Sorting
window.handleSort = () => {
    sortBy = sortSelect.value
    applyFilters()
}

// Navigation to detail
window.goToProduct = (id) => {
    window.location.href = `product-detail.html?id=${id}`
}

// Setup Event Listeners
function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value
        applyFilters()
    })
}

// Start
initCatalog()
