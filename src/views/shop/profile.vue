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
            Mis Pedidos
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
              <label>Teléfono / Móvil</label>
              <div class="phone-input-container">
                <div class="custom-select-wrapper" @click="togglePhoneDropdown" v-click-outside="closePhoneDropdown">
                  <div class="custom-select-trigger">
                    <img :src="getFlagUrl(getSelectedCountry(customerData.phoneCountry).iso)" class="flag-img" />
                    <span>{{ getSelectedCountry(customerData.phoneCountry).code }}</span>
                    <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12">
                      <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/>
                    </svg>
                  </div>
                  <div v-if="showPhoneDropdown" class="custom-select-dropdown">
                    <div
                      v-for="country in countries"
                      :key="country.id"
                      @click="selectPhoneCountry(country.id)"
                      class="custom-select-option"
                    >
                      <img :src="getFlagUrl(country.iso)" class="flag-img" />
                      <span>{{ country.code }} - {{ country.name }}</span>
                    </div>
                  </div>
                </div>
                <input
                  v-model="customerData.phone"
                  @input="handlePhoneInput"
                  type="tel"
                  :placeholder="getPhonePlaceholder(customerData.phoneCountry)"
                  class="form-input phone-input"
                  :maxlength="getPhoneMaxLength(customerData.phoneCountry)"
                />
              </div>
              <small class="char-counter">{{ customerData.phone ? customerData.phone.length : 0 }}/{{ getPhoneMaxLength(customerData.phoneCountry) }} caracteres</small>
            </div>

            <div class="form-group">
              <label>DNI o Pasaporte</label>
              <input
                v-model="customerData.dni"
                @input="handleDniInput"
                type="text"
                placeholder="Número de DNI o Pasaporte"
                class="form-input"
                maxlength="15"
              />
              <small class="char-counter">{{ customerData.dni ? customerData.dni.length : 0 }}/15 caracteres (DNI max 13, Pasaporte max 15)</small>
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
                    placeholder="Ej: Casa Principal, Casa Secundaria, Trabajo..."
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label>Nombre de quien recibe *</label>
                  <input
                    v-model="addressForm.recipient_name"
                    type="text"
                    placeholder="Ej: José López"
                    required
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label>Teléfono *</label>
                  <div class="phone-input-container">
                    <div class="custom-select-wrapper" @click="toggleAddressPhoneDropdown" v-click-outside="closeAddressPhoneDropdown">
                      <div class="custom-select-trigger">
                        <img :src="getFlagUrl(getSelectedCountry(addressForm.phoneCountry).iso)" class="flag-img" />
                        <span>{{ getSelectedCountry(addressForm.phoneCountry).code }}</span>
                        <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12">
                          <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                      </div>
                      <div v-if="showAddressPhoneDropdown" class="custom-select-dropdown">
                        <div
                          v-for="country in countries"
                          :key="country.id + '_address'"
                          @click="selectAddressPhoneCountry(country.id)"
                          class="custom-select-option"
                        >
                          <img :src="getFlagUrl(country.iso)" class="flag-img" />
                          <span>{{ country.code }} - {{ country.name }}</span>
                        </div>
                      </div>
                    </div>
                    <input
                      v-model="addressForm.phone"
                      @input="handleAddressPhoneInput"
                      type="tel"
                      :placeholder="getPhonePlaceholder(addressForm.phoneCountry)"
                      required
                      class="form-input phone-input"
                      :maxlength="getPhoneMaxLength(addressForm.phoneCountry)"
                    />
                  </div>
                  <small class="char-counter">{{ addressForm.phone ? addressForm.phone.length : 0 }}/{{ getPhoneMaxLength(addressForm.phoneCountry) }} caracteres</small>
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
                    maxlength="100"
                  />
                  <small class="char-counter">{{ billingForm.label ? billingForm.label.length : 0 }}/100 caracteres</small>
                </div>

                <div class="form-group">
                  <label>Razón Social *</label>
                  <input
                    v-model="billingForm.business_name"
                    type="text"
                    placeholder="Ej: COMERCIAL EL AHORRO S.A. DE C.V."
                    required
                    class="form-input"
                    maxlength="150"
                  />
                  <small class="char-counter">{{ billingForm.business_name ? billingForm.business_name.length : 0 }}/150 caracteres</small>
                </div>

                <div class="form-group">
                  <label>RTN (14 dígitos) *</label>
                  <input
                    v-model="billingForm.rtn"
                    @input="handleRtnInput"
                    type="text"
                    placeholder="0000-0000-000000"
                    required
                    class="form-input"
                    maxlength="16"
                  />
                  <small class="char-counter">{{ billingForm.rtn ? billingForm.rtn.length : 0 }}/16 caracteres (14 dígitos + guiones)</small>
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
                <button v-if="order.status === 'pendiente'" @click="openCancelOrderModal(order)" class="btn-cancel-order-card">
                  <i class="fas fa-times-circle"></i>
                  Cancelar Pedido
                </button>
                <button v-if="order.status !== 'cancelado'" @click="shareOrderViaWhatsApp(order)" class="btn-whatsapp-order-card" :disabled="loadingWhatsApp">
                  <i class="fab fa-whatsapp"></i>
                  Reenviar Pedido
                </button>
                <button @click="showStatusHistoryForOrder(order)" class="btn-history-order-card" :disabled="loadingHistory">
                  <i class="fas fa-history"></i>
                  Ver Historial
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
                    <template v-if="selectedOrderDetail.delivery_address !== 'Recoger en tienda'">
                      <p class="mb-1" v-if="selectedOrderDetail.receiver_name"><strong>Nombre de la Persona que va a Recibir:</strong> {{ selectedOrderDetail.receiver_name }}</p>
                      <p class="mb-1" v-if="selectedOrderDetail.receiver_phone"><strong>Teléfono de la Persona que va a Recibir:</strong> {{ selectedOrderDetail.receiver_phone }}</p>
                    </template>
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
                          {{ item.product_name }} <span class="unit-text">{{ item.unit || 'UNIDAD' }}</span>
                          <small class="text-muted d-block" v-if="item.product_code">{{ item.product_code }}</small>
                        </td>
                        <td class="text-end">{{ item.quantity }}</td>
                        <td class="text-end">L{{ parseFloat(item.unit_price).toFixed(2) }}</td>
                        <td class="text-end"><strong>L{{ parseFloat(item.subtotal).toFixed(2) }}</strong></td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr v-if="selectedOrderDetail.subtotal_before_discount">
                        <td colspan="3" class="text-end">Subtotal:</td>
                        <td class="text-end">L{{ parseFloat(selectedOrderDetail.subtotal_before_discount).toFixed(2) }}</td>
                      </tr>
                      <tr v-if="selectedOrderDetail.coupon_discount && selectedOrderDetail.coupon_discount > 0" style="color: #28a745;">
                        <td colspan="3" class="text-end">Descuento Cupón ({{ selectedOrderDetail.coupon_name || selectedOrderDetail.coupon_code }}):</td>
                        <td class="text-end">-L{{ parseFloat(selectedOrderDetail.coupon_discount).toFixed(2) }}</td>
                      </tr>
                      <tr v-if="selectedOrderDetail.offers_discount && selectedOrderDetail.offers_discount > 0" style="color: #28a745;">
                        <td colspan="3" class="text-end">Descuento Ofertas:</td>
                        <td class="text-end">-L{{ parseFloat(selectedOrderDetail.offers_discount).toFixed(2) }}</td>
                      </tr>
                      <tr v-if="selectedOrderDetail.subtotal_after_discount && (selectedOrderDetail.coupon_discount > 0 || selectedOrderDetail.offers_discount > 0)">
                        <td colspan="3" class="text-end">Subtotal con descuentos:</td>
                        <td class="text-end">L{{ parseFloat(selectedOrderDetail.subtotal_after_discount).toFixed(2) }}</td>
                      </tr>
                      <tr v-if="selectedOrderDetail.tax_amount">
                        <td colspan="3" class="text-end">ISV (15%):</td>
                        <td class="text-end">L{{ parseFloat(selectedOrderDetail.tax_amount).toFixed(2) }}</td>
                      </tr>
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

                <!-- Comentarios Adicionales -->
                <div v-if="selectedOrderDetail.additional_comments" class="alert-info-order mt-3">
                  <strong>Comentarios adicionales:</strong><br>
                  {{ selectedOrderDetail.additional_comments }}
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

        <!-- Modal de Historial de Cambios de Estado -->
        <div v-if="showStatusHistoryModal" class="modal-overlay-order" @click="closeStatusHistoryModal">
          <div class="modal-content-order" @click.stop style="max-width: 900px;">
            <div class="modal-header-order">
              <h2>Historial de Cambios de Estado</h2>
              <button @click="closeStatusHistoryModal" class="modal-close-order">&times;</button>
            </div>
            <div class="modal-body-order">
              <div v-if="loadingHistory" class="text-center py-4">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
              </div>

              <div v-else-if="statusHistory.length === 0" class="alert alert-info">
                No hay cambios de estado registrados para este pedido.
              </div>

              <div v-else class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Estado Anterior</th>
                      <th>Nuevo Estado</th>
                      <th>Notas del Proceso</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="change in statusHistory" :key="change.id">
                      <td>{{ formatDate(change.changed_at) }}</td>
                      <td>
                        <span :class="`order-status status-${change.previous_status}`">
                          {{ getStatusLabel(change.previous_status) }}
                        </span>
                      </td>
                      <td>
                        <span :class="`order-status status-${change.new_status}`">
                          {{ getStatusLabel(change.new_status) }}
                        </span>
                      </td>
                      <td>{{ change.notes || '-' }}</td>
                      <td>{{ change.changed_by_name || 'Sistema' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="modal-footer-order">
              <button type="button" class="btn-secondary-order" @click="closeStatusHistoryModal">Cerrar</button>
            </div>
          </div>
        </div>

        <!-- Modal de Cancelar Pedido -->
        <div v-if="showCancelOrderModal" class="modal-overlay" @click="closeCancelOrderModal">
          <div class="modal-dialog-order" @click.stop>
            <div class="modal-content-order">
              <div class="modal-header-order">
                <h5 class="modal-title">Cancelar Pedido {{ orderToCancel?.order_number }}</h5>
                <button type="button" class="btn-close-order" @click="closeCancelOrderModal">×</button>
              </div>
              <div class="modal-body-order">
                <div class="alert alert-warning">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  ¿Estás seguro que deseas cancelar este pedido? Esta acción no se puede deshacer.
                </div>
                <div class="mb-3">
                  <label class="form-label"><strong>Motivo de cancelación *</strong></label>
                  <textarea
                    v-model="cancellationReason"
                    class="form-control"
                    rows="4"
                    placeholder="Por favor indica el motivo de cancelación..."
                    required
                  ></textarea>
                </div>
              </div>
              <div class="modal-footer-order">
                <button type="button" class="btn-secondary-order" @click="closeCancelOrderModal" :disabled="cancellingOrder">Cerrar</button>
                <button type="button" class="btn-danger-order" @click="confirmCancelOrder" :disabled="!cancellationReason || cancellingOrder">
                  <i v-if="cancellingOrder" class="fas fa-spinner fa-spin me-2"></i>
                  {{ cancellingOrder ? 'Cancelando...' : 'Sí, Cancelar Pedido' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal de Pedido Cancelado Exitosamente -->
        <div v-if="showCancelSuccessModal" class="modal-overlay" @click="showCancelSuccessModal = false">
          <div class="cart-success-modal" @click.stop>
            <div class="cart-modal-content">
              <div class="success-icon-cancel">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              <h2>¡Pedido Cancelado!</h2>
              <p class="cart-message">
                Tu pedido ha sido cancelado exitosamente.
              </p>
              <div class="modal-buttons-single">
                <button @click="showCancelSuccessModal = false" class="btn-continue-cancel">
                  Aceptar
                </button>
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
                    <span class="price-amount">L {{ formatPrice(product.price) }} {{ product.unit || 'UNIDAD' }}</span>
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

    <!-- Modal de confirmación para quitar de favoritos -->
    <div v-if="showRemoveFavoriteModal" class="modal-overlay" @click="cancelRemoveFavorite">
      <div class="confirmation-modal" @click.stop>
        <div class="modal-icon">
          <i class="ti ti-heart-broken"></i>
        </div>
        <h3>Quitar de Favoritos</h3>
        <p>¿Está seguro de que desea quitar este producto de favoritos?</p>
        <div class="modal-actions">
          <button @click="confirmRemoveFavorite" class="btn-confirm-remove">Aceptar</button>
          <button @click="cancelRemoveFavorite" class="btn-cancel-remove">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import ShopHeader from '@/components/ShopHeader.vue'

const router = useRouter()
const route = useRoute()
const activeTab = ref('profile')

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

// Detectar si se pasa tab en la URL
if (route.query.tab) {
  activeTab.value = route.query.tab
}
const updateMessage = ref('')
const updateMessageType = ref('')
const showPasswordChange = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordMessage = ref('')
const passwordMessageType = ref('')

const showPhoneDropdown = ref(false)
const showAddressPhoneDropdown = ref(false)

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

const customerData = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  phoneCountry: '+504-hn',
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
  phoneCountry: '+504-hn',
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
const showRemoveFavoriteModal = ref(false)
const productToRemove = ref(null)

// Orders variables
const orders = ref([])
const loadingOrders = ref(false)
const showOrderModal = ref(false)
const selectedOrderDetail = ref(null)
const showStatusHistoryModal = ref(false)
const statusHistory = ref([])
const loadingHistory = ref(false)
const loadingWhatsApp = ref(false)
const showCancelOrderModal = ref(false)
const orderToCancel = ref(null)
const cancellationReason = ref('')
const cancellingOrder = ref(false)
const showCancelSuccessModal = ref(false)

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

// Funciones para el dropdown de país
const togglePhoneDropdown = () => {
  showPhoneDropdown.value = !showPhoneDropdown.value
}

const closePhoneDropdown = () => {
  showPhoneDropdown.value = false
}

const selectPhoneCountry = (countryId) => {
  customerData.value.phoneCountry = countryId
  customerData.value.phone = ''
  showPhoneDropdown.value = false
}

// Funciones helper para teléfonos según país
const getPhonePlaceholder = (countryId) => {
  const country = getSelectedCountry(countryId)
  const countryCode = country.code
  const placeholders = {
    '+504': '9999-9999',
    '+1': '(555) 123-4567',
    '+52': '55 1234 5678',
    '+34': '912 345 678',
    '+44': '20 1234 5678',
    '+33': '01 23 45 67 89',
    '+49': '030 12345678',
    '+39': '06 1234 5678',
    '+55': '(11) 91234-5678',
    '+54': '11 1234-5678',
    '+56': '2 2123 4567',
    '+57': '601 234 5678',
    '+51': '01 234 5678',
    '+503': '2123-4567',
    '+502': '2123-4567',
    '+505': '2234-5678',
    '+506': '2123-4567',
    '+507': '212-3456'
  }
  return placeholders[countryCode] || '123456789'
}

const getPhoneMaxLength = (countryId) => {
  const country = getSelectedCountry(countryId)
  const countryCode = country.code
  const lengths = {
    '+504': 9,
    '+1': 14,
    '+52': 12,
    '+34': 11,
    '+44': 12,
    '+33': 14,
    '+49': 12,
    '+39': 12,
    '+55': 15,
    '+54': 12,
    '+56': 11,
    '+57': 12,
    '+51': 10,
    '+503': 9,
    '+502': 9,
    '+505': 9,
    '+506': 9,
    '+507': 8
  }
  return lengths[countryCode] || 15
}

// Función para auto-formatear teléfonos según país
const formatPhoneByCountry = (numbers, countryId) => {
  const country = getSelectedCountry(countryId)
  const countryCode = country.code
  let formatted = ''
  switch(countryCode) {
    case '+504': // Honduras: 9999-9999
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
    default:
      formatted = numbers
  }
  return formatted
}

const handlePhoneInput = (event) => {
  let value = event.target.value
  value = value.replace(/[^0-9]/g, '')
  const formatted = formatPhoneByCountry(value, customerData.value.phoneCountry)
  customerData.value.phone = formatted
}

const handleDniInput = (event) => {
  let value = event.target.value
  value = value.replace(/[^0-9-]/g, '')
  customerData.value.dni = value.substring(0, 15)
}

// Funciones para el dropdown del modal de dirección
const toggleAddressPhoneDropdown = () => {
  showAddressPhoneDropdown.value = !showAddressPhoneDropdown.value
}

const closeAddressPhoneDropdown = () => {
  showAddressPhoneDropdown.value = false
}

const selectAddressPhoneCountry = (countryId) => {
  addressForm.value.phoneCountry = countryId
  addressForm.value.phone = ''
  showAddressPhoneDropdown.value = false
}

const handleAddressPhoneInput = (event) => {
  let value = event.target.value
  value = value.replace(/[^0-9]/g, '')
  const formatted = formatPhoneByCountry(value, addressForm.value.phoneCountry)
  addressForm.value.phone = formatted
}

// Función para auto-formatear RTN
const handleRtnInput = (event) => {
  let value = event.target.value
  // Solo permitir números
  value = value.replace(/[^0-9]/g, '')

  // Auto-formatear RTN: 0000-0000-000000 (4-4-6 dígitos)
  let formatted = ''
  if (value.length > 8) {
    formatted = value.substring(0, 4) + '-' + value.substring(4, 8) + '-' + value.substring(8, 14)
  } else if (value.length > 4) {
    formatted = value.substring(0, 4) + '-' + value.substring(4, 8)
  } else {
    formatted = value.substring(0, 4)
  }

  billingForm.value.rtn = formatted
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
      phoneCountry: customer.phone_country || '+504-hn',
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
    phoneCountry: address.phone_country || '+504-hn',
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
  showAddressPhoneDropdown.value = false
  addressForm.value = {
    address_label: '',
    recipient_name: '',
    phone: '',
    phoneCountry: '+504-hn',
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

const removeFavorite = (productId) => {
  productToRemove.value = productId
  showRemoveFavoriteModal.value = true
}

const confirmRemoveFavorite = async () => {
  try {
    const token = localStorage.getItem('ecommerce_token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await axios.delete(
      `http://localhost:3000/api/v1/ecommerce/favorites/${productToRemove.value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      await loadFavorites()
      showRemoveFavoriteModal.value = false
      productToRemove.value = null
    }
  } catch (error) {
    console.error('Error al eliminar favorito:', error)
    alert('Error al eliminar el producto de favoritos. Por favor intente nuevamente.')
  }
}

const cancelRemoveFavorite = () => {
  showRemoveFavoriteModal.value = false
  productToRemove.value = null
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
      // Filtrar pedidos cancelados - solo mostrar pendiente, cotizado y cobrado
      orders.value = response.data.data.filter(order => order.status !== 'cancelado')
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
    cobrado: 'Pagado',
    cancelado: 'Cancelado'
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

const showStatusHistoryForOrder = async (order) => {
  if (!order?.id) {
    console.error('No se encontró el ID del pedido')
    return
  }

  try {
    loadingHistory.value = true
    statusHistory.value = []

    const token = localStorage.getItem('ecommerce_token')
    if (!token) {
      alert('Debes iniciar sesión para ver el historial')
      return
    }

    console.log('Solicitando historial para pedido ID:', order.id)

    const response = await axios.get(
      `http://localhost:3000/api/v1/ecommerce/orders/${order.id}/status-history`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    console.log('Respuesta del historial:', response.data)

    if (response.data.success) {
      statusHistory.value = response.data.data || []
    }

    showStatusHistoryModal.value = true

  } catch (error) {
    console.error('Error al cargar historial:', error)
    if (error.response) {
      console.error('Error response:', error.response.data)
      alert(`Error: ${error.response.data.message || 'Error al cargar el historial'}`)
    } else {
      alert('Error al cargar el historial. Por favor, intenta de nuevo.')
    }
  } finally {
    loadingHistory.value = false
  }
}

const closeStatusHistoryModal = () => {
  showStatusHistoryModal.value = false
  statusHistory.value = []
}

// Funciones de cancelación de pedidos
const openCancelOrderModal = (order) => {
  orderToCancel.value = order
  cancellationReason.value = ''
  showCancelOrderModal.value = true
}

const closeCancelOrderModal = () => {
  showCancelOrderModal.value = false
  orderToCancel.value = null
  cancellationReason.value = ''
}

const confirmCancelOrder = async () => {
  if (!cancellationReason.value.trim()) {
    alert('Por favor indica el motivo de cancelación')
    return
  }

  try {
    cancellingOrder.value = true
    const token = localStorage.getItem('ecommerce_token')
    if (!token) {
      alert('Debes iniciar sesión')
      return
    }

    const response = await axios.post(
      `http://localhost:3000/api/v1/ecommerce/orders/${orderToCancel.value.order_number}/cancel`,
      {
        cancellation_reason: cancellationReason.value.trim()
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      // Actualizar la lista de pedidos
      await loadOrders()

      // Cerrar modal
      closeCancelOrderModal()

      // Mostrar modal de éxito
      showCancelSuccessModal.value = true
    }

  } catch (error) {
    console.error('Error al cancelar pedido:', error)
    const errorMessage = error.response?.data?.message || 'Error al cancelar el pedido. Por favor, intenta de nuevo.'
    alert(errorMessage)
  } finally {
    cancellingOrder.value = false
  }
}

const formatWhatsAppMessageForOrder = (order) => {
  const dateStr = new Date(order.created_at).toLocaleDateString('es-HN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timeStr = new Date(order.created_at).toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit', hour12: true })

  let message = 'Hola! Vengo de la Tienda en Linea\n\n'
  message += '*Pedido: ' + order.order_number + '*\n\n'
  message += dateStr + ' ' + timeStr + '\n\n'

  // Tipo de servicio
  if (order.delivery_address === 'Recoger en tienda') {
    message += '*Tipo de servicio: Recoger en Tienda*\n\n'
  } else {
    message += '*Tipo de servicio: Entrega a Domicilio*\n\n'
  }

  // Información del cliente
  message += 'Nombre: ' + order.customer_name + '\n'
  if (order.customer_dni) {
    message += 'DNI: ' + order.customer_dni + '\n'
  }
  if (order.customer_phone) {
    message += 'Telefono: 504 ' + order.customer_phone + '\n'
  }
  if (order.customer_email) {
    message += 'Correo: ' + order.customer_email + '\n'
  }
  message += '\n'

  // Tipo de factura
  message += '*Factura*\n'
  message += 'Tipo: ' + (order.invoice_type || 'Consumidor Final') + '\n'
  if (order.invoice_type === 'Con RTN' && order.business_name) {
    message += 'Razon Social: ' + order.business_name + '\n'
    message += 'RTN: ' + (order.rtn || '00000000000000') + '\n'
  }
  message += '\n'

  // Información de entrega a domicilio
  if (order.delivery_address !== 'Recoger en tienda') {
    message += '*Entrega:*\n'
    if (order.department) {
      message += 'Departamento: ' + order.department + '\n'
    }
    if (order.city) {
      message += 'Municipio: ' + order.city + '\n'
    }
    message += 'Direccion: ' + order.delivery_address + '\n'
    if (order.receiver_name) {
      message += 'Recibe: ' + order.receiver_name + '\n'
    }
    if (order.receiver_phone) {
      message += 'Telefono de quien recibe: ' + order.receiver_phone + '\n'
    }
    if (order.notes && order.notes.trim()) {
      message += 'Notas: ' + order.notes + '\n'
    }
    message += '\n'
  }

  // Productos
  message += '*Productos*\n'
  if (order.items && order.items.length > 0) {
    order.items.forEach(item => {
      message += 'X' + item.quantity + ' ' + item.product_name + ' L ' + parseFloat(item.subtotal).toFixed(2) + '\n'
    })
  }
  message += '\n'

  // Total
  message += '*Total a pagar: L ' + parseFloat(order.total_amount).toFixed(2) + '*\n\n'

  // Método de pago
  message += '*Pago*\n'
  message += 'Tipo de pago: ' + (order.payment_method || 'Efectivo') + '\n'

  if (order.payment_method === 'Transferencia') {
    message += 'Pagos con transferencia (Cuentas en Banco Atlantida, BAC Credomatic, Davivienda, Banpais) Haznos saber cual prefieres.\n'
  }
  message += '\n'

  // Comentarios adicionales
  if (order.additional_comments && order.additional_comments.trim()) {
    message += '*Comentarios adicionales:*\n'
    message += order.additional_comments + '\n\n'
  }

  message += 'Gracias! Envianos este mensaje. En cuanto lo recibamos estaremos atendiendole.'

  return message
}

const shareOrderViaWhatsApp = async (order) => {
  if (!order?.order_number) {
    console.error('No se encontró el número de pedido')
    return
  }

  try {
    loadingWhatsApp.value = true

    // Generar mensaje de WhatsApp
    const message = formatWhatsAppMessageForOrder(order)
    const encodedMessage = encodeURIComponent(message)
    const whatsappNumber = '50498752725' // Número de WhatsApp de la tienda
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank')

  } catch (error) {
    console.error('Error al generar URL de WhatsApp:', error)
    alert('Error al generar el enlace de WhatsApp. Por favor, intenta de nuevo.')
  } finally {
    loadingWhatsApp.value = false
  }
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

/* Estilos para teléfono con selector de país */
.phone-input-container {
  display: flex;
  gap: 0.5rem;
}

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

.char-counter {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #666;
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
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.address-form-modal .modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
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

.address-form-modal .modal-content {
  position: relative;
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
  z-index: 9999;
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

.status-cancelado {
  background: #f8d7da;
  color: #721c24;
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
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-view-order {
  display: inline-block;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s;
  cursor: pointer;
}

.btn-view-order:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-whatsapp-order-card {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #25D366;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s;
  cursor: pointer;
}

.btn-whatsapp-order-card:hover:not(:disabled) {
  background: #20BA5A;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
}

.btn-whatsapp-order-card:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-whatsapp-order-card i {
  font-size: 1.2rem;
}

.btn-history-order-card {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #0d6efd;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s;
  cursor: pointer;
}

.btn-history-order-card:hover:not(:disabled) {
  background: #0b5ed7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.4);
}

.btn-cancel-order-card {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s;
  cursor: pointer;
}

.btn-cancel-order-card:hover {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

.btn-cancel-order-card i {
  font-size: 1rem;
}

.btn-danger-order {
  padding: 0.75rem 1.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-danger-order:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.btn-danger-order:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert-warning {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 1rem;
  color: #856404;
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-history-order-card:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-history-order-card i {
  font-size: 1.2rem;
}

/* Modal de Pedido Cancelado Exitosamente */
.cart-success-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 450px;
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

.cart-modal-content {
  padding: 2.5rem 2rem;
  text-align: center;
}

.success-icon-cancel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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

.cart-modal-content h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.cart-message {
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.modal-buttons-single {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-continue-cancel {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  min-width: 180px;
}

.btn-continue-cancel:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.btn-continue-cancel:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .cart-success-modal {
    max-width: 95%;
  }

  .cart-modal-content {
    padding: 2rem 1.5rem;
  }

  .cart-modal-content h2 {
    font-size: 1.5rem;
  }

  .btn-continue-cancel {
    max-width: 100%;
  }
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

.modal-overlay-order {
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
  animation: fadeIn 0.3s ease;
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
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 0;
}

.modal-header-order {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header-order .modal-title,
.modal-header-order h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
}

.btn-close-order,
.modal-close-order {
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
  transition: all 0.3s;
}

.btn-close-order:hover,
.modal-close-order:hover {
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

.btn-whatsapp-order {
  padding: 0.75rem 1.5rem;
  background: #25D366;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-whatsapp-order:hover:not(:disabled) {
  background: #20BA5A;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(37, 211, 102, 0.3);
}

.btn-whatsapp-order:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-whatsapp-order i {
  font-size: 1.2rem;
}

/* Estilos para la tabla de historial */
.table-responsive {
  overflow-x: auto;
  margin-top: 1rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.table thead {
  background: #f8f9fa;
}

.table th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
}

.table td {
  padding: 0.75rem;
  border-bottom: 1px solid #dee2e6;
  color: #666;
}

.table tbody tr:hover {
  background: #f8f9fa;
}

/* Estilos Bootstrap para botones */
.btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: all 0.15s ease-in-out;
  cursor: pointer;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border-radius: 0.2rem;
}

.btn-outline-primary {
  color: #667eea;
  border-color: #667eea;
  background-color: transparent;
}

.btn-outline-primary:hover {
  color: #fff;
  background-color: #667eea;
  border-color: #667eea;
}

/* Utilidades de espaciado */
.ms-1 { margin-left: 0.25rem; }
.ms-2 { margin-left: 0.5rem; }
.ms-3 { margin-left: 1rem; }
.me-1 { margin-right: 0.25rem; }
.me-2 { margin-right: 0.5rem; }
.me-3 { margin-right: 1rem; }
.mt-3 { margin-top: 1rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-4 { margin-bottom: 1.5rem; }

.spinner-border {
  width: 2rem;
  height: 2rem;
  border: 0.25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.alert-info {
  background: #d1ecf1;
  color: #0c5460;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #bee5eb;
}

.text-center {
  text-align: center;
}

.py-4 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
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

  .table {
    font-size: 0.875rem;
  }

  .table th,
  .table td {
    padding: 0.5rem;
  }
}

/* Modal de confirmación para quitar de favoritos */
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
  z-index: 10000;
}

.confirmation-modal {
  background: white;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.confirmation-modal .modal-icon {
  width: 80px;
  height: 80px;
  background: #ff6b6b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.confirmation-modal .modal-icon i {
  font-size: 2.5rem;
  color: white;
}

.confirmation-modal h3 {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.confirmation-modal p {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-confirm-remove {
  background: #1abc9c;
  color: white;
  border: none;
  padding: 0.75rem 2.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(26, 188, 156, 0.3);
}

.btn-confirm-remove:hover {
  background: #16a085;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(26, 188, 156, 0.4);
}

.btn-cancel-remove {
  background: white;
  color: #7f8c8d;
  border: 2px solid #e0e0e0;
  padding: 0.75rem 2.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel-remove:hover {
  background: #f8f9fa;
  border-color: #bdc3c7;
  color: #5a6c7d;
}

/* Estilo para la unidad en el detalle del pedido */
.unit-text {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}
</style>
