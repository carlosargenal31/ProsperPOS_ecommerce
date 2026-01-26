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
          <router-link v-if="isLoggedIn" to="/profile?tab=orders" class="nav-link">
            Mis Pedidos
          </router-link>
          <router-link to="/store-location" class="nav-link" :class="{ active: currentRoute === 'store-location' }">
            Contacto
          </router-link>
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

  <!-- Categories Navigation -->
  <div class="categories-nav">
    <div class="container-fluid px-4">
      <div class="categories-content">
        <router-link
          v-for="category in categories"
          :key="category.id"
          :to="`/catalog?category=${category.id}`"
          class="category-link"
          :class="{ active: selectedCategoryId === category.id }"
        >
          <i class="ti ti-category-2"></i>
          {{ category.name }}
        </router-link>
        <router-link to="/catalog" class="category-link category-link-all">
          <i class="ti ti-apps"></i>
          Ver todos
        </router-link>
      </div>
    </div>
  </div>

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
              <input
                type="number"
                v-model.number="item.quantity"
                @blur="validateItemQuantity(item)"
                min="0.01"
                step="0.01"
                class="qty-input-modal"
              />
              <span class="unit-label">{{ item.unit || 'UNIDAD' }}</span>
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
        <div class="cart-totals-breakdown">
          <div class="cart-total-row">
            <span>Subtotal</span>
            <span>L {{ formatPrice(cartSubtotal) }}</span>
          </div>
          <div class="cart-total-row">
            <span>ISV (15%)</span>
            <span>L {{ formatPrice(cartTax) }}</span>
          </div>
          <div class="cart-total-row cart-total-final">
            <span>Total</span>
            <span class="total-amount">L {{ formatPrice(cartTotal) }}</span>
          </div>
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
const customer = ref(null)
const categories = ref([])

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

const selectedCategoryId = computed(() => {
  return route.query.category ? parseInt(route.query.category) : null
})

const cartCount = computed(() => {
  return cartItems.value.length
})

// Prices are base prices WITHOUT tax - need to add 15%
const cartSubtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const cartTax = computed(() => {
  // Calculate 15% tax on subtotal
  return cartSubtotal.value * 0.15
})

const cartTotal = computed(() => {
  // Total = Subtotal + Tax
  return cartSubtotal.value + cartTax.value
})

const toggleCart = () => {
  showCart.value = !showCart.value
  if (showCart.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const updateQuantity = (item, change) => {
  const newQuantity = parseFloat((item.quantity + change).toFixed(2))
  if (newQuantity >= 0.01) {
    item.quantity = newQuantity
    saveCart()
  }
}

const validateItemQuantity = (item) => {
  let value = parseFloat(item.quantity)

  if (isNaN(value) || value < 0.01) {
    item.quantity = 0.01
  } else {
    item.quantity = parseFloat(value.toFixed(2))
  }

  saveCart()
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
  if (!price && price !== 0) return '0.00'
  return parseFloat(price).toLocaleString('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
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

const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/v1/ecommerce/categories', {
      params: { visible_only: 'true' }
    })
    if (response.data && response.data.success) {
      categories.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
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

onMounted(() => {
  fetchCompanyInfo()
  fetchCategories()
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
  flex: 1;
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
  width: 36px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover {
  background: var(--primary-color, #FF9F43);
  color: white;
  border-color: var(--primary-color, #FF9F43);
}

.qty-input-modal {
  width: 60px;
  height: 36px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  padding: 0 0.25rem;
}

.cart-item-quantity .unit-label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

.qty-input-modal:focus {
  outline: none;
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

.cart-totals-breakdown {
  margin-bottom: 1.5rem;
}

.cart-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.cart-total-row.cart-total-final {
  padding-top: 0.75rem;
  border-top: 2px solid #e0e0e0;
  font-size: 1.2rem;
  font-weight: 700;
  margin-top: 0.5rem;
}

.total-amount {
  color: #000;
  font-size: 1.5rem;
  font-weight: 700;
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

/* Categories Navigation */
.categories-nav {
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  padding: 0.75rem 0;
  position: sticky;
  top: 92px;
  z-index: 999;
}

.categories-content {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.categories-content::-webkit-scrollbar {
  height: 6px;
}

.categories-content::-webkit-scrollbar-track {
  background: transparent;
}

.categories-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.categories-content::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.category-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  color: #333;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.category-link:hover {
  background: var(--primary-color, #FF9F43);
  color: white;
  border-color: var(--primary-color, #FF9F43);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(255, 159, 67, 0.3);
}

.category-link.active {
  background: var(--primary-color, #FF9F43);
  color: white;
  border-color: var(--primary-color, #FF9F43);
}

.category-link-all {
  background: var(--primary-color, #FF9F43);
  color: white;
  border-color: var(--primary-color, #FF9F43);
  font-weight: 600;
}

.category-link-all:hover {
  background: var(--primary-dark, #e68a2e);
  border-color: var(--primary-dark, #e68a2e);
}

.category-link i {
  font-size: 1.1rem;
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

  .nav-link {
    font-size: 0.9rem;
  }

  .cart-panel {
    width: 100%;
    max-width: 100%;
  }

  .categories-nav {
    top: auto;
    position: relative;
  }

  .category-link {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }
}
</style>
