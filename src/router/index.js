import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/shop/home.vue')
    },
    {
      path: '/catalog',
      name: 'catalog',
      component: () => import('@/views/shop/catalog.vue')
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: () => import('@/views/shop/product-detail-new.vue')
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/shop/cart.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/shop/login.vue')
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/shop/checkout.vue')
    },
    // Redirects for backward compatibility
    {
      path: '/shop/home',
      redirect: '/home'
    },
    {
      path: '/shop/catalog',
      redirect: '/catalog'
    },
    {
      path: '/shop/product/:id',
      redirect: to => `/product/${to.params.id}`
    },
    {
      path: '/shop/cart',
      redirect: '/cart'
    },
    {
      path: '/shop/login',
      redirect: '/login'
    },
    {
      path: '/ecommerce/catalog',
      redirect: '/catalog'
    },
    {
      path: '/ecommerce/product/:id',
      redirect: to => `/product/${to.params.id}`
    },
    {
      path: '/ecommerce/cart',
      redirect: '/cart'
    },
    // Catch all 404
    {
      path: '/:pathMatch(.*)*',
      redirect: '/home'
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
