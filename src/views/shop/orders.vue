<template>
  <div class="main-wrapper">
    <layout-header></layout-header>
    <layout-sidebar></layout-sidebar>

    <div class="page-wrapper">
      <div class="content">
        <div class="page-header">
          <div class="add-item d-flex">
            <div class="page-title">
              <h4>Mis Pedidos</h4>
              <h6>Historial de pedidos realizados</h6>
            </div>
          </div>
          <ul class="table-top-head">
            <li>
              <div class="page-btn">
                <router-link to="/ecommerce/catalog" class="btn btn-secondary">
                  <i class="ti ti-arrow-left me-2"></i>
                  Volver a la Tienda
                </router-link>
              </div>
            </li>
          </ul>
        </div>

      <div v-if="loading" class="loading">
        <i class="mdi mdi-loading mdi-spin"></i>
        Cargando pedidos...
      </div>

      <div v-else-if="!orders || orders.length === 0" class="no-orders">
        <i class="mdi mdi-package-variant-closed"></i>
        <h2>No tienes pedidos aún</h2>
        <p>Realiza tu primer pedido en nuestra tienda</p>
        <router-link to="/shop" class="btn-shop">
          Ir a la Tienda
        </router-link>
      </div>

      <div v-else class="orders-list">
        <div
          v-for="order in orders"
          :key="order.id"
          class="order-card"
        >
          <div class="order-header">
            <div class="order-info">
              <h3>Pedido {{ order.order_number }}</h3>
              <p class="order-date">
                <i class="mdi mdi-calendar"></i>
                {{ formatDate(order.created_at) }}
              </p>
            </div>
            <div class="order-status">
              <span :class="['status-badge', `status-${order.status}`]">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
          </div>

          <div class="order-body">
            <div class="order-details">
              <p class="detail-item">
                <strong>Total:</strong>
                <span class="total-amount">L{{ formatPrice(order.total) }}</span>
              </p>
              <p class="detail-item">
                <strong>Estado de Pago:</strong>
                <span :class="['payment-status', `payment-${order.payment_status}`]">
                  {{ getPaymentStatusLabel(order.payment_status) }}
                </span>
              </p>
              <p v-if="order.customer_notes" class="detail-item notes">
                <strong>Notas:</strong>
                {{ order.customer_notes }}
              </p>
            </div>

            <div class="order-actions">
              <router-link
                :to="`/shop/orders/${order.order_number}`"
                class="btn-view"
              >
                <i class="mdi mdi-eye"></i>
                Ver Detalles
              </router-link>

              <button
                v-if="order.status === 'pending' || order.status === 'pendiente'"
                @click="cancelOrder(order)"
                class="btn-cancel"
              >
                <i class="mdi mdi-close-circle"></i>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ordersService } from '@/api/ecommerce'

export default {
  name: 'ShopOrders',
  setup() {
    const router = useRouter()

    const orders = ref([])
    const loading = ref(false)

    const loadOrders = async () => {
      try {
        loading.value = true
        const response = await ordersService.getMyOrders({ limit: 50 })
        if (response.success) {
          orders.value = response.data
        }
      } catch (error) {
        console.error('Error loading orders:', error)
        alert('Error al cargar pedidos')
      } finally {
        loading.value = false
      }
    }

    const cancelOrder = async (order) => {
      if (!confirm(`¿Estás seguro de cancelar el pedido ${order.order_number}?`)) {
        return
      }

      const reason = prompt('Motivo de cancelación (opcional):')

      try {
        await ordersService.cancelOrder(order.order_number, reason || 'Cancelado por el cliente')
        alert('Pedido cancelado')
        await loadOrders()
      } catch (error) {
        console.error('Error cancelling order:', error)
        alert(error.response?.data?.message || 'Error al cancelar pedido')
      }
    }

    const getStatusLabel = (status) => {
      const labels = {
        pending: 'Pendiente',
        pendiente: 'Pendiente',
        confirmed: 'Confirmado',
        cotizado: 'Cotizado',
        processing: 'En Proceso',
        shipped: 'Enviado',
        delivered: 'Entregado',
        cobrado: 'Cobrado/Pagado',
        cancelled: 'Cancelado'
      }
      return labels[status] || status
    }

    const getPaymentStatusLabel = (status) => {
      const labels = {
        pending: 'Pendiente',
        paid: 'Pagado',
        refunded: 'Reembolsado'
      }
      return labels[status] || status
    }

    const formatPrice = (price) => {
      if (!price && price !== 0) return '0.00'
      return parseFloat(price).toLocaleString('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
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

    onMounted(() => {
      loadOrders()
    })

    return {
      orders,
      loading,
      cancelOrder,
      getStatusLabel,
      getPaymentStatusLabel,
      formatPrice,
      formatDate
    }
  }
}
</script>

<style scoped>

.loading,
.no-orders {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
}

.no-orders i {
  font-size: 4rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.no-orders h2 {
  color: #666;
  margin-bottom: 0.5rem;
}

.no-orders p {
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

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.order-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.25rem;
}

.order-date {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pending,
.status-pendiente {
  background: #fff3cd;
  color: #856404;
}

.status-confirmed {
  background: #d1ecf1;
  color: #0c5460;
}

.status-cotizado {
  background: #cfe2ff;
  color: #084298;
}

.status-processing {
  background: #d1ecf1;
  color: #0c5460;
}

.status-shipped {
  background: #d4edda;
  color: #155724;
}

.status-delivered,
.status-cobrado {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.order-body {
  padding: 1.5rem;
}

.order-details {
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  color: #666;
  margin: 0;
}

.detail-item strong {
  color: #333;
}

.total-amount {
  font-size: 1.25rem;
  font-weight: bold;
  color: #667eea;
}

.payment-pending {
  color: #856404;
}

.payment-paid {
  color: #155724;
}

.payment-refunded {
  color: #721c24;
}

.notes {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.order-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-view,
.btn-cancel {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
}

.btn-view {
  background: #667eea;
  color: white;
  border: none;
}

.btn-view:hover {
  background: #5568d3;
}

.btn-cancel {
  background: white;
  color: #ff4444;
  border: 1px solid #ff4444;
}

.btn-cancel:hover {
  background: #ff4444;
  color: white;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    gap: 1rem;
  }

  .order-actions {
    flex-direction: column;
  }

  .btn-view,
  .btn-cancel {
    width: 100%;
    justify-content: center;
  }
}
</style>
