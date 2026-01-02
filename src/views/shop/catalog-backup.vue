<template>
  <div class="main-wrapper">
    <layout-header></layout-header>
    <layout-sidebar></layout-sidebar>

    <div class="page-wrapper">
      <div class="content">
        <div class="page-header">
          <div class="add-item d-flex">
            <div class="page-title">
              <h4>Catálogo de Productos</h4>
              <h6>Explora nuestros productos disponibles</h6>
            </div>
          </div>
          <ul class="table-top-head">
            <li>
              <div class="page-btn" style="width: 100%;">
                <router-link to="/ecommerce/cart" class="btn btn-primary btn-lg w-100" style="min-width: 200px; padding: 12px 24px; font-size: 16px;">
                  <i class="ti ti-shopping-cart me-2"></i>
                  Ver Carrito de Compras
                  <span v-if="cartCount > 0" class="badge bg-white text-primary ms-2 px-3 py-2" style="font-size: 14px;">{{ cartCount }}</span>
                </router-link>
              </div>
            </li>
          </ul>
        </div>

        <!-- Filters -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-lg-3 col-sm-6">
                <div class="input-blocks">
                  <i class="ti ti-search"></i>
                  <input
                    v-model="searchQuery"
                    @input="handleSearch"
                    type="text"
                    class="form-control"
                    placeholder="Buscar productos..."
                  />
                </div>
              </div>
              <div class="col-lg-3 col-sm-6">
                <select v-model="selectedCategory" @change="loadProducts" class="form-select">
                  <option :value="null">Todas las categorías</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <div class="col-lg-3 col-sm-6">
                <select v-model="selectedBrand" @change="loadProducts" class="form-select">
                  <option :value="null">Todas las marcas</option>
                  <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                    {{ brand.name }}
                  </option>
                </select>
              </div>
              <div class="col-lg-3 col-sm-6">
                <select v-model="sortBy" @change="loadProducts" class="form-select">
                  <option value="newest">Más vendidos</option>
                  <option value="name_asc">Nombre A-Z</option>
                  <option value="price_asc">Precio: Menor a Mayor</option>
                  <option value="price_desc">Precio: Mayor a Menor</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Grid -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>

        <div v-else-if="products.length === 0" class="card">
          <div class="card-body text-center py-5">
            <i class="ti ti-shopping-cart-off" style="font-size: 48px; color: #ccc;"></i>
            <p class="mt-3">No se encontraron productos</p>
          </div>
        </div>

        <div v-else class="row">
          <div
            v-for="product in products"
            :key="product.id"
            class="col-xl-3 col-lg-4 col-md-6 col-sm-6"
          >
            <div class="card product-card">
              <div class="card-body">
                <router-link :to="`/ecommerce/product/${product.id}`" class="text-decoration-none text-dark">
                  <div class="product-image text-center">
                    <img
                      :src="getProductImage(product)"
                      :alt="product.name"
                      class="img-fluid"
                      style="max-height: 200px; object-fit: contain;"
                    />
                    <span v-if="product.stock_available <= 0" class="badge bg-danger position-absolute top-0 end-0 m-2">
                      Agotado
                    </span>
                  </div>
                  <div class="product-details mt-3">
                    <h6 class="product-name">{{ product.name }}</h6>
                    <p class="text-muted small mb-2">{{ product.category_name }}</p>
                  </div>
                </router-link>
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 class="text-primary mb-0">L{{ formatPrice(product.sale_price) }}</h5>
                    <small v-if="product.tax_rate > 0" class="text-muted">
                      + {{ product.tax_rate }}% ISV
                    </small>
                  </div>
                  <button
                    @click="addToCart(product)"
                    class="btn btn-sm btn-primary"
                    :disabled="product.stock_available <= 0"
                  >
                    <i class="ti ti-shopping-cart-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.totalPages > 1" class="row mt-4">
          <div class="col-12">
            <nav>
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: pagination.page === 1 }">
                  <a class="page-link" @click="goToPage(pagination.page - 1)" href="javascript:void(0);">
                    Anterior
                  </a>
                </li>
                <li class="page-item active">
                  <span class="page-link">
                    Página {{ pagination.page }} de {{ pagination.totalPages }}
                  </span>
                </li>
                <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
                  <a class="page-link" @click="goToPage(pagination.page + 1)" href="javascript:void(0);">
                    Siguiente
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { productsService, cartService } from '@/api/ecommerce'

export default {
  name: 'EcommerceCatalog',
  setup() {
    const router = useRouter()

    const products = ref([])
    const categories = ref([])
    const brands = ref([])
    const pagination = ref(null)
    const loading = ref(false)
    const cartCount = ref(0)

    const searchQuery = ref('')
    const selectedCategory = ref(null)
    const selectedBrand = ref(null)
    const sortBy = ref('newest')
    const currentPage = ref(1)

    const loadProducts = async () => {
      try {
        loading.value = true
        const response = await productsService.getCatalog({
          search: searchQuery.value,
          category_id: selectedCategory.value,
          brand_id: selectedBrand.value,
          sort: sortBy.value,
          page: currentPage.value,
          limit: 20
        })

        if (response.success) {
          products.value = response.data.products || []
          pagination.value = response.data.pagination
        }
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        loading.value = false
      }
    }

    const loadCategories = async () => {
      try {
        const response = await productsService.getCategories()
        if (response.success) {
          categories.value = response.data || []
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }

    const loadBrands = async () => {
      try {
        const response = await productsService.getBrands()
        if (response.success) {
          brands.value = response.data || []
        }
      } catch (error) {
        console.error('Error loading brands:', error)
      }
    }

    const loadCartCount = async () => {
      try {
        const response = await cartService.getCart()
        if (response.success) {
          cartCount.value = response.data.items?.length || 0
        }
      } catch (error) {
        // Si no está autenticado, simplemente no mostrar el contador
        // No es un error crítico para la navegación
        cartCount.value = 0
      }
    }

    const addToCart = async (product) => {
      try {
        const response = await cartService.addItem(product.id, 1)

        if (response.success) {
          cartCount.value++
          alert('Producto agregado al carrito')
        }
      } catch (error) {
        console.error('Error adding to cart:', error)
        // Si es error 401, significa que necesita autenticarse
        if (error.response?.status === 401) {
          const shouldLogin = confirm('Debes iniciar sesión para agregar productos al carrito. ¿Deseas iniciar sesión ahora?')
          if (shouldLogin) {
            router.push('/ecommerce/login')
          }
        } else {
          alert('Error al agregar el producto al carrito')
        }
      }
    }

    const handleSearch = () => {
      currentPage.value = 1
      loadProducts()
    }

    const goToPage = (page) => {
      if (page >= 1 && page <= pagination.value.totalPages) {
        currentPage.value = page
        loadProducts()
      }
    }

    const formatPrice = (price) => {
      return parseFloat(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    const getProductImage = (product) => {
      if (product.image) {
        return `${import.meta.env.VITE_UPLOAD_URL || 'http://localhost:3000/uploads'}/products/${product.image}`
      }
      return '/placeholder-product.svg'
    }

    onMounted(() => {
      loadProducts()
      loadCategories()
      loadBrands()
      loadCartCount()
    })

    return {
      products,
      categories,
      brands,
      pagination,
      loading,
      cartCount,
      searchQuery,
      selectedCategory,
      selectedBrand,
      sortBy,
      loadProducts,
      addToCart,
      handleSearch,
      goToPage,
      formatPrice,
      getProductImage
    }
  }
}
</script>

<style scoped>
.product-card {
  height: 100%;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.product-card .product-image {
  cursor: pointer;
}

.product-card .product-image img {
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
