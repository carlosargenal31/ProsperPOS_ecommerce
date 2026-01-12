<template>
  <footer class="shop-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>CONTACTO</h3>
        <ul>
          <li><a href="#" @click.prevent="openContactForm">Danos tu opinión</a></li>
          <li><router-link to="/store-location">Nuestros Canales</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>RECURSOS</h3>
        <ul>
          <li><router-link to="/about-us">Acerca de nosotros</router-link></li>
          <li><router-link to="/profile">Perfil</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>SOPORTE</h3>
        <ul>
          <li><router-link to="/how-to-buy">Cómo realizar tu pedido</router-link></li>
          <li><router-link to="/privacy-policy">Privacidad y seguridad</router-link></li>
          <li><router-link to="/terms-and-conditions">Términos y condiciones</router-link></li>
        </ul>
      </div>

      <div class="footer-section social-section">
        <h3>SÍGUENOS</h3>
        <div class="social-icons">
          <a :href="getFacebookUrl()" target="_blank" class="social-icon facebook" aria-label="Facebook">
            <i class="ti ti-brand-facebook"></i>
          </a>
          <a :href="getInstagramUrl()" target="_blank" class="social-icon instagram" aria-label="Instagram">
            <i class="ti ti-brand-instagram"></i>
          </a>
          <a :href="getWhatsAppUrl()" target="_blank" class="social-icon whatsapp" aria-label="WhatsApp">
            <i class="ti ti-brand-whatsapp"></i>
          </a>
          <a :href="getTikTokUrl()" target="_blank" class="social-icon tiktok" aria-label="TikTok">
            <i class="ti ti-brand-tiktok"></i>
          </a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>{{ currentYear }} {{ companyName }} DERECHOS RESERVADOS - <router-link to="/privacy-policy">Privacidad</router-link> - <router-link to="/terms-and-conditions">Términos y condiciones</router-link></p>
    </div>

    <!-- WhatsApp Floating Button -->
    <a href="https://wa.me/50498752725" target="_blank" class="whatsapp-float" aria-label="WhatsApp">
      <i class="ti ti-brand-whatsapp"></i>
    </a>

    <!-- Contact Form Modal -->
    <ContactFormModal :isOpen="showContactForm" @close="closeContactForm" />
  </footer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import ContactFormModal from './ContactFormModal.vue'

const companyInfo = ref(null)
const showContactForm = ref(false)

const currentYear = computed(() => new Date().getFullYear())

const companyName = computed(() => {
  return companyInfo.value?.name || 'TU EMPRESA'
})

const openContactForm = () => {
  showContactForm.value = true
}

const closeContactForm = () => {
  showContactForm.value = false
}

const getFacebookUrl = () => {
  if (!companyInfo.value?.facebook) return '#'
  const username = companyInfo.value.facebook.trim()
  // Si ya es una URL completa, devolverla tal cual
  if (username.startsWith('http://') || username.startsWith('https://')) {
    return username
  }
  // Si no, construir la URL
  return `https://www.facebook.com/${username}`
}

const getInstagramUrl = () => {
  if (!companyInfo.value?.instagram) return '#'
  const username = companyInfo.value.instagram.trim()
  // Si ya es una URL completa, devolverla tal cual
  if (username.startsWith('http://') || username.startsWith('https://')) {
    return username
  }
  // Si no, construir la URL
  return `https://www.instagram.com/${username}`
}

const getWhatsAppUrl = () => {
  if (!companyInfo.value?.whatsapp) return 'https://wa.me/50498752725'
  const phone = companyInfo.value.whatsapp.replace(/\D/g, '')
  return `https://wa.me/${phone}`
}

const getTikTokUrl = () => {
  if (!companyInfo.value?.tiktok) return '#'
  const username = companyInfo.value.tiktok.trim()
  // Si ya es una URL completa, devolverla tal cual
  if (username.startsWith('http://') || username.startsWith('https://')) {
    return username
  }
  // Si no, construir la URL (TikTok usa @ en las URLs)
  const cleanUsername = username.startsWith('@') ? username.substring(1) : username
  return `https://www.tiktok.com/@${cleanUsername}`
}

const fetchCompanyInfo = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/v1/companies/public/default')
    if (response.data && response.data.success) {
      companyInfo.value = response.data.data
    } else if (response.data) {
      companyInfo.value = response.data
    }
  } catch (error) {
    console.error('Error fetching company info:', error)
  }
}

onMounted(() => {
  fetchCompanyInfo()
})
</script>

<style scoped>
.shop-footer {
  background: #1a3a52;
  color: white;
  margin-top: auto;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
}

.footer-section h3 {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  letter-spacing: 0.5px;
  color: white;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section li {
  margin-bottom: 0.75rem;
}

.footer-section a {
  color: white;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: inline-block;
}

.footer-section a:hover {
  color: #FFD700;
  transform: translateX(5px);
}

.social-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.social-section h3 {
  margin-bottom: 1.5rem;
}

.social-icons {
  display: flex;
  gap: 1.8rem;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
}

.social-icon {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 4rem !important;
  transition: all 0.3s ease;
  padding: 0.5rem;
  background: transparent;
  border: none;
  box-shadow: none;
  width: auto !important;
  height: auto !important;
}

.social-icon i {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-size: inherit !important;
}

.social-icon:hover {
  color: white;
  transform: translateY(-3px) scale(1.15);
}

.social-icon.facebook:hover {
  color: #1877F2;
  filter: drop-shadow(0 4px 8px rgba(24, 119, 242, 0.5));
}

.social-icon.instagram:hover {
  color: #E4405F;
  filter: drop-shadow(0 4px 8px rgba(228, 64, 95, 0.5));
}

.social-icon.whatsapp:hover {
  color: #25D366;
  filter: drop-shadow(0 4px 8px rgba(37, 211, 102, 0.5));
}

.social-icon.tiktok:hover {
  color: #ffffff;
  filter: drop-shadow(0 4px 8px rgba(255, 255, 255, 0.5));
}

.footer-bottom {
  background: rgba(0, 0, 0, 0.2);
  padding: 1.5rem 2rem;
  text-align: center;
}

.footer-bottom p {
  margin: 0;
  font-size: 0.85rem;
  color: white;
}

.footer-bottom a {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-bottom a:hover {
  color: #FFD700;
  text-decoration: underline;
}

/* WhatsApp Floating Button */
.whatsapp-float {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: #25D366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
  transition: all 0.3s ease;
  z-index: 1000;
}

.whatsapp-float:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(37, 211, 102, 0.6);
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    padding: 2rem 1rem;
  }

  .social-section {
    grid-column: 1 / -1;
  }

  .social-icon {
    font-size: 3.5rem !important;
  }

  .social-icons {
    gap: 1.5rem;
    flex-wrap: nowrap;
  }

  .whatsapp-float {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
    bottom: 20px;
    right: 20px;
  }
}

@media (max-width: 480px) {
  .footer-content {
    grid-template-columns: 1fr;
  }

  .footer-section h3 {
    font-size: 0.9rem;
  }

  .footer-section a {
    font-size: 0.85rem;
  }

  .social-icon {
    font-size: 3rem !important;
  }

  .social-icons {
    gap: 1.2rem;
    flex-wrap: nowrap;
  }

  .footer-bottom p {
    font-size: 0.75rem;
  }
}
</style>
