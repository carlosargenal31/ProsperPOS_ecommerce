<template>
  <div class="product-detail-modern">
    <!-- Navigation Bar -->
    <ShopHeader />

    <!-- Breadcrumb -->
    <div class="breadcrumb-section">
      <div class="container-fluid px-4">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><router-link to="/shop/home">Inicio</router-link></li>
            <li class="breadcrumb-item"><router-link to="/shop/catalog">Productos</router-link></li>
            <li class="breadcrumb-item active">{{ product?.name || 'Detalle' }}</li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="container py-5 text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container py-5">
      <div class="error-card">
        <div class="error-icon">
          <i class="ti ti-alert-circle"></i>
        </div>
        <h3>Error al cargar el producto</h3>
        <p>{{ error }}</p>
        <router-link to="/shop/catalog" class="btn-back-catalog">
          Volver al Catálogo
        </router-link>
      </div>
    </div>

    <!-- Product Content -->
    <div v-else-if="product" class="product-container">
      <div class="container-fluid px-4 py-3">
        <div class="row g-4">
          <!-- Left Column - Product Image -->
          <div class="col-lg-6">
            <div class="product-image-wrapper">
              <div class="product-badge" v-if="product.stock_available <= 0">
                <span class="badge-out-of-stock">Agotado</span>
              </div>
              <div class="product-image-main">
                <img
                  :src="selectedImageUrl"
                  :alt="product.name"
                  class="product-img"
                  @error="handleImageError"
                />

                <!-- Navigation Arrows -->
                <button
                  v-if="allProductImages.length > 1"
                  class="image-nav-btn prev-btn"
                  @click="previousImage"
                  :disabled="selectedImageIndex === 0"
                >
                  <i class="ti ti-chevron-left"></i>
                </button>
                <button
                  v-if="allProductImages.length > 1"
                  class="image-nav-btn next-btn"
                  @click="nextImage"
                  :disabled="selectedImageIndex === allProductImages.length - 1"
                >
                  <i class="ti ti-chevron-right"></i>
                </button>
              </div>
            </div>

            <!-- Thumbnail Gallery Below Main Image -->
            <div v-if="allProductImages.length > 1" class="product-thumbnails-gallery mt-3">
              <div
                v-for="(imageUrl, index) in allProductImages"
                :key="index"
                class="thumbnail-item"
                :class="{ active: selectedImageIndex === index }"
                @click="selectImage(index)"
              >
                <img :src="imageUrl" :alt="`${product.name} ${index + 1}`" />
              </div>
            </div>

            <!-- Description Below Image -->
            <div v-if="product.description" class="product-description-box mt-3">
              <h5 class="desc-title-sm">Descripción</h5>
              <p class="desc-text-sm">{{ product.description }}</p>
            </div>
          </div>

          <!-- Right Column - Product Info -->
          <div class="col-lg-6">
            <div class="product-info-wrapper">
              <!-- Badges -->
              <div class="product-badges mb-2">
                <span class="category-badge">{{ product.category_name || 'Producto' }}</span>
                <span v-if="product.brand_name" class="brand-badge">{{ product.brand_name }}</span>
              </div>

              <!-- Title -->
              <h1 class="product-title-compact">{{ product.name }}</h1>

              <!-- Code and Availability in one row -->
              <div class="product-info-row mb-3">
                <div class="info-col">
                  <span class="meta-label-sm">Código:</span>
                  <span class="meta-value-sm">{{ product.code }}</span>
                </div>
                <div class="info-col">
                  <span class="availability-badge-sm" :class="product.stock_available > 0 ? 'available' : 'out-of-stock'">
                    <i class="ti" :class="product.stock_available > 0 ? 'ti-check-circle' : 'ti-x-circle'"></i>
                    {{ product.stock_available > 0 ? 'Disponible' : 'Agotado' }}
                  </span>
                </div>
              </div>

              <!-- Price Section Compact -->
              <div class="product-price-section-compact">
                <div class="price-row">
                  <span class="currency">L</span>
                  <span class="amount">{{ formatPrice(product.sale_price) }}</span>
                </div>
                <div class="tax-info" v-if="product.tax_rate > 0">
                  + {{ product.tax_rate }}% ISV
                </div>
              </div>

              <!-- Specifications Compact - 2 columns -->
              <div class="product-specifications-compact">
                <h5 class="spec-title-sm">Especificaciones</h5>
                <div class="spec-grid-2col">
                  <div class="spec-item-compact" v-if="product.category_name">
                    <span class="spec-label-sm">Categoría</span>
                    <span class="spec-value-sm">{{ product.category_name }}</span>
                  </div>
                  <div class="spec-item-compact" v-if="product.subcategory_name">
                    <span class="spec-label-sm">Subcategoría</span>
                    <span class="spec-value-sm">{{ product.subcategory_name }}</span>
                  </div>
                  <div class="spec-item-compact" v-if="product.brand_name">
                    <span class="spec-label-sm">Marca</span>
                    <span class="spec-value-sm">{{ product.brand_name }}</span>
                  </div>
                  <div class="spec-item-compact" v-if="product.unit">
                    <span class="spec-label-sm">Unidad</span>
                    <span class="spec-value-sm">{{ product.unit }}</span>
                  </div>
                </div>
              </div>

              <!-- Quantity and Add to Cart - Horizontal -->
              <div class="product-purchase-section-compact">
                <div class="purchase-row">
                  <div class="quantity-selector-compact">
                    <label class="quantity-label-sm">Cantidad</label>
                    <div class="quantity-controls-sm">
                      <button
                        class="qty-btn-sm"
                        type="button"
                        @click="decreaseQuantity"
                        :disabled="quantity <= 1"
                      >
                        <i class="ti ti-minus"></i>
                      </button>
                      <input
                        type="number"
                        class="qty-input-sm"
                        v-model.number="quantity"
                        min="1"
                        :max="product.stock_available"
                        readonly
                      />
                      <button
                        class="qty-btn-sm"
                        type="button"
                        @click="increaseQuantity"
                        :disabled="quantity >= product.stock_available || product.stock_available <= 0"
                      >
                        <i class="ti ti-plus"></i>
                      </button>
                    </div>
                  </div>

                  <button
                    class="btn-add-to-cart-compact"
                    @click="addToCart"
                    :disabled="product.stock_available <= 0 || addingToCart"
                  >
                    <i class="ti ti-shopping-cart"></i>
                    {{ addingToCart ? 'Agregando...' : 'Agregar al carrito' }}
                  </button>
                </div>
              </div>

              <!-- Success Message -->
              <div v-if="addedToCart" class="alert-success-custom-sm mt-2">
                <i class="ti ti-check-circle"></i>
                Producto agregado exitosamente
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productsService, companyService } from '@/api/ecommerce'
import ShopHeader from '@/components/ShopHeader.vue'

export default {
  name: 'ProductDetailModern',
  components: {
    ShopHeader
  },
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
    const companyInfo = ref(null)
    const selectedImageIndex = ref(0)

    const productId = computed(() => route.params.id)

    // Computed para obtener todas las imágenes (imagen principal + galería)
    const allProductImages = computed(() => {
      if (!product.value) return []

      const images = []

      // Agregar imagen principal primero
      const mainImage = getProductImage(product.value)
      images.push(mainImage)

      // Agregar imágenes de galería si existen
      if (product.value.gallery_images && product.value.gallery_images.length > 0) {
        product.value.gallery_images.forEach(galleryImg => {
          if (galleryImg.image_url) {
            images.push(galleryImg.image_url)
          }
        })
      }

      return images
    })

    // Computed para la imagen seleccionada actualmente
    const selectedImageUrl = computed(() => {
      if (allProductImages.value.length === 0) {
        return 'https://via.placeholder.com/500x500?text=Sin+Imagen'
      }
      return allProductImages.value[selectedImageIndex.value] || allProductImages.value[0]
    })

    // Función para seleccionar una imagen
    const selectImage = (index) => {
      selectedImageIndex.value = index
    }

    // Función para ir a la imagen anterior
    const previousImage = () => {
      if (selectedImageIndex.value > 0) {
        selectedImageIndex.value--
      }
    }

    // Función para ir a la siguiente imagen
    const nextImage = () => {
      if (selectedImageIndex.value < allProductImages.value.length - 1) {
        selectedImageIndex.value++
      }
    }

    const fetchProduct = async () => {
      try {
        loading.value = true
        error.value = null

        const response = await productsService.getProductDetails(productId.value)

        if (response.success && response.data) {
          product.value = response.data
          console.log('Product loaded:', product.value)
        } else {
          error.value = 'Producto no encontrado'
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        error.value = err.response?.data?.message || 'Error al obtener detalles del producto'
      } finally {
        loading.value = false
      }
    }

    const loadCompanyInfo = async () => {
      try {
        const response = await companyService.getDefaultCompany()
        if (response.success && response.data) {
          companyInfo.value = response.data
        }
      } catch (error) {
        console.error('Error loading company info:', error)
      }
    }

    const getProductImage = (product) => {
      // Prioridad 1: image_url (URL completa)
      if (product.image_url) {
        return product.image_url
      }

      // Prioridad 2: image field
      if (product.image) {
        // Si ya es una URL completa
        if (product.image.startsWith('http://') || product.image.startsWith('https://')) {
          return product.image
        }

        // Si es una ruta relativa, construir URL completa
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'

        // Si comienza con /, usar directamente
        if (product.image.startsWith('/')) {
          return `${baseUrl}${product.image}`
        }

        // Si no, agregar /uploads/
        return `${baseUrl}/uploads/${product.image}`
      }

      // Placeholder por defecto
      return 'https://via.placeholder.com/500x500?text=Sin+Imagen'
    }

    const handleImageError = (event) => {
      console.error('Error loading image:', event)
      event.target.src = 'https://via.placeholder.com/500x500?text=Sin+Imagen'
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
      // Verificar si el usuario está autenticado
      const token = localStorage.getItem('ecommerce_token')
      if (!token) {
        // Redirigir al login si no está autenticado
        router.push('/login')
        return
      }

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
            code: product.value.code,
            name: product.value.name,
            image: product.value.image,
            category: product.value.category_name || '',
            subcategory: product.value.subcategory_name || '',
            brand: product.value.brand_name || '',
            price: product.value.sale_price,
            tax_rate: product.value.tax_rate || 0,
            quantity: quantity.value,
            unit: product.value.unit || 'UND'
          })
        }

        localStorage.setItem('ecommerce_cart', JSON.stringify(cart))
        cartCount.value = cart.reduce((total, item) => total + item.quantity, 0)
        window.dispatchEvent(new Event('cart-updated'))

        addedToCart.value = true
        setTimeout(() => {
          addedToCart.value = false
        }, 3000)
      } catch (err) {
        console.error('Error adding to cart:', err)
      } finally {
        addingToCart.value = false
      }
    }

    const loadCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('ecommerce_cart') || '[]')
      cartCount.value = cart.reduce((total, item) => total + item.quantity, 0)
    }

    onMounted(() => {
      fetchProduct()
      loadCompanyInfo()
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
      companyInfo,
      selectedImageIndex,
      allProductImages,
      selectedImageUrl,
      getProductImage,
      handleImageError,
      formatPrice,
      increaseQuantity,
      decreaseQuantity,
      addToCart,
      selectImage,
      previousImage,
      nextImage
    }
  }
}
</script>

<style scoped>
.product-detail-modern {
  min-height: 100vh;
  background: #f8f9fa;
}

/* Navigation Bar (igual que home) */
/* Breadcrumb */
.breadcrumb-section {
  background: white;
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.breadcrumb {
  margin: 0;
  background: transparent;
  padding: 0;
}

.breadcrumb-item a {
  color: #64748b;
  text-decoration: none;
}

.breadcrumb-item a:hover {
  color: #1e40af;
}

.breadcrumb-item.active {
  color: #1e40af;
  font-weight: 500;
}

/* Product Container */
.product-container {
  background: white;
  min-height: 60vh;
}

/* Product Image - Compact */
.product-image-wrapper {
  position: relative;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  padding: 1rem;
}

.product-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
}

.badge-out-of-stock {
  background: #ef4444;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-weight: 600;
  font-size: 0.8rem;
}

.product-image-main {
  position: relative;
  width: 100%;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 6px;
}

.product-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Navigation Arrows */
.image-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 5;
  color: #1e293b;
  font-size: 1.5rem;
}

.image-nav-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.95);
  color: white;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.image-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.5);
}

.prev-btn {
  left: 10px;
}

.next-btn {
  right: 10px;
}

/* Additional Info Below Image */
.product-additional-info {
  margin-top: 2rem;
}

.info-card {
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 1.5rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.info-item i {
  font-size: 2rem;
  color: #1e40af;
  flex-shrink: 0;
}

.info-item h6 {
  margin: 0;
  font-weight: 600;
  color: #1e293b;
  font-size: 1rem;
}

.info-item p {
  margin: 0.25rem 0 0 0;
  color: #64748b;
  font-size: 0.875rem;
}

/* Product Info */
.product-info-wrapper {
  padding: 0 1rem;
}

.product-badges {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.category-badge, .brand-badge {
  background: #1e40af;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.brand-badge {
  background: #64748b;
}

.product-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 1rem 0;
  line-height: 1.2;
}

.product-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.meta-label {
  color: #64748b;
  font-weight: 500;
}

.meta-value {
  color: #1e293b;
  font-weight: 600;
}

/* Availability */
.availability-section {
  margin: 1.5rem 0;
}

.availability-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
}

.availability-badge.available {
  background: #dcfce7;
  color: #166534;
}

.availability-badge.out-of-stock {
  background: #fee2e2;
  color: #991b1b;
}

/* Price Section */
.product-price-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-radius: 12px;
  margin: 2rem 0;
}

.price-main {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  color: white;
}

.currency {
  font-size: 1.5rem;
  font-weight: 600;
}

.amount {
  font-size: 3rem;
  font-weight: 700;
}

.price-tax {
  color: rgba(255,255,255,0.9);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Specifications */
.product-specifications {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 2rem 0;
}

.spec-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.spec-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.spec-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.spec-item:last-child {
  border-bottom: none;
}

.spec-label {
  color: #64748b;
  font-weight: 500;
  min-width: 150px;
}

.spec-value {
  color: #1e293b;
  font-weight: 600;
  flex: 1;
}

/* Purchase Section */
.product-purchase-section {
  margin: 2rem 0;
}

.quantity-selector {
  margin-bottom: 1rem;
}

.quantity-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.qty-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #1e40af;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.qty-btn:hover:not(:disabled) {
  background: #e2e8f0;
  transform: scale(1.1);
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-input {
  width: 80px;
  height: 40px;
  text-align: center;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
}

.btn-add-to-cart {
  width: 100%;
  background: #f97316;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add-to-cart:hover:not(:disabled) {
  background: #ea580c;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(249, 115, 22, 0.3);
}

.btn-add-to-cart:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
}

.alert-success-custom {
  background: #dcfce7;
  border: 1px solid #86efac;
  color: #166534;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

/* Description */
.product-description {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e2e8f0;
}

.desc-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.desc-text {
  color: #475569;
  line-height: 1.6;
  font-size: 1rem;
}

/* Error State */
.error-card {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.error-icon {
  font-size: 4rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.btn-back-catalog {
  display: inline-block;
  background: #1e40af;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  margin-top: 1rem;
  transition: all 0.3s;
}

.btn-back-catalog:hover {
  background: #1e3a8a;
  transform: translateY(-2px);
  color: white;
}

/* New Compact Styles */
.product-description-box {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
}

.desc-title-sm {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.desc-text-sm {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

.info-card-sm {
  background: #dbeafe;
  border: 1px solid #93c5fd;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e40af;
}

.info-card-sm i {
  font-size: 1.25rem;
}

.product-title-compact {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0.5rem 0;
  line-height: 1.3;
}

.product-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.info-col {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-label-sm {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.meta-value-sm {
  color: #1e293b;
  font-size: 0.875rem;
  font-weight: 600;
}

.availability-badge-sm {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
}

.availability-badge-sm.available {
  background: #dcfce7;
  color: #166534;
}

.availability-badge-sm.out-of-stock {
  background: #fee2e2;
  color: #991b1b;
}

.product-price-section-compact {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.25rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  color: white;
}

.tax-info {
  color: rgba(255,255,255,0.9);
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.product-specifications-compact {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin: 1rem 0;
}

.spec-title-sm {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

.spec-grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.spec-item-compact {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.spec-label-sm {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.spec-value-sm {
  color: #1e293b;
  font-size: 0.875rem;
  font-weight: 600;
}

.product-purchase-section-compact {
  margin: 1.25rem 0;
}

.purchase-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.quantity-selector-compact {
  flex-shrink: 0;
}

.quantity-label-sm {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.quantity-controls-sm {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qty-btn-sm {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #1e40af;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.qty-btn-sm:hover:not(:disabled) {
  background: #e2e8f0;
}

.qty-btn-sm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-input-sm {
  width: 60px;
  height: 36px;
  text-align: center;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
}

.btn-add-to-cart-compact {
  flex: 1;
  background: #f97316;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add-to-cart-compact:hover:not(:disabled) {
  background: #ea580c;
  transform: translateY(-1px);
}

.btn-add-to-cart-compact:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
}

.alert-success-custom-sm {
  background: #dcfce7;
  border: 1px solid #86efac;
  color: #166534;
  padding: 0.75rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}

/* Product Thumbnails Gallery */
.product-thumbnails-gallery {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  padding: 4px;
}

.thumbnail-item:hover {
  border-color: #667eea;
  transform: scale(1.05);
}

.thumbnail-item.active {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-menu {
    display: none;
  }

  .product-title-compact {
    font-size: 1.25rem;
  }

  .amount {
    font-size: 1.75rem;
  }

  .product-image-main {
    height: 250px;
  }

  .spec-grid-2col {
    grid-template-columns: 1fr;
  }

  .purchase-row {
    flex-direction: column;
    align-items: stretch;
  }

  .quantity-selector-compact {
    width: 100%;
  }

  .product-thumbnails-gallery {
    justify-content: center;
  }

  .thumbnail-item {
    width: 70px;
    height: 70px;
  }

  .image-nav-btn {
    width: 38px;
    height: 38px;
    font-size: 1.2rem;
  }

  .prev-btn {
    left: 5px;
  }

  .next-btn {
    right: 5px;
  }
}
</style>
