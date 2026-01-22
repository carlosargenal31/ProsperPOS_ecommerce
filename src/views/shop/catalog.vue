<template>
  <div class="shop-catalog">
    <!-- Navigation Bar -->
    <ShopHeader />

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
                <h3>Filtros</h3>
                <button v-if="hasActiveFilters" @click="clearFilters" class="btn-clear">
                  <i class="ti ti-x"></i>
                  Limpiar
                </button>
              </div>

              <!-- Search Filter -->
              <div class="filter-group search-group">
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

              <!-- Price Range Filter -->
              <div class="filter-group">
                <button class="filter-toggle" @click="toggleFilter('price')">
                  <span>Rango de Precio</span>
                  <i class="ti" :class="filterStates.price ? 'ti-chevron-up' : 'ti-chevron-down'"></i>
                </button>
                <div v-show="filterStates.price" class="filter-options price-range-content">
                  <div class="price-inputs">
                    <div class="price-input-group">
                      <label>Mínimo</label>
                      <div class="input-with-currency">
                        <span class="currency">L</span>
                        <input
                          type="number"
                          v-model.number="priceMin"
                          @change="applyPriceFilter"
                          placeholder="0"
                          min="0"
                          class="form-control"
                        />
                      </div>
                    </div>
                    <span class="price-separator">-</span>
                    <div class="price-input-group">
                      <label>Máximo</label>
                      <div class="input-with-currency">
                        <span class="currency">L</span>
                        <input
                          type="number"
                          v-model.number="priceMax"
                          @change="applyPriceFilter"
                          placeholder="10000"
                          min="0"
                          class="form-control"
                        />
                      </div>
                    </div>
                  </div>
                  <button @click="applyPriceFilter" class="btn-apply-price">Aplicar</button>
                </div>
              </div>

              <!-- Categories & Subcategories Combined -->
              <div class="filter-group">
                <button class="filter-toggle" @click="toggleFilter('categories')">
                  <span>Categorías</span>
                  <i class="ti" :class="filterStates.categories ? 'ti-chevron-up' : 'ti-chevron-down'"></i>
                </button>
                <div v-show="filterStates.categories" class="filter-options categories-tree">
                  <div
                    v-for="category in categories"
                    :key="category.id"
                    class="category-item"
                  >
                    <div class="category-checkbox">
                      <input
                        type="checkbox"
                        :id="`category-${category.id}`"
                        :value="category.id"
                        v-model="selectedCategories"
                        @change="loadProducts"
                      />
                      <label :for="`category-${category.id}`" class="category-label">
                        {{ category.name }}
                      </label>
                      <button
                        v-if="getCategorySubcategories(category.id).length > 0"
                        @click="toggleCategory(category.id)"
                        class="category-expand"
                        type="button"
                      >
                        <i class="ti" :class="expandedCategories.includes(category.id) ? 'ti-chevron-up' : 'ti-chevron-down'"></i>
                      </button>
                    </div>

                    <!-- Subcategories -->
                    <div
                      v-show="expandedCategories.includes(category.id)"
                      class="subcategories-list"
                    >
                      <div
                        v-for="subcategory in getCategorySubcategories(category.id)"
                        :key="subcategory.id"
                        class="filter-option subcategory-option"
                      >
                        <input
                          type="checkbox"
                          :id="`subcategory-${subcategory.id}`"
                          :value="subcategory.id"
                          v-model="selectedSubcategories"
                          @change="loadProducts"
                        />
                        <label :for="`subcategory-${subcategory.id}`">{{ subcategory.name }}</label>
                      </div>
                    </div>
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
                      v-for="color in availableColors"
                      :key="color.value"
                      class="color-swatch"
                      :class="{ active: selectedColors.includes(color.value) }"
                      :style="{ backgroundColor: color.hex }"
                      :title="color.label"
                      @click="toggleColor(color.value)"
                      type="button"
                    >
                      <i v-if="selectedColors.includes(color.value)" class="ti ti-check"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Acabado Filter -->
              <div class="filter-group">
                <button class="filter-toggle" @click="toggleFilter('finish')">
                  <span>Acabado</span>
                  <i class="ti" :class="filterStates.finish ? 'ti-chevron-up' : 'ti-chevron-down'"></i>
                </button>
                <div v-show="filterStates.finish" class="filter-options">
                  <div
                    v-for="finish in availableFinishes"
                    :key="finish.value"
                    class="filter-option"
                  >
                    <input
                      type="checkbox"
                      :id="`finish-${finish.value}`"
                      :value="finish.value"
                      v-model="selectedFinishes"
                      @change="loadProducts"
                    />
                    <label :for="`finish-${finish.value}`">{{ finish.label }}</label>
                  </div>
                </div>
              </div>

              <!-- Estilo Filter -->
              <div class="filter-group">
                <button class="filter-toggle" @click="toggleFilter('style')">
                  <span>Estilo</span>
                  <i class="ti" :class="filterStates.style ? 'ti-chevron-up' : 'ti-chevron-down'"></i>
                </button>
                <div v-show="filterStates.style" class="filter-options">
                  <div
                    v-for="style in availableStyles"
                    :key="style.value"
                    class="filter-option"
                  >
                    <input
                      type="checkbox"
                      :id="`style-${style.value}`"
                      :value="style.value"
                      v-model="selectedStyles"
                      @change="loadProducts"
                    />
                    <label :for="`style-${style.value}`">{{ style.label }}</label>
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
                    <button
                      v-if="isLoggedIn"
                      @click.prevent="toggleFavorite(product)"
                      class="btn-favorite"
                      :class="{ active: product.isFavorite }"
                      :title="product.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'"
                    >
                      <svg class="heart-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </button>
                    <span v-if="!isProductAvailable(product)" class="badge-out-of-stock">
                      Agotado
                    </span>
                    <span v-if="product.has_offer" class="badge-offer">
                      OFERTA
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
                    <div v-if="product.has_offer" class="price-with-offer">
                      <!-- Para ambos tipos de oferta condicional, mostrar precio normal -->
                      <span class="price-amount">L{{ formatPrice(product.sale_price) }} {{ product.unit || 'UNIDAD' }}</span>
                      <div v-if="getOfferCondition(product)" class="offer-condition">
                        {{ getOfferCondition(product) }}
                      </div>
                    </div>
                    <div v-else>
                      <span class="price-amount">L{{ formatPrice(product.sale_price) }} {{ product.unit || 'UNIDAD' }}</span>
                    </div>
                    <span v-if="product.tax_rate > 0" class="price-tax">
                      + {{ product.tax_rate }}% ISV
                    </span>
                  </div>

                  <button
                    @click="addToCart(product)"
                    class="btn-add-cart"
                    :disabled="!isProductAvailable(product)"
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

    <!-- Modal de Seleccionar Cantidad -->
    <div v-if="showQuantityModal" class="modal-overlay" @click="closeQuantityModal">
      <div class="quantity-modal" @click.stop>
        <div class="quantity-modal-content">
          <button @click="closeQuantityModal" class="modal-close-btn">&times;</button>
          <h2>Selecciona la cantidad</h2>
          <div class="product-info-modal">
            <img :src="selectedProduct?.image || '/placeholder-product.png'" :alt="selectedProduct?.name" class="product-img-modal" />
            <div>
              <h3>{{ selectedProduct?.name }}</h3>
              <p class="product-price-modal">L {{ formatPrice(selectedProduct?.sale_price) }}</p>
            </div>
          </div>
          <div class="quantity-selector">
            <button @click="decreaseQuantity" class="qty-btn-modal">-</button>
            <input
              type="number"
              v-model.number="selectedQuantity"
              @blur="validateQuantity"
              min="0.01"
              step="0.01"
              class="qty-input-modal-catalog"
            />
            <span class="unit-label">{{ selectedProduct?.unit || 'UNIDAD' }}</span>
            <button @click="increaseQuantity" class="qty-btn-modal">+</button>
          </div>
          <div class="modal-buttons">
            <button @click="confirmAddToCart" class="btn-add-confirm">
              Agregar al Carrito
            </button>
            <button @click="closeQuantityModal" class="btn-cancel">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Producto Agregado -->
    <div v-if="showAddedToCartModal" class="modal-overlay" @click="closeAddedToCartModal">
      <div class="cart-success-modal" @click.stop>
        <div class="cart-modal-content">
          <div class="success-icon-cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h2>¡Producto Agregado!</h2>
          <p class="cart-message">
            El producto ha sido agregado a tu carrito exitosamente.
          </p>
          <div class="modal-buttons">
            <button @click="goToCart" class="btn-cart">
              Ver Carrito
            </button>
            <button @click="closeAddedToCartModal" class="btn-continue">
              Seguir Comprando
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { productsService, cartService, companyService } from '@/api/ecommerce'
import ShopHeader from '@/components/ShopHeader.vue'
import axios from 'axios'

export default {
  name: 'ShopCatalog',
  components: {
    ShopHeader
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    const products = ref([])
    const categories = ref([])
    const subcategories = ref([])
    const pagination = ref(null)
    const loading = ref(false)
    const cartCount = ref(0)
    const companyInfo = ref(null)
    const isLoggedIn = ref(false)
    const showAddedToCartModal = ref(false)
    const showQuantityModal = ref(false)
    const selectedProduct = ref(null)
    const selectedQuantity = ref(1)
    const allowOrderWithoutStock = ref(false)

    const searchQuery = ref('')
    const selectedCategories = ref([])
    const selectedSubcategories = ref([])
    const selectedColors = ref([])
    const selectedFinishes = ref([])
    const selectedStyles = ref([])
    const priceMin = ref(null)
    const priceMax = ref(null)
    const sortBy = ref('newest')
    const currentPage = ref(1)
    const currentView = ref('porcelain')
    const expandedCategories = ref([])

    const filterStates = reactive({
      price: true,
      categories: true,
      color: true,
      finish: true,
      style: true
    })

    const availableColors = [
      { value: 'azul', label: 'Azul', hex: '#2563EB' },
      { value: 'beige', label: 'Beige', hex: '#F5DEB3' },
      { value: 'blanco', label: 'Blanco', hex: '#FFFFFF' },
      { value: 'marron', label: 'Marrón', hex: '#8B4513' },
      { value: 'cafe', label: 'Café', hex: '#6F4E37' },
      { value: 'gris', label: 'Gris', hex: '#6B7280' },
      { value: 'gris_claro', label: 'Gris Claro', hex: '#D1D5DB' },
      { value: 'dorado', label: 'Dorado', hex: '#FFD700' },
      { value: 'negro', label: 'Negro', hex: '#000000' },
      { value: 'verde', label: 'Verde', hex: '#059669' }
    ]

    const availableFinishes = [
      { value: 'mate', label: 'Mate' },
      { value: 'brillante', label: 'Brillante' },
      { value: 'rustico', label: 'Rústico' }
    ]

    const availableStyles = [
      { value: 'marmoleado', label: 'Marmoleado' },
      { value: 'madera', label: 'Madera' },
      { value: 'geometrico', label: 'Geométrico' },
      { value: 'piedra', label: 'Piedra' }
    ]

    const hasActiveFilters = computed(() => {
      return searchQuery.value ||
        selectedCategories.value.length > 0 ||
        selectedSubcategories.value.length > 0 ||
        selectedColors.value.length > 0 ||
        selectedFinishes.value.length > 0 ||
        selectedStyles.value.length > 0 ||
        priceMin.value !== null ||
        priceMax.value !== null
    })

    const getCategorySubcategories = (categoryId) => {
      return subcategories.value.filter(sub => sub.category_id === categoryId)
    }

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
        const params = {
          search: searchQuery.value,
          sort: sortBy.value,
          page: currentPage.value,
          limit: 24,
          view: currentView.value
        }

        // Add filters only if they have values
        if (selectedCategories.value.length > 0) {
          params.category_ids = selectedCategories.value.join(',')
        }
        if (selectedSubcategories.value.length > 0) {
          params.subcategory_ids = selectedSubcategories.value.join(',')
        }
        if (selectedColors.value.length > 0) {
          params.colors = selectedColors.value.join(',')
        }
        if (selectedFinishes.value.length > 0) {
          params.finishes = selectedFinishes.value.join(',')
        }
        if (selectedStyles.value.length > 0) {
          params.styles = selectedStyles.value.join(',')
        }
        if (priceMin.value !== null && priceMin.value !== '') {
          params.price_min = priceMin.value
        }
        if (priceMax.value !== null && priceMax.value !== '') {
          params.price_max = priceMax.value
        }

        const response = await productsService.getCatalog(params)

        if (response.success) {
          // Inicializar cada producto con isFavorite = false
          products.value = (response.data.products || []).map(product => ({
            ...product,
            isFavorite: false
          }))
          pagination.value = response.data.pagination

          // Obtener configuración de e-commerce
          if (response.data.config && response.data.config.allow_order_without_stock !== undefined) {
            allowOrderWithoutStock.value = response.data.config.allow_order_without_stock
          }

          // Cargar estado de favoritos si está logueado
          if (isLoggedIn.value) {
            await loadFavoritesStatus()
          }
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

    const loadSubcategories = async () => {
      try {
        const response = await productsService.getSubcategories()
        if (response.success) {
          subcategories.value = response.data || []
        }
      } catch (error) {
        console.error('Error loading subcategories:', error)
      }
    }

    const loadCartCount = async () => {
      try {
        const cart = JSON.parse(localStorage.getItem('ecommerce_cart') || '[]')
        cartCount.value = cart.length
      } catch (error) {
        cartCount.value = 0
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

    const toggleFilter = (filterName) => {
      filterStates[filterName] = !filterStates[filterName]
    }

    const toggleCategory = (categoryId) => {
      const index = expandedCategories.value.indexOf(categoryId)
      if (index > -1) {
        expandedCategories.value.splice(index, 1)
      } else {
        expandedCategories.value.push(categoryId)
      }
    }

    const toggleColor = (color) => {
      const index = selectedColors.value.indexOf(color)
      if (index > -1) {
        selectedColors.value.splice(index, 1)
      } else {
        selectedColors.value.push(color)
      }
      loadProducts()
    }

    const applyPriceFilter = () => {
      currentPage.value = 1
      loadProducts()
    }

    const switchView = (view) => {
      currentView.value = view
      currentPage.value = 1
      loadProducts()
    }

    const clearFilters = () => {
      searchQuery.value = ''
      selectedCategories.value = []
      selectedSubcategories.value = []
      selectedColors.value = []
      selectedFinishes.value = []
      selectedStyles.value = []
      priceMin.value = null
      priceMax.value = null
      currentPage.value = 1
      loadProducts()
    }

    const handleSearch = () => {
      currentPage.value = 1
      loadProducts()
    }

    const isProductAvailable = (product) => {
      // Si allow_order_without_stock está activado, siempre disponible
      if (allowOrderWithoutStock.value) {
        return true
      }

      // Si no, verificar stock
      return product.stock_available > 0
    }

    const goToPage = (page) => {
      if (page >= 1 && page <= pagination.value.totalPages && page !== '...') {
        currentPage.value = page
        loadProducts()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    const addToCart = async (product) => {
      // Verificar si el usuario está autenticado
      const token = localStorage.getItem('ecommerce_token')
      if (!token) {
        // Redirigir al login si no está autenticado
        router.push('/login')
        return
      }

      // Mostrar modal de cantidad
      selectedProduct.value = product
      selectedQuantity.value = 1
      showQuantityModal.value = true
    }

    const confirmAddToCart = async () => {
      try {
        const cart = JSON.parse(localStorage.getItem('ecommerce_cart') || '[]')
        const existingItemIndex = cart.findIndex(item => item.product_id === selectedProduct.value.id)

        if (existingItemIndex !== -1) {
          cart[existingItemIndex].quantity += selectedQuantity.value
        } else {
          cart.push({
            product_id: selectedProduct.value.id,
            code: selectedProduct.value.code,
            name: selectedProduct.value.name,
            image: selectedProduct.value.image,
            category: selectedProduct.value.category_name || '',
            subcategory: selectedProduct.value.subcategory_name || '',
            brand: selectedProduct.value.brand_name || '',
            price: selectedProduct.value.sale_price,
            quantity: selectedQuantity.value,
            unit: selectedProduct.value.unit,
            tax_rate: selectedProduct.value.tax_rate || 0
          })
        }

        localStorage.setItem('ecommerce_cart', JSON.stringify(cart))
        cartCount.value = cart.length
        window.dispatchEvent(new Event('cart-updated'))

        // Cerrar modal de cantidad y mostrar modal de confirmación
        showQuantityModal.value = false
        showAddedToCartModal.value = true
      } catch (error) {
        console.error('Error adding to cart:', error)
        alert('Error al agregar el producto al carrito')
      }
    }

    const increaseQuantity = () => {
      selectedQuantity.value = parseFloat((selectedQuantity.value + 1).toFixed(2))
    }

    const decreaseQuantity = () => {
      if (selectedQuantity.value > 0.01) {
        selectedQuantity.value = Math.max(0.01, parseFloat((selectedQuantity.value - 1).toFixed(2)))
      }
    }

    const validateQuantity = () => {
      let value = parseFloat(selectedQuantity.value)

      if (isNaN(value) || value < 0.01) {
        selectedQuantity.value = 0.01
      } else {
        selectedQuantity.value = parseFloat(value.toFixed(2))
      }
    }

    const closeQuantityModal = () => {
      showQuantityModal.value = false
      selectedProduct.value = null
      selectedQuantity.value = 1
    }

    // Cerrar modal y continuar comprando
    const closeAddedToCartModal = () => {
      showAddedToCartModal.value = false
    }

    // Ir al carrito
    const goToCart = () => {
      showAddedToCartModal.value = false
      router.push('/cart')
    }

    const toggleFavorite = async (product) => {
      try {
        const token = localStorage.getItem('ecommerce_token')
        if (!token) {
          router.push('/login')
          return
        }

        if (product.isFavorite) {
          // Eliminar de favoritos
          await axios.delete(
            `http://localhost:3000/api/v1/ecommerce/favorites/${product.id}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          )
          product.isFavorite = false
        } else {
          // Agregar a favoritos
          await axios.post(
            'http://localhost:3000/api/v1/ecommerce/favorites',
            { product_id: product.id },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          )
          product.isFavorite = true
        }
      } catch (error) {
        console.error('Error toggling favorite:', error)
        alert('Error al actualizar favoritos')
      }
    }

    const loadFavoritesStatus = async () => {
      try {
        const token = localStorage.getItem('ecommerce_token')
        if (!token) return

        const response = await axios.get(
          'http://localhost:3000/api/v1/ecommerce/favorites',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        if (response.data.success) {
          const favoriteIds = response.data.favorites.map(f => f.id)
          products.value.forEach(product => {
            product.isFavorite = favoriteIds.includes(product.id)
          })
        }
      } catch (error) {
        console.error('Error loading favorites:', error)
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
      // If product has image_url (from Google Cloud Storage), use it directly
      if (product.image_url) {
        return product.image_url
      }
      // If product has image path (local), construct the full URL
      if (product.image) {
        // Check if the image path already includes the domain
        if (product.image.startsWith('http')) {
          return product.image
        }
        // Otherwise, construct the URL from the API base
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'
        return `${baseUrl}${product.image}`
      }
      return '/placeholder-product.svg'
    }

    const getOfferCondition = (product) => {
      if (!product.has_offer) return null

      if (product.offer_condition_type === 'compras_mayores' && product.offer_min_amount > 0) {
        return `Válido al comprar más de L${formatPrice(product.offer_min_amount)} de este producto`
      }

      if (product.offer_condition_type === 'cantidades_mayores' && product.offer_min_quantity > 0) {
        return `Válido al comprar ${product.offer_min_quantity} o más unidades de este producto`
      }

      return null
    }

    onMounted(() => {
      // Verificar si el usuario está logueado
      const token = localStorage.getItem('ecommerce_token')
      isLoggedIn.value = !!token

      // Load filters from URL query params
      if (route.query.category) {
        selectedCategories.value = [parseInt(route.query.category)]
      }
      if (route.query.search) {
        searchQuery.value = route.query.search
      }

      loadProducts()
      loadCategories()
      loadSubcategories()
      loadCartCount()
      loadCompanyInfo()
    })

    // Watch for route changes (when clicking on category links)
    watch(() => route.query.category, (newCategory, oldCategory) => {
      if (newCategory !== oldCategory) {
        // Update selected categories when route changes
        if (newCategory) {
          selectedCategories.value = [parseInt(newCategory)]
        } else {
          selectedCategories.value = []
        }
        // Reset to first page and reload products
        currentPage.value = 1
        loadProducts()
      }
    })

    return {
      products,
      categories,
      subcategories,
      pagination,
      loading,
      cartCount,
      companyInfo,
      searchQuery,
      selectedCategories,
      selectedSubcategories,
      selectedColors,
      selectedFinishes,
      selectedStyles,
      priceMin,
      priceMax,
      expandedCategories,
      sortBy,
      currentView,
      filterStates,
      availableColors,
      availableFinishes,
      availableStyles,
      hasActiveFilters,
      getCategorySubcategories,
      paginationPages,
      isLoggedIn,
      showAddedToCartModal,
      showQuantityModal,
      selectedProduct,
      selectedQuantity,
      loadProducts,
      toggleFilter,
      toggleCategory,
      toggleColor,
      applyPriceFilter,
      switchView,
      clearFilters,
      handleSearch,
      isProductAvailable,
      goToPage,
      addToCart,
      confirmAddToCart,
      increaseQuantity,
      decreaseQuantity,
      validateQuantity,
      closeQuantityModal,
      toggleFavorite,
      formatPrice,
      getProductImage,
      getOfferCondition,
      closeAddedToCartModal,
      goToCart
    }
  }
}
</script>

<style scoped>
/* Navigation */
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

.color-swatch i {
  color: white;
  font-size: 18px;
  text-shadow: 0 0 3px rgba(0,0,0,0.5);
}

/* Price Range Filter */
.price-range-content {
  padding: 0.5rem 0;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.price-input-group {
  flex: 1;
}

.price-input-group label {
  display: block;
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.input-with-currency {
  position: relative;
  display: flex;
  align-items: center;
}

.currency {
  position: absolute;
  left: 0.75rem;
  font-weight: 600;
  color: var(--primary-color, #FF9F43);
  z-index: 1;
}

.input-with-currency input {
  padding-left: 2rem !important;
  width: 100%;
}

.price-separator {
  color: #999;
  font-weight: 500;
  margin-top: 1.25rem;
}

.btn-apply-price {
  width: 100%;
  padding: 0.625rem;
  background: linear-gradient(135deg, var(--primary-color, #FF9F43) 0%, #ff8c2b 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-apply-price:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 159, 67, 0.3);
}

/* Categories Tree */
.categories-tree {
  max-height: 400px;
  overflow-y: auto;
}

.category-item {
  margin-bottom: 0.5rem;
}

.category-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.category-checkbox:hover {
  background: #f8f9fa;
}

.category-checkbox input[type="checkbox"] {
  margin: 0;
}

.category-label {
  flex: 1;
  font-weight: 500;
  margin: 0;
  cursor: pointer;
}

.category-expand {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.category-expand:hover {
  background: #e9ecef;
  color: var(--primary-color, #FF9F43);
}

.subcategories-list {
  margin-left: 1.75rem;
  margin-top: 0.5rem;
  padding-left: 0.75rem;
  border-left: 2px solid #e9ecef;
}

.subcategory-option {
  padding: 0.375rem 0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.subcategory-option:hover {
  background: #f8f9fa;
}

.search-group {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 1rem;
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

.btn-favorite {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 2;
  padding: 0;
}

.btn-favorite .heart-svg {
  width: 20px;
  height: 20px;
  fill: #9ca3af;
  transition: all 0.3s ease;
}

.btn-favorite:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.25);
}

.btn-favorite:hover .heart-svg {
  fill: #ff4757;
}

.btn-favorite.active .heart-svg {
  fill: #ff4757;
  animation: heartBeat 0.3s ease;
}

@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
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

.badge-offer {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #FF4757 0%, #FF6B6B 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
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
  gap: 0.25rem;
}

.price-with-offer {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.price-original {
  font-size: 0.9rem;
  color: #999;
  text-decoration: line-through;
  font-weight: 500;
}

.price-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.price-discounted {
  color: #FF4757 !important;
}

.offer-condition {
  font-size: 0.7rem;
  color: #FF4757;
  font-weight: 600;
  background: rgba(255, 71, 87, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-top: 0.25rem;
}

.price-tax {
  font-size: 0.75rem;
  color: #999;
}

.btn-add-cart {
  background: linear-gradient(135deg, #FF9F43 0%, #ff8c2b 100%);
  color: white;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.3rem;
  box-shadow: 0 4px 12px rgba(255, 159, 67, 0.35);
}

.btn-add-cart:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff8c2b 0%, #FF9F43 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 159, 67, 0.5);
}

.btn-add-cart:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255, 159, 67, 0.3);
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

/* Modal de Producto Agregado */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.cart-success-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 450px;
  width: 90%;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.cart-modal-content {
  padding: 2.5rem 2rem;
  text-align: center;
}

.success-icon-cart {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  color: white;
  animation: scaleIn 0.5s ease 0.2s both;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.cart-modal-content h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.cart-message {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.modal-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-cart {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  flex: 1;
  max-width: 180px;
}

.btn-cart:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.btn-continue {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  max-width: 180px;
}

.btn-continue:hover {
  border-color: #10b981;
  color: #10b981;
  transform: translateY(-2px);
}

.btn-cart:active,
.btn-continue:active {
  transform: translateY(0);
}

/* Modal de Seleccionar Cantidad */
.quantity-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  animation: slideUp 0.3s ease;
}

.quantity-modal-content {
  padding: 2rem;
  position: relative;
}

.modal-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  line-height: 1;
  transition: color 0.3s;
}

.modal-close-btn:hover {
  color: #000;
}

.quantity-modal-content h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  text-align: center;
}

.product-info-modal {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.product-img-modal {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.product-info-modal h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
}

.product-price-modal {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary-color, #FF9F43);
}

.quantity-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.qty-btn-modal {
  width: 45px;
  height: 45px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.qty-btn-modal:hover {
  background: var(--primary-color, #FF9F43);
  color: white;
  border-color: var(--primary-color, #FF9F43);
}

.qty-input-modal-catalog {
  width: 100px;
  height: 45px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  padding: 0 0.5rem;
}

.qty-input-modal-catalog:focus {
  outline: none;
  border-color: var(--primary-color, #FF9F43);
}

.quantity-selector .unit-label {
  font-size: 1rem;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
  min-width: 50px;
}

.btn-add-confirm {
  flex: 1;
  padding: 1rem 2rem;
  background: var(--primary-color, #FF9F43);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add-confirm:hover {
  background: var(--primary-dark, #e68a2e);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 159, 67, 0.3);
}

.btn-cancel {
  flex: 1;
  padding: 1rem 2rem;
  background: white;
  color: #666;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
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

@media (max-width: 576px) {
  .modal-buttons {
    flex-direction: column;
  }

  .btn-cart,
  .btn-continue {
    max-width: 100%;
  }
}
</style>
