<template>
  <div class="cart-page">
    <ShopHeader />

    <div class="container-fluid px-4 py-5">
      <!-- Progress Steps -->
      <div class="checkout-steps mb-5">
        <div class="step active">
          <div class="step-number">1</div>
          <div class="step-label">CARRITO DE COMPRA</div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-label">IDENTIFICACIÓN</div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-label">ENVÍO</div>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-label">CONFIRMACIÓN</div>
        </div>
      </div>

      <div class="row">
        <!-- Cart Items Table -->
        <div class="col-lg-8">
          <div class="cart-table-wrapper">
            <table class="cart-table" v-if="cartItems.length > 0">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in cartItems" :key="item.product_id" class="cart-row">
                  <td class="product-cell">
                    <div class="product-info">
                      <img :src="item.image || '/placeholder-product.png'" :alt="item.name" class="product-img" />
                      <div class="product-details">
                        <h4>{{ item.name }}</h4>
                        <p class="product-meta">Código: {{ item.code }}</p>
                        <p class="product-meta" v-if="item.category">Categoría: {{ item.category }}</p>
                        <p class="product-meta" v-if="item.subcategory">Subcategoría: {{ item.subcategory }}</p>
                        <p class="product-meta" v-if="item.brand">Marca: {{ item.brand }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="quantity-cell">
                    <div class="quantity-controls">
                      <button @click="updateQuantity(item, -1)" class="qty-btn">-</button>
                      <input
                        type="number"
                        v-model.number="item.quantity"
                        @blur="validateItemQuantity(item)"
                        min="0.01"
                        step="0.01"
                        class="qty-input"
                      />
                      <span class="unit-label">{{ item.unit || 'UNIDAD' }}</span>
                      <button @click="updateQuantity(item, 1)" class="qty-btn">+</button>
                    </div>
                  </td>
                  <td class="price-cell">
                    <span class="price">L {{ formatPrice(item.price * item.quantity) }}</span>
                  </td>
                  <td class="remove-cell">
                    <button @click="removeItem(item)" class="btn-remove">
                      <i class="ti ti-x"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="cartItems.length === 0" class="empty-cart">
              <i class="ti ti-shopping-cart-off"></i>
              <p>Tu carrito está vacío</p>
              <router-link to="/shop/catalog" class="btn-continue-shopping">
                Continuar comprando
              </router-link>
            </div>
          </div>
        </div>

        <!-- Summary Sidebar -->
        <div class="col-lg-4">
          <div class="summary-card">
            <h3>¿Tienes un código de promoción?</h3>
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
              <h4>Ofertas Aplicadas</h4>
              <div v-for="offer in activeOffers" :key="offer.id" class="offer-item">
                <i class="ti ti-tag"></i>
                <span>{{ offer.name }}</span>
                <span class="offer-discount">-L {{ formatPrice(offer.discount_amount) }}</span>
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

              <!-- Subtotal after discounts -->
              <div v-if="totalDiscount > 0" class="summary-row subtotal-after-discount">
                <span>Subtotal con descuentos</span>
                <span class="amount">L {{ formatPrice(subtotalAfterDiscount) }}</span>
              </div>

              <div class="summary-row">
                <span>ISV (15%)</span>
                <span class="amount">L {{ formatPrice(taxAmount) }}</span>
              </div>
              <div class="summary-row total-row">
                <span>Total</span>
                <span class="amount">L {{ formatPrice(total) }}</span>
              </div>
            </div>

            <button @click="proceedToCheckout" class="btn-checkout-full" :disabled="cartItems.length === 0">
              Continuar con el pedido
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ShopHeader from '@/components/ShopHeader.vue'

const router = useRouter()
const cartItems = ref([])
const promoCode = ref('')
const companyInfo = ref(null)
const appliedCoupons = ref([])
const activeOffers = ref([])
const couponError = ref('')
const isValidatingCoupon = ref(false)

// Prices are base prices WITHOUT tax - need to add 15%
const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
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

const total = computed(() => {
  // Total = Subtotal - Discounts + Tax
  return subtotalAfterDiscount.value + taxAmount.value
})

const loadCart = async () => {
  const savedCart = localStorage.getItem('ecommerce_cart')
  if (savedCart) {
    try {
      const cart = JSON.parse(savedCart)

      // Fix cart items that don't have category_id or subcategory_id
      const fixedCart = []
      for (const item of cart) {
        if (!item.category_id || !item.subcategory_id) {
          // Fetch product data from API to get missing IDs
          try {
            const response = await axios.get(`http://localhost:3000/api/v1/ecommerce/products/${item.product_id}`)
            if (response.data.success && response.data.data) {
              const product = response.data.data
              fixedCart.push({
                ...item,
                category_id: product.category_id || null,
                subcategory_id: product.subcategory_id || null,
                category: product.category_name || item.category || '',
                subcategory: product.subcategory_name || item.subcategory || ''
              })
            } else {
              fixedCart.push(item)
            }
          } catch (error) {
            console.error(`Error fetching product ${item.product_id}:`, error)
            fixedCart.push(item)
          }
        } else {
          fixedCart.push(item)
        }
      }

      cartItems.value = fixedCart
      // Save fixed cart back to localStorage
      localStorage.setItem('ecommerce_cart', JSON.stringify(fixedCart))
    } catch (error) {
      cartItems.value = []
    }
  }
}

const saveCart = () => {
  localStorage.setItem('ecommerce_cart', JSON.stringify(cartItems.value))
  window.dispatchEvent(new Event('cart-updated'))
  // Re-validar cupones cuando cambia el carrito
  revalidateCoupons()
  // Re-cargar ofertas cuando cambia el carrito
  loadActiveOffers()
}

const updateQuantity = (item, change) => {
  const newQuantity = parseFloat((item.quantity + change).toFixed(2))
  if (newQuantity >= 0.01) {
    item.quantity = newQuantity
    saveCart()
  }
}

const validateItemQuantity = (item) => {
  let value = parseFloat(item.quantity)

  if (isNaN(value) || value < 0.01) {
    item.quantity = 0.01
  } else {
    item.quantity = parseFloat(value.toFixed(2))
  }

  saveCart()
}

const removeItem = (item) => {
  const index = cartItems.value.findIndex(i => i.product_id === item.product_id)
  if (index > -1) {
    cartItems.value.splice(index, 1)
    saveCart()
  }
}

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
  if (appliedCoupons.value.some(c => c.code.toUpperCase() === couponCode)) {
    couponError.value = 'Este cupón ya está aplicado'
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

    if (response.data.success) {
      const newCoupon = response.data.data.coupon
      appliedCoupons.value.push(newCoupon)
      promoCode.value = ''
      couponError.value = ''
      // Save to localStorage for checkout
      localStorage.setItem('applied_coupons', JSON.stringify(appliedCoupons.value))
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

const revalidateCoupons = async () => {
  if (appliedCoupons.value.length === 0 || cartItems.value.length === 0) {
    // Si no hay cupones o el carrito está vacío, limpiar cupones
    if (cartItems.value.length === 0 && appliedCoupons.value.length > 0) {
      appliedCoupons.value = []
      localStorage.removeItem('applied_coupons')
    }
    return
  }

  // Re-validar cada cupón
  const validatedCoupons = []

  for (const coupon of appliedCoupons.value) {
    try {
      const cartData = {
        code: coupon.code,
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

      if (response.data.success) {
        // El cupón sigue siendo válido, actualizar con nuevo descuento
        validatedCoupons.push(response.data.data.coupon)
      }
      // Si no es válido, simplemente no lo agregamos a validatedCoupons
    } catch (error) {
      // Si hay error (cupón ya no válido), no lo agregamos
      console.log(`Cupón ${coupon.code} ya no es válido`)
    }
  }

  // Actualizar solo con cupones válidos
  appliedCoupons.value = validatedCoupons
  if (validatedCoupons.length > 0) {
    localStorage.setItem('applied_coupons', JSON.stringify(validatedCoupons))
  } else {
    localStorage.removeItem('applied_coupons')
  }
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
      // Save to localStorage for checkout
      localStorage.setItem('active_offers', JSON.stringify(activeOffers.value))
    }
  } catch (error) {
    console.error('Error loading active offers:', error)
    activeOffers.value = []
  }
}

const proceedToCheckout = () => {
  router.push('/shop/checkout')
}

const formatPrice = (price) => {
  if (!price && price !== 0) return '0.00'
  return parseFloat(price).toLocaleString('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
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

onMounted(async () => {
  await loadCart()
  fetchCompanyInfo()

  // Load saved coupons and offers
  const savedCoupons = localStorage.getItem('applied_coupons')
  if (savedCoupons) {
    try {
      appliedCoupons.value = JSON.parse(savedCoupons)
      // Re-validar cupones guardados al cargar la página
      await revalidateCoupons()
    } catch (e) {
      localStorage.removeItem('applied_coupons')
    }
  }

  // Load active offers
  await loadActiveOffers()

  window.addEventListener('cart-updated', async () => {
    await loadCart()
    await loadActiveOffers()
    await revalidateCoupons()
  })
})
</script>

<style scoped>
.cart-page {
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

.step.active {
  opacity: 1;
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

.cart-table-wrapper {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.cart-table {
  width: 100%;
  border-collapse: collapse;
}

.cart-table thead th {
  text-align: left;
  padding: 1rem;
  border-bottom: 2px solid #e0e0e0;
  font-weight: 600;
  color: #333;
}

.cart-row {
  border-bottom: 1px solid #e0e0e0;
}

.cart-row:last-child {
  border-bottom: none;
}

.product-cell {
  padding: 1.5rem 1rem;
}

.product-info {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.product-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.product-details h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.product-meta {
  margin: 0.25rem 0;
  font-size: 0.85rem;
  color: #666;
}

.quantity-cell {
  padding: 1.5rem 1rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 180px;
}

.qty-btn {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.2rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover {
  background: var(--primary-color, #FF9F43);
  color: white;
  border-color: var(--primary-color, #FF9F43);
}

.qty-input {
  width: 70px;
  height: 40px;
  text-align: center;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.qty-input:focus {
  outline: none;
  border-color: var(--primary-color, #FF9F43);
}

.quantity-controls .unit-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
  min-width: 40px;
}

.price-cell {
  padding: 1.5rem 1rem;
  text-align: left;
}

.price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #000;
}

.remove-cell {
  padding: 1.5rem 1rem;
  text-align: center;
}

.btn-remove {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.5rem;
  transition: color 0.2s;
}

.btn-remove:hover {
  color: #dc2626;
}

.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
}

.empty-cart i {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.empty-cart p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.btn-continue-shopping {
  display: inline-block;
  padding: 1rem 2rem;
  background: var(--primary-color, #FF9F43);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-continue-shopping:hover {
  background: var(--primary-dark, #e68a2e);
  transform: translateY(-2px);
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
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.promo-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
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
  font-size: 1.2rem;
}

.btn-remove-single-coupon:hover {
  background: rgba(21, 87, 36, 0.1);
  color: #0d3d1a;
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
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
}

.active-offers h4 {
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
  padding-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.discount-row {
  color: #28a745;
}

.discount-row .discount {
  color: #28a745;
  font-weight: 700;
}

.subtotal-after-discount {
  padding-top: 0.5rem;
  margin-top: 0.5rem;
  border-top: 1px solid #e0e0e0;
  font-weight: 600;
  color: #333;
}

.total-row {
  font-size: 1.2rem;
  font-weight: 700;
  padding-top: 1rem;
  border-top: 2px solid #333;
  margin-top: 0.5rem;
}

.amount {
  font-weight: 700;
  color: #000;
}

.btn-checkout-full {
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
}

.btn-checkout-full:hover:not(:disabled) {
  background: var(--primary-dark, #e68a2e);
}

.btn-checkout-full:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .checkout-steps {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .step-label {
    font-size: 0.7rem;
  }

  .cart-table {
    display: block;
    overflow-x: auto;
  }

  .product-info {
    flex-direction: column;
    text-align: center;
  }

  .summary-card {
    position: static;
  }
}
</style>
