<template>
  <div class="shop-catalog">
    <!-- Header -->
    <div class="shop-header">
      <div class="container">
        <div class="header-content">
          <h1>Tienda ProsperPOS</h1>
          <div class="header-actions">
            <div class="search-box">
              <input
                v-model="searchQuery"
                @input="handleSearch"
                type="text"
                placeholder="Buscar productos..."
                class="search-input"
              />
              <i class="mdi mdi-magnify"></i>
            </div>
            <button @click="goToCart" class="btn-cart">
              <i class="mdi mdi-cart"></i>
              <span class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</span>
            </button>
            <button v-if="!isAuthenticated" @click="goToLogin" class="btn-login">
              <i class="mdi mdi-account"></i>
              Iniciar Sesión
            </button>
            <div v-else class="user-menu">
              <button @click="toggleUserMenu" class="btn-user">
                <i class="mdi mdi-account-circle"></i>
                {{ customer?.first_name }}
              </button>
              <div v-if="showUserMenu" class="user-dropdown">
                <router-link to="/shop/profile" class="menu-item">
                  <i class="mdi mdi-account"></i> Mi Perfil
                </router-link>
                <router-link to="/shop/orders" class="menu-item">
                  <i class="mdi mdi-package-variant"></i> Mis Pedidos
                </router-link>
                <button @click="handleLogout" class="menu-item">
                  <i class="mdi mdi-logout"></i> Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="container">
        <div class="filters">
          <div class="filter-group">
            <label>Categoría:</label>
            <select v-model="selectedCategory" @change="loadProducts">
              <option :value="null">Todas</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }} ({{ category.products_count }})
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>Marca:</label>
            <select v-model="selectedBrand" @change="loadProducts">
              <option :value="null">Todas</option>
              <option
                v-for="brand in brands"
                :key="brand.id"
                :value="brand.id"
              >
                {{ brand.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>Ordenar:</label>
            <select v-model="sortBy" @change="loadProducts">
              <option value="newest">Más recientes</option>
              <option value="name_asc">Nombre A-Z</option>
              <option value="price_asc">Precio menor a mayor</option>
              <option value="price_desc">Precio mayor a menor</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Products Grid -->
    <div class="products-section">
      <div class="container">
        <div v-if="loading" class="loading">
          <i class="mdi mdi-loading mdi-spin"></i>
          Cargando productos...
        </div>

        <div v-else-if="products.length === 0" class="no-products">
          <i class="mdi mdi-package-variant-closed"></i>
          <p>No se encontraron productos</p>
        </div>

        <div v-else class="products-grid">
          <div
            v-for="product in products"
            :key="product.id"
            class="product-card"
            @click="goToProduct(product.id)"
          >
            <div class="product-image">
              <img
                :src="product.image || '/placeholder-product.png'"
                :alt="product.name"
                @error="handleImageError"
              />
              <div v-if="product.stock_available <= 0" class="out-of-stock-badge">
                Agotado
              </div>
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-category">{{ product.category_name }}</p>
              <div class="product-footer">
                <div class="product-price">
                  <span class="price">L{{ formatPrice(product.sale_price) }}</span>
                  <span v-if="product.tax_rate > 0" class="tax">
                    + {{ product.tax_rate }}% ISV
                  </span>
                </div>
                <button
                  @click.stop="addToCart(product)"
                  class="btn-add-cart"
                  :disabled="product.stock_available <= 0"
                >
                  <i class="mdi mdi-cart-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.totalPages > 1" class="pagination">
          <button
            @click="goToPage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="btn-page"
          >
            <i class="mdi mdi-chevron-left"></i>
          </button>
          <span class="page-info">
            Página {{ pagination.page }} de {{ pagination.totalPages }}
          </span>
          <button
            @click="goToPage(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="btn-page"
          >
            <i class="mdi mdi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { productsService, cartService, authService } from '@/api/ecommerce'

export default {
  name: 'ShopCatalog',
  setup() {
    const router = useRouter()

    const products = ref([])
    const categories = ref([])
    const brands = ref([])
    const pagination = ref(null)
    const loading = ref(false)
    const cartCount = ref(0)
    const showUserMenu = ref(false)

    const searchQuery = ref('')
    const selectedCategory = ref(null)
    const selectedBrand = ref(null)
    const sortBy = ref('newest')
    const currentPage = ref(1)

    const isAuthenticated = computed(() => authService.isAuthenticated())
    const customer = computed(() => authService.getCustomer())

    const loadProducts = async () => {
      try {
        loading.value = true
        const params = {
          page: currentPage.value,
          limit: 12,
          sort: sortBy.value
        }

        if (searchQuery.value) {
          params.search = searchQuery.value
        }
        if (selectedCategory.value) {
          params.category_id = selectedCategory.value
        }
        if (selectedBrand.value) {
          params.brand_id = selectedBrand.value
        }

        const response = await productsService.getCatalog(params)
        if (response.success) {
          products.value = response.data.products
          pagination.value = response.data.pagination
        }
      } catch (error) {
        console.error('Error loading products:', error)
        alert('Error al cargar productos')
      } finally {
        loading.value = false
      }
    }

    const loadCategories = async () => {
      try {
        const response = await productsService.getCategories()
        if (response.success) {
          categories.value = response.data
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }

    const loadBrands = async () => {
      try {
        const response = await productsService.getBrands()
        if (response.success) {
          brands.value = response.data
        }
      } catch (error) {
        console.error('Error loading brands:', error)
      }
    }

    const loadCartCount = async () => {
      if (!isAuthenticated.value) return

      try {
        const response = await cartService.getItemCount()
        if (response.success) {
          cartCount.value = response.data.items_count
        }
      } catch (error) {
        console.error('Error loading cart count:', error)
      }
    }

    const addToCart = async (product) => {
      if (!isAuthenticated.value) {
        router.push('/shop/login')
        return
      }

      try {
        const response = await cartService.addItem(product.id, 1)
        if (response.success) {
          cartCount.value++
          alert('Producto agregado al carrito')
        }
      } catch (error) {
        console.error('Error adding to cart:', error)
        alert(error.response?.data?.message || 'Error al agregar al carrito')
      }
    }

    const handleSearch = () => {
      currentPage.value = 1
      loadProducts()
    }

    const goToPage = (page) => {
      currentPage.value = page
      loadProducts()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const goToProduct = (id) => {
      router.push(`/shop/product/${id}`)
    }

    const goToCart = () => {
      if (!isAuthenticated.value) {
        router.push('/shop/login')
        return
      }
      router.push('/shop/cart')
    }

    const goToLogin = () => {
      router.push('/shop/login')
    }

    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
    }

    const handleLogout = () => {
      authService.logout()
      router.push('/shop')
    }

    const formatPrice = (price) => {
      return parseFloat(price || 0).toFixed(2)
    }

    const handleImageError = (e) => {
      e.target.src = '/placeholder-product.png'
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
      showUserMenu,
      searchQuery,
      selectedCategory,
      selectedBrand,
      sortBy,
      isAuthenticated,
      customer,
      loadProducts,
      addToCart,
      handleSearch,
      goToPage,
      goToProduct,
      goToCart,
      goToLogin,
      toggleUserMenu,
      handleLogout,
      formatPrice,
      handleImageError
    }
  }
}
</script>

<style scoped>
.shop-catalog {
  min-height: 100vh;
  background: #f5f5f5;
}

.shop-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  font-size: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border: none;
  border-radius: 25px;
  width: 300px;
  font-size: 0.9rem;
}

.search-box i {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.btn-cart {
  position: relative;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cart:hover {
  background: white;
  color: #667eea;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4444;
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

.btn-login,
.btn-user {
  background: white;
  color: #667eea;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-login:hover,
.btn-user:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-menu {
  position: relative;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: #333;
  text-decoration: none;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:hover {
  background: #f5f5f5;
}

.filters-section {
  background: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filters {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #666;
}

.filter-group select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.products-section {
  padding: 2rem 0;
}

.loading,
.no-products {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  width: 100%;
  height: 200px;
  background: #f5f5f5;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.out-of-stock-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #ff4444;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.product-info {
  padding: 1rem;
}

.product-name {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  color: #333;
  font-weight: 600;
}

.product-category {
  font-size: 0.85rem;
  color: #999;
  margin: 0 0 1rem 0;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price .price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #667eea;
}

.product-price .tax {
  display: block;
  font-size: 0.75rem;
  color: #999;
}

.btn-add-cart {
  background: #667eea;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-add-cart:hover:not(:disabled) {
  background: #764ba2;
  transform: scale(1.1);
}

.btn-add-cart:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-page {
  background: white;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-page:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: 500;
  color: #666;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .search-input {
    width: 100%;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group select {
    width: 100%;
  }
}
</style>
