<template>
  <div class="privacy-policy-page">
    <ShopHeader />

    <div class="privacy-container">
      <div class="privacy-header">
        <h1>POLÍTICA DE PRIVACIDAD Y SEGURIDAD</h1>
      </div>

      <div class="privacy-content">
        <section class="policy-section">
          <p class="intro-text">
            La presente Política de Privacidad establece los términos en que Cerámicas Terrazos y Pulidos Universal usa y protege la información que es proporcionada por sus usuarios al momento de utilizar su sitio web. Esta compañía está comprometida con la seguridad de los datos de sus usuarios. Cuando le pedimos llenar los campos de información personal con la cual usted pueda ser identificado, lo hacemos asegurando que sólo se empleará de acuerdo con los términos de este documento. Sin embargo, esta Política de Privacidad puede cambiar con el tiempo o ser actualizada por lo que le recomendamos y enfatizamos revisar continuamente esta página para asegurarse que está de acuerdo con dichos cambios.
          </p>
        </section>

        <section class="policy-section">
          <h2>INFORMACIÓN QUE ES RECOGIDA</h2>
          <p>
            Nuestro sitio web podrá recoger información personal, por ejemplo: nombre, información de contacto como su dirección de correo electrónica e información demográfica. Asimismo cuando sea necesario podrá ser requerida información específica para procesar algún pedido o realizar una entrega o facturación.
          </p>
        </section>

        <section class="policy-section">
          <h2>USO DE LA INFORMACIÓN RECOGIDA</h2>
          <p>
            Nuestro sitio web emplea la información con el fin de proporcionar el mejor servicio posible, particularmente para mantener un registro de usuarios, de pedidos en caso de que aplique, y mejorar nuestros productos y servicios. Es posible que sean enviados correos electrónicos periódicamente a través de nuestro sitio con ofertas especiales, nuevos productos y otra información publicitaria que consideremos relevante para usted o que pueda brindarle algún beneficio, estos correos electrónicos serán enviados a la dirección que usted proporcione y podrán ser cancelados en cualquier momento.
          </p>
          <p>
            Cerámicas Terrazos y Pulidos Universal está altamente comprometido para cumplir con el compromiso de mantener su información segura. Usamos los sistemas más avanzados y los actualizamos constantemente para asegurarnos que no exista ningún acceso no autorizado.
          </p>
        </section>

        <section class="policy-section">
          <h2>COOKIES</h2>
          <p>
            Una cookie se refiere a un fichero que es enviado con la finalidad de solicitar permiso para almacenarse en su ordenador, al aceptar dicho fichero se crea y la cookie sirve entonces para tener información respecto al tráfico web, y también facilita las futuras visitas a una web recurrente. Otra función que tienen las cookies es que con ellas las webs pueden reconocerte individualmente y por tanto brindarte el mejor servicio personalizado de su web.
          </p>
          <p>
            Nuestro sitio web emplea las cookies para poder identificar las páginas que son visitadas y su frecuencia. Esta información es empleada únicamente para análisis estadístico y después la información se elimina de forma permanente. Usted puede eliminar las cookies en cualquier momento desde su ordenador. Sin embargo, las cookies ayudan a proporcionar un mejor servicio de los sitios web, estás no dan acceso a información de su ordenador ni de usted, a menos de que usted así lo quiera y la proporcione directamente. Usted puede aceptar o negar el uso de cookies, sin embargo, la mayoría de los navegadores aceptan cookies automáticamente pues sirve para tener un mejor servicio web. También usted puede cambiar la configuración de su ordenador para declinar las cookies. Si se declinan es posible que no pueda utilizar algunos de nuestros servicios.
          </p>
        </section>

        <section class="policy-section">
          <h2>ENLACES A TERCEROS</h2>
          <p>
            Este sitio web pudiera contener enlaces a otros sitios que pudieran ser de su interés. Una vez que usted de clic en estos enlaces y abandone nuestra página, ya no tenemos control sobre el sitio al que es redirigido y por lo tanto no somos responsables de los términos o privacidad ni de la protección de sus datos en esos otros sitios terceros. Dichos sitios están sujetos a sus propias políticas de privacidad por lo cual es recomendable que los consulte para confirmar que usted está de acuerdo con estas.
          </p>
        </section>

        <section class="policy-section">
          <h2>CONTROL DE SU INFORMACIÓN PERSONAL</h2>
          <p>
            En cualquier momento usted puede restringir la recopilación o el uso de la información personal que es proporcionada a nuestro sitio web. Cada vez que se le solicite rellenar un formulario, como el de alta de usuario, puede marcar o desmarcar la opción de recibir información por correo electrónico. En caso de que haya marcado la opción de recibir nuestro boletín o publicidad usted puede cancelarla en cualquier momento.
          </p>
          <p>
            Cerámicas Terrazos y Pulidos Universal no venderá, cederá ni distribuirá la información personal que es recopilada sin su consentimiento, salvo que sea requerido por un juez con un orden judicial.
          </p>
          <p>
            Cerámicas Terrazos y Pulidos Universal se reserva el derecho de cambiar los términos de la presente Política de Privacidad en cualquier momento.
          </p>
        </section>

        <section class="policy-section last-update">
          <p><strong>Fecha de última actualización:</strong> Enero de 2026</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import ShopHeader from '@/components/ShopHeader.vue'
</script>

<style scoped>
.privacy-policy-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.privacy-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem 1rem;
}

.privacy-header {
  text-align: center;
  padding: 2rem 0 3rem 0;
  border-bottom: 3px solid #FF9F43;
  margin-bottom: 3rem;
}

.privacy-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #333;
  margin: 0;
}

.privacy-content {
  background: white;
  border-radius: 15px;
  padding: 3rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
}

.policy-section {
  margin-bottom: 2.5rem;
}

.policy-section:last-child {
  margin-bottom: 0;
}

.intro-text {
  font-size: 1rem;
  line-height: 1.8;
  color: #555;
  text-align: justify;
}

.policy-section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FF9F43;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #FF9F43;
}

.policy-section p {
  font-size: 1rem;
  line-height: 1.8;
  color: #555;
  margin-bottom: 1rem;
  text-align: justify;
}

.policy-section p:last-child {
  margin-bottom: 0;
}

.last-update {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
  margin-top: 3rem;
}

.last-update p {
  font-size: 0.95rem;
  color: #666;
  text-align: center;
}

@media (max-width: 768px) {
  .privacy-header h1 {
    font-size: 1.8rem;
  }

  .privacy-content {
    padding: 2rem 1.5rem;
  }

  .policy-section h2 {
    font-size: 1.3rem;
  }

  .policy-section p,
  .intro-text {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .privacy-header h1 {
    font-size: 1.5rem;
  }

  .privacy-content {
    padding: 1.5rem 1rem;
  }

  .policy-section h2 {
    font-size: 1.2rem;
  }
}
</style>
