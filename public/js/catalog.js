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
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true })

        if (error) throw error
        categories = data || []
        renderCategoryFilters()
    } catch (err) {
        console.error('Error loading categories:', err)
    }
}

// Render Category Filters
function renderCategoryFilters() {
    const html = categories.map(cat => `
        <button onclick="filterByCategory('${cat.id}', '${cat.name}')" 
            class="filter-chip px-4 py-2 border border-gray-200 rounded-full text-sm text-left hover:border-amber-500 transition 
            ${currentCategory === cat.id ? 'active' : ''}">
            ${cat.name}
        </button>
    `).join('')

    // Add "All" button at the start if not already there
    const container = document.getElementById('category-filters');
    if (container) {
        container.innerHTML = `
            <button onclick="filterByCategory('all', 'All Collection')" 
                class="filter-chip px-4 py-2 border border-gray-200 rounded-full text-sm text-left hover:border-amber-500 transition 
                ${currentCategory === 'all' ? 'active' : ''}">
                All Collection
            </button>
        ` + html
    }
}

// Load Products
async function loadProducts() {
    try {
        productsGrid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                <svg class="w-16 h-16 animate-spin mb-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-lg font-light">Unveiling our artisan treasures...</p>
            </div>
        `

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        allProducts = data || []
        applyFilters()
    } catch (err) {
        console.error('Error loading products:', err)
        productsGrid.innerHTML = `<p class="col-span-full text-center text-red-500 py-20">Error loading masterpieces. Please try again later.</p>`
    }
}

// Apply Filters, Search and Sort
function applyFilters() {
    filteredProducts = allProducts.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category_id === currentCategory
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    // Sort
    if (sortBy === 'price-low') {
        filteredProducts.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
        filteredProducts.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'name') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
    } else {
        // newest
        filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    renderProducts()
}

// Render Products to Grid
function renderProducts() {
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                <p class="text-xl font-light">No masterpieces found matching your search.</p>
                <button onclick="resetFilters()" class="mt-4 text-amber-700 hover:underline">Show all products</button>
            </div>
        `
        return
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
            <div class="relative aspect-square overflow-hidden cursor-pointer" onclick="goToProduct('${product.id}')">
                <img src="${product.image_url}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                ${product.is_featured ? '<span class="absolute top-4 left-4 bg-amber-600 text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">Featured</span>' : ''}
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span class="bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform">View Details</span>
                </div>
            </div>
            <div class="p-6 flex-grow flex flex-col">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-lg font-medium text-gray-900 line-clamp-1">${product.name}</h3>
                </div>
                <p class="text-gray-500 text-sm font-light line-clamp-2 mb-4 flex-grow">${product.description}</p>
                <div class="flex items-center justify-between mt-auto">
                    <span class="text-xl font-semibold text-amber-700">$${product.price}</span>
                    <button onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image_url}')" 
                        class="bg-gray-900 text-white p-2.5 rounded-xl hover:bg-amber-700 transition shadow-lg active:scale-95">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('')
}

// Global filter function (attached to window for onclick)
window.catalogFilterByCategory = (id, name) => {
    currentCategory = id
    const label = document.getElementById('active-filters');
    const nameLabel = document.getElementById('current-category-name');

    if (id === 'all') {
        if (label) label.classList.add('hidden')
    } else {
        if (nameLabel) nameLabel.textContent = name
        if (label) label.classList.remove('hidden')
    }
    renderCategoryFilters()
    applyFilters()
}

// Reset filters
window.resetFilters = () => {
    searchInput.value = ''
    searchQuery = ''
    filterByCategory('all')
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
