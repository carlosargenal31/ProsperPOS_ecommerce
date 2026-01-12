<template>
  <div id="app">
    <router-view />
    <ShopFooter />
  </div>
</template>

<script>
import ShopFooter from './components/ShopFooter.vue'

export default {
  name: 'App',
  components: {
    ShopFooter
  }
}
</script>

<style>
/* Global app styles - only affects ecommerce */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
