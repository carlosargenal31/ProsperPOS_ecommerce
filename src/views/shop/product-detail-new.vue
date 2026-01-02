<template>
  <div class="product-detail-page">
    <!-- Navigation Bar -->
    <nav class="shop-navbar">
      <div class="container-fluid px-4">
        <div class="navbar-content">
          <div class="navbar-brand">
            <router-link to="/shop/home" class="brand-link">
              <h2 class="brand-title">PROSPERPOS</h2>
              <p class="brand-subtitle">Sueña, Vende y Crece</p>
            </router-link>
          </div>

          <div class="navbar-menu">
            <router-link to="/shop/home" class="nav-link">Inicio</router-link>
            <router-link to="/shop/catalog" class="nav-link">Productos</router-link>
            <a href="#" class="nav-link">Ambientes</a>
            <a href="#" class="nav-link">Accesorios</a>
            <a href="#" class="nav-link">Contacto</a>
          </div>

          <div class="navbar-actions">
            <router-link to="/shop/cart" class="btn btn-cart">
              <i class="ti ti-shopping-cart"></i>
              <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
            </router-link>
            <router-link to="/shop/login" class="btn btn-login">
              <i class="ti ti-user"></i>
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Breadcrumb -->
    <div class="breadcrumb-section">
      <div class="container px-4">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><router-link to="/shop/home">Inicio</router-link></li>
            <li class="breadcrumb-item"><router-link to="/shop/catalog">Productos</router-link></li>
            <li v-if="product" class="breadcrumb-item active">{{ product.name }}</li>
          </ol>
        </nav>

        <div class="navigation-controls">
          <button v-if="previousProduct" @click="navigateToProduct(previousProduct)" class="nav-btn">
            <i class="ti ti-chevron-left"></i>
            Previo
          </button>
          <button v-if="nextProduct" @click="navigateToProduct(nextProduct)" class="nav-btn">
            Próximo
            <i class="ti ti-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="container py-5 text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-3">Cargando información del producto...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container py-5">
      <div class="alert alert-danger">
        <h5>Error al cargar el producto</h5>
        <p>{{ error }}</p>
        <router-link to="/shop/catalog" class="btn btn-primary">Volver al Catálogo</router-link>
      </div>
    </div>

    <!-- Product Content -->
    <div v-else-if="product" class="product-content">
      <div class="container py-5">
        <div class="row g-4">
          <!-- Left Column - Product Image -->
          <div class="col-lg-6">
            <div class="product-gallery">
              <div class="main-image-container">
                <img
                  :src="getProductImage(product)"
                  :alt="product.name"
                  class="main-image"
                />
                <button v-if="product.stock_available > 0" class="badge-available">
                  <i class="ti ti-check-circle"></i>
                  Disponible
                </button>
                <button v-else class="badge-unavailable">
                  <i class="ti ti-x-circle"></i>
                  No Disponible
                </button>
              </div>

              <!-- Thumbnail Images (if you have multiple images) -->
              <div class="thumbnail-container" v-if="productImages.length > 1">
                <div
                  v-for="(image, index) in productImages"
                  :key="index"
                  class="thumbnail"
                  :class="{ active: selectedImage === index }"
                  @click="selectedImage = index"
                >
                  <img :src="image" :alt="`${product.name} ${index + 1}`" />
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - Product Info -->
          <div class="col-lg-6">
            <div class="product-info-container">
              <!-- Product Header -->
              <div class="product-header">
                <div class="product-badges">
                  <span v-if="product.category_name" class="badge badge-category">
                    {{ product.category_name }}
                  </span>
                  <span v-if="product.brand_name" class="badge badge-brand">
                    {{ product.brand_name }}
                  </span>
                </div>

                <h1 class="product-title">{{ product.name }}</h1>

                <div class="product-code">
                  <span class="code-label">Código:</span>
                  <span class="code-value">{{ product.code }}</span>
                </div>
              </div>

              <!-- Price Section -->
              <div class="price-container">
                <div class="price-main">
                  <span class="currency">L</span>
                  <span class="amount">{{ formatPrice(product.sale_price) }}</span>
                </div>
                <div v-if="product.tax_rate > 0" class="price-details">
                  <span class="tax-info">
                    <i class="ti ti-info-circle"></i>
                    Incluye {{ product.tax_rate }}% de ISV
                  </span>
                </div>
              </div>

              <!-- Stock Information -->
              <div class="stock-info">
                <div class="stock-item">
                  <i class="ti ti-package"></i>
                  <span>Disponibilidad:</span>
                  <strong>{{ product.stock_available }} {{ product.unit }} en stock</strong>
                </div>
                <div class="stock-item">
                  <i class="ti ti-ruler-measure"></i>
                  <span>Unidad:</span>
                  <strong>{{ product.unit }}</strong>
                </div>
              </div>

              <!-- Product Description -->
              <div v-if="product.description" class="product-description">
                <h3 class="section-title">Descripción del Producto</h3>
                <p class="description-text">{{ product.description }}</p>
              </div>

              <!-- Quantity Selector & Add to Cart -->
              <div class="purchase-section">
                <div class="quantity-selector">
                  <label class="quantity-label">Cantidad:</label>
                  <div class="quantity-controls">
                    <button
                      class="qty-btn"
                      @click="decreaseQuantity"
                      :disabled="quantity <= 1"
                    >
                      <i class="ti ti-minus"></i>
                    </button>
                    <input
                      type="number"
                      class="qty-input"
                      v-model.number="quantity"
                      min="1"
                      :max="product.stock_available"
                    />
                    <button
                      class="qty-btn"
                      @click="increaseQuantity"
                      :disabled="quantity >= product.stock_available"
                    >
                      <i class="ti ti-plus"></i>
                    </button>
                  </div>
                </div>

                <button
                  class="btn-add-to-cart"
                  @click="addToCart"
                  :disabled="product.stock_available <= 0 || addingToCart"
                >
                  <i class="ti ti-shopping-cart-plus"></i>
                  {{ addingToCart ? 'Agregando...' : 'Agregar al Carrito' }}
                </button>

                <!-- Success Message -->
                <div v-if="addedToCart" class="success-message">
                  <i class="ti ti-circle-check"></i>
                  ¡Producto agregado al carrito exitosamente!
                </div>
              </div>

              <!-- Product Details Table -->
              <div class="product-specifications">
                <h3 class="section-title">Especificaciones</h3>
                <table class="specs-table">
                  <tbody>
                    <tr>
                      <td class="spec-label">Código del Producto</td>
                      <td class="spec-value">{{ product.code }}</td>
                    </tr>
                    <tr v-if="product.category_name">
                      <td class="spec-label">Categoría</td>
                      <td class="spec-value">{{ product.category_name }}</td>
                    </tr>
                    <tr v-if="product.subcategory_name">
                      <td class="spec-label">Subcategoría</td>
                      <td class="spec-value">{{ product.subcategory_name }}</td>
                    </tr>
                    <tr v-if="product.brand_name">
                      <td class="spec-label">Marca</td>
                      <td class="spec-value">{{ product.brand_name }}</td>
                    </tr>
                    <tr>
                      <td class="spec-label">Unidad de Medida</td>
                      <td class="spec-value">{{ product.unit }}</td>
                    </tr>
                    <tr>
                      <td class="spec-label">Stock Disponible</td>
                      <td class="spec-value">{{ product.stock_available }} {{ product.unit }}</td>
                    </tr>
                    <tr v-if="product.tax_rate">
                      <td class="spec-label">Impuesto</td>
                      <td class="spec-value">{{ product.tax_rate }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Additional Features -->
              <div class="product-features">
                <div class="feature-item">
                  <i class="ti ti-truck-delivery"></i>
                  <div class="feature-content">
                    <strong>Retiro en Tienda</strong>
                    <span>Disponible en nuestras sucursales</span>
                  </div>
                </div>
                <div class="feature-item">
                  <i class="ti ti-truck"></i>
                  <div class="feature-content">
                    <strong>Envío a domicilio</strong>
                    <span>Coordinamos la entrega</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <section v-if="relatedProducts.length > 0" class="related-products">
      <div class="container">
        <h2 class="section-title text-center">Productos Relacionados</h2>

        <div class="products-carousel">
          <div class="products-track">
            <div
              v-for="relatedProduct in relatedProducts"
              :key="relatedProduct.id"
              class="product-card"
            >
              <router-link :to="`/shop/product/${relatedProduct.id}`" class="product-link">
                <div class="product-image">
                  <img :src="getProductImage(relatedProduct)" :alt="relatedProduct.name" />
                </div>
                <div class="product-info">
                  <h4 class="product-name">{{ relatedProduct.name }}</h4>
                  <p class="product-price">L{{ formatPrice(relatedProduct.sale_price) }}</p>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

export default {
  name: 'ProductDetailNew',
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
    const selectedImage = ref(0)
    const relatedProducts = ref([])
    const previousProduct = ref(null)
    const nextProduct = ref(null)

    const productId = computed(() => route.params.id)

    const productImages = computed(() => {
      if (!product.value) return []
      // For now, return main image only. Can be extended for multiple images
      return [getProductImage(product.value)]
    })

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

    const fetchRelatedProducts = async () => {
      if (!product.value) return

      try {
        const response = await axios.get(`http://localhost:3000/api/v1/ecommerce/products?category_id=${product.value.category_id}&limit=6`)
        if (response.data && response.data.success) {
          relatedProducts.value = (response.data.data.products || []).filter(p => p.id !== product.value.id).slice(0, 5)
        }
      } catch (err) {
        console.error('Error fetching related products:', err)
      }
    }

    const getProductImage = (product) => {
      if (product.image && product.image.trim() !== '') {
        return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${product.image}`
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

        const cart = JSON.parse(localStorage.getItem('ecommerce_cart') || '[]')
        const existingItemIndex = cart.findIndex(item => item.product_id === product.value.id)

        if (existingItemIndex !== -1) {
          cart[existingItemIndex].quantity += quantity.value
        } else {
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

        localStorage.setItem('ecommerce_cart', JSON.stringify(cart))
        cartCount.value = cart.reduce((sum, item) => sum + item.quantity, 0)

        addedToCart.value = true
        quantity.value = 1

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

    const navigateToProduct = (productId) => {
      router.push(`/shop/product/${productId}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    onMounted(async () => {
      await fetchProduct()
      loadCartCount()
      if (product.value) {
        fetchRelatedProducts()
      }
    })

    return {
      product,
      loading,
      error,
      quantity,
      addingToCart,
      addedToCart,
      cartCount,
      selectedImage,
      productImages,
      relatedProducts,
      previousProduct,
      nextProduct,
      getProductImage,
      formatPrice,
      increaseQuantity,
      decreaseQuantity,
      addToCart,
      navigateToProduct
    }
  }
}
</script>

<style scoped>
/* Navigation */
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

.brand-link {
  text-decoration: none;
}

.navbar-brand {
  flex-shrink: 0;
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
  justify-content: center;
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

.btn-cart {
  position: relative;
  background: #f5f5f5;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  color: #333;
}

.btn-cart:hover {
  background: var(--primary-color, #FF9F43);
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
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: flex;
  align-items: center;
  font-size: 1.2rem;
}

.btn-login:hover {
  background: var(--primary-dark, #e68a2e);
}

/* Breadcrumb */
.breadcrumb-section {
  background: #f8f9fa;
  padding: 1.5rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.breadcrumb {
  margin: 0;
  background: none;
}

.breadcrumb-item a {
  color: var(--primary-color, #FF9F43);
  text-decoration: none;
}

.navigation-controls {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.nav-btn {
  background: white;
  border: 1px solid #e0e0e0;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.nav-btn:hover {
  background: var(--primary-color, #FF9F43);
  color: white;
  border-color: var(--primary-color, #FF9F43);
}

/* Product Content */
.product-content {
  background: #f8f9fa;
  min-height: calc(100vh - 200px);
}

/* Product Gallery */
.product-gallery {
  position: sticky;
  top: 100px;
}

.main-image-container {
  position: relative;
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.main-image {
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: contain;
  border-radius: 10px;
}

.badge-available,
.badge-unavailable {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 30px;
  border: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.badge-available {
  background: #10B981;
  color: white;
}

.badge-unavailable {
  background: #EF4444;
  color: white;
}

.thumbnail-container {
  display: flex;
  gap: 1rem;
}

.thumbnail {
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 10px;
  padding: 0.5rem;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.thumbnail:hover,
.thumbnail.active {
  border-color: var(--primary-color, #FF9F43);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
}

/* Product Info */
.product-info-container {
  background: white;
  border-radius: 15px;
  padding: 2.5rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.product-header {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.product-badges {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.badge {
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge-category {
  background: #E0E7FF;
  color: #4C51BF;
}

.badge-brand {
  background: #FEE2E2;
  color: #DC2626;
}

.product-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.product-code {
  display: flex;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.code-label {
  color: #6B7280;
}

.code-value {
  color: #1F2937;
  font-weight: 600;
}

/* Price */
.price-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  color: white;
}

.price-main {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.currency {
  font-size: 1.5rem;
  font-weight: 600;
}

.amount {
  font-size: 3rem;
  font-weight: 800;
}

.tax-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.95;
}

/* Stock Info */
.stock-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: #F9FAFB;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.stock-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #374151;
}

.stock-item i {
  color: var(--primary-color, #FF9F43);
  font-size: 1.3rem;
}

/* Description */
.product-description {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 1rem;
}

.description-text {
  color: #6B7280;
  line-height: 1.8;
  font-size: 1rem;
}

/* Purchase Section */
.purchase-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.quantity-selector {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.quantity-label {
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0;
  width: fit-content;
  border: 2px solid #E5E7EB;
  border-radius: 10px;
  overflow: hidden;
}

.qty-btn {
  background: white;
  border: none;
  padding: 1rem 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #374151;
  font-size: 1.1rem;
  border-right: 1px solid #E5E7EB;
}

.qty-btn:last-child {
  border-right: none;
  border-left: 1px solid #E5E7EB;
}

.qty-btn:hover:not(:disabled) {
  background: #F9FAFB;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-input {
  border: none;
  width: 80px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  padding: 1rem 0.5rem;
}

.qty-input:focus {
  outline: none;
}

.btn-add-to-cart {
  width: 100%;
  background: var(--primary-color, #FF9F43);
  color: white;
  border: none;
  padding: 1.2rem 2rem;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}

.btn-add-to-cart:hover:not(:disabled) {
  background: var(--primary-dark, #e68a2e);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 159, 67, 0.3);
}

.btn-add-to-cart:disabled {
  background: #D1D5DB;
  cursor: not-allowed;
}

.success-message {
  background: #D1FAE5;
  color: #065F46;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 600;
}

/* Specifications */
.product-specifications {
  margin-bottom: 2rem;
}

.specs-table {
  width: 100%;
}

.specs-table tr {
  border-bottom: 1px solid #F3F4F6;
}

.specs-table tr:last-child {
  border-bottom: none;
}

.spec-label {
  padding: 1rem 0;
  color: #6B7280;
  font-weight: 500;
  width: 40%;
}

.spec-value {
  padding: 1rem 0;
  color: #1F2937;
  font-weight: 600;
}

/* Features */
.product-features {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem;
  background: #F9FAFB;
  border-radius: 10px;
}

.feature-item i {
  font-size: 2rem;
  color: var(--primary-color, #FF9F43);
}

.feature-content {
  display: flex;
  flex-direction: column;
}

.feature-content strong {
  color: #1F2937;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.feature-content span {
  color: #6B7280;
  font-size: 0.9rem;
}

/* Related Products */
.related-products {
  padding: 4rem 0;
  background: white;
}

.products-carousel {
  margin-top: 2rem;
}

.products-track {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 1rem 0;
}

.product-card {
  flex: 0 0 280px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.product-link {
  text-decoration: none;
  color: inherit;
}

.product-image {
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 1.2rem;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 0.5rem;
}

.product-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary-color, #FF9F43);
}

/* Responsive */
@media (max-width: 992px) {
  .navbar-menu {
    display: none;
  }

  .product-title {
    font-size: 1.8rem;
  }

  .price-main .amount {
    font-size: 2rem;
  }

  .product-gallery {
    position: static;
  }
}
</style>
