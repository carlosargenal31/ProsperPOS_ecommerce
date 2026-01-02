// ===================================================================
// PROSPERPOS - CONFIGURACIÓN DE API
// ===================================================================

import axios from 'axios';
import { message } from 'ant-design-vue';

// Configuración base de la API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor de peticiones - agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar store_id si está disponible
    const storeId = localStorage.getItem('store_id');
    if (storeId && !config.params?.store_id) {
      config.params = {
        ...config.params,
        store_id: storeId
      };
    }

    return config;
  },
  (error) => {
    console.error('Error en interceptor de petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor de respuestas - manejo de errores global
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Error en respuesta de API:', error);

    // Manejo de errores específicos
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.message || 'Error en la solicitud';

      switch (status) {
        case 401:
          // Token inválido o expirado
          message.error('Sesión expirada. Por favor inicia sesión nuevamente.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => {
            window.location.href = '/signin';
          }, 1500);
          break;

        case 403:
          // Sin permisos
          message.error('No tienes permisos para realizar esta acción');
          break;

        case 404:
          message.error('Recurso no encontrado');
          break;

        case 422:
          // Errores de validación
          message.error(errorMessage);
          break;

        case 500:
          message.error('Error interno del servidor. Por favor intenta más tarde.');
          break;

        default:
          message.error(errorMessage);
      }
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      message.error('No se pudo conectar con el servidor. Verifica tu conexión.');
    } else {
      // Error al configurar la petición
      message.error('Error al procesar la solicitud');
    }

    return Promise.reject(error);
  }
);

// ===================================================================
// SERVICIOS DE API POR MÓDULO
// ===================================================================

/**
 * Servicio de Productos
 */
export const productService = {
  /**
   * Obtener lista de productos
   */
  getAll: (params = {}) => {
    return api.get('/products', { params });
  },

  /**
   * Obtener producto por ID
   */
  getById: (id) => {
    return api.get(`/products/${id}`);
  },

  /**
   * Buscar producto por código de barras
   */
  getByBarcode: (barcode) => {
    return api.get(`/products/barcode/${barcode}`);
  },

  /**
   * Crear nuevo producto
   */
  create: (productData) => {
    return api.post('/products', productData);
  },

  /**
   * Actualizar producto
   */
  update: (id, productData) => {
    return api.put(`/products/${id}`, productData);
  },

  /**
   * Eliminar producto
   */
  delete: (id) => {
    return api.delete(`/products/${id}`);
  },

  /**
   * Generar código de producto
   */
  generateCode: (categoryId) => {
    return api.get('/products/generate-code', {
      params: { category_id: categoryId }
    });
  },

  /**
   * Obtener productos con stock bajo
   */
  getLowStock: (limit = 20) => {
    return api.get('/products/low-stock', {
      params: { limit }
    });
  },

  /**
   * Obtener resumen de inventario
   */
  getSummary: () => {
    return api.get('/products/summary');
  }
};

/**
 * Servicio de Inventario
 */
export const inventoryService = {
  /**
   * Obtener stock actual
   */
  getStock: (params = {}) => {
    return api.get('/products/stock/current', { params });
  },

  /**
   * Verificar disponibilidad de stock
   */
  checkStock: (productId, quantity) => {
    return api.get('/products/stock/check', {
      params: { product_id: productId, quantity }
    });
  },

  /**
   * Validar stock para venta
   */
  validateStock: (items) => {
    return api.post('/products/stock/validate', { items });
  },

  /**
   * Ajustar stock
   */
  adjustStock: (adjustmentData) => {
    return api.post('/products/stock/adjust', adjustmentData);
  },

  /**
   * Transferir stock entre almacenes
   */
  transferStock: (transferData) => {
    return api.post('/products/stock/transfer', transferData);
  },

  /**
   * Obtener dashboard de inventario
   */
  getDashboard: () => {
    return api.get('/inventory/dashboard');
  },

  /**
   * Obtener alertas de inventario
   */
  getAlerts: () => {
    return api.get('/inventory/alerts');
  },

  /**
   * Ajuste masivo de inventario
   */
  bulkAdjust: (adjustments) => {
    return api.post('/inventory/bulk-adjust', { adjustments });
  },

  /**
   * Obtener movimientos recientes
   */
  getRecentMovements: (params = {}) => {
    return api.get('/inventory/movements/recent', { params });
  },

  /**
   * Registrar movimiento manual
   */
  recordMovement: (movementData) => {
    return api.post('/inventory/stock/record-movement', movementData);
  }
};

/**
 * Servicio de Reportes
 */
export const reportService = {
  /**
   * Reporte de movimientos de inventario
   */
  getMovements: (params = {}) => {
    return api.get('/products/reports/movements', { params });
  },

  /**
   * Reporte de valorización de inventario
   */
  getValuation: (warehouseId = null) => {
    return api.get('/products/reports/valuation', {
      params: { warehouse_id: warehouseId }
    });
  },

  /**
   * Reporte de stock crítico
   */
  getCriticalStock: () => {
    return api.get('/products/reports/critical-stock');
  },

  /**
   * Exportar reporte de stock
   */
  exportStock: (format = 'excel', warehouseId = null) => {
    return api.get('/inventory/export/stock', {
      params: { format, warehouse_id: warehouseId },
      responseType: format === 'csv' ? 'blob' : 'json'
    });
  }
};

/**
 * Servicio de Categorías
 */
export const categoryService = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};

/**
 * Servicio de Marcas
 */
export const brandService = {
  getAll: () => api.get('/brands'),
  getById: (id) => api.get(`/brands/${id}`),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.put(`/brands/${id}`, data),
  delete: (id) => api.delete(`/brands/${id}`)
};

/**
 * Servicio de Clientes
 */
export const customerService = {
  getAll: (params = {}) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`)
};

/**
 * Servicio de Proveedores
 */
export const supplierService = {
  getAll: (params = {}) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`)
};

/**
 * Servicio de Ventas
 */
export const saleService = {
  getAll: (params = {}) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
  update: (id, data) => api.put(`/sales/${id}`, data),
  delete: (id) => api.delete(`/sales/${id}`),
  getPending: () => api.get('/sales/pending'),
  complete: (id, paymentData) => api.post(`/sales/${id}/complete`, paymentData)
};

/**
 * Servicio de Compras
 */
export const purchaseService = {
  getAll: (params = {}) => api.get('/purchases', { params }),
  getById: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post('/purchases', data),
  update: (id, data) => api.put(`/purchases/${id}`, data),
  delete: (id) => api.delete(`/purchases/${id}`)
};

/**
 * Servicio de Autenticación
 */
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  changePassword: (data) => api.post('/auth/change-password', data)
};

/**
 * Servicio de Usuarios
 */
export const userService = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
};

/**
 * Servicio de Historial de Existencias
 */
export const stockHistoryService = {
  /**
   * Obtener historial de existencias
   */
  getStockHistory: (params = {}) => {
    return api.get('/stock-history', { params });
  },

  /**
   * Exportar historial de existencias
   */
  exportStockHistory: (params = {}) => {
    return api.get('/stock-history/export', {
      params,
      responseType: 'blob'
    });
  },

  /**
   * Obtener lista de categorías para filtros
   */
  getCategories: () => {
    return api.get('/stock-history/categories');
  },

  /**
   * Obtener lista de subcategorías para filtros
   */
  getSubcategories: (categoryId = null) => {
    return api.get('/stock-history/subcategories', {
      params: { category_id: categoryId }
    });
  },

  /**
   * Obtener lista de productos para filtros
   */
  getProducts: (categoryId = null, subcategoryId = null) => {
    const params = {};
    if (categoryId) params.category_id = categoryId;
    if (subcategoryId) params.subcategory_id = subcategoryId;

    return api.get('/stock-history/products', { params });
  },

  /**
   * Obtener lista de almacenes para filtros
   */
  getWarehouses: () => {
    return api.get('/stock-history/warehouses');
  }
};

// Exportar la instancia de axios por defecto
export default api;