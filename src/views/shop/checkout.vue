<template>
  <div class="checkout-page">
    <ShopHeader />

    <div class="container-fluid px-4 py-5">
      <!-- Progress Steps -->
      <div class="checkout-steps mb-5">
        <div class="step completed">
          <div class="step-number">1</div>
          <div class="step-label">CARRITO DE COMPRA</div>
        </div>
        <div class="step" :class="{ completed: currentStep > 2, active: currentStep === 2 }">
          <div class="step-number">2</div>
          <div class="step-label">INGRESA TU CORREO</div>
        </div>
        <div class="step" :class="{ completed: currentStep > 3, active: currentStep === 3 }">
          <div class="step-number">3</div>
          <div class="step-label">ENVÍO Y PAGO</div>
        </div>
        <div class="step" :class="{ active: currentStep === 4 }">
          <div class="step-number">4</div>
          <div class="step-label">CONFIRMACIÓN</div>
        </div>
      </div>

      <div class="row">
        <!-- Checkout Form -->
        <div class="col-lg-8">
          <!-- Step 2: Customer Info -->
          <div v-if="currentStep === 2" class="checkout-card">
            <div class="step-header">
              <span class="step-badge">2</span>
              <h3>Identificación</h3>
            </div>

            <div class="form-group">
              <label>Correo</label>
              <input type="email" v-model="customerInfo.email" placeholder="ejemplo@correo.com" class="form-input" required />
            </div>

            <div class="form-group">
              <label>Nombre</label>
              <input type="text" v-model="customerInfo.firstName" placeholder="Nombre" class="form-input" required />
            </div>

            <div class="form-group">
              <label>Apellidos</label>
              <input type="text" v-model="customerInfo.lastName" placeholder="Apellidos" class="form-input" required />
            </div>

            <div class="form-group">
              <label>DNI</label>
              <input type="text" v-model="customerInfo.dni" placeholder="0801-1990-12345" class="form-input" required />
            </div>

            <div class="form-group">
              <label>Teléfono / Móvil</label>
              <input type="tel" v-model="customerInfo.phone" placeholder="9999-9999" class="form-input" required />
            </div>

            <div v-if="isLoggedIn" class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="saveProfile" class="checkbox-input" />
                <span>Guardar esta información en mi perfil</span>
              </label>
            </div>

            <button @click="nextStep" class="btn-next" :disabled="!isStep2Valid">
              Continuar con Tipo de Entrega
            </button>
          </div>

          <!-- Step 3: Delivery Type -->
          <div v-if="currentStep === 3" class="checkout-card">
            <div class="step-header-completed">
              <span class="step-badge">2</span>
              <h4>Identificación</h4>
              <button @click="editStep(2)" class="btn-edit">Editar</button>
            </div>
            <div class="info-summary">
              <p>{{ customerInfo.email }}</p>
              <p>{{ customerInfo.firstName }} {{ customerInfo.lastName }}</p>
              <p>{{ customerInfo.phone }}</p>
            </div>

            <div class="step-header">
              <span class="step-badge active">3</span>
              <h3>Tipo de Entrega</h3>
            </div>

            <div class="delivery-options">
              <button
                @click="selectDeliveryType('domicilio')"
                class="delivery-option"
                :class="{ active: deliveryInfo.type === 'domicilio' }"
              >
                Entrega a Domicilio
              </button>
              <button
                @click="selectDeliveryType('tienda')"
                class="delivery-option"
                :class="{ active: deliveryInfo.type === 'tienda' }"
              >
                Recoger en Tienda
              </button>
            </div>

            <div v-if="deliveryInfo.type === 'domicilio'" class="delivery-form">
              <!-- Direcciones guardadas (solo si está autenticado y tiene direcciones) -->
              <div v-if="isLoggedIn && savedAddresses.length > 0" class="saved-addresses-section">
                <button
                  @click="showSavedAddresses = !showSavedAddresses"
                  class="btn-toggle-addresses"
                  type="button"
                >
                  <i class="ti ti-map-pin"></i>
                  {{ showSavedAddresses ? 'Ocultar' : 'Usar' }} direcciones guardadas
                  <i :class="showSavedAddresses ? 'ti ti-chevron-up' : 'ti ti-chevron-down'"></i>
                </button>

                <div v-if="showSavedAddresses" class="saved-addresses-list">
                  <div
                    v-for="address in savedAddresses"
                    :key="address.id"
                    @click="selectSavedAddress(address)"
                    class="saved-address-item"
                    :class="{ default: address.is_default }"
                  >
                    <div class="address-item-header">
                      <strong>{{ address.address_label || address.recipient_name }}</strong>
                      <span v-if="address.is_default" class="default-tag">Predeterminada</span>
                    </div>
                    <p v-if="address.address_label" class="address-item-recipient">{{ address.recipient_name }}</p>
                    <p class="address-item-details">{{ address.full_address }}</p>
                    <p class="address-item-location">{{ address.city }}, {{ address.department }}</p>
                    <p class="address-item-phone">Tel: {{ address.phone }}</p>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label>Departamento</label>
                <select v-model="deliveryInfo.departmentId" @change="onDepartmentChange" class="form-select">
                  <option value="">Seleccione un departamento</option>
                  <option v-for="state in states" :key="state.id" :value="state.id">
                    {{ state.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Municipio</label>
                <select v-model="deliveryInfo.municipalityId" :disabled="!deliveryInfo.departmentId || loadingCities" class="form-select">
                  <option value="">{{ loadingCities ? 'Cargando...' : 'Seleccione un municipio' }}</option>
                  <option v-for="city in cities" :key="city.id" :value="city.id">
                    {{ city.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Complete su Dirección de Entrega</label>
                <textarea v-model="deliveryInfo.address" rows="3" placeholder="Calle, colonia, referencias..." class="form-textarea"></textarea>
              </div>

              <div class="form-group">
                <label>Nombre de la Persona que va a Recibir</label>
                <input type="text" v-model="deliveryInfo.receiverName" :placeholder="`${customerInfo.firstName} ${customerInfo.lastName}`" class="form-input" />
              </div>

              <div class="form-group">
                <label>Teléfono de la Persona que va a Recibir</label>
                <input type="tel" v-model="deliveryInfo.receiverPhone" placeholder="9999-9999" class="form-input" />
              </div>

              <div class="form-group">
                <label>Notas adicionales para la entrega</label>
                <textarea v-model="deliveryInfo.notes" rows="2" placeholder="Ej: Tocar timbre, casa color verde, portón negro..." class="form-textarea"></textarea>
              </div>

              <div v-if="isLoggedIn" class="save-address-section">
                <div class="form-group checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="saveAddress" class="checkbox-input" />
                    <span>Guardar esta dirección para futuros pedidos</span>
                  </label>
                </div>

                <div v-if="saveAddress" class="form-group">
                  <label>Nombre para esta dirección</label>
                  <input
                    type="text"
                    v-model="addressLabel"
                    placeholder="Ej: Casa Principal, Casa de Sambo, Oficina..."
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <div v-if="deliveryInfo.type === 'tienda'" class="pickup-info">
              <p><strong>Ubicación de la tienda:</strong></p>
              <p>{{ companyInfo?.address || 'Dirección no disponible' }}</p>
              <p><strong>Horario:</strong> Lunes a Viernes 7:30 AM - 5:00 PM, Sábados 7:30 AM - 4:00 PM</p>
            </div>

            <button @click="nextStep" class="btn-next" :disabled="!isStep3Valid">
              Continuar con el Pedido
            </button>
          </div>

          <!-- Step 4: Confirmation -->
          <div v-if="currentStep === 4" class="checkout-card">
            <div class="step-header-completed">
              <span class="step-badge">2</span>
              <h4>Identificación</h4>
              <button @click="editStep(2)" class="btn-edit">Editar</button>
            </div>

            <div class="step-header-completed">
              <span class="step-badge">3</span>
              <h4>Tipo de Entrega</h4>
              <button @click="editStep(3)" class="btn-edit">Editar</button>
            </div>
            <div class="info-summary">
              <p v-if="deliveryInfo.type === 'domicilio'">
                <strong>Entrega a Domicilio</strong><br>
                {{ deliveryInfo.departmentName }} - {{ deliveryInfo.municipalityName }}<br>
                {{ deliveryInfo.address }}
              </p>
              <p v-else>
                <strong>Recoger en Tienda</strong><br>
                {{ companyInfo?.address }}
              </p>
            </div>

            <div class="step-header">
              <span class="step-badge active">4</span>
              <h3>Confirmación</h3>
            </div>

            <div class="form-group">
              <label>Tipo de Factura</label>
              <select v-model="paymentInfo.invoiceType" class="form-select">
                <option value="">Seleccione tipo de factura</option>
                <option value="Consumidor Final">Consumidor Final</option>
                <option value="Con RTN">Factura con RTN</option>
              </select>
            </div>

            <div v-if="paymentInfo.invoiceType === 'Con RTN'">
              <!-- Mostrar RTN guardados si está logueado y tiene RTN guardados -->
              <div v-if="isLoggedIn && savedBillingInfo.length > 0 && !showSavedBilling" class="saved-info-prompt">
                <p>¿Deseas usar un RTN guardado?</p>
                <button type="button" @click="showSavedBilling = true" class="btn-use-saved">
                  Ver mis RTN guardados
                </button>
              </div>

              <!-- Lista de RTN guardados -->
              <div v-if="showSavedBilling" class="saved-list">
                <div class="saved-list-header">
                  <h4>Selecciona un RTN guardado</h4>
                  <button type="button" @click="showSavedBilling = false" class="btn-close-list">
                    <i class="ti ti-x"></i>
                  </button>
                </div>
                <div class="saved-items">
                  <div
                    v-for="billing in savedBillingInfo"
                    :key="billing.id"
                    @click="selectSavedBilling(billing)"
                    class="saved-item"
                  >
                    <div class="saved-item-header">
                      <strong>{{ billing.label || billing.business_name }}</strong>
                      <span v-if="billing.is_default" class="default-tag">Predeterminado</span>
                    </div>
                    <p v-if="billing.label" class="saved-item-business">{{ billing.business_name }}</p>
                    <p class="saved-item-rtn">RTN: {{ billing.rtn }}</p>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label>Razón Social</label>
                <input type="text" v-model="paymentInfo.businessName" placeholder="Nombre de la empresa" class="form-input" />
              </div>
              <div class="form-group">
                <label>RTN</label>
                <input type="text" v-model="paymentInfo.rtn" placeholder="0000-0000-000000" class="form-input" />
              </div>

              <!-- Opción para guardar RTN si está logueado -->
              <div v-if="isLoggedIn" class="save-info-section">
                <div class="form-group checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="saveBilling" class="checkbox-input" />
                    <span>Guardar este RTN para futuros pedidos</span>
                  </label>
                </div>

                <div v-if="saveBilling" class="form-group">
                  <label>Nombre para este RTN</label>
                  <input
                    type="text"
                    v-model="billingLabel"
                    placeholder="Ej: Empresa Principal, Negocio, Personal..."
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Tipo de Pago</label>
              <select v-model="paymentInfo.type" class="form-select">
                <option value="">Seleccione un tipo de pago</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta de Crédito o Débito">Tarjeta de Crédito o Débito</option>
              </select>
            </div>

            <div class="form-group">
              <label>Comentarios adicionales</label>
              <textarea v-model="paymentInfo.comments" rows="4" placeholder="" class="form-textarea"></textarea>
            </div>

            <div class="confirmation-info">
              <p>¿Está listo para enviar su pedido?</p>
              <p class="confirmation-note">
                Su pedido será enviado vía WhatsApp para confirmación final.
              </p>
            </div>

            <button @click="submitOrder" class="btn-submit" :disabled="!isStep4Valid || submitting">
              {{ submitting ? 'Enviando...' : 'Realizar Pedido' }}
            </button>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="col-lg-4">
          <div class="summary-card">
            <h3>Resumen de la compra</h3>

            <div class="summary-items">
              <div v-for="item in cartItems" :key="item.product_id" class="summary-item">
                <img :src="item.image || '/placeholder-product.png'" :alt="item.name" class="summary-item-img" />
                <div class="summary-item-info">
                  <h5>{{ item.name }}</h5>
                  <p>{{ item.quantity }} Unidades</p>
                  <p class="summary-item-price">L {{ formatPrice(item.price * item.quantity) }}</p>
                </div>
              </div>
            </div>

            <div class="summary-totals">
              <div class="summary-row">
                <span>Subtotal</span>
                <span class="amount">L {{ formatPrice(subtotal) }}</span>
              </div>
              <div class="summary-row total-row">
                <span>Total</span>
                <span class="amount">L {{ formatPrice(grandTotal) }}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Éxito -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="success-modal" @click.stop>
        <div class="success-modal-content">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2>¡Pedido Creado Exitosamente!</h2>
          <p class="order-number">Número de Pedido: <strong>{{ createdOrderNumber }}</strong></p>
          <p class="success-message">
            Tu pedido ha sido registrado correctamente. <br>
            En breve serás redirigido a WhatsApp para confirmar tu pedido.
          </p>
          <button @click="closeSuccessModal" class="btn-accept">Aceptar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ShopHeader from '@/components/ShopHeader.vue'

const router = useRouter()
const cartItems = ref([])
const companyInfo = ref(null)
const currentStep = ref(2)
const submitting = ref(false)
const states = ref([])
const cities = ref([])
const loadingCities = ref(false)
const isLoggedIn = ref(false)
const savedAddresses = ref([])
const showSavedAddresses = ref(false)
const saveProfile = ref(false)
const saveAddress = ref(false)
const addressLabel = ref('')
const savedBillingInfo = ref([])
const showSavedBilling = ref(false)
const saveBilling = ref(false)
const billingLabel = ref('')
const showSuccessModal = ref(false)
const createdOrderNumber = ref('')

const customerInfo = ref({
  email: '',
  firstName: '',
  lastName: '',
  dni: '',
  phone: ''
})

const deliveryInfo = ref({
  type: '', // 'domicilio' or 'tienda'
  departmentId: '',
  departmentName: '',
  municipalityId: '',
  municipalityName: '',
  address: '',
  receiverName: '',
  receiverPhone: '',
  notes: '',
  method: 'estandar'
})

const paymentInfo = ref({
  invoiceType: '',
  businessName: '',
  rtn: '',
  type: '',
  comments: ''
})

const deliveryCost = computed(() => {
  // No hay costo de envío fijo
  return 0
})

const subtotal = computed(() => {
  const itemsTotal = cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = cartItems.value.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity
    return sum + (itemTotal * ((item.tax_rate || 0) / 100))
  }, 0)
  return itemsTotal + tax
})

const grandTotal = computed(() => {
  return subtotal.value + deliveryCost.value
})

const isStep2Valid = computed(() => {
  return customerInfo.value.email &&
         customerInfo.value.firstName &&
         customerInfo.value.lastName &&
         customerInfo.value.dni &&
         customerInfo.value.phone
})

const isStep3Valid = computed(() => {
  if (!deliveryInfo.value.type) return false

  if (deliveryInfo.value.type === 'domicilio') {
    return deliveryInfo.value.departmentId &&
           deliveryInfo.value.municipalityId &&
           deliveryInfo.value.address
  }

  return true // Para recoger en tienda solo necesita seleccionar el tipo
})

const isStep4Valid = computed(() => {
  if (!paymentInfo.value.invoiceType || !paymentInfo.value.type) return false

  // Si requiere RTN, validar que estén llenos tanto la razón social como el RTN
  if (paymentInfo.value.invoiceType === 'Con RTN') {
    if (!paymentInfo.value.businessName || !paymentInfo.value.rtn) {
      return false
    }
  }

  return true
})

const loadCart = () => {
  const savedCart = localStorage.getItem('ecommerce_cart')
  if (savedCart) {
    try {
      cartItems.value = JSON.parse(savedCart)
      if (cartItems.value.length === 0) {
        router.push('/shop/cart')
      }
    } catch (error) {
      cartItems.value = []
      router.push('/shop/cart')
    }
  } else {
    router.push('/shop/cart')
  }
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

const fetchStates = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/v1/locations/states')
    if (response.data && response.data.success) {
      states.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching states:', error)
  }
}

const fetchCitiesByState = async (stateId) => {
  if (!stateId) {
    cities.value = []
    return
  }

  loadingCities.value = true
  try {
    const response = await axios.get(`http://localhost:3000/api/v1/locations/cities/${stateId}`)
    if (response.data && response.data.success) {
      cities.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching cities:', error)
    cities.value = []
  } finally {
    loadingCities.value = false
  }
}

const onDepartmentChange = async () => {
  // Limpiar municipio seleccionado
  deliveryInfo.value.municipalityId = ''
  deliveryInfo.value.municipalityName = ''

  // Actualizar nombre del departamento
  const selectedState = states.value.find(s => s.id === deliveryInfo.value.departmentId)
  if (selectedState) {
    deliveryInfo.value.departmentName = selectedState.name
  }

  // Cargar municipios del departamento seleccionado
  if (deliveryInfo.value.departmentId) {
    await fetchCitiesByState(deliveryInfo.value.departmentId)
  } else {
    cities.value = []
  }
}

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2)
}

const nextStep = async () => {
  // Si está en el paso 2 (Identificación) y quiere guardar el perfil
  if (currentStep.value === 2 && saveProfile.value && isLoggedIn.value) {
    await saveCustomerProfile()
  }

  // Si está en el paso 3 (Entrega) y quiere guardar la dirección
  if (currentStep.value === 3 && saveAddress.value && isLoggedIn.value && deliveryInfo.value.type === 'domicilio') {
    await saveCustomerAddress()
  }

  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const editStep = (step) => {
  currentStep.value = step
}

const selectDeliveryType = (type) => {
  deliveryInfo.value.type = type
  if (type === 'tienda') {
    // Limpiar campos de domicilio
    deliveryInfo.value.departmentId = ''
    deliveryInfo.value.departmentName = ''
    deliveryInfo.value.municipalityId = ''
    deliveryInfo.value.municipalityName = ''
    deliveryInfo.value.address = ''
    deliveryInfo.value.receiverName = ''
    deliveryInfo.value.receiverPhone = ''
    deliveryInfo.value.notes = ''
    cities.value = []
  }
}

const formatWhatsAppMessage = (orderNumber = null) => {
  const now = new Date()
  const dateStr = now.toLocaleDateString('es-HN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit', hour12: true })

  const companyName = companyInfo.value?.commercial_name || companyInfo.value?.name || 'Tienda'

  let message = 'Hola! Vengo de la Tienda en Linea de ' + companyName + '\n\n'

  // Agregar número de pedido si está disponible
  if (orderNumber) {
    message += '*Pedido: ' + orderNumber + '*\n\n'
  }

  message += dateStr + ' ' + timeStr + '\n\n'

  // Tipo de servicio
  if (deliveryInfo.value.type === 'domicilio') {
    message += '*Tipo de servicio: Entrega a Domicilio*\n\n'
  } else {
    message += '*Tipo de servicio: Recoger en Tienda*\n\n'
  }

  // Información del cliente
  message += 'Nombre: ' + customerInfo.value.firstName + ' ' + customerInfo.value.lastName + '\n'
  message += 'DNI: ' + customerInfo.value.dni + '\n'
  message += 'Telefono: 504 ' + customerInfo.value.phone + '\n'
  message += 'Correo: ' + customerInfo.value.email + '\n\n'

  // Tipo de factura
  message += '*Factura*\n'
  message += 'Tipo: ' + paymentInfo.value.invoiceType + '\n'
  if (paymentInfo.value.invoiceType === 'Con RTN') {
    message += 'Razon Social: ' + paymentInfo.value.businessName + '\n'
    message += 'RTN: ' + paymentInfo.value.rtn + '\n'
  }
  message += '\n'

  // Información de entrega a domicilio
  if (deliveryInfo.value.type === 'domicilio') {
    message += '*Entrega:*\n'
    message += 'Departamento: ' + deliveryInfo.value.departmentName + '\n'
    message += 'Municipio: ' + deliveryInfo.value.municipalityName + '\n'
    message += 'Direccion: ' + deliveryInfo.value.address + '\n'
    if (deliveryInfo.value.receiverName) {
      message += 'Recibe: ' + deliveryInfo.value.receiverName + '\n'
    }
    if (deliveryInfo.value.receiverPhone) {
      message += 'Telefono de quien recibe: ' + deliveryInfo.value.receiverPhone + '\n'
    }
    if (deliveryInfo.value.notes && deliveryInfo.value.notes.trim()) {
      message += 'Notas: ' + deliveryInfo.value.notes + '\n'
    }
    message += '\n'
  }

  // Productos
  message += '*Productos*\n'
  cartItems.value.forEach(item => {
    message += 'X' + item.quantity + ' ' + item.name + ' L ' + formatPrice(item.price * item.quantity) + '\n'
    if (item.unit) {
      message += item.quantity + ' ' + item.unit + ' L ' + formatPrice(item.price) + '\n'
    }
  })
  message += '\n'

  // Totales
  const itemsSubtotal = cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = cartItems.value.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity
    return sum + (itemTotal * ((item.tax_rate || 0) / 100))
  }, 0)

  message += 'Subtotal: L ' + formatPrice(itemsSubtotal) + '\n'
  if (tax > 0) {
    message += 'ISV (15%): L ' + formatPrice(tax) + '\n'
  }
  message += 'Total: L ' + formatPrice(grandTotal.value) + '\n\n'

  // Información de pago
  message += '*Pago*\n'
  message += 'Tipo de pago: ' + paymentInfo.value.type + '\n'
  message += '*Total a pagar: L ' + formatPrice(grandTotal.value) + '*\n'

  // Detalles adicionales según tipo de pago
  if (paymentInfo.value.type === 'Transferencia') {
    message += 'Pagos con transferencia (Cuentas en Banco Atlantida, BAC Credomatic, Davivienda, Banpais) Haznos saber cual prefieres.\n'
  }
  message += '\n'

  // Comentarios adicionales
  if (paymentInfo.value.comments && paymentInfo.value.comments.trim()) {
    message += '*Comentarios adicionales:*\n'
    message += paymentInfo.value.comments + '\n\n'
  }

  message += 'Gracias! Envianos este mensaje. En cuanto lo recibamos estaremos atendiendole.'

  return message
}

const submitOrder = async () => {
  submitting.value = true

  try {
    // Guardar RTN si el usuario marcó la opción y está logueado
    if (saveBilling.value && isLoggedIn.value && paymentInfo.value.invoiceType === 'Con RTN') {
      await saveCustomerBilling()
    }

    // Preparar datos del pedido
    const orderData = {
      delivery_address: deliveryInfo.value.type === 'tienda'
        ? 'Recoger en tienda'
        : deliveryInfo.value.address,
      city: deliveryInfo.value.type === 'tienda'
        ? 'Tegucigalpa'
        : (deliveryInfo.value.municipalityName || deliveryInfo.value.municipalityId || 'Tegucigalpa'),
      department: deliveryInfo.value.type === 'tienda'
        ? 'Francisco Morazán'
        : (deliveryInfo.value.departmentName || deliveryInfo.value.departmentId || 'Francisco Morazán'),
      notes: deliveryInfo.value.type === 'tienda'
        ? (deliveryInfo.value.notes ? 'RECOGER EN TIENDA - ' + deliveryInfo.value.notes : 'RECOGER EN TIENDA')
        : deliveryInfo.value.notes || null,
      customer_dni: customerInfo.value.dni || null,
      invoice_type: paymentInfo.value.invoiceType || 'Consumidor Final',
      rtn: paymentInfo.value.invoiceType === 'Con RTN' ? paymentInfo.value.rtn : null,
      business_name: paymentInfo.value.invoiceType === 'Con RTN' ? paymentInfo.value.businessName : null,
      payment_method: paymentInfo.value.type || 'Efectivo',
      items: cartItems.value.map(item => {
        console.log('🛒 Item del carrito:', item)
        return {
          product_id: item.product_id || item.id,
          product_name: item.product_name || item.name,
          product_code: item.product_code || item.code || 'N/A',
          quantity: item.quantity,
          unit_price: item.unit_price || item.price,
          subtotal: (item.unit_price || item.price) * item.quantity
        }
      })
    }

    console.log('📦 Datos del pedido a enviar:', orderData)

    // Crear pedido en la base de datos
    const token = localStorage.getItem('ecommerce_token')
    const response = await axios.post(
      'http://localhost:3000/api/v1/ecommerce/orders',
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    console.log('✅ Respuesta del servidor:', response.data)

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al crear el pedido')
    }

    const orderNumber = response.data.data.order_number

    // Guardar el número de pedido y mostrar modal
    createdOrderNumber.value = orderNumber
    showSuccessModal.value = true

    // Limpiar carrito
    localStorage.removeItem('ecommerce_cart')
    window.dispatchEvent(new Event('cart-updated'))

  } catch (error) {
    console.error('Error submitting order:', error)

    let errorMessage = 'Error al procesar el pedido. Por favor intente nuevamente.'

    if (error.response) {
      console.error('❌ Error del servidor:', error.response.data)
      errorMessage = error.response.data.message || errorMessage
    }

    alert(errorMessage)
  } finally {
    submitting.value = false
  }
}

// Cerrar modal de éxito y continuar flujo
const closeSuccessModal = () => {
  showSuccessModal.value = false

  // Generar mensaje de WhatsApp con el número de pedido
  const message = formatWhatsAppMessage(createdOrderNumber.value)
  const whatsappNumber = '50498752725' // 9875-2725 con código de país
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

  // Abrir WhatsApp
  window.open(whatsappUrl, '_blank')

  // Redirigir a home después de un breve delay
  setTimeout(() => {
    router.push('/shop/home')
  }, 500)
}

// Cargar información del usuario autenticado
const checkAuthAndLoadCustomer = async () => {
  const token = localStorage.getItem('ecommerce_token')
  const storedCustomer = localStorage.getItem('ecommerce_customer')

  if (token && storedCustomer) {
    isLoggedIn.value = true
    const customer = JSON.parse(storedCustomer)

    // Auto-llenar información del cliente
    customerInfo.value = {
      email: customer.email || '',
      firstName: customer.first_name || '',
      lastName: customer.last_name || '',
      dni: customer.dni || '',
      phone: customer.phone || ''
    }

    // Cargar direcciones guardadas
    await loadSavedAddresses()

    // Saltar al paso 3 si tiene información completa (excepto DNI que no lo tenemos)
    if (customerInfo.value.email && customerInfo.value.firstName && customerInfo.value.lastName && customerInfo.value.phone) {
      currentStep.value = 3
    }
  }
}

// Cargar direcciones guardadas del usuario
const loadSavedAddresses = async () => {
  try {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) return

    const response = await axios.get(
      'http://localhost:3000/api/v1/ecommerce/customers/addresses',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      savedAddresses.value = response.data.addresses
    }
  } catch (error) {
    console.error('Error al cargar direcciones:', error)
  }
}

const loadSavedBillingInfo = async () => {
  try {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) return

    const response = await axios.get(
      'http://localhost:3000/api/v1/ecommerce/customers/billing-info',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      savedBillingInfo.value = response.data.billingInfo
    }
  } catch (error) {
    console.error('Error al cargar información de facturación:', error)
  }
}

// Seleccionar una dirección guardada
const selectSavedAddress = (address) => {
  // Buscar el departamento por nombre
  const department = states.value.find(s => s.name === address.department)

  if (department) {
    deliveryInfo.value.departmentId = department.id
    deliveryInfo.value.departmentName = address.department

    // Cargar ciudades del departamento y luego seleccionar la ciudad
    fetchCitiesByState(department.id).then(() => {
      const city = cities.value.find(c => c.name === address.city)
      if (city) {
        deliveryInfo.value.municipalityId = city.id
        deliveryInfo.value.municipalityName = address.city
      }
    })
  }

  deliveryInfo.value.address = address.full_address
  deliveryInfo.value.receiverName = address.recipient_name
  deliveryInfo.value.receiverPhone = address.phone
  deliveryInfo.value.notes = address.additional_notes || ''
  deliveryInfo.value.type = 'domicilio'

  showSavedAddresses.value = false
}

// Seleccionar un RTN guardado
const selectSavedBilling = (billing) => {
  paymentInfo.value.businessName = billing.business_name
  paymentInfo.value.rtn = billing.rtn
  paymentInfo.value.invoiceType = 'Con RTN'
  showSavedBilling.value = false
}

// Guardar perfil del cliente
const saveCustomerProfile = async () => {
  try {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) return

    const response = await axios.put(
      'http://localhost:3000/api/v1/ecommerce/customers/profile',
      {
        first_name: customerInfo.value.firstName,
        last_name: customerInfo.value.lastName,
        phone: customerInfo.value.phone,
        dni: customerInfo.value.dni
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      // Actualizar localStorage con los nuevos datos
      localStorage.setItem('ecommerce_customer', JSON.stringify(response.data.customer))
      console.log('Perfil guardado exitosamente')
    }
  } catch (error) {
    console.error('Error al guardar perfil:', error)
  }
}

// Guardar dirección del cliente
const saveCustomerAddress = async () => {
  try {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) return

    // Obtener nombres en lugar de IDs para guardar
    const departmentName = states.value.find(s => s.id === deliveryInfo.value.departmentId)?.name || ''
    const cityName = cities.value.find(c => c.id === deliveryInfo.value.municipalityId)?.name || ''

    const response = await axios.post(
      'http://localhost:3000/api/v1/ecommerce/customers/addresses',
      {
        recipient_name: deliveryInfo.value.receiverName || `${customerInfo.value.firstName} ${customerInfo.value.lastName}`,
        phone: deliveryInfo.value.receiverPhone || customerInfo.value.phone,
        department: departmentName,
        city: cityName,
        full_address: deliveryInfo.value.address,
        additional_notes: deliveryInfo.value.notes,
        address_label: addressLabel.value || null,
        is_default: savedAddresses.value.length === 0 // Primera dirección es predeterminada
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      // Recargar direcciones guardadas
      await loadSavedAddresses()
      console.log('Dirección guardada exitosamente')

      // Limpiar el campo de etiqueta y desmarcar checkbox
      addressLabel.value = ''
      saveAddress.value = false
    }
  } catch (error) {
    console.error('Error al guardar dirección:', error)
  }
}

const saveCustomerBilling = async () => {
  try {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) return

    const response = await axios.post(
      'http://localhost:3000/api/v1/ecommerce/customers/billing-info',
      {
        label: billingLabel.value || null,
        business_name: paymentInfo.value.businessName,
        rtn: paymentInfo.value.rtn,
        is_default: savedBillingInfo.value.length === 0
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      await loadSavedBillingInfo()
      console.log('RTN guardado exitosamente')
      billingLabel.value = ''
      saveBilling.value = false
    }
  } catch (error) {
    console.error('Error al guardar RTN:', error)
  }
}

// Watcher para actualizar el nombre del municipio cuando se seleccione
watch(() => deliveryInfo.value.municipalityId, (newMunicipalityId) => {
  if (newMunicipalityId) {
    const selectedCity = cities.value.find(c => c.id === newMunicipalityId)
    if (selectedCity) {
      deliveryInfo.value.municipalityName = selectedCity.name
    }
  } else {
    deliveryInfo.value.municipalityName = ''
  }
})

onMounted(async () => {
  loadCart()
  fetchCompanyInfo()
  await fetchStates()
  await checkAuthAndLoadCustomer()
  loadSavedBillingInfo()
})
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.checkout-steps {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.4;
}

.step.active,
.step.completed {
  opacity: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.step.active .step-number {
  background: var(--primary-color, #FF9F43);
  color: #000;
}

.step.completed .step-number {
  background: #28a745;
  color: #fff;
}

.step-label {
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}

.checkout-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 1.5rem;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.step-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
}

.step-badge {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.step-badge.active {
  background: var(--primary-color, #FF9F43);
  color: #000;
}

.step-header-completed {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.step-header-completed h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  flex: 1;
}

.btn-edit {
  padding: 0.5rem 1rem;
  background: transparent;
  color: var(--primary-color, #FF9F43);
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
}

.btn-edit:hover {
  color: var(--primary-dark, #e68a2e);
}

.info-summary {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.info-summary p {
  margin: 0.25rem 0;
  color: #666;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color, #FF9F43);
  box-shadow: 0 0 0 3px rgba(255, 159, 67, 0.1);
}

.delivery-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.delivery-option {
  padding: 1.5rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.delivery-option:hover {
  border-color: var(--primary-color, #FF9F43);
}

.delivery-option.active {
  background: var(--primary-color, #FF9F43);
  border-color: var(--primary-color, #FF9F43);
  color: #000;
}

.delivery-form,
.pickup-info {
  margin-top: 2rem;
}

.pickup-info {
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.pickup-info p {
  margin: 0.5rem 0;
  color: #666;
}

.delivery-method {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.delivery-method h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.delivery-method-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
}

.delivery-method-option input[type="radio"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.delivery-method-option label {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  cursor: pointer;
}

.delivery-price {
  font-weight: 700;
  color: var(--primary-color, #FF9F43);
}

/* Estilos para direcciones guardadas */
.saved-addresses-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.btn-toggle-addresses {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
  gap: 0.75rem;
}

.btn-toggle-addresses:hover {
  background: #FF9F43;
  color: white;
  border-color: #FF9F43;
}

.btn-toggle-addresses i:first-child {
  font-size: 1.2rem;
}

.saved-addresses-list {
  margin-top: 1rem;
  display: grid;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.saved-address-item {
  padding: 1.25rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.saved-address-item:hover {
  border-color: #FF9F43;
  box-shadow: 0 4px 12px rgba(255, 159, 67, 0.2);
  transform: translateY(-2px);
}

.saved-address-item.default {
  border-color: #FF9F43;
  background: #fff8f0;
}

.address-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.address-item-header strong {
  font-size: 1rem;
  color: #333;
}

.default-tag {
  background: #FF9F43;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.address-item-details {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.address-item-location {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.address-item-phone {
  color: #666;
  font-size: 0.85rem;
  margin: 0;
}

.confirmation-info {
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
}

.confirmation-info p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.confirmation-note {
  font-size: 0.95rem !important;
  font-weight: 400 !important;
  color: #666 !important;
  margin-top: 1rem !important;
}

.btn-next,
.btn-submit {
  width: 100%;
  padding: 1rem;
  background: #000;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 2rem;
}

.btn-next:hover:not(:disabled),
.btn-submit:hover:not(:disabled) {
  background: #333;
}

.btn-next:disabled,
.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: sticky;
  top: 100px;
}

.summary-card h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  font-weight: 700;
}

.summary-items {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.summary-item-info {
  flex: 1;
}

.summary-item-info h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.summary-item-info p {
  margin: 0.25rem 0;
  font-size: 0.85rem;
  color: #666;
}

.summary-item-price {
  font-weight: 700;
  color: #000 !important;
}

.summary-totals {
  border-top: 1px solid #e0e0e0;
  padding-top: 1rem;
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.total-row {
  font-size: 1.2rem;
  font-weight: 700;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  margin-top: 1rem;
}

.amount {
  font-weight: 700;
  color: #000;
}

@media (max-width: 768px) {
  .checkout-steps {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .step-label {
    font-size: 0.7rem;
  }

  .delivery-options {
    grid-template-columns: 1fr;
  }

  .summary-card {
    position: static;
    margin-top: 2rem;
  }
}

/* Estilos para RTN guardados */
.saved-info-prompt {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.saved-info-prompt p {
  margin-bottom: 0.75rem;
  color: #666;
  font-size: 0.95rem;
}

.btn-use-saved {
  background: white;
  color: #333;
  border: 1px solid #ddd;
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-use-saved:hover {
  background: #FF9F43;
  color: white;
  border-color: #FF9F43;
}

.saved-list {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.saved-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.saved-list-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.btn-close-list {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  border-radius: 50%;
  width: 30px;
  height: 30px;
}

.btn-close-list:hover {
  background: #e5e7eb;
  color: #333;
}

.saved-items {
  display: grid;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
}

.saved-item {
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.saved-item:hover {
  border-color: #FF9F43;
  box-shadow: 0 4px 12px rgba(255, 159, 67, 0.2);
  transform: translateY(-2px);
}

.saved-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.saved-item-header strong {
  font-size: 0.95rem;
  color: #333;
}

.saved-item-business {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.saved-item-rtn {
  color: #666;
  font-size: 0.85rem;
  margin: 0;
}

.save-info-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

/* Modal de Éxito */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.success-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.success-modal-content {
  padding: 3rem 2rem;
  text-align: center;
}

.success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  color: white;
  animation: scaleIn 0.5s ease 0.2s both;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.success-modal-content h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.order-number {
  font-size: 1.1rem;
  color: #4b5563;
  margin-bottom: 1rem;
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  border-radius: 8px;
  display: inline-block;
}

.order-number strong {
  color: #10b981;
  font-weight: 700;
}

.success-message {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.btn-accept {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.875rem 3rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-accept:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.btn-accept:active {
  transform: translateY(0);
}
</style>
