import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Import Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css'

// Import Tabler Icons CSS
import '@tabler/icons-webfont/dist/tabler-icons.min.css'

// Import shop theme CSS (this will NOT affect the POS)
import '@/assets/css/shop-theme.css'

const app = createApp(App)

app.use(router)

app.mount('#app')
