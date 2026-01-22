<template>
  <div class="checkout-page">
    <ShopHeader />

    <div class="container-fluid px-4 py-5">
      <!-- Progress Steps -->
      <div class="checkout-steps mb-5">
        <div class="step completed clickable" @click="router.push('/shop/cart')">
          <div class="step-number">1</div>
          <div class="step-label">CARRITO DE COMPRA</div>
        </div>
        <div class="step clickable" :class="{ completed: currentStep > 2, active: currentStep === 2 }" @click="editStep(2)">
          <div class="step-number">2</div>
          <div class="step-label">IDENTIFICACIÓN</div>
        </div>
        <div class="step clickable" :class="{ completed: currentStep > 3, active: currentStep === 3 }" @click="currentStep >= 3 ? editStep(3) : null">
          <div class="step-number">3</div>
          <div class="step-label">ENVÍO</div>
        </div>
        <div class="step" :class="{ active: currentStep === 4, clickable: currentStep === 4 }" @click="currentStep === 4 ? editStep(4) : null">
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
              <input
                type="email"
                v-model="customerInfo.email"
                @blur="validateEmail"
                placeholder="ejemplo@correo.com"
                class="form-input"
                maxlength="100"
                required
              />
              <small v-if="emailError" class="error-message">{{ emailError }}</small>
              <small v-else class="char-counter">{{ customerInfo.email ? customerInfo.email.length : 0 }}/100 caracteres</small>
            </div>

            <div class="form-group">
              <label>Nombre</label>
              <input
                type="text"
                v-model="customerInfo.firstName"
                placeholder="Nombre"
                class="form-input"
                maxlength="50"
                required
              />
              <small class="char-counter">{{ customerInfo.firstName ? customerInfo.firstName.length : 0 }}/50 caracteres</small>
            </div>

            <div class="form-group">
              <label>Apellidos</label>
              <input
                type="text"
                v-model="customerInfo.lastName"
                placeholder="Apellidos"
                class="form-input"
                maxlength="50"
                required
              />
              <small class="char-counter">{{ customerInfo.lastName ? customerInfo.lastName.length : 0 }}/50 caracteres</small>
            </div>

            <div class="form-group">
              <label>DNI o Pasaporte</label>
              <input
                type="text"
                v-model="customerInfo.dni"
                @input="handleDniInput"
                placeholder="0801-1990-12345 o Pasaporte"
                class="form-input"
                maxlength="15"
                required
              />
              <small class="char-counter">{{ customerInfo.dni ? customerInfo.dni.length : 0 }}/15 caracteres (DNI max 13, Pasaporte max 15)</small>
            </div>

            <div class="form-group">
              <label>Teléfono / Móvil</label>
              <div class="phone-input-container">
                <div class="custom-select-wrapper" @click="toggleCustomerDropdown" v-click-outside="closeCustomerDropdown">
                  <div class="custom-select-trigger">
                    <img :src="getFlagUrl(getSelectedCountry(customerInfo.phoneCountry).iso)" class="flag-img" />
                    <span>{{ getSelectedCountry(customerInfo.phoneCountry).code }}</span>
                    <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12">
                      <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/>
                    </svg>
                  </div>
                  <div v-if="showCustomerDropdown" class="custom-select-dropdown">
                    <div
                      v-for="country in countries"
                      :key="country.id"
                      @click="selectCustomerCountry(country.id)"
                      class="custom-select-option"
                    >
                      <img :src="getFlagUrl(country.iso)" class="flag-img" />
                      <span>{{ country.code }} - {{ country.name }}</span>
                    </div>
                  </div>
                </div>
                <input
                  type="tel"
                  v-model="customerInfo.phone"
                  @input="handlePhoneInput"
                  :placeholder="getPhonePlaceholder(customerInfo.phoneCountry)"
                  class="form-input phone-input"
                  :maxlength="getPhoneMaxLength(customerInfo.phoneCountry)"
                  required
                />
              </div>
              <small class="char-counter">{{ customerInfo.phone ? customerInfo.phone.length : 0 }}/{{ getPhoneMaxLength(customerInfo.phoneCountry) }} caracteres</small>
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
              <h3>Envío</h3>
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
                <textarea
                  v-model="deliveryInfo.address"
                  rows="3"
                  placeholder="Calle, colonia, referencias..."
                  class="form-textarea"
                  maxlength="250"
                ></textarea>
                <small class="char-counter">{{ deliveryInfo.address ? deliveryInfo.address.length : 0 }}/250 caracteres</small>
              </div>

              <div class="form-group">
                <label>Nombre de la Persona que va a Recibir</label>
                <input
                  type="text"
                  v-model="deliveryInfo.receiverName"
                  placeholder="Nombre y Apellido"
                  class="form-input"
                  maxlength="100"
                />
                <small class="char-counter">{{ deliveryInfo.receiverName ? deliveryInfo.receiverName.length : 0 }}/100 caracteres</small>
              </div>

              <div class="form-group">
                <label>Teléfono de la Persona que va a Recibir</label>
                <div class="phone-input-container">
                  <div class="custom-select-wrapper" @click="toggleDeliveryDropdown" v-click-outside="closeDeliveryDropdown">
                    <div class="custom-select-trigger">
                      <img :src="getFlagUrl(getSelectedCountry(deliveryInfo.receiverPhoneCountry).iso)" class="flag-img" />
                      <span>{{ getSelectedCountry(deliveryInfo.receiverPhoneCountry).code }}</span>
                      <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12">
                        <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/>
                      </svg>
                    </div>
                    <div v-if="showDeliveryDropdown" class="custom-select-dropdown">
                      <div
                        v-for="country in countries"
                        :key="country.id + '_receiver'"
                        @click="selectDeliveryCountry(country.id)"
                        class="custom-select-option"
                      >
                        <img :src="getFlagUrl(country.iso)" class="flag-img" />
                        <span>{{ country.code }} - {{ country.name }}</span>
                      </div>
                    </div>
                  </div>
                  <input
                    type="tel"
                    v-model="deliveryInfo.receiverPhone"
                    @input="handleReceiverPhoneInput"
                    :placeholder="getPhonePlaceholder(deliveryInfo.receiverPhoneCountry)"
                    class="form-input phone-input"
                    :maxlength="getPhoneMaxLength(deliveryInfo.receiverPhoneCountry)"
                  />
                </div>
                <small class="char-counter">{{ deliveryInfo.receiverPhone ? deliveryInfo.receiverPhone.length : 0 }}/{{ getPhoneMaxLength(deliveryInfo.receiverPhoneCountry) }} caracteres</small>
              </div>

              <div class="form-group">
                <label>Notas adicionales para la entrega</label>
                <textarea
                  v-model="deliveryInfo.notes"
                  rows="2"
                  placeholder="Ej: Tocar timbre, casa color verde, portón negro..."
                  class="form-textarea"
                  maxlength="200"
                ></textarea>
                <small class="char-counter">{{ deliveryInfo.notes ? deliveryInfo.notes.length : 0 }}/200 caracteres</small>
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
              <h4>Envío</h4>
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
                <input
                  type="text"
                  v-model="paymentInfo.businessName"
                  placeholder="Nombre de la empresa"
                  class="form-input"
                  maxlength="150"
                />
                <small class="char-counter">{{ paymentInfo.businessName ? paymentInfo.businessName.length : 0 }}/150 caracteres</small>
              </div>
              <div class="form-group">
                <label>RTN (14 dígitos)</label>
                <input
                  type="text"
                  v-model="paymentInfo.rtn"
                  @input="handleRtnInput"
                  placeholder="0000-0000-000000"
                  class="form-input"
                  maxlength="16"
                />
                <small class="char-counter">{{ paymentInfo.rtn ? paymentInfo.rtn.length : 0 }}/16 caracteres (14 dígitos + guiones)</small>
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
              <textarea
                v-model="paymentInfo.comments"
                rows="4"
                placeholder="Observaciones o instrucciones especiales sobre su pedido..."
                class="form-textarea"
                maxlength="500"
              ></textarea>
              <small class="char-counter">{{ paymentInfo.comments ? paymentInfo.comments.length : 0 }}/500 caracteres</small>
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
                  <div class="quantity-edit-container">
                    <button @click="decreaseItemQuantity(item)" class="qty-btn-sm">-</button>
                    <input
                      type="number"
                      v-model.number="item.quantity"
                      @blur="validateItemQuantity(item)"
                      min="0.01"
                      step="0.01"
                      class="qty-input-checkout"
                    />
                    <span class="unit-label">{{ item.unit || 'UNIDAD' }}</span>
                    <button @click="increaseItemQuantity(item)" class="qty-btn-sm">+</button>
                  </div>
                  <p class="summary-item-price">L {{ formatPrice(item.price * item.quantity) }}</p>
                </div>
              </div>
            </div>

            <!-- Coupon Section -->
            <div v-if="currentStep === 4" class="coupon-section">
              <h4>¿Tienes un código de promoción?</h4>
              <div class="promo-input-group">
                <input
                  type="text"
                  v-model="promoCode"
                  placeholder="Código de cupón"
                  class="promo-input"
                  @keyup.enter="applyPromo"
                />
                <button
                  @click="applyPromo()"
                  class="btn-apply"
                  :disabled="!promoCode.trim() || isValidatingCoupon"
                >
                  {{ isValidatingCoupon ? 'Validando...' : 'Aplicar' }}
                </button>
              </div>

              <!-- Applied Coupons List -->
              <div v-if="appliedCoupons.length > 0" class="applied-coupons-list">
                <div
                  v-for="coupon in appliedCoupons"
                  :key="coupon.code"
                  class="coupon-success"
                >
                  <div class="coupon-info">
                    <i class="ti ti-discount-check"></i>
                    <span>Cupón "{{ coupon.code }}" aplicado</span>
                  </div>
                  <button @click="removeCoupon(coupon.code)" class="btn-remove-single-coupon">
                    <i class="ti ti-x"></i>
                  </button>
                </div>
              </div>

              <!-- Coupon Error Message -->
              <div v-if="couponError" class="coupon-error">
                <i class="ti ti-alert-circle"></i>
                <span>{{ couponError }}</span>
              </div>

              <!-- Active Offers -->
              <div v-if="activeOffers.length > 0" class="active-offers">
                <h5>Ofertas Aplicadas</h5>
                <div v-for="offer in activeOffers" :key="offer.id" class="offer-item">
                  <i class="ti ti-tag"></i>
                  <span>{{ offer.name }}</span>
                  <span class="offer-discount">-L {{ formatPrice(offer.discount_amount) }}</span>
                </div>
              </div>
            </div>

            <div class="summary-totals">
              <div class="summary-row">
                <span>Subtotal</span>
                <span class="amount">L {{ formatPrice(subtotal) }}</span>
              </div>

              <!-- Coupons Discount -->
              <div
                v-for="coupon in appliedCoupons"
                :key="coupon.code"
                class="summary-row discount-row"
              >
                <span>Cupón {{ coupon.code }} ({{ coupon.name }})</span>
                <span class="amount discount">-L {{ formatPrice(coupon.discount_amount) }}</span>
              </div>

              <!-- Offers Discount -->
              <div v-if="totalOffersDiscount > 0" class="summary-row discount-row">
                <span>Descuento Ofertas</span>
                <span class="amount discount">-L {{ formatPrice(totalOffersDiscount) }}</span>
              </div>

              <div class="summary-row">
                <span>ISV (15%)</span>
                <span class="amount">L {{ formatPrice(taxAmount) }}</span>
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

    <!-- Modal de Error -->
    <div v-if="showErrorModal" class="modal-overlay" @click="closeErrorModal">
      <div class="error-modal" @click.stop>
        <div class="error-modal-content">
          <div class="error-icon">
            <i class="ti ti-alert-circle"></i>
          </div>
          <h2>Error al Procesar el Pedido</h2>
          <p class="error-message">{{ errorMessage }}</p>
          <button @click="closeErrorModal" class="btn-error-accept">Aceptar</button>
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

// Directiva personalizada para detectar clicks fuera del elemento
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.body.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent)
  }
}
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
const showErrorModal = ref(false)
const errorMessage = ref('')
const createdOrderNumber = ref('')
const emailError = ref('')
const showCustomerDropdown = ref(false)
const showDeliveryDropdown = ref(false)
const promoCode = ref('')
const appliedCoupons = ref([])
const activeOffers = ref([])
const couponError = ref('')
const isValidatingCoupon = ref(false)

// Lista de países con códigos ISO para banderas
const countries = [
  { code: '+504', iso: 'hn', name: 'Honduras', id: '+504-hn' },
  { code: '+1', iso: 'us', name: 'USA', id: '+1-us' },
  { code: '+1', iso: 'ca', name: 'Canadá', id: '+1-ca' },
  { code: '+52', iso: 'mx', name: 'México', id: '+52-mx' },
  { code: '+503', iso: 'sv', name: 'El Salvador', id: '+503-sv' },
  { code: '+502', iso: 'gt', name: 'Guatemala', id: '+502-gt' },
  { code: '+505', iso: 'ni', name: 'Nicaragua', id: '+505-ni' },
  { code: '+506', iso: 'cr', name: 'Costa Rica', id: '+506-cr' },
  { code: '+507', iso: 'pa', name: 'Panamá', id: '+507-pa' },
  { code: '+34', iso: 'es', name: 'España', id: '+34-es' },
  { code: '+54', iso: 'ar', name: 'Argentina', id: '+54-ar' },
  { code: '+55', iso: 'br', name: 'Brasil', id: '+55-br' },
  { code: '+56', iso: 'cl', name: 'Chile', id: '+56-cl' },
  { code: '+57', iso: 'co', name: 'Colombia', id: '+57-co' },
  { code: '+51', iso: 'pe', name: 'Perú', id: '+51-pe' },
  { code: '+58', iso: 've', name: 'Venezuela', id: '+58-ve' },
  { code: '+593', iso: 'ec', name: 'Ecuador', id: '+593-ec' },
  { code: '+591', iso: 'bo', name: 'Bolivia', id: '+591-bo' },
  { code: '+595', iso: 'py', name: 'Paraguay', id: '+595-py' },
  { code: '+598', iso: 'uy', name: 'Uruguay', id: '+598-uy' },
  { code: '+44', iso: 'gb', name: 'Reino Unido', id: '+44-gb' },
  { code: '+33', iso: 'fr', name: 'Francia', id: '+33-fr' },
  { code: '+49', iso: 'de', name: 'Alemania', id: '+49-de' },
  { code: '+39', iso: 'it', name: 'Italia', id: '+39-it' },
  { code: '+351', iso: 'pt', name: 'Portugal', id: '+351-pt' },
  { code: '+31', iso: 'nl', name: 'Países Bajos', id: '+31-nl' },
  { code: '+32', iso: 'be', name: 'Bélgica', id: '+32-be' },
  { code: '+41', iso: 'ch', name: 'Suiza', id: '+41-ch' },
  { code: '+43', iso: 'at', name: 'Austria', id: '+43-at' },
  { code: '+45', iso: 'dk', name: 'Dinamarca', id: '+45-dk' },
  { code: '+46', iso: 'se', name: 'Suecia', id: '+46-se' },
  { code: '+47', iso: 'no', name: 'Noruega', id: '+47-no' },
  { code: '+358', iso: 'fi', name: 'Finlandia', id: '+358-fi' },
  { code: '+86', iso: 'cn', name: 'China', id: '+86-cn' },
  { code: '+81', iso: 'jp', name: 'Japón', id: '+81-jp' },
  { code: '+82', iso: 'kr', name: 'Corea del Sur', id: '+82-kr' },
  { code: '+91', iso: 'in', name: 'India', id: '+91-in' },
  { code: '+61', iso: 'au', name: 'Australia', id: '+61-au' },
  { code: '+64', iso: 'nz', name: 'Nueva Zelanda', id: '+64-nz' }
]

// Función para obtener la URL de la bandera
const getFlagUrl = (iso) => {
  return `https://flagcdn.com/24x18/${iso}.png`
}

// Función para obtener el país seleccionado (ahora busca por ID único)
const getSelectedCountry = (countryId) => {
  return countries.find(c => c.id === countryId) || countries[0]
}

const customerInfo = ref({
  email: '',
  firstName: '',
  lastName: '',
  dni: '',
  phone: '',
  phoneCountry: '+504-hn' // Honduras por defecto
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
  receiverPhoneCountry: '+504-hn', // Honduras por defecto
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

// Prices are base prices WITHOUT tax - need to add 15%
const subtotal = computed(() => {
  const itemsTotal = cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  return itemsTotal
})

const totalOffersDiscount = computed(() => {
  return activeOffers.value.reduce((sum, offer) => sum + offer.discount_amount, 0)
})

const totalCouponsDiscount = computed(() => {
  return appliedCoupons.value.reduce((sum, coupon) => sum + coupon.discount_amount, 0)
})

const totalDiscount = computed(() => {
  return totalOffersDiscount.value + totalCouponsDiscount.value
})

const subtotalAfterDiscount = computed(() => {
  return Math.max(0, subtotal.value - totalDiscount.value)
})

const taxAmount = computed(() => {
  // Calculate 15% tax on subtotal after discounts
  return subtotalAfterDiscount.value * 0.15
})

const grandTotal = computed(() => {
  // Total = Subtotal - Discounts + Tax + Delivery
  return subtotalAfterDiscount.value + taxAmount.value + deliveryCost.value
})

// Funciones para manejar los dropdowns personalizados
const toggleCustomerDropdown = () => {
  showCustomerDropdown.value = !showCustomerDropdown.value
  showDeliveryDropdown.value = false
}

const closeCustomerDropdown = () => {
  showCustomerDropdown.value = false
}

const selectCustomerCountry = (countryId) => {
  customerInfo.value.phoneCountry = countryId
  customerInfo.value.phone = ''
  showCustomerDropdown.value = false
}

const toggleDeliveryDropdown = () => {
  showDeliveryDropdown.value = !showDeliveryDropdown.value
  showCustomerDropdown.value = false
}

const closeDeliveryDropdown = () => {
  showDeliveryDropdown.value = false
}

const selectDeliveryCountry = (countryId) => {
  deliveryInfo.value.receiverPhoneCountry = countryId
  deliveryInfo.value.receiverPhone = ''
  showDeliveryDropdown.value = false
}

// Funciones helper para teléfonos según país
const getPhonePlaceholder = (countryId) => {
  const country = getSelectedCountry(countryId)
  const countryCode = country.code
  const placeholders = {
    '+504': '9999-9999',      // Honduras
    '+1': '(555) 123-4567',   // USA, Canadá, etc.
    '+52': '55 1234 5678',    // México
    '+34': '912 345 678',     // España
    '+44': '20 1234 5678',    // Reino Unido
    '+33': '01 23 45 67 89',  // Francia
    '+49': '030 12345678',    // Alemania
    '+39': '06 1234 5678',    // Italia
    '+55': '(11) 91234-5678', // Brasil
    '+54': '11 1234-5678',    // Argentina
    '+56': '2 2123 4567',     // Chile
    '+57': '601 234 5678',    // Colombia
    '+51': '01 234 5678',     // Perú
    '+503': '2123-4567',      // El Salvador
    '+502': '2123-4567',      // Guatemala
    '+505': '2234-5678',      // Nicaragua
    '+506': '2123-4567',      // Costa Rica
    '+507': '212-3456',       // Panamá
  }
  return placeholders[countryCode] || '123456789'
}

const getPhoneMaxLength = (countryId) => {
  const country = getSelectedCountry(countryId)
  const countryCode = country.code
  const lengths = {
    '+504': 9,   // Honduras: 9999-9999
    '+1': 14,    // USA/Canadá: (555) 123-4567
    '+52': 12,   // México: 55 1234 5678
    '+34': 11,   // España: 912 345 678
    '+44': 12,   // Reino Unido: 20 1234 5678
    '+33': 14,   // Francia: 01 23 45 67 89
    '+49': 12,   // Alemania: 030 12345678
    '+39': 12,   // Italia: 06 1234 5678
    '+55': 15,   // Brasil: (11) 91234-5678
    '+54': 12,   // Argentina: 11 1234-5678
    '+56': 11,   // Chile: 2 2123 4567
    '+57': 12,   // Colombia: 601 234 5678
    '+51': 10,   // Perú: 01 234 5678
    '+503': 9,   // El Salvador: 2123-4567
    '+502': 9,   // Guatemala: 2123-4567
    '+505': 9,   // Nicaragua: 2234-5678
    '+506': 9,   // Costa Rica: 2123-4567
    '+507': 8,   // Panamá: 212-3456
  }
  return lengths[countryCode] || 15
}

// Funciones de validación de entrada
const validateEmail = () => {
  const email = customerInfo.value.email
  if (!email) {
    emailError.value = 'El correo es requerido'
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    emailError.value = 'Por favor ingrese un correo válido'
    return false
  }
  emailError.value = ''
  return true
}

const handleDniInput = (event) => {
  let value = event.target.value
  // Permitir solo números y guiones
  value = value.replace(/[^0-9-]/g, '')
  // Limitar a 15 caracteres (para pasaportes)
  customerInfo.value.dni = value.substring(0, 15)
}

const formatPhoneByCountry = (numbers, countryId) => {
  const country = getSelectedCountry(countryId)
  const countryCode = country.code
  let formatted = ''

  switch(countryCode) {
    case '+504': // Honduras: 9999-9999
    case '+503': // El Salvador: 2123-4567
    case '+502': // Guatemala: 2123-4567
    case '+505': // Nicaragua: 2234-5678
    case '+506': // Costa Rica: 2123-4567
      if (numbers.length <= 4) {
        formatted = numbers
      } else {
        formatted = numbers.substring(0, 4) + '-' + numbers.substring(4, 8)
      }
      break

    case '+1': // USA/Canadá: (555) 123-4567
      if (numbers.length <= 3) {
        formatted = numbers
      } else if (numbers.length <= 6) {
        formatted = '(' + numbers.substring(0, 3) + ') ' + numbers.substring(3)
      } else {
        formatted = '(' + numbers.substring(0, 3) + ') ' + numbers.substring(3, 6) + '-' + numbers.substring(6, 10)
      }
      break

    case '+52': // México: 55 1234 5678
      if (numbers.length <= 2) {
        formatted = numbers
      } else if (numbers.length <= 6) {
        formatted = numbers.substring(0, 2) + ' ' + numbers.substring(2)
      } else {
        formatted = numbers.substring(0, 2) + ' ' + numbers.substring(2, 6) + ' ' + numbers.substring(6, 10)
      }
      break

    case '+34': // España: 912 345 678
      if (numbers.length <= 3) {
        formatted = numbers
      } else if (numbers.length <= 6) {
        formatted = numbers.substring(0, 3) + ' ' + numbers.substring(3)
      } else {
        formatted = numbers.substring(0, 3) + ' ' + numbers.substring(3, 6) + ' ' + numbers.substring(6, 9)
      }
      break

    case '+44': // Reino Unido: 20 1234 5678
      if (numbers.length <= 2) {
        formatted = numbers
      } else if (numbers.length <= 6) {
        formatted = numbers.substring(0, 2) + ' ' + numbers.substring(2)
      } else {
        formatted = numbers.substring(0, 2) + ' ' + numbers.substring(2, 6) + ' ' + numbers.substring(6, 10)
      }
      break

    case '+33': // Francia: 01 23 45 67 89
      if (numbers.length <= 2) {
        formatted = numbers
      } else if (numbers.length <= 4) {
        formatted = numbers.substring(0, 2) + ' ' + numbers.substring(2)
      } else if (numbers.length <= 6) {
        formatted = numbers.substring(0, 2) + ' ' + numbers.substring(2, 4) + ' ' + numbers.substring(4)
      } else if (numbers.length <= 8) {
        formatted = numbers.substring(0, 2) + ' ' + numbers.substring(2, 4) + ' ' + numbers.substring(4, 6) + ' ' + numbers.substring(6)
      } else {
        formatted = numbers.substring(0, 2) + ' ' + numbers.substring(2, 4) + ' ' + numbers.substring(4, 6) + ' ' + numbers.substring(6, 8) + ' ' + numbers.substring(8, 10)
      }
      break

    case '+55': // Brasil: (11) 91234-5678
      if (numbers.length <= 2) {
        formatted = numbers
      } else if (numbers.length <= 7) {
        formatted = '(' + numbers.substring(0, 2) + ') ' + numbers.substring(2)
      } else {
        formatted = '(' + numbers.substring(0, 2) + ') ' + numbers.substring(2, 7) + '-' + numbers.substring(7, 11)
      }
      break

    case '+54': // Argentina: 11 1234-5678
      if (numbers.length <= 2) {
        formatted = numbers
      } else if (numbers.length <= 6) {
        formatted = numbers.substring(0, 2) + ' ' + numbers.substring(2)
      } else {
        formatted = numbers.substring(0, 2) + ' ' + numbers.substring(2, 6) + '-' + numbers.substring(6, 10)
      }
      break

    case '+57': // Colombia: 601 234 5678
      if (numbers.length <= 3) {
        formatted = numbers
      } else if (numbers.length <= 6) {
        formatted = numbers.substring(0, 3) + ' ' + numbers.substring(3)
      } else {
        formatted = numbers.substring(0, 3) + ' ' + numbers.substring(3, 6) + ' ' + numbers.substring(6, 10)
      }
      break

    case '+507': // Panamá: 212-3456
      if (numbers.length <= 3) {
        formatted = numbers
      } else {
        formatted = numbers.substring(0, 3) + '-' + numbers.substring(3, 7)
      }
      break

    default:
      // Para otros países, solo números sin formato especial
      formatted = numbers
  }

  return formatted
}

const handlePhoneInput = (event) => {
  let value = event.target.value
  const country = customerInfo.value.phoneCountry

  // Eliminar todo excepto números
  const numbers = value.replace(/[^0-9]/g, '')

  // Aplicar formato según el país
  customerInfo.value.phone = formatPhoneByCountry(numbers, country)
}

const handleReceiverPhoneInput = (event) => {
  let value = event.target.value
  const country = deliveryInfo.value.receiverPhoneCountry

  // Eliminar todo excepto números
  const numbers = value.replace(/[^0-9]/g, '')

  // Aplicar formato según el país
  deliveryInfo.value.receiverPhone = formatPhoneByCountry(numbers, country)
}

const handleRtnInput = (event) => {
  let value = event.target.value
  // Eliminar todo excepto números
  value = value.replace(/[^0-9]/g, '')

  // Auto-formatear RTN: 0000-0000-000000 (4-4-6 dígitos)
  if (value.length > 8) {
    value = value.substring(0, 4) + '-' + value.substring(4, 8) + '-' + value.substring(8, 14)
  } else if (value.length > 4) {
    value = value.substring(0, 4) + '-' + value.substring(4, 8)
  }

  paymentInfo.value.rtn = value
}

const isStep2Valid = computed(() => {
  // Validar email
  const emailValid = customerInfo.value.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.value.email)

  // Validar nombres
  const nameValid = customerInfo.value.firstName && customerInfo.value.lastName

  // Validar DNI o Pasaporte (DNI max 13 caracteres sin guiones, Pasaporte max 15)
  const dniValid = customerInfo.value.dni && customerInfo.value.dni.length >= 5 && customerInfo.value.dni.length <= 15

  // Validar teléfono (formato 9999-9999, 9 caracteres con guión)
  const phoneValid = customerInfo.value.phone && customerInfo.value.phone.length >= 8

  return emailValid && nameValid && dniValid && phoneValid
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
    // Validar que el RTN tenga 16 caracteres (14 dígitos + 2 guiones) o 14 dígitos sin formato
    const rtnDigits = paymentInfo.value.rtn.replace(/[^0-9]/g, '')
    if (rtnDigits.length !== 14) {
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

const updateCartInStorage = () => {
  localStorage.setItem('ecommerce_cart', JSON.stringify(cartItems.value))
  window.dispatchEvent(new Event('cart-updated'))
}

const increaseItemQuantity = (item) => {
  item.quantity = parseFloat((item.quantity + 1).toFixed(2))
  updateCartInStorage()
}

const decreaseItemQuantity = (item) => {
  if (item.quantity > 0.01) {
    item.quantity = Math.max(0.01, parseFloat((item.quantity - 1).toFixed(2)))
    updateCartInStorage()
  }
}

const validateItemQuantity = (item) => {
  let value = parseFloat(item.quantity)

  if (isNaN(value) || value < 0.01) {
    item.quantity = 0.01
  } else {
    item.quantity = parseFloat(value.toFixed(2))
  }

  updateCartInStorage()
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
  if (!price && price !== 0) return '0.00'
  return parseFloat(price).toLocaleString('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Funciones de cupones y ofertas
const applyPromo = async () => {
  if (!promoCode.value.trim()) {
    couponError.value = 'Por favor ingresa un código de cupón'
    return
  }

  if (cartItems.value.length === 0) {
    couponError.value = 'Tu carrito está vacío'
    return
  }

  // Verificar si el cupón ya está aplicado
  const couponCode = promoCode.value.trim().toUpperCase()
  console.log('🎫 Intentando aplicar cupón:', couponCode)
  console.log('🎫 Cupones actuales:', appliedCoupons.value.map(c => c.code))

  if (appliedCoupons.value.some(c => c.code.toUpperCase() === couponCode)) {
    couponError.value = 'Este cupón ya está aplicado'
    console.log('❌ Cupón duplicado')
    return
  }

  couponError.value = ''
  isValidatingCoupon.value = true

  try {
    const cartData = {
      code: promoCode.value.trim(),
      cart: {
        items: cartItems.value.map(item => ({
          product_id: item.product_id,
          price: item.price,
          quantity: item.quantity,
          category_id: item.category_id,
          subcategory_id: item.subcategory_id
        }))
      }
    }

    const response = await axios.post('http://localhost:3000/api/v1/ecommerce/cart/validate-coupon', cartData)

    console.log('✅ Respuesta del servidor:', response.data)

    if (response.data.success) {
      const newCoupon = response.data.data.coupon
      console.log('✅ Nuevo cupón a agregar:', newCoupon)
      appliedCoupons.value.push(newCoupon)
      console.log('✅ Cupones después de agregar:', appliedCoupons.value)
      promoCode.value = ''
      couponError.value = '' // Limpiar cualquier error previo
      localStorage.setItem('applied_coupons', JSON.stringify(appliedCoupons.value))
      console.log('✅ Cupón guardado en localStorage')
    }
  } catch (error) {
    console.error('Error validating coupon:', error)
    if (error.response?.data?.message) {
      couponError.value = error.response.data.message
    } else {
      couponError.value = 'Error al validar el cupón. Inténtalo de nuevo.'
    }
  } finally {
    isValidatingCoupon.value = false
  }
}

const removeCoupon = (couponCode) => {
  appliedCoupons.value = appliedCoupons.value.filter(c => c.code !== couponCode)
  couponError.value = ''
  localStorage.setItem('applied_coupons', JSON.stringify(appliedCoupons.value))
}

const loadActiveOffers = async () => {
  if (cartItems.value.length === 0) {
    activeOffers.value = []
    return
  }

  try {
    const cartData = {
      cart: {
        items: cartItems.value.map(item => ({
          product_id: item.product_id,
          price: item.price,
          quantity: item.quantity,
          category_id: item.category_id,
          subcategory_id: item.subcategory_id
        }))
      }
    }

    const response = await axios.post('http://localhost:3000/api/v1/ecommerce/cart/active-offers', cartData)

    if (response.data.success) {
      activeOffers.value = response.data.data.offers
      localStorage.setItem('active_offers', JSON.stringify(activeOffers.value))
    }
  } catch (error) {
    console.error('Error loading active offers:', error)
    activeOffers.value = []
  }
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
  message += 'DNI/Pasaporte: ' + customerInfo.value.dni + '\n'
  message += 'Telefono: +504 ' + customerInfo.value.phone + '\n'
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

  message += 'Subtotal: L ' + formatPrice(itemsSubtotal) + '\n'

  // Descuentos
  let totalDescuento = 0

  // Descuento de cupones
  console.log('🎫 Generando mensaje WhatsApp - Cupones aplicados:', appliedCoupons.value)
  if (appliedCoupons.value && appliedCoupons.value.length > 0) {
    appliedCoupons.value.forEach(coupon => {
      message += 'Descuento Cupon ' + coupon.code + ' (' + coupon.name + '): -L ' + formatPrice(coupon.discount_amount) + '\n'
      totalDescuento += coupon.discount_amount
    })
  } else {
    console.log('❌ No hay cupones para incluir en el mensaje de WhatsApp')
  }

  // Descuento de ofertas
  if (activeOffers.value && activeOffers.value.length > 0) {
    const ofertasDescuento = activeOffers.value.reduce((sum, offer) => sum + offer.discount_amount, 0)
    message += 'Descuento Ofertas: -L ' + formatPrice(ofertasDescuento) + '\n'
    totalDescuento += ofertasDescuento
  }

  // Subtotal después de descuentos
  const subtotalConDescuento = Math.max(0, itemsSubtotal - totalDescuento)
  if (totalDescuento > 0) {
    message += 'Subtotal con descuentos: L ' + formatPrice(subtotalConDescuento) + '\n'
  }

  // ISV se calcula sobre el subtotal con descuentos
  const tax = subtotalConDescuento * 0.15
  message += 'ISV (15%): L ' + formatPrice(tax) + '\n'

  const itemsTotal = subtotalConDescuento + tax
  message += 'Total: L ' + formatPrice(itemsTotal) + '\n\n'

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
        ? 'La Ceiba'
        : (deliveryInfo.value.municipalityName || deliveryInfo.value.municipalityId || 'La Ceiba'),
      department: deliveryInfo.value.type === 'tienda'
        ? 'Atlántida'
        : (deliveryInfo.value.departmentName || deliveryInfo.value.departmentId || 'Atlántida'),
      receiver_name: deliveryInfo.value.type === 'domicilio'
        ? (deliveryInfo.value.receiverName || `${customerInfo.value.firstName} ${customerInfo.value.lastName}`)
        : null,
      receiver_phone: deliveryInfo.value.type === 'domicilio'
        ? (deliveryInfo.value.receiverPhone || customerInfo.value.phone)
        : null,
      receiver_phone_country: deliveryInfo.value.type === 'domicilio'
        ? (deliveryInfo.value.receiverPhoneCountry || customerInfo.value.phoneCountry)
        : null,
      notes: deliveryInfo.value.type === 'tienda'
        ? (deliveryInfo.value.notes ? 'RECOGER EN TIENDA - ' + deliveryInfo.value.notes : 'RECOGER EN TIENDA')
        : deliveryInfo.value.notes || null,
      additional_comments: paymentInfo.value.comments || null,
      customer_dni: customerInfo.value.dni || null,
      customer_phone_country: customerInfo.value.phoneCountry,
      invoice_type: paymentInfo.value.invoiceType || 'Consumidor Final',
      rtn: paymentInfo.value.invoiceType === 'Con RTN' ? paymentInfo.value.rtn : null,
      business_name: paymentInfo.value.invoiceType === 'Con RTN' ? paymentInfo.value.businessName : null,
      payment_method: paymentInfo.value.type || 'Efectivo',
      // Información de descuentos
      coupons: appliedCoupons.value.map(c => ({
        code: c.code,
        name: c.name,
        discount_amount: c.discount_amount
      })),
      coupon_discount: totalCouponsDiscount.value || 0,
      offers_discount: totalOffersDiscount.value || 0,
      subtotal_before_discount: subtotal.value,
      subtotal_after_discount: subtotalAfterDiscount.value,
      tax_amount: taxAmount.value,
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
    console.log('🔍 deliveryInfo.receiverName:', deliveryInfo.value.receiverName)
    console.log('🔍 deliveryInfo.receiverPhone:', deliveryInfo.value.receiverPhone)
    console.log('🔍 paymentInfo.comments:', paymentInfo.value.comments)

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

    // Limpiar solo el carrito (los cupones se limpian cuando se cierra el modal)
    localStorage.removeItem('ecommerce_cart')
    window.dispatchEvent(new Event('cart-updated'))

    // NO limpiar cupones aquí - se necesitan para el mensaje de WhatsApp
    // Los cupones se limpiarán cuando el usuario cierre el modal o cambie de página

  } catch (error) {
    console.error('Error submitting order:', error)

    errorMessage.value = 'Error al procesar el pedido. Por favor intente nuevamente.'

    if (error.response) {
      console.error('❌ Error del servidor:', error.response.data)
      errorMessage.value = error.response.data.message || errorMessage.value
    }

    showErrorModal.value = true
  } finally {
    submitting.value = false
  }
}

const closeErrorModal = () => {
  showErrorModal.value = false
  errorMessage.value = ''
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

  // Limpiar cupones y ofertas DESPUÉS de generar el mensaje de WhatsApp
  localStorage.removeItem('applied_coupons')
  localStorage.removeItem('active_offers')
  appliedCoupons.value = []
  activeOffers.value = []
  promoCode.value = ''

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
      phone: customer.phone || '',
      phoneCountry: customer.phone_country || '+504-hn'
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
  deliveryInfo.value.receiverPhoneCountry = address.phone_country || '+504-hn'
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
        phone_country: customerInfo.value.phoneCountry,
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
        phone_country: deliveryInfo.value.receiverPhoneCountry || customerInfo.value.phoneCountry,
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

  // Load saved coupons from localStorage
  const savedCoupons = localStorage.getItem('applied_coupons')
  console.log('🎫 Checkout mounted - LocalStorage applied_coupons:', savedCoupons)
  if (savedCoupons) {
    try {
      appliedCoupons.value = JSON.parse(savedCoupons)
      console.log('✅ Cupones cargados en checkout:', appliedCoupons.value)
    } catch (e) {
      console.log('❌ Error parseando cupones:', e)
      localStorage.removeItem('applied_coupons')
    }
  } else {
    console.log('⚠️ No hay cupones guardados en localStorage')
  }

  // Load saved offers from localStorage
  const savedOffers = localStorage.getItem('active_offers')
  if (savedOffers) {
    try {
      activeOffers.value = JSON.parse(savedOffers)
    } catch (e) {
      localStorage.removeItem('active_offers')
    }
  }

  // Load active offers from server
  await loadActiveOffers()
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

.step.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.step.clickable:hover {
  opacity: 1;
  transform: translateY(-2px);
}

.step.clickable:hover .step-number {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color, #FF9F43);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.step.active .step-number {
  background: var(--primary-color, #FF9F43);
  color: #fff;
}

.step.completed .step-number {
  background: #28a745;
  color: #fff;
}

.step.completed .step-label {
  color: #28a745;
  font-weight: 700;
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
  background: var(--primary-color, #FF9F43);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.step-badge.active {
  background: var(--primary-color, #FF9F43);
  color: #fff;
}

.step-header-completed .step-badge {
  background: #28a745;
  color: #fff;
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

.char-counter {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #999;
  text-align: right;
}

.error-message {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #dc3545;
  text-align: left;
}

.phone-input-container {
  display: flex;
  gap: 0.5rem;
}

/* Custom Select con banderas */
.custom-select-wrapper {
  position: relative;
  width: 140px;
  cursor: pointer;
  user-select: none;
}

.custom-select-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.custom-select-trigger:hover {
  border-color: #ccc;
}

.custom-select-trigger .flag-img {
  width: 24px;
  height: 18px;
  object-fit: cover;
  border-radius: 2px;
}

.custom-select-trigger .dropdown-arrow {
  margin-left: auto;
  transition: transform 0.3s ease;
}

.custom-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.custom-select-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.95rem;
}

.custom-select-option:hover {
  background-color: #f5f5f5;
}

.custom-select-option .flag-img {
  width: 24px;
  height: 18px;
  object-fit: cover;
  border-radius: 2px;
  flex-shrink: 0;
}

.custom-select-option span {
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.phone-input {
  flex: 1;
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
  color: #fff;
  font-weight: 700;
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
  background: var(--primary-color, #FF9F43);
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
  background: var(--primary-dark, #e68a2e);
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

.quantity-edit-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.qty-btn-sm {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.qty-btn-sm:hover {
  background: #f0f0f0;
  border-color: #bbb;
}

.qty-input-checkout {
  width: 65px;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 0.95rem;
  padding: 0 0.25rem;
}

.qty-input-checkout:focus {
  outline: none;
  border-color: #4CAF50;
}

.quantity-edit-container .unit-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
  min-width: 40px;
}

.coupon-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.coupon-section h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.promo-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.promo-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
}

.promo-input:focus {
  outline: none;
  border-color: var(--primary-color, #FF9F43);
}

.promo-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.btn-apply {
  padding: 0.75rem 1.5rem;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-apply:hover {
  background: #e0e0e0;
}

.btn-remove-coupon {
  background: #fee;
  color: #dc2626;
  border-color: #fcc;
}

.btn-remove-coupon:hover {
  background: #fcc;
}

.applied-coupons-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.coupon-success {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  color: #155724;
  font-size: 0.9rem;
}

.coupon-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.coupon-success i {
  font-size: 1.2rem;
}

.btn-remove-single-coupon {
  background: transparent;
  border: none;
  color: #155724;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove-single-coupon:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #dc2626;
}

.btn-remove-single-coupon i {
  font-size: 1.1rem;
}

.coupon-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  color: #721c24;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.coupon-error i {
  font-size: 1.2rem;
}

.active-offers {
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.active-offers h5 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: #856404;
}

.offer-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  color: #856404;
}

.offer-item i {
  font-size: 1.1rem;
}

.offer-item span:nth-child(2) {
  flex: 1;
}

.offer-discount {
  font-weight: 700;
  color: #28a745;
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

.discount-row {
  color: #28a745;
}

.discount-row .discount {
  color: #28a745;
  font-weight: 700;
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

/* Modal de Error */
.error-modal {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.error-modal-content {
  padding: 3rem 2rem;
  text-align: center;
}

.error-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
}

.error-icon i {
  font-size: 3rem;
  color: white;
}

.error-modal-content h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.1rem;
  color: #4b5563;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.btn-error-accept {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 0.875rem 3rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-error-accept:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.btn-error-accept:active {
  transform: translateY(0);
}
</style>
