<template>
  <div class="store-location-page">
    <ShopHeader />

    <div class="location-container">
      <div class="location-header">
        <h1>Nuestra Tienda</h1>
      </div>

      <div class="location-content">
        <div class="location-info">
          <div class="store-card">
            <h2>{{ companyInfo?.commercial_name || companyInfo?.name || 'Nuestra Tienda' }}</h2>
            <div class="info-item">
              <i class="ti ti-map-pin"></i>
              <p>{{ companyInfo?.address || 'Dirección de la tienda' }}</p>
            </div>
            <div class="info-item" v-if="companyInfo?.city || companyInfo?.state">
              <i class="ti ti-building"></i>
              <p>{{ companyInfo?.city }}<span v-if="companyInfo?.state">, {{ companyInfo.state }}</span></p>
            </div>
            <div class="info-item">
              <i class="ti ti-brand-whatsapp"></i>
              <div>
                <p><a href="https://wa.me/50498752725" target="_blank" class="whatsapp-link">+504 9875-2725</a></p>
                <p><a href="https://wa.me/50432063879" target="_blank" class="whatsapp-link">+504 3206-3879</a></p>
              </div>
            </div>
            <div class="info-item">
              <i class="ti ti-mail"></i>
              <p><a href="mailto:ceramicasuniversal504@gmail.com" class="email-link">ceramicasuniversal504@gmail.com</a></p>
            </div>
            <a
              href="https://maps.app.goo.gl/1Vsw39e8kQZcoMNv8"
              target="_blank"
              class="btn-directions"
            >
              <i class="ti ti-directions"></i>
              Ver en Google Maps
            </a>
          </div>
        </div>

        <div class="location-map">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d479.9349816230606!2d-86.7870657!3d15.7786322!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f69a9c97c6d8865%3A0x154da39ad44c6a8c!2sCeramicas%20Y%20Terrazos%20Universal!5e1!3m2!1ses!2shn!4v1767501623689!5m2!1ses!2shn"
            width="100%"
            height="100%"
            style="border:0;"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
          <div class="map-overlay">
            <p>Haz clic en "Ver en Google Maps" para obtener direcciones</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import ShopHeader from '@/components/ShopHeader.vue'

const companyInfo = ref(null)

const loadCompanyInfo = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/v1/companies/public/default')
    if (response.data && response.data.success) {
      companyInfo.value = response.data.data
    } else if (response.data) {
      companyInfo.value = response.data
    }
  } catch (error) {
    console.error('Error loading company info:', error)
  }
}

onMounted(() => {
  loadCompanyInfo()
})
</script>

<style scoped>
.store-location-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.location-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.location-header {
  text-align: center;
  margin-bottom: 2rem;
}

.location-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #333;
  margin: 0;
}

.location-content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.location-info {
  padding: 2rem;
  background: #f8f9fa;
}

.store-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.store-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FF9F43;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.info-item:last-of-type {
  border-bottom: none;
  margin-bottom: 2rem;
}

.info-item i {
  font-size: 1.5rem;
  color: #FF9F43;
  flex-shrink: 0;
  margin-top: 0.2rem;
}

.info-item p {
  margin: 0;
  color: #555;
  line-height: 1.6;
  font-size: 0.95rem;
}

.whatsapp-link,
.email-link {
  color: #555;
  text-decoration: none;
  transition: all 0.3s;
}

.whatsapp-link:hover {
  color: #25D366;
  text-decoration: underline;
}

.email-link:hover {
  color: #FF9F43;
  text-decoration: underline;
}

.btn-directions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem;
  background: #FF9F43;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-directions:hover {
  background: #e68a2e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 159, 67, 0.4);
}

.btn-directions i {
  font-size: 1.5rem;
}

.location-map {
  position: relative;
  min-height: 600px;
  background: #e0e0e0;
}

.location-map iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.map-overlay {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 159, 67, 0.95);
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  pointer-events: none;
  z-index: 10;
}

.map-overlay p {
  margin: 0;
  color: #ffffff;
}

@media (max-width: 992px) {
  .location-content {
    grid-template-columns: 1fr;
  }

  .location-map {
    min-height: 400px;
    order: 1;
  }

  .location-info {
    order: 2;
  }
}

@media (max-width: 768px) {
  .location-header h1 {
    font-size: 2rem;
  }

  .location-container {
    padding: 1rem;
  }

  .location-info {
    padding: 1.5rem;
  }

  .store-card {
    padding: 1.5rem;
  }

  .location-map {
    min-height: 350px;
  }
}
</style>
