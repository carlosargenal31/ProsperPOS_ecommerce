<template>
  <div class="shop-catalog">
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
            <router-link to="/shop/catalog" class="nav-link active">Productos</router-link>
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
      <div class="container-fluid px-4">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><router-link to="/shop/home">Inicio</router-link></li>
            <li class="breadcrumb-item active">Productos</li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Catalog Section -->
    <div class="catalog-container">
      <div class="container-fluid px-4">
        <div class="row">
          <!-- Sidebar Filters -->
          <div class="col-lg-3">
            <div class="filters-sidebar">
              <div class="filter-header">
                <h3>Filtrar por</h3>
                <button v-if="hasActiveFilters" @click="clearFilters" class="btn-clear">
                  Limpiar filtros
                </button>
              </div>

              <!-- Search Filter -->
              <div class="filter-group">
                <div class="search-box">
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

              <!-- Category Filter -->
              <div class="filter-group">
                <button class="filter-toggle" @click="toggleFilter('category')">
                  <span>Categoría</span>
                  <i class="ti" :class="filterStates.category ? 'ti-chevron-up' : 'ti-chevron-down'"></i>
                </button>
                <div v-show="filterStates.category" class="filter-options">
                  <div class="filter-option">
                    <input
                      type="radio"
                      id="category-all"
                      :value="null"
                      v-model="selectedCategory"
                      @change="loadProducts"
                    />
                    <label for="category-all">Todos</label>
                  </div>
                  <div
                    v-for="category in categories"
                    :key="category.id"
                    class="filter-option"
                  >
                    <input
                      type="radio"
                      :id="`category-${category.id}`"
                      :value="category.id"
                      v-model="selectedCategory"
                      @change="loadProducts"
                    />
                    <label :for="`category-${category.id}`">{{ category.name }}</label>
                  </div>
                </div>
              </div>

              <!-- Color Filter -->
              <div class="filter-group">
                <button class="filter-toggle" @click="toggleFilter('color')">
                  <span>Color</span>
                  <i class="ti" :class="filterStates.color ? 'ti-chevron-up' : 'ti-chevron-down'"></i>
                </button>
                <div v-show="filterStates.color" class="filter-options">
                  <div class="color-swatches">
                    <button
                      v-for="color in colors"
                      :key="color.name"
                      class="color-swatch"
                      :class="{ active: selectedColor === color.name }"
                      :style="{ backgroundColor: color.hex }"
                      :title="color.name"
                      @click="selectColor(color.name)"
                    ></button>
                  </div>
                </div>
              </div>

              <!-- Characteristics Filter -->
              <div class="filter-group">
                <button class="filter-toggle" @click="toggleFilter('characteristics')">
                  <span>Características</span>
                  <i class="ti" :class="filterStates.characteristics ? 'ti-chevron-up' : 'ti-chevron-down'"></i>
                </button>
                <div v-show="filterStates.characteristics" class="filter-options">
                  <div class="filter-option">
                    <input
                      type="checkbox"
                      id="char-1"
                      value="ceramic"
                      v-model="selectedCharacteristics"
                      @change="loadProducts"
                    />
                    <label for="char-1">Cerámica</label>
                  </div>
                  <div class="filter-option">
                    <input
                      type="checkbox"
                      id="char-2"
                      value="porcelain"
                      v-model="selectedCharacteristics"
                      @change="loadProducts"
                    />
                    <label for="char-2">Porcelanato</label>
                  </div>
                  <div class="filter-option">
                    <input
                      type="checkbox"
                      id="char-3"
                      value="wood"
                      v-model="selectedCharacteristics"
                      @change="loadProducts"
                    />
                    <label for="char-3">Madera</label>
                  </div>
                </div>
              </div>

              <!-- Simulation Filter -->
              <div class="filter-group">
                <button class="filter-toggle" @click="toggleFilter('simulation')">
                  <span>Simulación</span>
                  <i class="ti" :class="filterStates.simulation ? 'ti-chevron-up' : 'ti-chevron-down'"></i>
                </button>
                <div v-show="filterStates.simulation" class="filter-options">
                  <div class="filter-option">
                    <input
                      type="radio"
                      id="sim-all"
                      :value="null"
                      v-model="selectedSimulation"
                      @change="loadProducts"
                    />
                    <label for="sim-all">Todos</label>
                  </div>
                  <div class="filter-option">
                    <input
                      type="radio"
                      id="sim-wood"
                      value="wood"
                      v-model="selectedSimulation"
                      @change="loadProducts"
                    />
                    <label for="sim-wood">Madera</label>
                  </div>
                  <div class="filter-option">
                    <input
                      type="radio"
                      id="sim-marble"
                      value="marble"
                      v-model="selectedSimulation"
                      @change="loadProducts"
                    />
                    <label for="sim-marble">Mármol</label>
                  </div>
                  <div class="filter-option">
                    <input
                      type="radio"
                      id="sim-stone"
                      value="stone"
                      v-model="selectedSimulation"
                      @change="loadProducts"
                    />
                    <label for="sim-stone">Piedra</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Products Grid -->
          <div class="col-lg-9">
            <!-- Catalog Header -->
            <div class="catalog-header">
              <div class="catalog-header-left">
                <h1 class="catalog-title">Catálogo de Productos</h1>
                <p class="catalog-count" v-if="pagination">
                  Mostrando {{ products.length }} de {{ pagination.total }} productos
                </p>
              </div>

              <div class="catalog-header-right">
                <!-- Sort Dropdown -->
                <div class="sort-dropdown">
                  <label>Ordenar por</label>
                  <select v-model="sortBy" @change="loadProducts" class="form-select">
                    <option value="newest">Más recientes</option>
                    <option value="name_asc">Nombre A-Z</option>
                    <option value="name_desc">Nombre Z-A</option>
                    <option value="price_asc">Precio: Menor a Mayor</option>
                    <option value="price_desc">Precio: Mayor a Menor</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Catalog Tabs -->
            <div class="catalog-tabs">
              <button
                @click="switchView('porcelain')"
                class="catalog-tab"
                :class="{ active: currentView === 'porcelain' }"
              >
                Catálogo Porcelanato
              </button>
              <button
                @click="switchView('ceramic')"
                class="catalog-tab"
                :class="{ active: currentView === 'ceramic' }"
              >
                Catálogo Cerámica
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-3">Cargando productos...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="products.length === 0" class="empty-state">
              <div class="empty-icon">
                <i class="ti ti-box-off"></i>
              </div>
              <h3>No se encontraron productos</h3>
              <p>Intenta ajustar los filtros de búsqueda</p>
              <button @click="clearFilters" class="btn btn-primary">
                Limpiar filtros
              </button>
            </div>

            <!-- Products Grid -->
            <div v-else class="products-grid">
              <div
                v-for="product in products"
                :key="product.id"
                class="product-card"
              >
                <router-link :to="`/shop/product/${product.id}`" class="product-link">
                  <div class="product-image-wrapper">
                    <img
                      :src="getProductImage(product)"
                      :alt="product.name"
                      class="product-image"
                    />
                    <div class="product-overlay">
                      <button class="btn-quick-view">
                        <i class="ti ti-eye"></i>
                        Vista Rápida
                      </button>
                    </div>
                    <span v-if="product.stock_available <= 0" class="badge-out-of-stock">
                      Agotado
                    </span>
                  </div>

                  <div class="product-details">
                    <h3 class="product-name">{{ product.name }}</h3>
                    <p class="product-category" v-if="product.category_name">
                      {{ product.category_name }}
                    </p>
                  </div>
                </router-link>

                <div class="product-footer">
                  <div class="product-price">
                    <span class="price-amount">L{{ formatPrice(product.sale_price) }} {{ product.unit || 'UNIDAD' }}</span>
                    <span v-if="product.tax_rate > 0" class="price-tax">
                      + {{ product.tax_rate }}% ISV
                    </span>
                  </div>

                  <button
                    @click="addToCart(product)"
                    class="btn-add-cart"
                    :disabled="product.stock_available <= 0"
                  >
                    <i class="ti ti-shopping-cart-plus"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="pagination && pagination.totalPages > 1" class="pagination-wrapper">
              <nav>
                <ul class="pagination">
                  <li class="page-item" :class="{ disabled: pagination.page === 1 }">
                    <button class="page-link" @click="goToPage(pagination.page - 1)">
                      <i class="ti ti-chevron-left"></i>
                    </button>
                  </li>

                  <li
                    v-for="page in paginationPages"
                    :key="page"
                    class="page-item"
                    :class="{ active: pagination.page === page }"
                  >
                    <button class="page-link" @click="goToPage(page)">
                      {{ page }}
                    </button>
                  </li>

                  <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
                    <button class="page-link" @click="goToPage(pagination.page + 1)">
                      <i class="ti ti-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { productsService, cartService } from '@/api/ecommerce'

export default {
  name: 'ShopCatalog',
  setup() {
    const router = useRouter()
    const route = useRoute()

    const products = ref([])
    const categories = ref([])
    const pagination = ref(null)
    const loading = ref(false)
    const cartCount = ref(0)

    const searchQuery = ref('')
    const selectedCategory = ref(null)
    const selectedColor = ref(null)
    const selectedCharacteristics = ref([])
    const selectedSimulation = ref(null)
    const sortBy = ref('newest')
    const currentPage = ref(1)
    const currentView = ref('porcelain')

    const filterStates = reactive({
      category: true,
      color: true,
      characteristics: true,
      simulation: true
    })

    const colors = [
      { name: 'BLUE', hex: '#2563EB' },
      { name: 'BEIGE', hex: '#F5DEB3' },
      { name: 'WHITE', hex: '#FFFFFF' },
      { name: 'BROWN', hex: '#8B4513' },
      { name: 'GRAY', hex: '#6B7280' },
      { name: 'LIGHT_GRAY', hex: '#D1D5DB' },
      { name: 'GOLD', hex: '#FFD700' },
      { name: 'BLACK', hex: '#000000' },
      { name: 'GREEN', hex: '#059669' }
    ]

    const hasActiveFilters = computed(() => {
      return searchQuery.value ||
        selectedCategory.value ||
        selectedColor.value ||
        selectedCharacteristics.value.length > 0 ||
        selectedSimulation.value
    })

    const paginationPages = computed(() => {
      if (!pagination.value) return []
      const total = pagination.value.totalPages
      const current = pagination.value.page
      const pages = []

      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i)
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) pages.push(i)
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) pages.push(i)
          pages.push('...')
          pages.push(total)
        }
      }

      return pages
    })

    const loadProducts = async () => {
      try {
        loading.value = true
        const response = await productsService.getCatalog({
          search: searchQuery.value,
          category_id: selectedCategory.value,
          color: selectedColor.value,
          characteristics: selectedCharacteristics.value,
          simulation: selectedSimulation.value,
          sort: sortBy.value,
          page: currentPage.value,
          limit: 24,
          view: currentView.value
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

    const loadCartCount = async () => {
      try {
        const cart = JSON.parse(localStorage.getItem('ecommerce_cart') || '[]')
        cartCount.value = cart.reduce((sum, item) => sum + item.quantity, 0)
      } catch (error) {
        cartCount.value = 0
      }
    }

    const toggleFilter = (filterName) => {
      filterStates[filterName] = !filterStates[filterName]
    }

    const selectColor = (color) => {
      if (selectedColor.value === color) {
        selectedColor.value = null
      } else {
        selectedColor.value = color
      }
      loadProducts()
    }

    const switchView = (view) => {
      currentView.value = view
      currentPage.value = 1
      loadProducts()
    }

    const clearFilters = () => {
      searchQuery.value = ''
      selectedCategory.value = null
      selectedColor.value = null
      selectedCharacteristics.value = []
      selectedSimulation.value = null
      currentPage.value = 1
      loadProducts()
    }

    const handleSearch = () => {
      currentPage.value = 1
      loadProducts()
    }

    const goToPage = (page) => {
      if (page >= 1 && page <= pagination.value.totalPages && page !== '...') {
        currentPage.value = page
        loadProducts()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    const addToCart = async (product) => {
      try {
        const cart = JSON.parse(localStorage.getItem('ecommerce_cart') || '[]')
        const existingItemIndex = cart.findIndex(item => item.product_id === product.id)

        if (existingItemIndex !== -1) {
          cart[existingItemIndex].quantity += 1
        } else {
          cart.push({
            product_id: product.id,
            product_code: product.code,
            product_name: product.name,
            product_image: product.image,
            price: product.sale_price,
            quantity: 1,
            unit: product.unit,
            tax_rate: product.tax_rate || 0
          })
        }

        localStorage.setItem('ecommerce_cart', JSON.stringify(cart))
        cartCount.value++

        alert('Producto agregado al carrito')
      } catch (error) {
        console.error('Error adding to cart:', error)
        alert('Error al agregar el producto al carrito')
      }
    }

    const formatPrice = (price) => {
      if (!price && price !== 0) return '0.00'
      return parseFloat(price).toLocaleString('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
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
      loadCartCount()

      // Load filters from URL query params
      if (route.query.category) {
        selectedCategory.value = parseInt(route.query.category)
      }
    })

    return {
      products,
      categories,
      pagination,
      loading,
      cartCount,
      searchQuery,
      selectedCategory,
      selectedColor,
      selectedCharacteristics,
      selectedSimulation,
      sortBy,
      currentView,
      filterStates,
      colors,
      hasActiveFilters,
      paginationPages,
      loadProducts,
      toggleFilter,
      selectColor,
      switchView,
      clearFilters,
      handleSearch,
      goToPage,
      addToCart,
      formatPrice,
      getProductImage
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
  padding: 1rem 0;
}

.breadcrumb {
  margin: 0;
  background: none;
}

.breadcrumb-item a {
  color: var(--primary-color, #FF9F43);
  text-decoration: none;
}

/* Catalog Container */
.catalog-container {
  padding: 2rem 0;
}

/* Filters Sidebar */
.filters-sidebar {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 100px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.filter-header h3 {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
}

.btn-clear {
  background: none;
  border: none;
  color: var(--primary-color, #FF9F43);
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: underline;
}

.filter-group {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1rem;
}

.filter-group:last-child {
  border-bottom: none;
}

.search-box {
  position: relative;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-box input {
  padding-left: 40px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.filter-toggle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  padding: 0.5rem 0;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
}

.filter-options {
  padding-left: 0.5rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.filter-option input[type="checkbox"],
.filter-option input[type="radio"] {
  cursor: pointer;
}

.filter-option label {
  cursor: pointer;
  margin: 0;
  flex: 1;
}

.color-swatches {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
}

.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.color-swatch:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.color-swatch.active {
  border-color: var(--primary-color, #FF9F43);
  border-width: 3px;
}

.color-swatch.active::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  text-shadow: 0 0 3px rgba(0,0,0,0.5);
}

/* Catalog Header */
.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.catalog-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.catalog-count {
  color: #666;
  margin: 0.5rem 0 0 0;
}

.sort-dropdown {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-dropdown label {
  margin: 0;
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
}

.sort-dropdown select {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

/* Catalog Tabs */
.catalog-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
}

.catalog-tab {
  background: none;
  border: none;
  padding: 1rem 2rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.catalog-tab:hover {
  color: var(--primary-color, #FF9F43);
}

.catalog-tab.active {
  color: var(--primary-color, #FF9F43);
  border-bottom-color: var(--primary-color, #FF9F43);
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 5rem;
  color: #ccc;
  margin-bottom: 1rem;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}

.product-link {
  text-decoration: none;
  color: inherit;
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  background: #f5f5f5;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.product-card:hover .product-image {
  transform: scale(1.1);
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.btn-quick-view {
  background: white;
  color: #333;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.btn-quick-view:hover {
  background: var(--primary-color, #FF9F43);
  color: white;
}

.badge-out-of-stock {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #FF6B6B;
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.product-details {
  padding: 1.2rem;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-category {
  color: #999;
  font-size: 0.9rem;
  margin: 0;
}

.product-footer {
  padding: 0 1.2rem 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.product-price {
  display: flex;
  flex-direction: column;
}

.price-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color, #FF9F43);
}

.price-tax {
  font-size: 0.75rem;
  color: #999;
}

.btn-add-cart {
  background: var(--primary-color, #FF9F43);
  color: white;
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.2rem;
}

.btn-add-cart:hover:not(:disabled) {
  background: var(--primary-dark, #e68a2e);
  transform: scale(1.1);
}

.btn-add-cart:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Pagination */
.pagination-wrapper {
  margin-top: 3rem;
  display: flex;
  justify-content: center;
}

.pagination {
  display: flex;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.page-item {
  margin: 0;
}

.page-link {
  background: white;
  border: 1px solid #e0e0e0;
  color: #333;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
}

.page-link:hover {
  background: var(--primary-color, #FF9F43);
  color: white;
  border-color: var(--primary-color, #FF9F43);
}

.page-item.active .page-link {
  background: var(--primary-color, #FF9F43);
  color: white;
  border-color: var(--primary-color, #FF9F43);
}

.page-item.disabled .page-link {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 992px) {
  .filters-sidebar {
    position: static;
    max-height: none;
    margin-bottom: 2rem;
  }

  .navbar-menu {
    display: none;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
}
</style>
