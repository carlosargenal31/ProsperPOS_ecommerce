<template>
  <div class="shop-home">
    <!-- Navigation Bar -->
    <nav class="shop-navbar">
      <div class="container-fluid px-4">
        <div class="navbar-content">
          <div class="navbar-brand">
            <h2 class="brand-title">PROSPERPOS</h2>
            <p class="brand-subtitle">Sueña, Vende y Crece</p>
          </div>

          <div class="navbar-menu">
            <a href="#inicio" class="nav-link active">Inicio</a>
            <router-link to="/shop/catalog" class="nav-link">Productos</router-link>
            <a href="#ambientes" class="nav-link">Ambientes</a>
            <a href="#accesorios" class="nav-link">Accesorios</a>
            <a href="#piedras" class="nav-link">Piedras Naturales</a>
            <a href="#contacto" class="nav-link">Contacto</a>
          </div>

          <div class="navbar-actions">
            <router-link to="/shop/cart" class="btn btn-cart">
              <i class="ti ti-shopping-cart"></i>
              <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
            </router-link>
            <router-link to="/shop/login" class="btn btn-login">
              <i class="ti ti-user"></i>
              Iniciar Sesión
            </router-link>
          </div>
        </div>
      </div>
    </nav>

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
    <section class="featured-categories">
      <div class="container-fluid px-5">
        <div class="row g-4">
          <div
            v-for="(category, index) in featuredCategories"
            :key="index"
            class="col-xl-3 col-lg-4 col-md-6"
          >
            <div class="category-card">
              <div class="category-image">
                <img :src="category.image" :alt="category.name" />
                <div class="category-overlay">
                  <h3 class="category-title">{{ category.name }}</h3>
                  <router-link :to="`/shop/catalog?category=${category.id}`" class="btn btn-category">
                    Ver {{ category.name }}
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
      <div class="container">
        <h2 class="section-title text-center">Lo mejor en diseño actual</h2>

        <div class="products-carousel">
          <button class="carousel-nav prev" @click="slidePrev">
            <i class="ti ti-chevron-left"></i>
          </button>

          <div class="products-track">
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

    <!-- Inspiration Section -->
    <section class="inspiration-section">
      <div class="container">
        <h2 class="section-title text-center">INSPIRACIÓN POR AMBIENTES</h2>

        <div class="inspiration-grid">
          <div
            v-for="(ambiente, index) in ambientes"
            :key="index"
            class="inspiration-card"
            :class="ambiente.size"
          >
            <div class="inspiration-image">
              <img :src="ambiente.image" :alt="ambiente.name" />
              <div class="inspiration-overlay">
                <h3 class="inspiration-title">{{ ambiente.name }}</h3>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-5">
          <router-link to="/shop/catalog" class="btn btn-primary btn-lg">
            VER TODOS LOS AMBIENTES
          </router-link>
        </div>
      </div>
    </section>

    <!-- Latest Materials -->
    <section class="latest-materials">
      <div class="container">
        <h2 class="section-title text-center">LO ÚLTIMO EN REVESTIMIENTOS</h2>

        <div class="row g-4 mt-4">
          <div
            v-for="(material, index) in latestMaterials"
            :key="index"
            class="col-lg-6"
          >
            <div class="material-card">
              <div class="row g-0">
                <div class="col-md-5">
                  <div class="material-image">
                    <img :src="material.image" :alt="material.name" />
                  </div>
                </div>
                <div class="col-md-7">
                  <div class="material-content">
                    <h3 class="material-title">{{ material.name }}</h3>
                    <p class="material-description">{{ material.description }}</p>
                    <router-link :to="`/shop/catalog?material=${material.id}`" class="btn btn-material">
                      VER {{ material.name.toUpperCase() }}
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="shop-footer">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-4">
            <h3 class="footer-title">PROSPERPOS</h3>
            <p class="footer-text">
              Tu solución completa para la gestión de tu negocio y ventas online.
              Sueña, Vende y Crece con nosotros.
            </p>
          </div>

          <div class="col-lg-4">
            <h4 class="footer-heading">Enlaces Rápidos</h4>
            <ul class="footer-links">
              <li><router-link to="/shop/catalog">Productos</router-link></li>
              <li><a href="#ambientes">Ambientes</a></li>
              <li><a href="#accesorios">Accesorios</a></li>
              <li><a href="#contacto">Contacto</a></li>
            </ul>
          </div>

          <div class="col-lg-4">
            <h4 class="footer-heading">Contacto</h4>
            <ul class="footer-contact">
              <li><i class="ti ti-phone"></i> +504 1234-5678</li>
              <li><i class="ti ti-mail"></i> info@prosperpos.com</li>
              <li><i class="ti ti-map-pin"></i> Tegucigalpa, Honduras</li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; 2024 ProsperPOS. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>

    <!-- WhatsApp Float Button -->
    <a href="https://wa.me/50412345678" target="_blank" class="whatsapp-float">
      <i class="ti ti-brand-whatsapp"></i>
    </a>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'ShopHome',
  setup() {
    const router = useRouter()
    const currentSlide = ref(0)
    const cartCount = ref(0)
    const featuredProducts = ref([])

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

    const featuredCategories = [
      {
        id: 1,
        name: 'Muebles de baño',
        image: '/placeholder-bathroom.jpg'
      },
      {
        id: 2,
        name: 'Pisos y Muros',
        image: '/placeholder-floors.jpg'
      },
      {
        id: 3,
        name: 'Baños',
        image: '/placeholder-bath.jpg'
      },
      {
        id: 4,
        name: 'Adhesivos y repellos',
        image: '/placeholder-adhesives.jpg'
      }
    ]

    const ambientes = [
      {
        name: 'COCINA',
        image: '/placeholder-kitchen.jpg',
        size: 'large'
      },
      {
        name: 'DORMITORIO',
        image: '/placeholder-bedroom.jpg',
        size: 'medium'
      },
      {
        name: 'SALA',
        image: '/placeholder-living.jpg',
        size: 'medium'
      },
      {
        name: 'TERRAZA',
        image: '/placeholder-terrace.jpg',
        size: 'small'
      },
      {
        name: 'VER BAÑOS',
        image: '/placeholder-bathroom2.jpg',
        size: 'small'
      }
    ]

    const latestMaterials = [
      {
        id: 1,
        name: 'Cerámica',
        description: 'Este arte que se considera una tradición, ha brindado al mundo del diseño de interiores, cerámica para cocina, cerámica para baños y refinados azulejos para cocina y paredes de baño.',
        image: '/placeholder-ceramic.jpg'
      },
      {
        id: 2,
        name: 'Porcelanato',
        description: 'El porcelanato es idealmente utilizado en diferentes ambientes, así podemos usarlo para la cocina de forma elegante, de igual manera para el baño, y no olvidemos los pisos de porcelanato.',
        image: '/placeholder-porcelain.jpg'
      }
    ]

    let carouselInterval = null

    const goToSlide = (index) => {
      currentSlide.value = index
    }

    const nextSlide = () => {
      currentSlide.value = (currentSlide.value + 1) % heroSlides.value.length
    }

    const slidePrev = () => {
      // Implement product carousel previous
    }

    const slideNext = () => {
      // Implement product carousel next
    }

    const loadCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('ecommerce_cart') || '[]')
      cartCount.value = cart.reduce((sum, item) => sum + item.quantity, 0)
    }

    const loadBanners = async () => {
      try {
        const response = await fetch('/api/v1/banners')
        const data = await response.json()
        if (data.success && data.data && data.data.length > 0) {
          // Mapear los banners de la base de datos
          heroSlides.value = data.data
            .filter(banner => banner.image_url) // Solo banners con imagen
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
        const response = await fetch('/api/v1/ecommerce/products/featured?limit=8')
        const data = await response.json()
        if (data.success) {
          featuredProducts.value = data.data || []
        }
      } catch (error) {
        console.error('Error loading featured products:', error)
      }
    }

    const getProductImage = (product) => {
      if (product.image) {
        return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${product.image}`
      }
      return '/placeholder-product.svg'
    }

    onMounted(() => {
      loadCartCount()
      loadBanners()
      loadFeaturedProducts()

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
      ambientes,
      latestMaterials,
      goToSlide,
      slidePrev,
      slideNext,
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
  padding: 4rem 0;
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
  padding: 4rem 0;
  background: white;
}

.category-card {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  height: 350px;
  cursor: pointer;
  transition: transform 0.3s;
}

.category-card:hover {
  transform: translateY(-10px);
}

.category-image {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
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
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  padding: 2rem;
  color: white;
}

.category-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.btn-category {
  background: white;
  color: #333;
  padding: 0.7rem 2rem;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
  transition: all 0.3s;
}

.btn-category:hover {
  background: var(--primary-color, #FF9F43);
  color: white;
  transform: translateY(-2px);
}

/* Featured Products */
.featured-products {
  padding: 5rem 0;
  background: #f8f9fa;
}

.products-carousel {
  position: relative;
  margin-top: 3rem;
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

/* Inspiration Section */
.inspiration-section {
  padding: 5rem 0;
  background: white;
}

.inspiration-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  margin-top: 3rem;
}

.inspiration-card {
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s;
}

.inspiration-card:hover {
  transform: scale(1.02);
}

.inspiration-card.large {
  grid-column: span 6;
  min-height: 500px;
}

.inspiration-card.medium {
  grid-column: span 6;
  min-height: 350px;
}

.inspiration-card.small {
  grid-column: span 6;
  min-height: 300px;
}

.inspiration-image {
  position: relative;
  width: 100%;
  height: 100%;
}

.inspiration-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.inspiration-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  padding: 2rem;
  color: white;
}

.inspiration-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

/* Latest Materials */
.latest-materials {
  padding: 5rem 0;
  background: #f8f9fa;
}

.material-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  transition: all 0.3s;
  height: 100%;
}

.material-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.material-image {
  height: 100%;
  min-height: 300px;
}

.material-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.material-content {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.material-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #333;
}

.material-description {
  color: #666;
  line-height: 1.8;
  margin-bottom: 2rem;
}

.btn-material {
  background: transparent;
  color: #333;
  border: 2px solid #333;
  padding: 0.8rem 2rem;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
  transition: all 0.3s;
  align-self: flex-start;
}

.btn-material:hover {
  background: var(--primary-color, #FF9F43);
  border-color: var(--primary-color, #FF9F43);
  color: white;
}

/* Footer */
.shop-footer {
  background: #2c3e50;
  color: white;
  padding: 4rem 0 2rem;
  margin-top: 5rem;
}

.footer-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--primary-color, #FF9F43);
}

.footer-text {
  color: rgba(255,255,255,0.8);
  line-height: 1.8;
}

.footer-heading {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.8rem;
}

.footer-links a {
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: var(--primary-color, #FF9F43);
}

.footer-contact {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-contact li {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: rgba(255,255,255,0.8);
}

.footer-bottom {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  text-align: center;
  color: rgba(255,255,255,0.6);
}

/* WhatsApp Float */
.whatsapp-float {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: #25D366;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: 0 5px 20px rgba(37, 211, 102, 0.5);
  z-index: 1000;
  transition: all 0.3s;
  text-decoration: none;
}

.whatsapp-float:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(37, 211, 102, 0.7);
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
