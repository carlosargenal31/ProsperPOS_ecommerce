<template>
  <div class="shop-home">
    <!-- Navigation Bar -->
    <ShopHeader />

    <!-- Hero Section with Carousel -->
    <section class="hero-section">
      <div class="hero-carousel">
        <div
          v-for="(slide, index) in heroSlides"
          :key="index"
          class="hero-slide"
          :class="{ active: currentSlide === index }"
          :style="{ backgroundImage: `url(${slide.image})` }"
        >
          <div class="hero-content">
            <div class="container">
              <div class="row align-items-center">
                <div class="col-lg-8 col-xl-6">
                  <div class="hero-text">
                    <h1 class="hero-title">{{ slide.title }}</h1>
                    <p class="hero-subtitle">{{ slide.subtitle }}</p>
                    <router-link :to="slide.link" class="btn btn-hero">
                      {{ slide.buttonText }}
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Carousel Controls -->
      <div class="carousel-controls">
        <button
          v-for="(slide, index) in heroSlides"
          :key="index"
          class="carousel-dot"
          :class="{ active: currentSlide === index }"
          @click="goToSlide(index)"
        ></button>
      </div>
    </section>

    <!-- Quality Banner -->
    <section class="quality-banner">
      <div class="container">
        <h2 class="section-title text-center">ELIGE CALIDAD, EXCLUSIVIDAD Y AHORRO</h2>
        <p class="section-subtitle text-center">Elige lo mejor en:</p>
      </div>
    </section>

    <!-- Featured Categories -->
    <section class="featured-categories" v-if="featuredCategories.length > 0">
      <div class="container-fluid px-5">
        <div class="row g-4">
          <div
            v-for="(category, index) in featuredCategories"
            :key="index"
            class="col-xl-3 col-lg-3 col-md-6 col-sm-6"
          >
            <div class="category-card">
              <div class="category-image">
                <img :src="category.image" :alt="category.name" />
                <div class="category-overlay">
                  <h3 class="category-title">{{ category.name }}</h3>
                  <router-link :to="`/shop/catalog?category=${category.id}`" class="btn btn-category">
                    Ver más
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="featured-products">
      <div class="container-fluid px-5">
        <h2 class="section-title text-center">Lo mejor en diseño actual</h2>

        <div class="products-carousel">
          <button class="carousel-nav prev" @click="slidePrev">
            <i class="ti ti-chevron-left"></i>
          </button>

          <div class="products-track" ref="productsTrack">
            <div
              v-for="product in featuredProducts"
              :key="product.id"
              class="product-item"
            >
              <router-link :to="`/shop/product/${product.id}`" class="product-link">
                <div class="product-image">
                  <img :src="getProductImage(product)" :alt="product.name" />
                </div>
                <div class="product-info">
                  <h4 class="product-name">{{ product.name }}</h4>
                </div>
              </router-link>
            </div>
          </div>

          <button class="carousel-nav next" @click="slideNext">
            <i class="ti ti-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>

  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { bannersService, productsService, companyService } from '@/api/ecommerce'
import ShopHeader from '@/components/ShopHeader.vue'

export default {
  name: 'ShopHome',
  components: {
    ShopHeader
  },
  setup() {
    const router = useRouter()
    const currentSlide = ref(0)
    const cartCount = ref(0)
    const featuredProducts = ref([])
    const productsTrack = ref(null)
    const companyInfo = ref(null)

    const heroSlides = ref([
      {
        title: 'VANGUARDISTAS',
        subtitle: 'DE LAS TENDENCIAS EN ESTILOS Y DISEÑOS',
        buttonText: 'EXPLORAR AHORA',
        link: '/shop/catalog',
        image: '/placeholder-hero-1.jpg'
      },
      {
        title: 'CALIDAD SUPERIOR',
        subtitle: 'PRODUCTOS DE LA MÁS ALTA CALIDAD',
        buttonText: 'VER PRODUCTOS',
        link: '/shop/catalog',
        image: '/placeholder-hero-2.jpg'
      },
      {
        title: 'STOCK GARANTIZADO',
        subtitle: 'MÁS DE 1,000 M² DISPONIBLES',
        buttonText: 'VER DISPONIBILIDAD',
        link: '/shop/catalog',
        image: '/placeholder-hero-3.jpg'
      }
    ])

    const featuredCategories = ref([])

    let carouselInterval = null

    const goToSlide = (index) => {
      currentSlide.value = index
    }

    const nextSlide = () => {
      currentSlide.value = (currentSlide.value + 1) % heroSlides.value.length
    }

    const slidePrev = () => {
      if (productsTrack.value) {
        productsTrack.value.scrollBy({
          left: -320,
          behavior: 'smooth'
        })
      }
    }

    const slideNext = () => {
      if (productsTrack.value) {
        productsTrack.value.scrollBy({
          left: 320,
          behavior: 'smooth'
        })
      }
    }

    const loadCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('ecommerce_cart') || '[]')
      cartCount.value = cart.reduce((sum, item) => sum + item.quantity, 0)
    }

    const loadBanners = async () => {
      try {
        const response = await bannersService.getBanners()
        if (response.success && response.data && response.data.length > 0) {
          // Mapear los banners de la base de datos
          heroSlides.value = response.data
            .filter(banner => banner.image_url && banner.is_active) // Solo banners activos con imagen
            .sort((a, b) => a.sort_order - b.sort_order) // Ordenar por sort_order
            .map(banner => ({
              title: banner.title || 'Título del Banner',
              subtitle: banner.subtitle || 'Subtítulo del banner',
              buttonText: banner.button_text || 'VER CATÁLOGO',
              link: banner.button_link || '/shop/catalog',
              image: banner.image_url
            }))
        }
      } catch (error) {
        console.error('Error loading banners:', error)
        // Mantener los banners por defecto si hay error
      }
    }

    const loadFeaturedProducts = async () => {
      try {
        const response = await productsService.getFeaturedProducts(10)
        if (response.success) {
          featuredProducts.value = response.data || []
        }
      } catch (error) {
        console.error('Error loading featured products:', error)
      }
    }

    const loadFeaturedCategories = async () => {
      try {
        const response = await productsService.getVisibleCategories()
        if (response.success && response.data) {
          featuredCategories.value = response.data.map(category => ({
            id: category.id,
            name: category.name,
            image: category.image_url || '/placeholder-category.jpg'
          }))
        }
      } catch (error) {
        console.error('Error loading categories:', error)
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

    onMounted(() => {
      loadCartCount()
      loadBanners()
      loadFeaturedProducts()
      loadFeaturedCategories()
      loadCompanyInfo()

      // Auto-advance carousel
      carouselInterval = setInterval(() => {
        nextSlide()
      }, 5000)
    })

    onUnmounted(() => {
      if (carouselInterval) {
        clearInterval(carouselInterval)
      }
    })

    return {
      currentSlide,
      cartCount,
      heroSlides,
      featuredCategories,
      featuredProducts,
      productsTrack,
      companyInfo,
      goToSlide,
      slidePrev,
      slideNext,
      getProductImage
    }
  }
}
</script>

<style scoped>
/* Hero Section */
.hero-section {
  position: relative;
  min-height: 600px;
  overflow: hidden;
}

.hero-carousel {
  position: relative;
  width: 100%;
  height: 600px;
}

.hero-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.hero-slide.active {
  opacity: 1;
}

.hero-slide::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.hero-content {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 3rem 0;
  z-index: 2;
}

.hero-text {
  color: white;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 1.5rem;
  letter-spacing: 2px;
  line-height: 1.1;
  color: white;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  font-weight: 600;
  color: white;
}

.btn-hero {
  background: white;
  color: #333;
  padding: 1rem 3rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.1rem;
  display: inline-block;
  transition: all 0.3s;
  border: 3px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.btn-hero:hover {
  background: var(--primary-color, #FF9F43);
  color: white;
  border-color: var(--primary-color, #FF9F43);
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

.hero-image {
  display: none;
}

.carousel-controls {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  z-index: 10;
}

.carousel-dot {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.carousel-dot.active {
  background: white;
  transform: scale(1.3);
}

/* Quality Banner */
.quality-banner {
  padding: 3rem 0 0.5rem 0;
  background: #f8f9fa;
  text-align: center;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 1rem;
  letter-spacing: 1px;
}

.section-subtitle {
  font-size: 1.3rem;
  color: #666;
  font-weight: 400;
}

/* Featured Categories */
.featured-categories {
  padding: 2rem 0;
  background: #f8f9fa;
}

.category-card {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  height: 350px;
  cursor: pointer;
  transition: transform 0.3s;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.category-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.category-image {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.category-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.category-card:hover .category-image img {
  transform: scale(1.1);
}

.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 2;
}

.category-title {
  font-size: 1.8rem;
  font-weight: 900;
  margin-bottom: 1.5rem;
  color: white;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
}

.btn-category {
  background: white;
  color: #333;
  padding: 0.8rem 2.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 700;
  display: inline-block;
  transition: all 0.3s;
  border: 3px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.btn-category:hover {
  background: var(--primary-color, #FF9F43);
  color: white;
  border-color: var(--primary-color, #FF9F43);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

/* Featured Products */
.featured-products {
  padding: 2rem 0 5rem 0;
  background: #f8f9fa;
}

.products-carousel {
  position: relative;
  margin-top: 1.5rem;
}

.products-track {
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 1rem 0;
}

.products-track::-webkit-scrollbar {
  height: 8px;
}

.products-track::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.products-track::-webkit-scrollbar-thumb {
  background: var(--primary-color, #FF9F43);
  border-radius: 10px;
}

.product-item {
  flex: 0 0 300px;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: all 0.3s;
}

.product-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.product-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.product-image {
  width: 100%;
  height: 250px;
  overflow: hidden;
  background: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-item:hover .product-image img {
  transform: scale(1.1);
}

.product-info {
  padding: 1.5rem;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  transition: all 0.3s;
  z-index: 10;
}

.carousel-nav:hover {
  background: var(--primary-color, #FF9F43);
  color: white;
}

.carousel-nav.prev {
  left: -25px;
}

.carousel-nav.next {
  right: -25px;
}

/* Responsive */
@media (max-width: 992px) {
  .navbar-menu {
    display: none;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .inspiration-card.large,
  .inspiration-card.medium,
  .inspiration-card.small {
    grid-column: span 12;
  }
}
</style>
