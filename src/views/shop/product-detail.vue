<template>
  <div class="product-detail-page">
    <!-- Header -->
    <header class="shop-header bg-white shadow-sm mb-4">
      <div class="container-fluid px-4 py-3">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <router-link to="/ecommerce/catalog" class="btn btn-outline-secondary btn-sm">
              <i class="ti ti-arrow-left me-2"></i>Volver al Catálogo
            </router-link>
          </div>
          <h4 class="mb-0">Detalle del Producto</h4>
          <div>
            <router-link to="/ecommerce/cart" class="btn btn-primary">
              <i class="ti ti-shopping-cart me-2"></i>
              Carrito
              <span v-if="cartCount > 0" class="badge bg-white text-primary ms-2">{{ cartCount }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="container py-5 text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container py-5">
      <div class="alert alert-danger">
        <h5>Error al cargar el producto</h5>
        <p>{{ error }}</p>
        <router-link to="/ecommerce/catalog" class="btn btn-primary">Volver al Catálogo</router-link>
      </div>
    </div>

    <!-- Product Content -->
    <div v-else-if="product" class="container py-4">
      <div class="row">
        <!-- Left Column - Product Image -->
        <div class="col-lg-5 mb-4">
          <div class="product-image-container bg-white p-4 rounded shadow-sm sticky-top" style="top: 20px;">
            <div class="main-image text-center">
              <img
                :src="getProductImage(product)"
                :alt="product.name"
                class="img-fluid rounded"
                style="max-height: 500px; width: 100%; object-fit: contain;"
              />
            </div>
          </div>
        </div>

        <!-- Right Column - Product Info -->
        <div class="col-lg-7">
          <!-- Product Title & Basic Info -->
          <div class="product-info bg-white p-4 rounded shadow-sm mb-3">
            <div class="mb-3">
              <span class="badge bg-info text-white mb-2">{{ product.category_name || 'Sin Categoría' }}</span>
              <span v-if="product.brand_name" class="badge bg-secondary text-white mb-2 ms-2">{{ product.brand_name }}</span>
            </div>

            <h1 class="h3 mb-3">{{ product.name }}</h1>

            <div class="mb-3">
              <small class="text-muted">Código: {{ product.code }}</small>
            </div>

            <!-- Price Section -->
            <div class="price-section mb-4 p-3 bg-light rounded">
              <div class="row align-items-center">
                <div class="col">
                  <div class="mb-2">
                    <span class="text-muted small">Precio:</span>
                  </div>
                  <h2 class="text-primary mb-0 fw-bold">
                    L{{ formatPrice(product.sale_price) }}
                  </h2>
                  <small v-if="product.tax_rate > 0" class="text-muted">
                    (Incluye {{ product.tax_rate }}% de impuesto)
                  </small>
                </div>
                <div class="col-auto">
                  <div class="text-end">
                    <span v-if="product.stock_available > 0" class="badge bg-success">
                      <i class="ti ti-check me-1"></i>Disponible
                    </span>
                    <span v-else class="badge bg-danger">
                      <i class="ti ti-x me-1"></i>No Disponible
                    </span>
                    <div class="mt-2 small text-muted">
                      Stock: {{ product.stock_available }} {{ product.unit }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Product Details Table -->
            <div class="product-details mb-4">
              <h5 class="mb-3">Especificaciones</h5>
              <table class="table table-borderless">
                <tbody>
                  <tr>
                    <td class="text-muted" style="width: 40%;">Código del Producto:</td>
                    <td class="fw-semibold">{{ product.code }}</td>
                  </tr>
                  <tr v-if="product.category_name">
                    <td class="text-muted">Categoría:</td>
                    <td class="fw-semibold">{{ product.category_name }}</td>
                  </tr>
                  <tr v-if="product.brand_name">
                    <td class="text-muted">Marca:</td>
                    <td class="fw-semibold">{{ product.brand_name }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">Unidad de Medida:</td>
                    <td class="fw-semibold">{{ product.unit }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted">Disponibilidad:</td>
                    <td class="fw-semibold">{{ product.stock_available }} {{ product.unit }} en stock</td>
                  </tr>
                  <tr v-if="product.tax_rate">
                    <td class="text-muted">Impuesto:</td>
                    <td class="fw-semibold">{{ product.tax_rate }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Quantity & Add to Cart -->
            <div class="purchase-section">
              <div class="row g-3 mb-3">
                <div class="col-5">
                  <label class="form-label fw-semibold">Cantidad:</label>
                  <div class="input-group">
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="decreaseQuantity"
                      :disabled="quantity <= 1"
                    >
                      <i class="ti ti-minus"></i>
                    </button>
                    <input
                      type="number"
                      class="form-control text-center"
                      v-model.number="quantity"
                      min="1"
                      :max="product.stock_available"
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="increaseQuantity"
                      :disabled="quantity >= product.stock_available"
                    >
                      <i class="ti ti-plus"></i>
                    </button>
                  </div>
                </div>
                <div class="col-7">
                  <label class="form-label fw-semibold">&nbsp;</label>
                  <button
                    class="btn btn-primary btn-lg w-100"
                    @click="addToCart"
                    :disabled="product.stock_available <= 0 || addingToCart"
                  >
                    <i class="ti ti-shopping-cart-plus me-2"></i>
                    {{ addingToCart ? 'Agregando...' : 'Agregar al Carrito' }}
                  </button>
                </div>
              </div>

              <!-- Success Message -->
              <div v-if="addedToCart" class="alert alert-success mb-0">
                <i class="ti ti-check me-2"></i>
                Producto agregado al carrito exitosamente
              </div>
            </div>
          </div>

          <!-- Product Description -->
          <div v-if="product.description" class="product-description bg-white p-4 rounded shadow-sm">
            <h5 class="mb-3">Descripción del Producto</h5>
            <p class="text-muted mb-0" style="white-space: pre-line;">{{ product.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

export default {
  name: 'ProductDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const product = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const quantity = ref(1)
    const addingToCart = ref(false)
    const addedToCart = ref(false)
    const cartCount = ref(0)

    const productId = computed(() => route.params.id)

    const fetchProduct = async () => {
      try {
        loading.value = true
        error.value = null

        const response = await axios.get(`http://localhost:3000/api/v1/ecommerce/products/${productId.value}`)

        if (response.data && response.data.success && response.data.data) {
          product.value = response.data.data
        } else if (response.data && response.data.id) {
          product.value = response.data
        } else {
          error.value = 'Producto no encontrado'
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        error.value = err.response?.data?.message || err.response?.data?.error || 'Error al cargar el producto'
      } finally {
        loading.value = false
      }
    }

    const getProductImage = (product) => {
      if (product.image && product.image.trim() !== '') {
        return `http://localhost:3000${product.image}`
      }
      return '/placeholder-product.svg'
    }

    const formatPrice = (price) => {
      return parseFloat(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    const increaseQuantity = () => {
      if (quantity.value < product.value.stock_available) {
        quantity.value++
      }
    }

    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--
      }
    }

    const addToCart = async () => {
      try {
        addingToCart.value = true
        addedToCart.value = false

        // Get cart from localStorage
        const cart = JSON.parse(localStorage.getItem('ecommerce_cart') || '[]')

        // Check if product already exists in cart
        const existingItemIndex = cart.findIndex(item => item.product_id === product.value.id)

        if (existingItemIndex !== -1) {
          // Update quantity
          cart[existingItemIndex].quantity += quantity.value
        } else {
          // Add new item
          cart.push({
            product_id: product.value.id,
            product_code: product.value.code,
            product_name: product.value.name,
            product_image: product.value.image,
            price: product.value.sale_price,
            quantity: quantity.value,
            unit: product.value.unit,
            tax_rate: product.value.tax_rate || 0
          })
        }

        // Save to localStorage
        localStorage.setItem('ecommerce_cart', JSON.stringify(cart))

        // Update cart count
        cartCount.value = cart.reduce((sum, item) => sum + item.quantity, 0)

        // Show success message
        addedToCart.value = true

        // Reset quantity
        quantity.value = 1

        // Hide message after 3 seconds
        setTimeout(() => {
          addedToCart.value = false
        }, 3000)

      } catch (err) {
        console.error('Error adding to cart:', err)
        alert('Error al agregar al carrito')
      } finally {
        addingToCart.value = false
      }
    }

    const loadCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('ecommerce_cart') || '[]')
      cartCount.value = cart.reduce((sum, item) => sum + item.quantity, 0)
    }

    onMounted(() => {
      fetchProduct()
      loadCartCount()
    })

    return {
      product,
      loading,
      error,
      quantity,
      addingToCart,
      addedToCart,
      cartCount,
      getProductImage,
      formatPrice,
      increaseQuantity,
      decreaseQuantity,
      addToCart
    }
  }
}
</script>

<style scoped>
.product-detail-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.shop-header {
  position: sticky;
  top: 0;
  z-index: 1000;
}

.product-image-container {
  border: 1px solid #e0e0e0;
}

.main-image img {
  transition: transform 0.3s ease;
}

.main-image img:hover {
  transform: scale(1.05);
}

.price-section {
  border-left: 4px solid #0d6efd;
}

.input-group .form-control {
  max-width: 80px;
}

.table td {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.table tr:last-child td {
  border-bottom: none;
}

@media (max-width: 991px) {
  .sticky-top {
    position: relative !important;
  }
}
</style>
