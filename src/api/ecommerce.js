// ===================================================================
// PROSPERPOS - API E-COMMERCE
// ===================================================================

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Crear instancia de axios para e-commerce
const ecommerceApi = axios.create({
  baseURL: `${API_URL}/ecommerce`,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token
ecommerceApi.interceptors.request.use(
  config => {
    const token = localStorage.getItem('ecommerce_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Interceptor para manejar errores de autenticación
ecommerceApi.interceptors.response.use(
  response => response,
  error => {
    // Solo limpiar token si es error 401, pero NO redirigir automáticamente
    if (error.response?.status === 401) {
      localStorage.removeItem('ecommerce_token')
      localStorage.removeItem('ecommerce_customer')
    }
    return Promise.reject(error)
  }
)

// ===================================================================
// AUTENTICACIÓN
// ===================================================================

export const authService = {
  async register(data) {
    const response = await ecommerceApi.post('/auth/register', data)
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('ecommerce_token', response.data.data.token)
      localStorage.setItem('ecommerce_customer', JSON.stringify(response.data.data.customer))
    }
    return response.data
  },

  async login(email, password) {
    const response = await ecommerceApi.post('/auth/login', { email, password })
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('ecommerce_token', response.data.data.token)
      localStorage.setItem('ecommerce_customer', JSON.stringify(response.data.data.customer))
    }
    return response.data
  },

  async getProfile() {
    const response = await ecommerceApi.get('/auth/profile')
    return response.data
  },

  async updateProfile(data) {
    const response = await ecommerceApi.put('/auth/profile', data)
    return response.data
  },

  async changePassword(currentPassword, newPassword) {
    const response = await ecommerceApi.put('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    })
    return response.data
  },

  logout() {
    localStorage.removeItem('ecommerce_token')
    localStorage.removeItem('ecommerce_customer')
  },

  isAuthenticated() {
    return !!localStorage.getItem('ecommerce_token')
  },

  getCustomer() {
    const customer = localStorage.getItem('ecommerce_customer')
    return customer ? JSON.parse(customer) : null
  }
}

// ===================================================================
// PRODUCTOS
// ===================================================================

export const productsService = {
  async getCatalog(params = {}) {
    const response = await ecommerceApi.get('/products/catalog', { params })
    return response.data
  },

  async getProductDetails(id) {
    const response = await ecommerceApi.get(`/products/${id}`)
    return response.data
  },

  async getFeaturedProducts(limit = 8) {
    const response = await ecommerceApi.get('/products/featured', {
      params: { limit }
    })
    return response.data
  },

  async searchProducts(query, limit = 10) {
    const response = await ecommerceApi.get('/products/search', {
      params: { q: query, limit }
    })
    return response.data
  },

  async getCategories(visibleOnly = false) {
    const response = await ecommerceApi.get('/categories', {
      params: { visible_only: visibleOnly ? 'true' : 'false' }
    })
    return response.data
  },

  async getVisibleCategories() {
    return this.getCategories(true)
  },

  async getSubcategories() {
    const response = await ecommerceApi.get('/subcategories')
    return response.data
  },

  async getBrands() {
    const response = await ecommerceApi.get('/brands')
    return response.data
  }
}

// ===================================================================
// CARRITO
// ===================================================================

export const cartService = {
  async getCart() {
    const response = await ecommerceApi.get('/cart')
    return response.data
  },

  async addItem(productId, quantity = 1) {
    const response = await ecommerceApi.post('/cart/add', {
      product_id: productId,
      quantity
    })
    return response.data
  },

  async updateQuantity(productId, quantity) {
    const response = await ecommerceApi.put(`/cart/item/${productId}`, {
      quantity
    })
    return response.data
  },

  async removeItem(productId) {
    const response = await ecommerceApi.delete(`/cart/item/${productId}`)
    return response.data
  },

  async clearCart() {
    const response = await ecommerceApi.delete('/cart/clear')
    return response.data
  },

  async getItemCount() {
    const response = await ecommerceApi.get('/cart/count')
    return response.data
  }
}

// ===================================================================
// PEDIDOS
// ===================================================================

export const ordersService = {
  async createOrder(orderData) {
    const response = await ecommerceApi.post('/orders', orderData)
    return response.data
  },

  async getMyOrders(params = {}) {
    const response = await ecommerceApi.get('/orders', { params })
    return response.data
  },

  async getOrderByNumber(orderNumber) {
    const response = await ecommerceApi.get(`/orders/${orderNumber}`)
    return response.data
  },

  async cancelOrder(orderNumber, reason) {
    const response = await ecommerceApi.post(`/orders/${orderNumber}/cancel`, {
      reason
    })
    return response.data
  },

  async getWhatsAppUrl(orderNumber) {
    const response = await ecommerceApi.get(`/orders/${orderNumber}/whatsapp`)
    return response.data
  }
}

// ===================================================================
// BANNERS
// ===================================================================

// Crear instancia de axios para banners (endpoint público, sin /ecommerce)
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const bannersService = {
  async getBanners() {
    const response = await publicApi.get('/banners/active')
    return response.data
  }
}

// ===================================================================
// COMPANY (EMPRESA)
// ===================================================================

export const companyService = {
  async getDefaultCompany() {
    const response = await publicApi.get('/companies/public/default')
    return response.data
  }
}

export default {
  auth: authService,
  products: productsService,
  cart: cartService,
  orders: ordersService,
  banners: bannersService,
  company: companyService
}
