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
          <div class="step-label">INGRESA TU CORREO</div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-label">ENVÍO Y PAGO</div>
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
                      <input type="number" v-model.number="item.quantity" @change="saveCart" min="1" class="qty-input" />
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
              <input type="text" v-model="promoCode" placeholder="Código" class="promo-input" />
              <button @click="applyPromo" class="btn-apply">Aplicar</button>
            </div>

            <div class="summary-totals">
              <div class="summary-row">
                <span>Subtotal</span>
                <span class="amount">L {{ formatPrice(subtotal) }}</span>
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

const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const taxAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity
    const itemTax = itemTotal * ((item.tax_rate || 0) / 100)
    return sum + itemTax
  }, 0)
})

const total = computed(() => {
  return subtotal.value + taxAmount.value
})

const loadCart = () => {
  const savedCart = localStorage.getItem('ecommerce_cart')
  if (savedCart) {
    try {
      cartItems.value = JSON.parse(savedCart)
    } catch (error) {
      cartItems.value = []
    }
  }
}

const saveCart = () => {
  localStorage.setItem('ecommerce_cart', JSON.stringify(cartItems.value))
  window.dispatchEvent(new Event('cart-updated'))
}

const updateQuantity = (item, change) => {
  const newQuantity = item.quantity + change
  if (newQuantity > 0) {
    item.quantity = newQuantity
    saveCart()
  }
}

const removeItem = (item) => {
  const index = cartItems.value.findIndex(i => i.product_id === item.product_id)
  if (index > -1) {
    cartItems.value.splice(index, 1)
    saveCart()
  }
}

const applyPromo = () => {
  if (promoCode.value.trim()) {
    alert('Función de código promocional en desarrollo')
  }
}

const proceedToCheckout = () => {
  router.push('/shop/checkout')
}

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2)
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

onMounted(() => {
  loadCart()
  fetchCompanyInfo()
  window.addEventListener('cart-updated', loadCart)
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
  max-width: 140px;
}

.qty-btn {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  width: 35px;
  height: 35px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.qty-btn:hover {
  background: var(--primary-color, #FF9F43);
  color: white;
  border-color: var(--primary-color, #FF9F43);
}

.qty-input {
  width: 60px;
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

.total-row {
  font-size: 1.2rem;
  font-weight: 700;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.amount {
  font-weight: 700;
  color: #000;
}

.btn-checkout-full {
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
}

.btn-checkout-full:hover:not(:disabled) {
  background: #333;
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
