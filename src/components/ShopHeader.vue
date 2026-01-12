<template>
  <nav class="shop-navbar">
    <div class="container-fluid px-4">
      <div class="navbar-content">
        <div class="navbar-brand">
          <img v-if="companyInfo?.logo_url" :src="companyInfo.logo_url" class="brand-logo" alt="Logo" />
        </div>

        <div class="navbar-menu">
          <router-link to="/home" class="nav-link" :class="{ active: currentRoute === 'home' }">
            Inicio
          </router-link>
          <router-link to="/catalog" class="nav-link" :class="{ active: currentRoute === 'catalog' }">
            Productos
          </router-link>
          <router-link to="/store-location" class="nav-link" :class="{ active: currentRoute === 'store-location' }">
            Contacto
          </router-link>
        </div>

        <div class="navbar-search">
          <div class="search-box">
            <i class="ti ti-search"></i>
            <input
              type="text"
              v-model="searchQuery"
              @input="handleSearchInput"
              @keyup.enter="handleSearch"
              @focus="showSearchResults = true"
              placeholder="Busca el producto para tu proyecto"
              class="search-input"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="clear-search-btn"
            >
              <i class="ti ti-x"></i>
            </button>
          </div>

          <!-- Search Results Dropdown -->
          <div
            v-if="showSearchResults && (searchSuggestions.length > 0 || searchProducts.length > 0)"
            class="search-dropdown"
            v-click-outside="closeSearchResults"
          >
            <!-- Sugerencias de categorías/subcategorías -->
            <div v-if="searchSuggestions.length > 0" class="search-section">
              <h3 class="search-section-title">SUGERENCIAS</h3>
              <div class="suggestion-item" v-for="suggestion in searchSuggestions" :key="suggestion.id" @click="selectSuggestion(suggestion)">
                {{ suggestion.label }}
              </div>
            </div>

            <!-- Productos -->
            <div v-if="searchProducts.length > 0" class="search-section">
              <h3 class="search-section-title">PRODUCTOS PARA {{ searchQuery.toUpperCase() }}</h3>
              <div class="products-grid">
                <div
                  v-for="product in searchProducts"
                  :key="product.id"
                  class="product-card-search"
                  @click="goToProduct(product.id)"
                >
                  <div class="product-image-wrapper">
                    <img :src="product.image_url || '/placeholder-product.png'" :alt="product.name" class="product-image" />
                    <span v-if="product.discount > 0" class="discount-badge">-{{ product.discount }}%</span>
                  </div>
                  <div class="product-info">
                    <p class="product-brand">{{ product.brand || 'Sin marca' }}</p>
                    <h4 class="product-name">{{ product.name }}</h4>
                    <div class="product-pricing">
                      <span v-if="product.discount > 0" class="original-price">Antes L {{ formatPrice(product.original_price) }} Unidad</span>
                      <span class="current-price">L {{ formatPrice(product.price) }} Unidad</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="view-all" @click="viewAllProducts">
                Ver todos los {{ totalProducts }} productos
              </div>
            </div>

            <!-- No results -->
            <div v-if="searchQuery && searchSuggestions.length === 0 && searchProducts.length === 0" class="no-results">
              No se encontraron resultados para "{{ searchQuery }}"
            </div>
          </div>
        </div>

        <div class="navbar-actions">
          <router-link v-if="!isLoggedIn" to="/login" class="btn btn-login">
            <i class="ti ti-user"></i>
            Iniciar Sesión
          </router-link>
          <router-link v-else to="/profile" class="btn btn-login">
            <i class="ti ti-user"></i>
            Hola, {{ customerName }}
          </router-link>
          <button @click="toggleCart" class="btn btn-cart">
            <i class="ti ti-shopping-cart"></i>
            <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
          </button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Cart Sidebar -->
  <div class="cart-sidebar" :class="{ active: showCart }">
    <div class="cart-overlay" @click="toggleCart"></div>
    <div class="cart-panel">
      <div class="cart-header">
        <h3>Mi pedido</h3>
        <button @click="toggleCart" class="close-btn">
          <i class="ti ti-x"></i>
        </button>
      </div>

      <div class="cart-body" v-if="cartItems.length > 0">
        <div v-for="item in cartItems" :key="item.product_id" class="cart-item">
          <img :src="item.image || '/placeholder-product.png'" :alt="item.name" class="cart-item-image" />
          <div class="cart-item-details">
            <h4>{{ item.name }}</h4>
            <p class="cart-item-info">Código: {{ item.code }}</p>
            <p class="cart-item-info" v-if="item.category">Categoría: {{ item.category }}</p>
            <p class="cart-item-info" v-if="item.subcategory">Subcategoría: {{ item.subcategory }}</p>
            <p class="cart-item-info" v-if="item.brand">Marca: {{ item.brand }}</p>
            <p class="cart-item-info" v-if="item.unit">Unidad: {{ item.unit }}</p>
            <div class="cart-item-quantity">
              <button @click="updateQuantity(item, -1)" class="qty-btn">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="updateQuantity(item, 1)" class="qty-btn">+</button>
            </div>
            <p class="cart-item-price">L {{ formatPrice(item.price * item.quantity) }}</p>
          </div>
          <button @click="removeItem(item)" class="remove-btn">
            <i class="ti ti-trash"></i>
          </button>
        </div>
      </div>

      <div class="cart-empty" v-else>
        <i class="ti ti-shopping-cart-off"></i>
        <p>Tu carrito está vacío</p>
      </div>

      <div class="cart-footer" v-if="cartItems.length > 0">
        <div class="cart-total">
          <span>Total:</span>
          <span class="total-amount">L {{ formatPrice(cartTotal) }}</span>
        </div>
        <button @click="goToCheckout" class="btn-checkout">
          Finalizar Pedido
        </button>
        <button @click="goToCart" class="btn-continue">
          Editar Pedido
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const companyInfo = ref(null)
const cartItems = ref([])
const showCart = ref(false)
const searchQuery = ref('')
const customer = ref(null)
const showSearchResults = ref(false)
const searchSuggestions = ref([])
const searchProducts = ref([])
const totalProducts = ref(0)
let searchTimeout = null

const currentRoute = computed(() => {
  const path = route.path
  if (path.includes('/home')) return 'home'
  if (path.includes('/catalog') || path.includes('/product/')) return 'catalog'
  if (path.includes('/store-location')) return 'store-location'
  return ''
})

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('ecommerce_token')
})

const customerName = computed(() => {
  const storedCustomer = localStorage.getItem('ecommerce_customer')
  if (storedCustomer) {
    const customerData = JSON.parse(storedCustomer)
    return customerData.first_name || 'Usuario'
  }
  return 'Usuario'
})

const cartCount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const cartTotal = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity
    const itemWithTax = itemTotal * (1 + (item.tax_rate || 0) / 100)
    return sum + itemWithTax
  }, 0)
})

const toggleCart = () => {
  showCart.value = !showCart.value
  if (showCart.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/catalog', query: { search: searchQuery.value } })
    closeSearchResults()
  }
}

const handleSearchInput = async () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (!searchQuery.value.trim()) {
    searchSuggestions.value = []
    searchProducts.value = []
    totalProducts.value = 0
    showSearchResults.value = false
    return
  }

  showSearchResults.value = true

  searchTimeout = setTimeout(async () => {
    await performSearch()
  }, 300)
}

const performSearch = async () => {
  try {
    const query = searchQuery.value.trim()

    // Buscar sugerencias (categorías, subcategorías, marcas)
    const suggestionsResponse = await axios.get(`http://localhost:3000/api/v1/ecommerce/search-suggestions`, {
      params: { q: query }
    })

    if (suggestionsResponse.data.success) {
      searchSuggestions.value = suggestionsResponse.data.data
    }

    // Buscar productos (limitar a 4 para el dropdown)
    const productsResponse = await axios.get(`http://localhost:3000/api/v1/ecommerce/products`, {
      params: {
        search: query,
        limit: 4
      }
    })

    if (productsResponse.data.success && productsResponse.data.data) {
      // La respuesta viene como { success: true, data: { products: [[...]], pagination: {...} } }
      const productsArray = productsResponse.data.data.products
      let products = []

      // Manejar diferentes formatos de respuesta
      if (Array.isArray(productsArray)) {
        if (productsArray.length > 0 && Array.isArray(productsArray[0])) {
          // Si es un array de arrays (resultado de db.execute)
          products = productsArray[0]
        } else {
          // Si ya es un array directo de productos
          products = productsArray
        }
      }

      if (Array.isArray(products) && products.length > 0) {
        searchProducts.value = products.map(p => ({
          id: p.id,
          name: p.name,
          brand: p.brand_name,
          price: parseFloat(p.sale_price || 0),
          original_price: parseFloat(p.sale_price || 0),
          discount: 0,
          image_url: p.image || null
        }))
      } else {
        searchProducts.value = []
      }

      totalProducts.value = productsResponse.data.data.pagination?.total || 0
    }
  } catch (error) {
    console.error('Error searching:', error)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchSuggestions.value = []
  searchProducts.value = []
  totalProducts.value = 0
  showSearchResults.value = false
}

const closeSearchResults = () => {
  showSearchResults.value = false
}

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion.label
  router.push({ path: '/catalog', query: { search: suggestion.label } })
  closeSearchResults()
}

const goToProduct = (productId) => {
  router.push(`/product/${productId}`)
  closeSearchResults()
  clearSearch()
}

const viewAllProducts = () => {
  router.push({ path: '/catalog', query: { search: searchQuery.value } })
  closeSearchResults()
}

const updateQuantity = (item, change) => {
  const newQuantity = item.quantity + change
  if (newQuantity > 0) {
    item.quantity = newQuantity
    saveCart()
  }
}

const removeItem = (item) => {
  const index = cartItems.value.findIndex(i => i.product_id === item.product_id)
  if (index > -1) {
    cartItems.value.splice(index, 1)
    saveCart()
  }
}

const saveCart = () => {
  localStorage.setItem('ecommerce_cart', JSON.stringify(cartItems.value))
  window.dispatchEvent(new Event('cart-updated'))
}

const goToCheckout = () => {
  toggleCart()
  router.push('/shop/checkout')
}

const goToCart = () => {
  toggleCart()
  router.push('/shop/cart')
}

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2)
}

const fetchCompanyInfo = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/v1/companies/public/default')
    if (response.data && response.data.success) {
      companyInfo.value = response.data.data
    } else if (response.data) {
      companyInfo.value = response.data
    }
  } catch (error) {
    console.error('Error fetching company info:', error)
  }
}

const loadCart = () => {
  const savedCart = localStorage.getItem('ecommerce_cart')
  if (savedCart) {
    try {
      cartItems.value = JSON.parse(savedCart)
    } catch (error) {
      cartItems.value = []
    }
  }
}

// Click outside directive
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

onMounted(() => {
  fetchCompanyInfo()
  loadCart()

  // Listen for cart updates
  window.addEventListener('storage', loadCart)
  window.addEventListener('cart-updated', loadCart)
})
</script>

<style scoped>
.shop-navbar {
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.navbar-brand {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.brand-logo {
  height: 60px;
  width: auto;
  max-width: 200px;
  object-fit: contain;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--primary-color, #FF9F43);
  letter-spacing: 1px;
}

.brand-subtitle {
  font-size: 0.75rem;
  margin: 0;
  color: #666;
  font-weight: 500;
}

.navbar-menu {
  display: flex;
  gap: 2rem;
}

.navbar-search {
  flex: 1;
  max-width: 500px;
  margin: 0 2rem;
  position: relative;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 1rem;
  color: #999;
  font-size: 1.2rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 3rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color, #FF9F43);
  box-shadow: 0 0 0 3px rgba(255, 159, 67, 0.1);
}

.search-input::placeholder {
  color: #999;
}

.clear-search-btn {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.clear-search-btn:hover {
  color: #666;
}

/* Search Dropdown */
.search-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  max-height: 600px;
  overflow-y: auto;
  z-index: 1000;
}

.search-section {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.search-section:last-child {
  border-bottom: none;
}

.search-section-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #666;
  margin: 0 0 0.75rem 0;
  letter-spacing: 0.5px;
}

.suggestion-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
  font-size: 0.95rem;
  color: #333;
}

.suggestion-item:hover {
  background: #f8f9fa;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.product-card-search {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-card-search:hover {
  border-color: var(--primary-color, #FF9F43);
  box-shadow: 0 4px 12px rgba(255, 159, 67, 0.2);
  transform: translateY(-2px);
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: 6px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 0.5rem;
}

.discount-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #FF0000;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-brand {
  font-size: 0.75rem;
  color: #666;
  margin: 0;
  text-transform: uppercase;
}

.product-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-pricing {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.original-price {
  font-size: 0.75rem;
  color: #999;
  text-decoration: line-through;
}

.current-price {
  font-size: 0.95rem;
  font-weight: 700;
  color: #000;
}

.view-all {
  text-align: center;
  padding: 0.75rem;
  color: var(--primary-color, #FF9F43);
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
}

.view-all:hover {
  background: #fff5e6;
}

.no-results {
  padding: 2rem;
  text-align: center;
  color: #999;
  font-size: 0.95rem;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.3s;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
}

.nav-link:hover,
.nav-link.active {
  color: var(--primary-color, #FF9F43);
  border-bottom-color: var(--primary-color, #FF9F43);
}

.navbar-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn {
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
}

.btn-cart {
  position: relative;
  background: #f5f5f5;
  color: #333;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  font-size: 1.5rem;
}

.btn-cart:hover {
  background: #f97316;
  color: white;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #FF6B6B;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
}

.btn-login {
  background: var(--primary-color, #FF9F43);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.btn-login:hover {
  background: var(--primary-dark, #e68a2e);
  transform: translateY(-2px);
}

/* Cart Sidebar */
.cart-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  pointer-events: none;
  transition: all 0.3s ease;
}

.cart-sidebar.active {
  pointer-events: all;
}

.cart-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cart-sidebar.active .cart-overlay {
  opacity: 1;
}

.cart-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 450px;
  max-width: 90%;
  height: 100%;
  background: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.cart-sidebar.active .cart-panel {
  transform: translateX(0);
}

.cart-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.cart-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.cart-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
  position: relative;
}

.cart-item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.cart-item-details {
  flex: 1;
}

.cart-item-details h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.cart-item-info {
  margin: 0.25rem 0;
  font-size: 0.8rem;
  color: #666;
  line-height: 1.4;
}

.cart-item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.qty-btn {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.qty-btn:hover {
  background: var(--primary-color, #FF9F43);
  color: white;
  border-color: var(--primary-color, #FF9F43);
}

.cart-item-price {
  margin: 0.5rem 0 0 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #000;
}

.remove-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
}

.remove-btn:hover {
  color: #dc2626;
}

.cart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.cart-empty i {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.cart-empty p {
  font-size: 1.1rem;
}

.cart-footer {
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  background: #f9f9f9;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 700;
}

.total-amount {
  color: #000;
  font-size: 1.5rem;
}

.btn-checkout {
  width: 100%;
  padding: 1rem;
  background: var(--primary-color, #FF9F43);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 0.5rem;
  transition: all 0.3s;
}

.btn-checkout:hover {
  background: var(--primary-dark, #e68a2e);
}

.btn-continue {
  width: 100%;
  padding: 1rem;
  background: transparent;
  color: #666;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: underline;
}

.btn-continue:hover {
  color: #333;
}

@media (max-width: 768px) {
  .navbar-content {
    flex-wrap: wrap;
  }

  .navbar-menu {
    order: 3;
    width: 100%;
    justify-content: flex-start;
    margin-top: 1rem;
  }

  .navbar-search {
    order: 2;
    width: 100%;
    margin: 1rem 0;
    max-width: 100%;
  }

  .nav-link {
    font-size: 0.9rem;
  }

  .cart-panel {
    width: 100%;
    max-width: 100%;
  }
}
</style>
