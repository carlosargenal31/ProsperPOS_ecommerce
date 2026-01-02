<template>
  <div class="main-wrapper">
    <layout-header></layout-header>
    <layout-sidebar></layout-sidebar>

    <div class="page-wrapper">
      <div class="content">
        <div class="page-header">
          <div class="add-item d-flex">
            <div class="page-title">
              <h4>Finalizar Pedido</h4>
              <h6>Complete la información para realizar su pedido</h6>
            </div>
          </div>
        </div>

      <div v-if="loading" class="loading">
        <i class="mdi mdi-loading mdi-spin"></i>
        Cargando...
      </div>

      <div v-else class="checkout-content">
        <div class="checkout-form">
          <div class="form-section">
            <h2><i class="mdi mdi-map-marker"></i> Dirección de Envío</h2>

            <div class="form-group">
              <label>Dirección *</label>
              <textarea
                v-model="orderForm.shipping_address"
                rows="3"
                placeholder="Calle, número, colonia..."
                required
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Ciudad *</label>
                <input
                  v-model="orderForm.shipping_city"
                  type="text"
                  placeholder="Tegucigalpa"
                  required
                />
              </div>

              <div class="form-group">
                <label>Departamento</label>
                <input
                  v-model="orderForm.shipping_state"
                  type="text"
                  placeholder="Francisco Morazán"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>País</label>
                <input
                  v-model="orderForm.shipping_country"
                  type="text"
                  value="Honduras"
                  readonly
                />
              </div>

              <div class="form-group">
                <label>Código Postal</label>
                <input
                  v-model="orderForm.shipping_postal_code"
                  type="text"
                  placeholder="11101"
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2><i class="mdi mdi-note-text"></i> Notas del Pedido</h2>
            <div class="form-group">
              <label>Instrucciones especiales (opcional)</label>
              <textarea
                v-model="orderForm.customer_notes"
                rows="4"
                placeholder="Referencias de la dirección, preferencias de entrega, etc..."
              ></textarea>
            </div>
          </div>

          <div class="form-section">
            <h2><i class="mdi mdi-cash"></i> Método de Contacto</h2>
            <div class="payment-methods">
              <label class="payment-option">
                <input
                  type="radio"
                  v-model="orderForm.payment_method"
                  value="whatsapp"
                  checked
                />
                <div class="option-content">
                  <i class="mdi mdi-whatsapp"></i>
                  <div>
                    <strong>WhatsApp</strong>
                    <p>Un vendedor te contactará para confirmar tu pedido</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="order-summary">
          <h2>Resumen del Pedido</h2>

          <div class="summary-items">
            <div
              v-for="item in cart?.items || []"
              :key="item.cart_id"
              class="summary-item"
            >
              <div class="item-details">
                <img
                  :src="item.product_image || '/placeholder-product.png'"
                  :alt="item.product_name"
                  @error="handleImageError"
                />
                <div>
                  <p class="item-name">{{ item.product_name }}</p>
                  <p class="item-quantity">Cantidad: {{ item.quantity }}</p>
                </div>
              </div>
              <p class="item-total">L{{ formatPrice(item.total) }}</p>
            </div>
          </div>

          <div class="summary-totals">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>L{{ formatPrice(cart?.summary.subtotal) }}</span>
            </div>

            <div class="summary-row">
              <span>ISV:</span>
              <span>L{{ formatPrice(cart?.summary.tax_amount) }}</span>
            </div>

            <div class="summary-row summary-total">
              <span>Total:</span>
              <span>L{{ formatPrice(cart?.summary.total) }}</span>
            </div>
          </div>

          <button
            @click="submitOrder"
            class="btn-submit-order"
            :disabled="submitting"
          >
            <i v-if="submitting" class="mdi mdi-loading mdi-spin"></i>
            <span v-else>
              <i class="mdi mdi-check-circle"></i>
              Confirmar Pedido
            </span>
          </button>

          <router-link to="/shop/cart" class="btn-back">
            <i class="mdi mdi-arrow-left"></i>
            Volver al Carrito
          </router-link>
        </div>
      </div>
    </div>

    <!-- Modal de éxito -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="success-icon">
          <i class="mdi mdi-check-circle"></i>
        </div>
        <h2>¡Pedido Realizado!</h2>
        <p>Tu pedido <strong>{{ orderNumber }}</strong> ha sido creado exitosamente.</p>
        <p class="whatsapp-info">
          <i class="mdi mdi-whatsapp"></i>
          Serás redirigido a WhatsApp para confirmar tu pedido con un vendedor.
        </p>

        <div class="modal-actions">
          <button @click="openWhatsApp" class="btn-whatsapp">
            <i class="mdi mdi-whatsapp"></i>
            Abrir WhatsApp
          </button>
          <button @click="goToOrders" class="btn-orders">
            Ver Mis Pedidos
          </button>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { cartService, ordersService, authService } from '@/api/ecommerce'

export default {
  name: 'ShopCheckout',
  setup() {
    const router = useRouter()

    const cart = ref(null)
    const customer = ref(null)
    const loading = ref(false)
    const submitting = ref(false)
    const showSuccessModal = ref(false)
    const orderNumber = ref('')
    const whatsappUrl = ref('')

    const orderForm = ref({
      shipping_address: '',
      shipping_city: '',
      shipping_state: '',
      shipping_country: 'Honduras',
      shipping_postal_code: '',
      customer_notes: '',
      payment_method: 'whatsapp'
    })

    const loadData = async () => {
      try {
        loading.value = true

        // Cargar carrito
        const cartResponse = await cartService.getCart()
        if (cartResponse.success) {
          cart.value = cartResponse.data

          // Verificar que hay items
          if (!cart.value.items || cart.value.items.length === 0) {
            alert('Tu carrito está vacío')
            router.push('/shop/cart')
            return
          }
        }

        // Cargar datos del cliente
        const profileResponse = await authService.getProfile()
        if (profileResponse.success) {
          customer.value = profileResponse.data

          // Prellenar formulario con datos guardados
          if (customer.value.shipping_address) {
            orderForm.value.shipping_address = customer.value.shipping_address
            orderForm.value.shipping_city = customer.value.shipping_city || ''
            orderForm.value.shipping_state = customer.value.shipping_state || ''
            orderForm.value.shipping_postal_code = customer.value.shipping_postal_code || ''
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
        alert('Error al cargar datos')
      } finally {
        loading.value = false
      }
    }

    const submitOrder = async () => {
      // Validar formulario
      if (!orderForm.value.shipping_address || !orderForm.value.shipping_city) {
        alert('Por favor completa la dirección de envío')
        return
      }

      try {
        submitting.value = true

        const response = await ordersService.createOrder(orderForm.value)

        if (response.success) {
          orderNumber.value = response.data.order_number

          // Obtener URL de WhatsApp
          const whatsappResponse = await ordersService.getWhatsAppUrl(orderNumber.value)
          if (whatsappResponse.success) {
            whatsappUrl.value = whatsappResponse.data.whatsapp_url
          }

          showSuccessModal.value = true
        }
      } catch (error) {
        console.error('Error submitting order:', error)
        alert(error.response?.data?.message || 'Error al crear pedido')
      } finally {
        submitting.value = false
      }
    }

    const openWhatsApp = () => {
      if (whatsappUrl.value) {
        window.open(whatsappUrl.value, '_blank')
      }
      closeModal()
      router.push('/shop/orders')
    }

    const goToOrders = () => {
      closeModal()
      router.push('/shop/orders')
    }

    const closeModal = () => {
      showSuccessModal.value = false
    }

    const formatPrice = (price) => {
      return parseFloat(price || 0).toFixed(2)
    }

    const handleImageError = (e) => {
      e.target.src = '/placeholder-product.png'
    }

    onMounted(() => {
      loadData()
    })

    return {
      cart,
      customer,
      loading,
      submitting,
      showSuccessModal,
      orderNumber,
      orderForm,
      submitOrder,
      openWhatsApp,
      goToOrders,
      closeModal,
      formatPrice,
      handleImageError
    }
  }
}
</script>

<style scoped>

.loading {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
}

.form-section h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-option:has(input:checked) {
  border-color: #667eea;
  background: #f0f3ff;
}

.payment-option input[type="radio"] {
  width: 20px;
  height: 20px;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.option-content i {
  font-size: 2rem;
  color: #25D366;
}

.option-content strong {
  display: block;
  color: #333;
  margin-bottom: 0.25rem;
}

.option-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.order-summary {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.order-summary h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.item-details {
  display: flex;
  gap: 0.75rem;
  flex: 1;
}

.item-details img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.item-name {
  font-weight: 500;
  color: #333;
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
}

.item-quantity {
  font-size: 0.85rem;
  color: #999;
  margin: 0;
}

.item-total {
  font-weight: 600;
  color: #667eea;
  white-space: nowrap;
}

.summary-totals {
  border-top: 1px solid #f0f0f0;
  padding-top: 1rem;
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  color: #666;
}

.summary-total {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  border-top: 2px solid #e0e0e0;
  margin-top: 0.5rem;
  padding-top: 1rem;
}

.btn-submit-order {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-submit-order:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-submit-order:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.5rem;
  background: white;
  color: #667eea;
  border: 1px solid #667eea;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #f0f3ff;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  color: #4CAF50;
  margin-bottom: 1rem;
}

.modal-content h2 {
  color: #333;
  margin: 0 0 1rem 0;
}

.modal-content p {
  color: #666;
  margin: 0 0 0.5rem 0;
}

.whatsapp-info {
  background: #f0f9f4;
  padding: 1rem;
  border-radius: 8px;
  color: #25D366;
  font-weight: 500;
  margin-top: 1rem;
}

.whatsapp-info i {
  margin-right: 0.5rem;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-whatsapp {
  padding: 1rem;
  background: #25D366;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-whatsapp:hover {
  background: #1da851;
  transform: translateY(-2px);
}

.btn-orders {
  padding: 0.75rem;
  background: white;
  color: #667eea;
  border: 1px solid #667eea;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-orders:hover {
  background: #f0f3ff;
}

@media (max-width: 968px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: static;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
