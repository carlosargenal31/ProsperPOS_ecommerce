<template>
  <div class="contact-modal" :class="{ active: isOpen }" @click="handleBackdropClick">
    <div class="contact-modal-content" @click.stop>
      <button class="close-btn" @click="closeModal" aria-label="Cerrar">
        <i class="ti ti-x"></i>
      </button>

      <div class="modal-header">
        <h2>CONTÁCTANOS</h2>
      </div>

      <div class="modal-subheader">
        <p>Si tienes dudas y quieres cotizar un proyecto déjanos tu información y nos pondremos en contacto.</p>
      </div>

      <form @submit.prevent="handleSubmit" class="contact-form">
        <div class="form-row">
          <div class="form-group">
            <input
              v-model="formData.firstName"
              type="text"
              placeholder="Nombre *"
              required
              class="form-input"
            />
          </div>
          <div class="form-group">
            <input
              v-model="formData.lastName"
              type="text"
              placeholder="Apellido *"
              required
              class="form-input"
            />
          </div>
        </div>

        <div class="form-group">
          <input
            v-model="formData.email"
            type="email"
            placeholder="Correo electrónico *"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <select v-model="formData.reason" required class="form-select">
            <option value="cotizacion" selected>Solicitud de cotización</option>
            <option value="otra">Otra</option>
            <option value="dudas">Resolución de dudas x BOC</option>
            <option value="asesor">Seguimiento con Asesor</option>
            <option value="cotizacion-no-recibida">Cotización no fue recibida/enviada</option>
            <option value="ovp">Línea en OV pendiente de Facturación</option>
            <option value="entrega-incorrecta">Entregas de producto incorrecto</option>
            <option value="producto-danado">Reposición de producto dañado</option>
            <option value="producto-calidad">Reposición de producto x calidad</option>
            <option value="direccion-incorrecta">Entrega en dirección incorrecta</option>
            <option value="orden-no-entregada">Orden no entregada</option>
            <option value="factura-no-recibida">Factura - no fue recibida/enviada</option>
            <option value="factura-incorrecta">Factura - incorrecta</option>
            <option value="asesor-no-responde">Servicio - Asesor no responde</option>
            <option value="asesor-no-seguimiento">Servicio - Asesor no da seguimiento</option>
            <option value="tiempo-entrega">Servicio - Tiempo de entrega en bodega</option>
            <option value="no-atienden-tienda">Servicio - No atienden en Tienda</option>
            <option value="no-contestan-extension">Servicio - No contestan en Extensión</option>
            <option value="horarios-tiendas">Horarios de Servicio de Tiendas</option>
            <option value="confirmacion-pagos">Confirmación de pagos a proveedores</option>
            <option value="horarios-pagos">Horarios para entrega de contraseñas de pago</option>
            <option value="referencias">Referencias personales/comerciales</option>
            <option value="recepcion-parcial">Recepción Parcial por el cliente</option>
            <option value="producto-tarima">Reposición Producto Dañado En Tarima Sellada</option>
          </select>
        </div>

        <div class="form-group">
          <textarea
            v-model="formData.message"
            placeholder="Mensaje"
            rows="5"
            class="form-textarea"
          ></textarea>
        </div>

        <button type="submit" class="btn-submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'ENVIANDO...' : 'ENVIAR' }}
        </button>

        <div v-if="submitMessage" class="submit-message" :class="submitStatus">
          {{ submitMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  reason: 'cotizacion',
  message: ''
})

const isSubmitting = ref(false)
const submitMessage = ref('')
const submitStatus = ref('')

const resetForm = () => {
  formData.value = {
    firstName: '',
    lastName: '',
    email: '',
    reason: 'cotizacion',
    message: ''
  }
  submitMessage.value = ''
  submitStatus.value = ''
}

const closeModal = () => {
  emit('close')
  // Reset form after a delay to allow the modal to close animation
  setTimeout(resetForm, 300)
}

const handleBackdropClick = () => {
  closeModal()
}

const handleSubmit = async () => {
  isSubmitting.value = true
  submitMessage.value = ''
  submitStatus.value = ''

  try {
    // Aquí puedes agregar la lógica para enviar el formulario a tu backend
    // Por ahora solo simulamos el envío
    await new Promise(resolve => setTimeout(resolve, 1500))

    console.log('Form submitted:', formData.value)

    submitMessage.value = 'Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.'
    submitStatus.value = 'success'

    // Close modal after successful submission
    setTimeout(() => {
      closeModal()
    }, 2000)
  } catch (error) {
    console.error('Error submitting form:', error)
    submitMessage.value = 'Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.'
    submitStatus.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

// Prevent body scroll when modal is open
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.contact-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  padding: 1rem;
}

.contact-modal.active {
  opacity: 1;
  visibility: visible;
}

.contact-modal-content {
  background: white;
  border-radius: 12px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  transform: scale(0.9);
  transition: transform 0.3s ease;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.contact-modal.active .contact-modal-content {
  transform: scale(1);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
  z-index: 1;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-header {
  background: #FF9F43;
  color: white;
  padding: 2rem 3rem;
  text-align: center;
}

.modal-header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 1px;
  color: white;
}

.modal-subheader {
  padding: 1.5rem 3rem 0.5rem 3rem;
  text-align: center;
}

.modal-subheader p {
  font-size: 0.95rem;
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.contact-form {
  padding: 2.5rem 3rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.9rem 1.2rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #FF9F43;
  box-shadow: 0 0 0 3px rgba(255, 159, 67, 0.1);
}

.form-select {
  cursor: pointer;
  background-color: white;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  background: #FF9F43;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 1px;
}

.btn-submit:hover:not(:disabled) {
  background: #e68a2e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 159, 67, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  font-size: 0.9rem;
}

.submit-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.submit-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .modal-header {
    padding: 1.5rem 1.5rem;
  }

  .modal-header h2 {
    font-size: 1.5rem;
  }

  .modal-subheader {
    padding: 1rem 1.5rem 0.5rem 1.5rem;
  }

  .contact-form {
    padding: 2rem 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .contact-modal {
    padding: 0.5rem;
  }

  .modal-header {
    padding: 1.5rem 1rem;
  }

  .modal-header h2 {
    font-size: 1.3rem;
  }

  .modal-subheader {
    padding: 1rem 1rem 0.5rem 1rem;
  }

  .modal-subheader p {
    font-size: 0.85rem;
  }

  .contact-form {
    padding: 1.5rem 1rem;
  }
}
</style>
