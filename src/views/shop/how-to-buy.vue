<template>
  <div class="how-to-buy-page">
    <ShopHeader />

    <div class="how-to-buy-container">
      <div class="page-header">
        <h1>¿Cómo realizar tu pedido?</h1>
        <p>Sigue estos sencillos pasos para realizar tu pedido</p>
      </div>

      <div class="steps-container">
        <div class="step-card">
          <div class="step-number">1</div>
          <div class="step-icon">
            <i class="ti ti-layout-grid"></i>
          </div>
          <div class="step-content">
            <h3>Elige tu producto</h3>
            <p>Explora nuestras categorías y selecciona por diseño, tamaño o acabado.</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-number">2</div>
          <div class="step-icon">
            <i class="ti ti-shopping-cart"></i>
          </div>
          <div class="step-content">
            <h3>Agrega al carrito</h3>
            <p>Ingresa la cantidad que necesitas y haz clic en 'Agregar al carrito'.</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-number">3</div>
          <div class="step-icon">
            <i class="ti ti-clipboard-check"></i>
          </div>
          <div class="step-content">
            <h3>Revisa tu pedido</h3>
            <p>Ve al carrito y verifica producto, modelo y cantidades.</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-number">4</div>
          <div class="step-icon">
            <i class="ti ti-forms"></i>
          </div>
          <div class="step-content">
            <h3>Completa tus datos</h3>
            <p>Ingresa tu información de envío y facturación para continuar.</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-number">5</div>
          <div class="step-icon">
            <i class="ti ti-brand-whatsapp"></i>
          </div>
          <div class="step-content">
            <h3>Confirma por WhatsApp</h3>
            <p>Tu pedido será enviado a WhatsApp donde nuestro equipo te atenderá y confirmará disponibilidad y métodos de pago.</p>
          </div>
        </div>
      </div>

      <div class="cta-section">
        <h2>¿Listo para empezar?</h2>
        <p class="cta-text">Navega por nuestro catálogo y encuentra los productos perfectos para tu proyecto</p>
        <div class="cta-buttons">
          <router-link to="/catalog" class="btn btn-primary">
            <i class="ti ti-shopping-bag"></i>
            Ver Catálogo
          </router-link>
          <a
            href="https://wa.me/50498752725?text=Hola,%20necesito%20ayuda%20para%20hacer%20un%20pedido"
            target="_blank"
            class="btn btn-whatsapp"
          >
            <i class="ti ti-brand-whatsapp"></i>
            Contactar por WhatsApp
          </a>
        </div>
      </div>

      <div class="help-section">
        <div class="help-card">
          <i class="ti ti-help-circle"></i>
          <h3>¿Necesitas ayuda?</h3>
          <p>Nuestro equipo está disponible para asistirte en todo el proceso de compra.</p>
          <div class="contact-methods">
            <a href="https://wa.me/50498752725" target="_blank" class="contact-item">
              <i class="ti ti-brand-whatsapp"></i>
              <span>+504 9875-2725</span>
            </a>
            <a href="https://wa.me/50432063879" target="_blank" class="contact-item">
              <i class="ti ti-brand-whatsapp"></i>
              <span>+504 3206-3879</span>
            </a>
            <a href="mailto:ceramicasuniversal504@gmail.com" class="contact-item">
              <i class="ti ti-mail"></i>
              <span>ceramicasuniversal504@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ShopHeader from '@/components/ShopHeader.vue'
</script>

<style scoped>
.how-to-buy-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.how-to-buy-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 0.5rem;
}

.page-header p {
  font-size: 1.1rem;
  color: #666;
}

.steps-container {
  display: grid;
  gap: 2rem;
  margin-bottom: 4rem;
}

.step-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 1.5rem;
  align-items: center;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.step-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background: #FF9F43;
  transform: scaleY(0);
  transition: transform 0.3s;
}

.step-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
}

.step-card:hover::before {
  transform: scaleY(1);
}

.step-number {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #FF9F43, #e68a2e);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(255, 159, 67, 0.3);
}

.step-icon {
  font-size: 3rem;
  color: #FF9F43;
}

.step-content h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.step-content p {
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.cta-section {
  background: linear-gradient(135deg, #FF9F43, #e68a2e);
  color: white;
  padding: 3rem 2rem;
  border-radius: 15px;
  text-align: center;
  margin-bottom: 3rem;
}

.cta-section h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.cta-section p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.95;
}

.cta-text {
  color: white !important;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-primary {
  background: white;
  color: #FF9F43;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}

.btn-whatsapp {
  background: #25D366;
  color: white;
}

.btn-whatsapp:hover {
  background: #20b358;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
}

.help-section {
  margin-top: 3rem;
}

.help-card {
  background: white;
  padding: 2.5rem;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  text-align: center;
}

.help-card > i {
  font-size: 4rem;
  color: #FF9F43;
  margin-bottom: 1rem;
}

.help-card h3 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.help-card p {
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  color: #555;
  transition: all 0.3s;
}

.contact-item i {
  font-size: 1.5rem;
  color: #FF9F43;
}

.contact-item:hover {
  background: #FF9F43;
  color: white;
  transform: translateX(5px);
}

.contact-item:hover i {
  color: white;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .step-card {
    grid-template-columns: auto 1fr;
    gap: 1rem;
    padding: 1.5rem;
  }

  .step-icon {
    grid-column: 1 / -1;
    font-size: 2.5rem;
  }

  .step-number {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .step-content h3 {
    font-size: 1.2rem;
  }

  .cta-section {
    padding: 2rem 1.5rem;
  }

  .cta-section h2 {
    font-size: 1.5rem;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
