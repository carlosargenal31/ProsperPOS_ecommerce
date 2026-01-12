<template>
  <div class="profile-page">
    <ShopHeader />

    <div class="profile-container">
      <div class="profile-sidebar">
        <h2>Hola!</h2>
        <nav class="profile-nav">
          <a href="#" @click.prevent="activeTab = 'profile'" :class="{ active: activeTab === 'profile' }">
            Perfil
          </a>
          <a href="#" @click.prevent="activeTab = 'addresses'" :class="{ active: activeTab === 'addresses' }">
            Direcciones
          </a>
          <a href="#" @click.prevent="activeTab = 'billing'" :class="{ active: activeTab === 'billing' }">
            Información de Facturación
          </a>
          <a href="#" @click.prevent="activeTab = 'orders'" :class="{ active: activeTab === 'orders' }">
            Pedidos
          </a>
          <a href="#" @click.prevent="activeTab = 'favorites'" :class="{ active: activeTab === 'favorites' }">
            Mis Favoritos
          </a>
          <a href="#" @click.prevent="activeTab = 'authentication'" :class="{ active: activeTab === 'authentication' }">
            Autenticación
          </a>
          <a href="#" @click.prevent="handleLogout" class="logout">
            Salir
          </a>
        </nav>
      </div>

      <div class="profile-content">
        <!-- Perfil Tab -->
        <div v-if="activeTab === 'profile'" class="content-section">
          <h1>Perfil</h1>

          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-row">
              <div class="form-group">
                <label>Nombre</label>
                <input
                  v-model="customerData.first_name"
                  type="text"
                  placeholder="Nombre"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>Apellido</label>
                <input
                  v-model="customerData.last_name"
                  type="text"
                  placeholder="Apellido"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Email</label>
              <input
                v-model="customerData.email"
                type="email"
                disabled
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Teléfono</label>
              <input
                v-model="customerData.phone"
                type="tel"
                placeholder="Teléfono"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>DNI</label>
              <input
                v-model="customerData.dni"
                type="text"
                placeholder="DNI"
                class="form-input"
              />
            </div>

            <div v-if="updateMessage" class="update-message" :class="updateMessageType">
              <i class="ti ti-check-circle" v-if="updateMessageType === 'success'"></i>
              <i class="ti ti-alert-circle" v-if="updateMessageType === 'error'"></i>
              <span>{{ updateMessage }}</span>
            </div>

            <button type="submit" class="btn-submit">
              Guardar Cambios
            </button>
          </form>
        </div>

        <!-- Direcciones Tab -->
        <div v-if="activeTab === 'addresses'" class="content-section">
          <h1>Direcciones</h1>

          <div v-if="addresses.length === 0" class="empty-state">
            <p>Aún No Tienes Ninguna Dirección Registrada.</p>
            <button @click="showAddressForm = true" class="btn-primary">Agregar Dirección</button>
          </div>

          <div v-else>
            <button @click="showAddressForm = true" class="btn-add-address">
              <i class="ti ti-plus"></i> Agregar Nueva Dirección
            </button>

            <div class="addresses-list">
              <div v-for="address in addresses" :key="address.id" class="address-card">
                <div class="address-header">
                  <h3>{{ address.address_label || address.recipient_name }}</h3>
                  <span v-if="address.is_default" class="default-badge">Predeterminada</span>
                </div>
                <p v-if="address.address_label" class="address-recipient">{{ address.recipient_name }}</p>
                <p class="address-details">{{ address.full_address }}</p>
                <p class="address-details">{{ address.city }}, {{ address.department }}</p>
                <p class="address-phone">Tel: {{ address.phone }}</p>
                <div class="address-actions">
                  <button @click="editAddress(address)" class="btn-edit">
                    <i class="ti ti-edit"></i> Editar
                  </button>
                  <button @click="deleteAddress(address.id)" class="btn-delete">
                    <i class="ti ti-trash"></i> Eliminar
                  </button>
                  <button v-if="!address.is_default" @click="setDefaultAddress(address.id)" class="btn-default">
                    <i class="ti ti-star"></i> Predeterminar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Formulario de agregar/editar dirección -->
          <div v-if="showAddressForm" class="address-form-modal">
            <div class="modal-overlay" @click="closeAddressForm"></div>
            <div class="modal-content">
              <div class="modal-header">
                <h2>{{ editingAddress ? 'Editar Dirección' : 'Agregar Nueva Dirección' }}</h2>
                <button @click="closeAddressForm" class="close-btn">
                  <i class="ti ti-x"></i>
                </button>
              </div>

              <form @submit.prevent="saveAddress" class="address-form">
                <div class="form-group">
                  <label>Nombre para esta dirección</label>
                  <input
                    v-model="addressForm.address_label"
                    type="text"
                    placeholder="Ej: Casa Principal, Casa de Sambo, Oficina..."
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label>Nombre de quien recibe *</label>
                  <input
                    v-model="addressForm.recipient_name"
                    type="text"
                    placeholder="Ej: Carlos Mauricio Argeñal Bonilla"
                    required
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label>Teléfono *</label>
                  <input
                    v-model="addressForm.phone"
                    type="tel"
                    placeholder="9999-9999"
                    required
                    class="form-input"
                  />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Departamento *</label>
                    <select v-model="addressForm.department" @change="onDepartmentChange" required class="form-input">
                      <option value="">Seleccione un departamento</option>
                      <option v-for="state in states" :key="state.id" :value="state.name">
                        {{ state.name }}
                      </option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Ciudad/Municipio *</label>
                    <select v-model="addressForm.city" :disabled="!addressForm.department || loadingCities" required class="form-input">
                      <option value="">{{ loadingCities ? 'Cargando...' : 'Seleccione un municipio' }}</option>
                      <option v-for="city in cities" :key="city.id" :value="city.name">
                        {{ city.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label>Dirección completa *</label>
                  <textarea
                    v-model="addressForm.full_address"
                    placeholder="Ej: Calle, colonia, referencias... Ej: Tocar timbre, casa color verde, portón negro..."
                    required
                    rows="3"
                    class="form-input"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label>Notas adicionales para la entrega</label>
                  <textarea
                    v-model="addressForm.additional_notes"
                    placeholder="Ej: Tocar timbre antes de entrar, dejar en portería, etc."
                    rows="2"
                    class="form-input"
                  ></textarea>
                </div>

                <div class="form-group checkbox-group">
                  <label class="checkbox-label">
                    <input
                      v-model="addressForm.is_default"
                      type="checkbox"
                      class="checkbox-input"
                    />
                    <span>Establecer como dirección predeterminada</span>
                  </label>
                </div>

                <div v-if="addressMessage" class="update-message" :class="addressMessageType">
                  <i class="ti ti-check-circle" v-if="addressMessageType === 'success'"></i>
                  <i class="ti ti-alert-circle" v-if="addressMessageType === 'error'"></i>
                  <span>{{ addressMessage }}</span>
                </div>

                <div class="modal-actions">
                  <button type="button" @click="closeAddressForm" class="btn-cancel">
                    Cancelar
                  </button>
                  <button type="submit" class="btn-submit">
                    {{ editingAddress ? 'Actualizar' : 'Guardar' }} Dirección
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Información de Facturación Tab -->
        <div v-if="activeTab === 'billing'" class="content-section">
          <h1>Información de Facturación</h1>

          <div v-if="billingInfo.length === 0" class="empty-state">
            <p>Aún No Tienes Ninguna Información de Facturación Registrada.</p>
            <button @click="showBillingForm = true" class="btn-primary">Agregar RTN</button>
          </div>

          <div v-else>
            <button @click="showBillingForm = true" class="btn-add-address">
              <i class="ti ti-plus"></i> Agregar Nuevo RTN
            </button>

            <div class="addresses-list">
              <div v-for="billing in billingInfo" :key="billing.id" class="address-card">
                <div class="address-header">
                  <h3>{{ billing.label || billing.business_name }}</h3>
                  <span v-if="billing.is_default" class="default-badge">Predeterminado</span>
                </div>
                <p v-if="billing.label" class="address-recipient">{{ billing.business_name }}</p>
                <p class="address-details">RTN: {{ billing.rtn }}</p>
                <div class="address-actions">
                  <button @click="editBilling(billing)" class="btn-edit">
                    <i class="ti ti-edit"></i> Editar
                  </button>
                  <button @click="deleteBilling(billing.id)" class="btn-delete">
                    <i class="ti ti-trash"></i> Eliminar
                  </button>
                  <button v-if="!billing.is_default" @click="setDefaultBilling(billing.id)" class="btn-default">
                    <i class="ti ti-star"></i> Predeterminar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Formulario de agregar/editar información de facturación -->
          <div v-if="showBillingForm" class="address-form-modal">
            <div class="modal-overlay" @click="closeBillingForm"></div>
            <div class="modal-content">
              <div class="modal-header">
                <h2>{{ editingBilling ? 'Editar RTN' : 'Agregar Nuevo RTN' }}</h2>
                <button @click="closeBillingForm" class="close-btn">
                  <i class="ti ti-x"></i>
                </button>
              </div>

              <form @submit.prevent="saveBilling" class="address-form">
                <div class="form-group">
                  <label>Nombre para este RTN</label>
                  <input
                    v-model="billingForm.label"
                    type="text"
                    placeholder="Ej: Empresa Principal, Negocio, Personal..."
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label>Razón Social *</label>
                  <input
                    v-model="billingForm.business_name"
                    type="text"
                    placeholder="Ej: COMERCIAL EL AHORRO S.A. DE C.V."
                    required
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label>RTN *</label>
                  <input
                    v-model="billingForm.rtn"
                    type="text"
                    placeholder="0801-1234-567890"
                    required
                    class="form-input"
                  />
                </div>

                <div class="form-group checkbox-group">
                  <label class="checkbox-label">
                    <input
                      v-model="billingForm.is_default"
                      type="checkbox"
                      class="checkbox-input"
                    />
                    <span>Establecer como RTN predeterminado</span>
                  </label>
                </div>

                <div v-if="billingMessage" class="update-message" :class="billingMessageType">
                  <i class="ti ti-check-circle" v-if="billingMessageType === 'success'"></i>
                  <i class="ti ti-alert-circle" v-if="billingMessageType === 'error'"></i>
                  <span>{{ billingMessage }}</span>
                </div>

                <div class="modal-actions">
                  <button type="button" @click="closeBillingForm" class="btn-cancel">
                    Cancelar
                  </button>
                  <button type="submit" class="btn-submit">
                    {{ editingBilling ? 'Actualizar' : 'Guardar' }} RTN
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Pedidos Tab -->
        <div v-if="activeTab === 'orders'" class="content-section">
          <h1>Mis Pedidos</h1>

          <div v-if="loadingOrders" class="loading-state">
            <p>Cargando pedidos...</p>
          </div>

          <div v-else-if="orders.length === 0" class="empty-state">
            <p>Todavía no realizas tu primer pedido, no lo dudes y ¡vive la experiencia de recibir tus productos!</p>
            <button class="btn-primary" @click="$router.push('/catalog')">Empezar a Comprar</button>
          </div>

          <div v-else class="orders-list">
            <div v-for="order in orders" :key="order.id" class="order-card">
              <div class="order-header">
                <div>
                  <h3>Pedido {{ order.order_number }}</h3>
                  <p class="order-date">{{ formatDate(order.created_at) }}</p>
                </div>
                <span class="order-status" :class="`status-${order.status}`">
                  {{ getStatusLabel(order.status) }}
                </span>
              </div>
              <div class="order-body">
                <p><strong>Total:</strong> L{{ formatPrice(order.total_amount) }}</p>
                <p v-if="order.notes"><strong>Notas:</strong> {{ order.notes }}</p>
              </div>
              <div class="order-actions">
                <button @click="viewOrderDetail(order)" class="btn-view-order">
                  Ver Pedido
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal de Detalle del Pedido -->
        <div v-if="showOrderModal" class="modal-overlay" @click="closeOrderModal">
          <div class="modal-dialog-order" @click.stop>
            <div class="modal-content-order">
              <div class="modal-header-order">
                <h5 class="modal-title">Detalle del Pedido {{ selectedOrderDetail?.order_number }}</h5>
                <button type="button" class="btn-close-order" @click="closeOrderModal">×</button>
              </div>
              <div class="modal-body-order" v-if="selectedOrderDetail">
                <!-- Información del Cliente -->
                <div class="info-row mb-4">
                  <div class="info-col">
                    <h6>Información del Cliente</h6>
                    <p class="mb-1"><strong>Nombre:</strong> {{ selectedOrderDetail.customer_name }}</p>
                    <p class="mb-1" v-if="selectedOrderDetail.customer_email"><strong>Email:</strong> {{ selectedOrderDetail.customer_email }}</p>
                    <p class="mb-1" v-if="selectedOrderDetail.customer_phone"><strong>Teléfono:</strong> {{ selectedOrderDetail.customer_phone }}</p>
                    <p class="mb-1" v-if="selectedOrderDetail.customer_dni"><strong>DNI:</strong> {{ selectedOrderDetail.customer_dni }}</p>
                  </div>
                  <div class="info-col">
                    <h6>Dirección de Entrega</h6>
                    <p class="mb-1">{{ selectedOrderDetail.delivery_address }}</p>
                    <p class="mb-1" v-if="selectedOrderDetail.delivery_address !== 'Recoger en tienda'">
                      {{ selectedOrderDetail.city }}<span v-if="selectedOrderDetail.department">, {{ selectedOrderDetail.department }}</span>
                    </p>
                  </div>
                </div>

                <!-- Información de Facturación y Pago -->
                <div class="info-row mb-4">
                  <div class="info-col">
                    <h6>Información de Facturación</h6>
                    <p class="mb-1"><strong>Tipo:</strong> {{ selectedOrderDetail.invoice_type || 'Consumidor Final' }}</p>
                    <p class="mb-1" v-if="selectedOrderDetail.business_name"><strong>Razón Social:</strong> {{ selectedOrderDetail.business_name }}</p>
                    <p class="mb-1"><strong>RTN:</strong> {{ selectedOrderDetail.rtn || '00000000000000' }}</p>
                  </div>
                  <div class="info-col">
                    <h6>Información de Pago</h6>
                    <p class="mb-1"><strong>Método de Pago:</strong> {{ selectedOrderDetail.payment_method || 'Efectivo' }}</p>
                  </div>
                </div>

                <!-- Productos -->
                <h6>Productos</h6>
                <div class="table-responsive">
                  <table class="products-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th class="text-end">Cantidad</th>
                        <th class="text-end">Precio Unit.</th>
                        <th class="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in selectedOrderDetail.items" :key="item.id">
                        <td>
                          {{ item.product_name }}
                          <small class="text-muted d-block" v-if="item.product_code">{{ item.product_code }}</small>
                        </td>
                        <td class="text-end">{{ item.quantity }}</td>
                        <td class="text-end">L{{ parseFloat(item.unit_price).toFixed(2) }}</td>
                        <td class="text-end"><strong>L{{ parseFloat(item.subtotal).toFixed(2) }}</strong></td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="3" class="text-end"><strong>TOTAL:</strong></td>
                        <td class="text-end"><strong>L{{ parseFloat(selectedOrderDetail.total_amount).toFixed(2) }}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <!-- Notas -->
                <div v-if="selectedOrderDetail.notes" class="alert-info-order mt-3">
                  <strong>Notas del cliente:</strong><br>
                  {{ selectedOrderDetail.notes }}
                </div>

                <!-- Estado Actual -->
                <div class="mt-3">
                  <strong>Estado Actual:</strong>
                  <span :class="`order-status status-${selectedOrderDetail.status}`" class="ms-2">
                    {{ getStatusLabel(selectedOrderDetail.status) }}
                  </span>
                </div>
              </div>
              <div class="modal-footer-order">
                <button type="button" class="btn-secondary-order" @click="closeOrderModal">Cerrar</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Favoritos Tab -->
        <div v-if="activeTab === 'favorites'" class="content-section">
          <h1>Mis Favoritos</h1>

          <div v-if="favorites.length === 0" class="empty-state">
            <h3>Aún no tienes productos favoritos</h3>
            <p>Explora nuestro catálogo y agrega productos a favoritos</p>
            <button class="btn-primary" @click="$router.push('/catalog')">Ir al Catálogo</button>
          </div>

          <div v-else class="favorites-grid">
            <div v-for="product in favorites" :key="product.id" class="favorite-card">
              <router-link :to="`/shop/product/${product.id}`" class="product-link">
                <div class="favorite-image-wrapper">
                  <img :src="getProductImage(product)" :alt="product.name" class="favorite-image" />
                </div>
                <div class="favorite-details">
                  <h3 class="favorite-name">{{ product.name }}</h3>
                  <p v-if="product.category_name" class="favorite-category">{{ product.category_name }}</p>
                  <div class="favorite-price">
                    <span class="price-amount">L {{ formatPrice(product.price) }}</span>
                    <span v-if="product.tax_rate > 0" class="price-tax">+ {{ product.tax_rate }}% ISV</span>
                  </div>
                </div>
              </router-link>
              <div class="favorite-actions">
                <button @click="addToCart(product)" class="btn-add-cart">
                  <i class="ti ti-shopping-cart-plus"></i>
                  Agregar al Carrito
                </button>
                <button @click="removeFavorite(product.id)" class="btn-remove-favorite">
                  <i class="ti ti-trash"></i>
                  Quitar de Favoritos
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Autenticación Tab -->
        <div v-if="activeTab === 'authentication'" class="content-section">
          <h1>Autenticación</h1>

          <!-- Usuario autenticado con Google -->
          <div v-if="customerData.google_id" class="auth-section">
            <div class="google-auth-info">
              <i class="ti ti-brand-google google-icon"></i>
              <div class="google-auth-text">
                <h3>Cuenta vinculada con Google</h3>
                <p class="auth-description">
                  Has iniciado sesión con tu cuenta de Google. La gestión de tu contraseña se realiza
                  directamente en tu cuenta de Google por motivos de seguridad.
                </p>
                <p class="auth-description">
                  Si deseas cambiar tu contraseña, puedes hacerlo desde la
                  <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" class="google-link">
                    configuración de seguridad de Google
                  </a>.
                </p>
              </div>
            </div>
          </div>

          <!-- Usuario con contraseña tradicional -->
          <div v-else class="auth-section">
            <h3>Contraseña</h3>
            <p class="auth-description">Cambia tu contraseña para mantener tu cuenta segura</p>
            <button @click="showPasswordChange = !showPasswordChange" class="btn-change-password">
              {{ showPasswordChange ? 'Cancelar' : 'Cambiar Contraseña' }}
            </button>

            <form v-if="showPasswordChange" @submit.prevent="handleChangePassword" class="password-form">
              <div class="form-group">
                <label>Contraseña actual</label>
                <div class="password-input-group">
                  <input
                    v-model="passwordForm.currentPassword"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    placeholder="Ingrese su contraseña actual"
                    required
                    class="form-input"
                  />
                  <button
                    type="button"
                    @click="showCurrentPassword = !showCurrentPassword"
                    class="toggle-password-btn"
                  >
                    <i :class="showCurrentPassword ? 'ti ti-eye-off' : 'ti ti-eye'"></i>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Nueva contraseña</label>
                <div class="password-input-group">
                  <input
                    v-model="passwordForm.newPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    placeholder="Ingrese su nueva contraseña"
                    required
                    minlength="6"
                    class="form-input"
                  />
                  <button
                    type="button"
                    @click="showNewPassword = !showNewPassword"
                    class="toggle-password-btn"
                  >
                    <i :class="showNewPassword ? 'ti ti-eye-off' : 'ti ti-eye'"></i>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Confirmar nueva contraseña</label>
                <div class="password-input-group">
                  <input
                    v-model="passwordForm.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="Confirme su nueva contraseña"
                    required
                    minlength="6"
                    class="form-input"
                  />
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="toggle-password-btn"
                  >
                    <i :class="showConfirmPassword ? 'ti ti-eye-off' : 'ti ti-eye'"></i>
                  </button>
                </div>
              </div>

              <div v-if="passwordMessage" class="update-message" :class="passwordMessageType">
                <i class="ti ti-check-circle" v-if="passwordMessageType === 'success'"></i>
                <i class="ti ti-alert-circle" v-if="passwordMessageType === 'error'"></i>
                <span>{{ passwordMessage }}</span>
              </div>

              <button type="submit" class="btn-submit">
                Guardar Contraseña
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ShopHeader from '@/components/ShopHeader.vue'

const router = useRouter()
const activeTab = ref('profile')
const updateMessage = ref('')
const updateMessageType = ref('')
const showPasswordChange = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordMessage = ref('')
const passwordMessageType = ref('')

const customerData = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  dni: '',
  google_id: null
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Addresses variables
const addresses = ref([])
const showAddressForm = ref(false)
const editingAddress = ref(null)
const addressMessage = ref('')
const addressMessageType = ref('')
const addressForm = ref({
  address_label: '',
  recipient_name: '',
  phone: '',
  department: '',
  city: '',
  full_address: '',
  additional_notes: '',
  is_default: false
})
const states = ref([])
const cities = ref([])
const loadingCities = ref(false)

// Favorites variables
const favorites = ref([])

// Orders variables
const orders = ref([])
const loadingOrders = ref(false)
const showOrderModal = ref(false)
const selectedOrderDetail = ref(null)

// Billing Info variables
const billingInfo = ref([])
const showBillingForm = ref(false)
const editingBilling = ref(null)
const billingMessage = ref('')
const billingMessageType = ref('')
const billingForm = ref({
  label: '',
  business_name: '',
  rtn: '',
  is_default: false
})

// Cargar departamentos desde el API
const loadStates = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/v1/locations/states')
    if (response.data && response.data.success) {
      states.value = response.data.data
    }
  } catch (error) {
    console.error('Error al cargar departamentos:', error)
  }
}

// Cargar ciudades por departamento
const loadCitiesByState = async (departmentName) => {
  if (!departmentName) {
    cities.value = []
    return
  }

  loadingCities.value = true
  try {
    // Buscar el ID del departamento por nombre
    const state = states.value.find(s => s.name === departmentName)
    if (state) {
      const response = await axios.get(`http://localhost:3000/api/v1/locations/cities/${state.id}`)
      if (response.data && response.data.success) {
        cities.value = response.data.data
      }
    }
  } catch (error) {
    console.error('Error al cargar ciudades:', error)
    cities.value = []
  } finally {
    loadingCities.value = false
  }
}

// Manejar cambio de departamento
const onDepartmentChange = async () => {
  addressForm.value.city = ''
  await loadCitiesByState(addressForm.value.department)
}

onMounted(async () => {
  loadAddresses()
  loadBillingInfo()
  loadFavorites()
  loadOrders()
  await loadStates()

  // Cargar datos del cliente desde localStorage
  const storedCustomer = localStorage.getItem('ecommerce_customer')
  if (storedCustomer) {
    const customer = JSON.parse(storedCustomer)
    customerData.value = {
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      dni: customer.dni || '',
      google_id: customer.google_id || null
    }
  } else {
    // Si no hay datos en localStorage, redirigir a login
    router.push('/login')
  }
})

const updateProfile = async () => {
  updateMessage.value = ''
  updateMessageType.value = ''

  try {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await axios.put(
      'http://localhost:3000/api/v1/ecommerce/customers/profile',
      {
        first_name: customerData.value.first_name,
        last_name: customerData.value.last_name,
        phone: customerData.value.phone,
        dni: customerData.value.dni
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      // Actualizar datos en localStorage
      localStorage.setItem('ecommerce_customer', JSON.stringify(response.data.customer))
      updateMessage.value = 'Perfil actualizado exitosamente'
      updateMessageType.value = 'success'

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        updateMessage.value = ''
        updateMessageType.value = ''
      }, 5000)
    }
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    updateMessage.value = 'Error al actualizar el perfil. Por favor intente nuevamente.'
    updateMessageType.value = 'error'

    // Limpiar mensaje después de 5 segundos
    setTimeout(() => {
      updateMessage.value = ''
      updateMessageType.value = ''
    }, 5000)
  }
}

const handleChangePassword = async () => {
  passwordMessage.value = ''
  passwordMessageType.value = ''

  // Validar que las contraseñas coincidan
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordMessage.value = 'Las contraseñas nuevas no coinciden'
    passwordMessageType.value = 'error'
    return
  }

  // Validar longitud mínima
  if (passwordForm.value.newPassword.length < 6) {
    passwordMessage.value = 'La contraseña debe tener al menos 6 caracteres'
    passwordMessageType.value = 'error'
    return
  }

  try {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await axios.put(
      'http://localhost:3000/api/v1/ecommerce/customers/change-password',
      {
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      passwordMessage.value = 'Contraseña actualizada exitosamente'
      passwordMessageType.value = 'success'

      // Limpiar formulario
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }

      // Ocultar formulario después de 3 segundos
      setTimeout(() => {
        showPasswordChange.value = false
        passwordMessage.value = ''
        passwordMessageType.value = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Error al cambiar contraseña:', error)
    passwordMessage.value = error.response?.data?.message || 'Error al cambiar la contraseña. Verifica tu contraseña actual.'
    passwordMessageType.value = 'error'
  }
}

// Address management functions
const loadAddresses = async () => {
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
      addresses.value = response.data.addresses
    }
  } catch (error) {
    console.error('Error al cargar direcciones:', error)
  }
}

const saveAddress = async () => {
  addressMessage.value = ''
  addressMessageType.value = ''

  try {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) {
      router.push('/login')
      return
    }

    const url = editingAddress.value
      ? `http://localhost:3000/api/v1/ecommerce/customers/addresses/${editingAddress.value.id}`
      : 'http://localhost:3000/api/v1/ecommerce/customers/addresses'

    const method = editingAddress.value ? 'put' : 'post'

    const response = await axios[method](
      url,
      addressForm.value,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      addressMessage.value = editingAddress.value
        ? 'Dirección actualizada exitosamente'
        : 'Dirección guardada exitosamente'
      addressMessageType.value = 'success'

      // Recargar direcciones
      await loadAddresses()

      // Cerrar formulario después de 2 segundos
      setTimeout(() => {
        closeAddressForm()
      }, 2000)
    }
  } catch (error) {
    console.error('Error al guardar dirección:', error)
    addressMessage.value = 'Error al guardar la dirección. Por favor intente nuevamente.'
    addressMessageType.value = 'error'
  }
}

const editAddress = async (address) => {
  editingAddress.value = address
  addressForm.value = {
    address_label: address.address_label || '',
    recipient_name: address.recipient_name,
    phone: address.phone,
    department: address.department,
    city: address.city,
    full_address: address.full_address,
    additional_notes: address.additional_notes || '',
    is_default: address.is_default
  }

  // Cargar ciudades del departamento seleccionado
  if (address.department) {
    await loadCitiesByState(address.department)
  }

  showAddressForm.value = true
}

const deleteAddress = async (addressId) => {
  if (!confirm('¿Está seguro de que desea eliminar esta dirección?')) {
    return
  }

  try {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await axios.delete(
      `http://localhost:3000/api/v1/ecommerce/customers/addresses/${addressId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      // Recargar direcciones
      await loadAddresses()
    }
  } catch (error) {
    console.error('Error al eliminar dirección:', error)
    alert('Error al eliminar la dirección. Por favor intente nuevamente.')
  }
}

const setDefaultAddress = async (addressId) => {
  try {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await axios.put(
      `http://localhost:3000/api/v1/ecommerce/customers/addresses/${addressId}/set-default`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      // Recargar direcciones
      await loadAddresses()
    }
  } catch (error) {
    console.error('Error al establecer dirección predeterminada:', error)
    alert('Error al establecer la dirección predeterminada. Por favor intente nuevamente.')
  }
}

const closeAddressForm = () => {
  showAddressForm.value = false
  editingAddress.value = null
  addressForm.value = {
    address_label: '',
    recipient_name: '',
    phone: '',
    department: '',
    city: '',
    full_address: '',
    additional_notes: '',
    is_default: false
  }
  addressMessage.value = ''
  addressMessageType.value = ''
}

// Billing Info management functions
const loadBillingInfo = async () => {
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
      billingInfo.value = response.data.billingInfo
    }
  } catch (error) {
    console.error('Error al cargar información de facturación:', error)
  }
}

const saveBilling = async () => {
  billingMessage.value = ''
  billingMessageType.value = ''

  try {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) {
      router.push('/login')
      return
    }

    const url = editingBilling.value
      ? `http://localhost:3000/api/v1/ecommerce/customers/billing-info/${editingBilling.value.id}`
      : 'http://localhost:3000/api/v1/ecommerce/customers/billing-info'

    const method = editingBilling.value ? 'put' : 'post'

    const response = await axios[method](
      url,
      billingForm.value,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      billingMessage.value = editingBilling.value
        ? 'RTN actualizado exitosamente'
        : 'RTN guardado exitosamente'
      billingMessageType.value = 'success'

      // Recargar información de facturación
      await loadBillingInfo()

      // Cerrar formulario después de 2 segundos
      setTimeout(() => {
        closeBillingForm()
      }, 2000)
    }
  } catch (error) {
    console.error('Error al guardar RTN:', error)
    billingMessage.value = 'Error al guardar el RTN. Por favor intente nuevamente.'
    billingMessageType.value = 'error'
  }
}

const editBilling = (billing) => {
  editingBilling.value = billing
  billingForm.value = {
    label: billing.label || '',
    business_name: billing.business_name,
    rtn: billing.rtn,
    is_default: billing.is_default
  }
  showBillingForm.value = true
}

const deleteBilling = async (billingId) => {
  if (!confirm('¿Está seguro de que desea eliminar esta información de facturación?')) {
    return
  }

  try {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await axios.delete(
      `http://localhost:3000/api/v1/ecommerce/customers/billing-info/${billingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      // Recargar información de facturación
      await loadBillingInfo()
    }
  } catch (error) {
    console.error('Error al eliminar RTN:', error)
    alert('Error al eliminar el RTN. Por favor intente nuevamente.')
  }
}

const setDefaultBilling = async (billingId) => {
  try {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await axios.put(
      `http://localhost:3000/api/v1/ecommerce/customers/billing-info/${billingId}/set-default`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      // Recargar información de facturación
      await loadBillingInfo()
    }
  } catch (error) {
    console.error('Error al establecer RTN predeterminado:', error)
    alert('Error al establecer el RTN predeterminado. Por favor intente nuevamente.')
  }
}

const closeBillingForm = () => {
  showBillingForm.value = false
  editingBilling.value = null
  billingForm.value = {
    label: '',
    business_name: '',
    rtn: '',
    is_default: false
  }
  billingMessage.value = ''
  billingMessageType.value = ''
}

// Favorites management functions
const loadFavorites = async () => {
  try {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) return

    const response = await axios.get(
      'http://localhost:3000/api/v1/ecommerce/favorites',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      favorites.value = response.data.favorites
    }
  } catch (error) {
    console.error('Error al cargar favoritos:', error)
  }
}

const removeFavorite = async (productId) => {
  if (!confirm('¿Está seguro de que desea quitar este producto de favoritos?')) {
    return
  }

  try {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await axios.delete(
      `http://localhost:3000/api/v1/ecommerce/favorites/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      await loadFavorites()
    }
  } catch (error) {
    console.error('Error al eliminar favorito:', error)
    alert('Error al eliminar el producto de favoritos. Por favor intente nuevamente.')
  }
}

const addToCart = async (product) => {
  try {
    const cart = JSON.parse(localStorage.getItem('ecommerce_cart') || '[]')
    const existingItemIndex = cart.findIndex(item => item.product_id === product.id)

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += 1
    } else {
      cart.push({
        product_id: product.id,
        name: product.name,
        image: product.image,
        category: product.category_name || '',
        subcategory: product.subcategory_name || '',
        brand: product.brand_name || '',
        price: product.price,
        quantity: 1,
        tax_rate: product.tax_rate || 0
      })
    }

    localStorage.setItem('ecommerce_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    alert('Producto agregado al carrito')
  } catch (error) {
    console.error('Error al agregar al carrito:', error)
    alert('Error al agregar el producto al carrito')
  }
}

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const getProductImage = (product) => {
  if (product.image_url) {
    return product.image_url
  }
  if (product.image) {
    if (product.image.startsWith('http')) {
      return product.image
    }
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'
    return `${baseUrl}${product.image}`
  }
  return '/placeholder-product.svg'
}

// Orders management functions
const loadOrders = async () => {
  try {
    loadingOrders.value = true
    const token = localStorage.getItem('ecommerce_token')
    if (!token) return

    const response = await axios.get(
      'http://localhost:3000/api/v1/ecommerce/orders',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      orders.value = response.data.data
    }
  } catch (error) {
    console.error('Error al cargar pedidos:', error)
  } finally {
    loadingOrders.value = false
  }
}

const getStatusLabel = (status) => {
  const labels = {
    pendiente: 'Pendiente',
    cotizado: 'Cotizado',
    cobrado: 'Pagado'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewOrderDetail = (order) => {
  selectedOrderDetail.value = order
  showOrderModal.value = true
}

const closeOrderModal = () => {
  showOrderModal.value = false
  selectedOrderDetail.value = null
}

const handleLogout = () => {
  localStorage.removeItem('ecommerce_token')
  localStorage.removeItem('ecommerce_customer')
  router.push('/login')
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
}

.profile-sidebar {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  height: fit-content;
}

.profile-sidebar h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1.5rem;
}

.profile-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-nav a {
  padding: 0.875rem 1rem;
  color: #666;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
  font-weight: 500;
}

.profile-nav a:hover {
  background: #f8f9fa;
  color: #333;
}

.profile-nav a.active {
  background: #FF9F43;
  color: white;
}

.profile-nav a.logout {
  color: #dc3545;
  margin-top: 1rem;
  border-top: 1px solid #eee;
  padding-top: 1.375rem;
}

.profile-nav a.logout:hover {
  background: #fff5f5;
}

.profile-content {
  background: white;
  border-radius: 15px;
  padding: 3rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
}

.content-section h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 2rem;
}

.profile-form {
  max-width: 600px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #FF9F43;
  box-shadow: 0 0 0 3px rgba(255, 159, 67, 0.1);
}

.form-input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.update-message {
  padding: 1rem 1.25rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

.update-message i {
  font-size: 1.5rem;
}

.update-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.update-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-submit {
  background: #FF9F43;
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 0.5px;
}

.btn-submit:hover {
  background: #e68a2e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 159, 67, 0.4);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state p,
.empty-state h3 {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.btn-primary {
  background: white;
  color: #333;
  border: 1px solid #ddd;
  padding: 0.875rem 2rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #f8f9fa;
  border-color: #333;
}

@media (max-width: 768px) {
  .profile-container {
    grid-template-columns: 1fr;
  }

  .profile-sidebar {
    padding: 1.5rem;
  }

  .profile-content {
    padding: 2rem 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .profile-content {
    padding: 1.5rem 1rem;
  }

  .content-section h1 {
    font-size: 1.5rem;
  }
}

/* Estilos de Autenticación */
.auth-section {
  max-width: 600px;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.auth-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.auth-description {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Estilos para autenticación con Google */
.google-auth-info {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.google-icon {
  font-size: 3rem;
  color: #4285f4;
  flex-shrink: 0;
  margin-top: 0.5rem;
}

.google-auth-text h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.google-link {
  color: #4285f4;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.google-link:hover {
  color: #2a75f3;
  text-decoration: underline;
}

.btn-change-password {
  background: white;
  color: #333;
  border: 1px solid #ddd;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-change-password:hover {
  background: #f8f9fa;
  border-color: #333;
}

.password-form {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.password-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-group .form-input {
  flex: 1;
  padding-right: 3rem;
}

.toggle-password-btn {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.toggle-password-btn:hover {
  color: #FF9F43;
}

/* Estilos de Direcciones */
.btn-add-address {
  background: #FF9F43;
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.btn-add-address:hover {
  background: #e68a2e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 159, 67, 0.4);
}

.addresses-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.address-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.address-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #FF9F43;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.address-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.default-badge {
  background: #FF9F43;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.address-recipient {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.address-details {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.address-phone {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.address-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.address-actions button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #ddd;
  background: white;
  color: #333;
}

.address-actions button:hover {
  background: #f8f9fa;
  border-color: #333;
}

.btn-edit:hover {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #2196f3;
}

.btn-delete:hover {
  background: #ffebee;
  border-color: #f44336;
  color: #f44336;
}

.btn-default:hover {
  background: #fff8e1;
  border-color: #FF9F43;
  color: #FF9F43;
}

/* Modal de dirección */
.address-form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
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

.modal-content {
  position: relative;
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
  z-index: 1001;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  border-radius: 50%;
  width: 36px;
  height: 36px;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #333;
}

.address-form {
  padding: 2rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  color: #333;
}

.checkbox-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-cancel {
  background: white;
  color: #666;
  border: 1px solid #ddd;
  padding: 0.875rem 1.5rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel:hover {
  background: #f8f9fa;
  border-color: #333;
  color: #333;
}

@media (max-width: 768px) {
  .addresses-list {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header {
    padding: 1rem 1.5rem;
  }

  .address-form {
    padding: 1.5rem;
  }

  .address-actions {
    flex-direction: column;
  }

  .address-actions button {
    width: 100%;
    justify-content: center;
  }
}

/* Estilos de Favoritos */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.favorite-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.favorite-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #FF9F43;
}

.product-link {
  text-decoration: none;
  color: inherit;
}

.favorite-image-wrapper {
  width: 100%;
  height: 250px;
  overflow: hidden;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.favorite-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s;
}

.favorite-card:hover .favorite-image {
  transform: scale(1.05);
}

.favorite-details {
  padding: 1rem;
}

.favorite-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.favorite-category {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 0.75rem 0;
}

.favorite-price {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.price-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #FF9F43;
}

.price-tax {
  font-size: 0.75rem;
  color: #666;
}

.favorite-actions {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.btn-add-cart {
  background: #FF9F43;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-add-cart:hover {
  background: #e68a2e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 159, 67, 0.4);
}

.btn-remove-favorite {
  background: white;
  color: #666;
  border: 1px solid #ddd;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-remove-favorite:hover {
  background: #ffebee;
  border-color: #f44336;
  color: #f44336;
}

@media (max-width: 768px) {
  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .favorites-grid {
    grid-template-columns: 1fr;
  }
}

/* Orders Styles */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.order-header h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
}

.order-date {
  margin: 0;
  color: #666;
  font-size: 0.85rem;
}

.order-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pendiente {
  background: #fff3cd;
  color: #856404;
}

.status-cotizado {
  background: #cfe2ff;
  color: #084298;
}

.status-cobrado {
  background: #d4edda;
  color: #155724;
}

.order-body {
  margin-bottom: 1rem;
}

.order-body p {
  margin: 0.5rem 0;
  color: #666;
}

.order-actions {
  display: flex;
  gap: 1rem;
}

.btn-view-order {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
  cursor: pointer;
}

.btn-view-order:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

/* Modal de Pedido */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-dialog-order {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-content-order {
  padding: 0;
}

.modal-header-order {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header-order .modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
}

.btn-close-order {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close-order:hover {
  color: #333;
}

.modal-body-order {
  padding: 1.5rem;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.info-col h6 {
  margin-bottom: 0.75rem;
  color: #333;
  font-weight: 700;
  font-size: 1rem;
}

.info-col p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.mt-3 {
  margin-top: 1rem;
}

.ms-2 {
  margin-left: 0.5rem;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}

.products-table thead {
  background: #f8f9fa;
}

.products-table th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.products-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
}

.products-table tbody tr:last-child td {
  border-bottom: none;
}

.products-table tfoot td {
  padding: 1rem 0.75rem;
  border-top: 2px solid #333;
  font-size: 1rem;
}

.text-end {
  text-align: right;
}

.text-muted {
  color: #666;
  font-size: 0.85rem;
}

.d-block {
  display: block;
}

.alert-info-order {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 1rem;
  border-radius: 6px;
  color: #0d47a1;
}

.modal-footer-order {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-secondary-order {
  padding: 0.75rem 1.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary-order:hover {
  background: #5a6268;
}

@media (max-width: 768px) {
  .info-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .modal-dialog-order {
    margin: 0;
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>
