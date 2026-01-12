<template>
  <div class="about-us-page">
    <ShopHeader />

    <div class="about-container">
      <div class="about-header">
        <h1>ACERCA DE NOSOTROS</h1>
      </div>

      <div class="about-content">
        <section class="about-section hero-section">
          <div class="hero-text">
            <h2>Cerámicas Universal</h2>
            <p class="intro-text">
              Somos una empresa hondureña dedicada a ofrecer productos de la más alta calidad en cerámicas y porcelanatos.
              Con años de experiencia en el mercado, nos hemos consolidado como líderes en el sector de materiales para el hogar,
              construcción y acabados arquitectónicos en Honduras.
            </p>
          </div>
        </section>

        <section class="about-section">
          <h2>Nuestra Historia</h2>
          <p>
            Desde nuestros inicios, nos hemos comprometido con la excelencia en cada producto que ofrecemos. Comenzamos como una
            tienda familiar y, gracias al apoyo de nuestros clientes y a la dedicación de nuestro equipo, hemos crecido
            hasta convertirnos en una de las empresas más confiables del sector en Honduras.
          </p>
          <p>
            A lo largo de los años, hemos establecido relaciones sólidas con los mejores fabricantes y proveedores a nivel nacional
            e internacional, lo que nos permite ofrecer una amplia gama de productos de primera calidad a precios competitivos.
          </p>
        </section>

        <section class="about-section">
          <h2>Nuestros Productos</h2>
          <p>
            Especializados en <strong>cerámicas y porcelanatos</strong> de alta calidad, también ofrecemos una amplia gama de productos
            para el hogar que incluyen: tablillas de PVC, loza sanitaria, ladrillos, muebles de baño, bañeras, inodoros y todo lo
            necesario para hacer de tu hogar un espacio único y funcional.
          </p>
        </section>

        <section class="about-section">
          <h2>Nuestra Misión</h2>
          <p>
            Proveer a nuestros clientes cerámicas, porcelanatos y productos para el hogar de la más alta calidad, ofreciendo un servicio
            personalizado y profesional que supere sus expectativas. Nos esforzamos por ser el socio de confianza en cada proyecto
            de construcción, renovación o mejora del hogar.
          </p>
        </section>

        <section class="about-section">
          <h2>Nuestra Visión</h2>
          <p>
            Ser la empresa líder en Honduras en la comercialización de cerámicas, porcelanatos y productos para el hogar, reconocida por nuestra
            excelencia en productos, servicio al cliente e innovación constante. Aspiramos a expandir nuestra presencia a nivel
            nacional y seguir siendo la primera opción para constructores, arquitectos y propietarios de viviendas.
          </p>
        </section>

        <section class="about-section">
          <h2>Nuestros Valores</h2>
          <div class="values-grid">
            <div class="value-card">
              <div class="value-icon">
                <i class="ti ti-award"></i>
              </div>
              <h3>Calidad</h3>
              <p>Ofrecemos únicamente productos que cumplen con los más altos estándares de calidad.</p>
            </div>

            <div class="value-card">
              <div class="value-icon">
                <i class="ti ti-users"></i>
              </div>
              <h3>Servicio al Cliente</h3>
              <p>Nos enfocamos en brindar atención personalizada y asesoría experta a cada cliente.</p>
            </div>

            <div class="value-card">
              <div class="value-icon">
                <i class="ti ti-shield-check"></i>
              </div>
              <h3>Confiabilidad</h3>
              <p>Cumplimos nuestras promesas y mantenemos la transparencia en todas nuestras operaciones.</p>
            </div>

            <div class="value-card">
              <div class="value-icon">
                <i class="ti ti-bulb"></i>
              </div>
              <h3>Innovación</h3>
              <p>Nos mantenemos actualizados con las últimas tendencias y tecnologías del sector.</p>
            </div>
          </div>
        </section>

        <section class="about-section">
          <h2>¿Por Qué Elegirnos?</h2>
          <ul class="benefits-list">
            <li>
              <i class="ti ti-check"></i>
              <span><strong>Amplio catálogo de productos:</strong> Disponemos de una extensa variedad de cerámicas, porcelanatos, loza sanitaria, muebles de baño y más para todo tipo de proyectos.</span>
            </li>
            <li>
              <i class="ti ti-check"></i>
              <span><strong>Especialistas en cerámicas y porcelanatos:</strong> Contamos con las mejores marcas y acabados del mercado.</span>
            </li>
            <li>
              <i class="ti ti-check"></i>
              <span><strong>Asesoría profesional:</strong> Nuestro equipo de expertos está capacitado para ayudarte a elegir los productos adecuados para tu hogar.</span>
            </li>
            <li>
              <i class="ti ti-check"></i>
              <span><strong>Precios competitivos:</strong> Ofrecemos los mejores precios del mercado sin comprometer la calidad.</span>
            </li>
            <li>
              <i class="ti ti-check"></i>
              <span><strong>Entrega confiable:</strong> Contamos con un sistema de distribución eficiente para garantizar que tus productos lleguen a tiempo.</span>
            </li>
            <li>
              <i class="ti ti-check"></i>
              <span><strong>Garantía de calidad:</strong> Todos nuestros productos están respaldados por garantías del fabricante.</span>
            </li>
          </ul>
        </section>

        <section class="about-section cta-section">
          <h2>Visítanos</h2>
          <p>
            Te invitamos a conocer nuestras instalaciones y descubrir todo lo que tenemos para ofrecerte. Nuestro equipo estará
            encantado de atenderte y ayudarte a encontrar los productos perfectos para tu proyecto.
          </p>
          <div class="cta-buttons">
            <router-link to="/catalog" class="btn btn-primary">
              <i class="ti ti-shopping-cart"></i>
              Ver Catálogo
            </router-link>
            <router-link to="/store-location" class="btn btn-secondary">
              <i class="ti ti-map-pin"></i>
              Nuestra Ubicación
            </router-link>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import ShopHeader from '@/components/ShopHeader.vue'
</script>

<style scoped>
.about-us-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem 1rem;
}

.about-header {
  text-align: center;
  padding: 2rem 0 3rem 0;
  border-bottom: 3px solid #FF9F43;
  margin-bottom: 3rem;
}

.about-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #333;
  margin: 0;
}

.about-content {
  background: white;
  border-radius: 15px;
  padding: 3rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
}

.about-section {
  margin-bottom: 3rem;
}

.about-section:last-child {
  margin-bottom: 0;
}

.hero-section {
  text-align: center;
  padding: 2rem 0;
  background: white;
  border-radius: 12px;
  margin: -1rem -1rem 3rem -1rem;
  padding: 3rem 2rem;
}

.hero-text h2 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: #FF9F43;
}

.intro-text {
  font-size: 1.1rem;
  line-height: 1.8;
  max-width: 900px;
  margin: 0 auto;
  color: #555;
}

.about-section h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #FF9F43;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #FF9F43;
}

.about-section p {
  font-size: 1rem;
  line-height: 1.8;
  color: #555;
  margin-bottom: 1rem;
  text-align: justify;
}

.about-section p:last-child {
  margin-bottom: 0;
}

/* Values Grid */
.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.value-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.value-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border-color: #FF9F43;
}

.value-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #FF9F43 0%, #ffb366 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  font-size: 2.5rem;
  color: white;
}

.value-card h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
}

.value-card p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #666;
  text-align: center;
  margin: 0;
}

/* Benefits List */
.benefits-list {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0 0;
}

.benefits-list li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.benefits-list li:hover {
  background: #fff5e6;
  transform: translateX(10px);
}

.benefits-list li i {
  color: #FF9F43;
  font-size: 1.5rem;
  margin-right: 1rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.benefits-list li span {
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
}

/* CTA Section */
.cta-section {
  text-align: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #fff5e6 100%);
  padding: 3rem 2rem;
  border-radius: 12px;
  margin: 3rem -1rem -1rem -1rem;
}

.cta-section h2 {
  border-bottom: none;
  margin-bottom: 1rem;
}

.cta-section p {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.cta-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-primary {
  background: #FF9F43;
  color: white;
}

.btn-primary:hover {
  background: #e88b2e;
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(255, 159, 67, 0.4);
}

.btn-secondary {
  background: #1a3a52;
  color: white;
}

.btn-secondary:hover {
  background: #2a5a82;
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(26, 58, 82, 0.4);
}

@media (max-width: 768px) {
  .about-header h1 {
    font-size: 1.8rem;
  }

  .about-content {
    padding: 2rem 1.5rem;
  }

  .hero-section {
    padding: 2rem 1.5rem;
    margin: -0.5rem -0.5rem 2rem -0.5rem;
  }

  .hero-text h2 {
    font-size: 1.5rem;
  }

  .intro-text {
    font-size: 1rem;
  }

  .about-section h2 {
    font-size: 1.5rem;
  }

  .about-section p {
    font-size: 0.95rem;
  }

  .values-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .value-icon {
    width: 70px;
    height: 70px;
    font-size: 2rem;
  }

  .value-card h3 {
    font-size: 1.2rem;
  }

  .cta-section {
    padding: 2rem 1.5rem;
    margin: 2rem -0.5rem -0.5rem -0.5rem;
  }

  .cta-buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .about-header h1 {
    font-size: 1.5rem;
  }

  .about-content {
    padding: 1.5rem 1rem;
  }

  .hero-section {
    padding: 1.5rem 1rem;
  }

  .hero-text h2 {
    font-size: 1.3rem;
  }

  .intro-text {
    font-size: 0.95rem;
  }

  .about-section h2 {
    font-size: 1.3rem;
  }

  .value-icon {
    width: 60px;
    height: 60px;
    font-size: 1.8rem;
  }

  .benefits-list li {
    padding: 1rem;
  }

  .benefits-list li i {
    font-size: 1.3rem;
  }
}
</style>
