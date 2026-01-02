<template>
  <div class="main-wrapper">
    <layout-header></layout-header>
    <layout-sidebar></layout-sidebar>

    <div class="page-wrapper">
      <div class="content">
        <div class="page-header">
          <div class="add-item d-flex">
            <div class="page-title">
              <h4>Mi Carrito</h4>
              <h6>Gestiona los productos de tu carrito</h6>
            </div>
          </div>
          <ul class="table-top-head">
            <li>
              <div class="page-btn">
                <router-link to="/ecommerce/catalog" class="btn btn-secondary">
                  <i class="ti ti-arrow-left me-2"></i>
                  Continuar Comprando
                </router-link>
              </div>
            </li>
          </ul>
        </div>

      <div v-if="loading" class="loading">
        <i class="mdi mdi-loading mdi-spin"></i>
        Cargando carrito...
      </div>

      <div v-else-if="!cart || cart.items.length === 0" class="empty-cart">
        <i class="mdi mdi-cart-outline"></i>
        <h2>Tu carrito está vacío</h2>
        <p>Agrega productos para hacer un pedido</p>
        <router-link to="/shop" class="btn-shop">
          Ir a la Tienda
        </router-link>
      </div>

      <div v-else class="cart-content">
        <div class="cart-items">
          <div
            v-for="item in cart.items"
            :key="item.cart_id"
            class="cart-item"
          >
            <div class="item-image">
              <img
                :src="item.product_image || '/placeholder-product.png'"
                :alt="item.product_name"
                @error="handleImageError"
              />
            </div>

            <div class="item-info">
              <h3>{{ item.product_name }}</h3>
              <p class="item-code">Código: {{ item.product_code }}</p>
              <p class="item-price">L{{ formatPrice(item.unit_price) }}</p>
              <p v-if="item.tax_rate > 0" class="item-tax">
                + {{ item.tax_rate }}% ISV
              </p>
            </div>

            <div class="item-quantity">
              <button @click="updateQuantity(item, item.quantity - 1)">
                <i class="mdi mdi-minus"></i>
              </button>
              <input
                :value="item.quantity"
                @change="updateQuantity(item, $event.target.value)"
                type="number"
                min="1"
                :max="item.stock_available"
              />
              <button @click="updateQuantity(item, item.quantity + 1)">
                <i class="mdi mdi-plus"></i>
              </button>
            </div>

            <div class="item-total">
              <p class="total-label">Subtotal:</p>
              <p class="total-amount">L{{ formatPrice(item.total) }}</p>
            </div>

            <button @click="removeItem(item)" class="btn-remove">
              <i class="mdi mdi-delete"></i>
            </button>
          </div>
        </div>

        <div class="cart-summary">
          <h2>Resumen del Pedido</h2>

          <div class="summary-row">
            <span>Subtotal:</span>
            <span>L{{ formatPrice(cart.summary.subtotal) }}</span>
          </div>

          <div class="summary-row">
            <span>ISV:</span>
            <span>L{{ formatPrice(cart.summary.tax_amount) }}</span>
          </div>

          <div class="summary-row summary-total">
            <span>Total:</span>
            <span>L{{ formatPrice(cart.summary.total) }}</span>
          </div>

          <button @click="goToCheckout" class="btn-checkout">
            Proceder al Pedido
            <i class="mdi mdi-arrow-right"></i>
          </button>

          <button @click="clearCart" class="btn-clear">
            Vaciar Carrito
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
import { cartService } from '@/api/ecommerce'

export default {
  name: 'ShopCart',
  setup() {
    const router = useRouter()

    const cart = ref(null)
    const loading = ref(false)

    const loadCart = async () => {
      try {
        loading.value = true
        const response = await cartService.getCart()
        if (response.success) {
          cart.value = response.data
        }
      } catch (error) {
        console.error('Error loading cart:', error)
        alert('Error al cargar el carrito')
      } finally {
        loading.value = false
      }
    }

    const updateQuantity = async (item, newQuantity) => {
      const quantity = parseInt(newQuantity)

      if (quantity < 1) {
        return removeItem(item)
      }

      if (quantity > item.stock_available) {
        alert(`Stock máximo disponible: ${item.stock_available}`)
        return
      }

      try {
        await cartService.updateQuantity(item.product_id, quantity)
        await loadCart()
      } catch (error) {
        console.error('Error updating quantity:', error)
        alert(error.response?.data?.message || 'Error al actualizar cantidad')
      }
    }

    const removeItem = async (item) => {
      if (!confirm('¿Eliminar este producto del carrito?')) {
        return
      }

      try {
        await cartService.removeItem(item.product_id)
        await loadCart()
      } catch (error) {
        console.error('Error removing item:', error)
        alert('Error al eliminar producto')
      }
    }

    const clearCart = async () => {
      if (!confirm('¿Vaciar todo el carrito?')) {
        return
      }

      try {
        await cartService.clearCart()
        await loadCart()
      } catch (error) {
        console.error('Error clearing cart:', error)
        alert('Error al vaciar carrito')
      }
    }

    const goToCheckout = () => {
      router.push('/shop/checkout')
    }

    const formatPrice = (price) => {
      return parseFloat(price || 0).toFixed(2)
    }

    const handleImageError = (e) => {
      e.target.src = '/placeholder-product.png'
    }

    onMounted(() => {
      loadCart()
    })

    return {
      cart,
      loading,
      updateQuantity,
      removeItem,
      clearCart,
      goToCheckout,
      formatPrice,
      handleImageError
    }
  }
}
</script>

<style scoped>

.loading,
.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
}

.empty-cart i {
  font-size: 4rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.empty-cart h2 {
  color: #666;
  margin-bottom: 0.5rem;
}

.empty-cart p {
  color: #999;
  margin-bottom: 2rem;
}

.btn-shop {
  display: inline-block;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-shop:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 100px 1fr auto auto auto;
  gap: 1.5rem;
  align-items: center;
}

.item-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
}

.item-code {
  color: #999;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.item-price {
  color: #667eea;
  font-weight: bold;
  font-size: 1.1rem;
  margin: 0;
}

.item-tax {
  color: #999;
  font-size: 0.8rem;
  margin: 0;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-quantity button {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.item-quantity button:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.item-quantity input {
  width: 60px;
  height: 32px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-weight: 500;
}

.item-total {
  text-align: right;
}

.total-label {
  color: #999;
  font-size: 0.85rem;
  margin: 0 0 0.25rem 0;
}

.total-amount {
  color: #333;
  font-weight: bold;
  font-size: 1.25rem;
  margin: 0;
}

.btn-remove {
  width: 40px;
  height: 40px;
  border: none;
  background: #ff4444;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-remove:hover {
  background: #cc0000;
  transform: scale(1.1);
}

.cart-summary {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.cart-summary h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
}

.summary-total {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  border-bottom: none;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e0e0e0;
}

.btn-checkout {
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
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-checkout:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-clear {
  width: 100%;
  padding: 0.75rem;
  background: white;
  color: #ff4444;
  border: 1px solid #ff4444;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 0.5rem;
}

.btn-clear:hover {
  background: #ff4444;
  color: white;
}

@media (max-width: 968px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }

  .cart-item {
    grid-template-columns: 80px 1fr;
    gap: 1rem;
  }

  .item-quantity,
  .item-total {
    grid-column: 2;
  }

  .btn-remove {
    grid-column: 2;
    justify-self: end;
  }
}
</style>
