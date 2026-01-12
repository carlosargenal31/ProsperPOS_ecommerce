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
      component: () => import('@/views/shop/product-detail.vue')
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
      path: '/register',
      name: 'register',
      component: () => import('@/views/shop/register.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/shop/profile.vue')
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/shop/checkout.vue')
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/shop/orders.vue')
    },
    {
      path: '/store-location',
      name: 'store-location',
      component: () => import('@/views/shop/store-location.vue')
    },
    {
      path: '/how-to-buy',
      name: 'how-to-buy',
      component: () => import('@/views/shop/how-to-buy.vue')
    },
    {
      path: '/privacy-policy',
      name: 'privacy-policy',
      component: () => import('@/views/shop/privacy-policy.vue')
    },
    {
      path: '/terms-and-conditions',
      name: 'terms-and-conditions',
      component: () => import('@/views/shop/terms-and-conditions.vue')
    },
    {
      path: '/about-us',
      name: 'about-us',
      component: () => import('@/views/shop/about-us.vue')
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
      path: '/shop/checkout',
      redirect: '/checkout'
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
