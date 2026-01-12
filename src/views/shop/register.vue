<template>
  <div class="register-page">
    <ShopHeader />

    <div class="register-container">
      <div class="register-card">
        <h1>Crear cuenta</h1>
        <p class="subtitle">Regístrate para una mejor experiencia de compra</p>

        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-row">
            <div class="form-group">
              <input
                v-model="formData.firstName"
                type="text"
                placeholder="Nombre *"
                required
                class="form-input"
              />
            </div>
            <div class="form-group">
              <input
                v-model="formData.lastName"
                type="text"
                placeholder="Apellido *"
                required
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <input
              v-model="formData.email"
              type="email"
              placeholder="Ej: ejemplo@mail.com *"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <input
              v-model="formData.phone"
              type="tel"
              placeholder="Teléfono"
              class="form-input"
            />
          </div>

          <div class="form-group password-group">
            <input
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Ingrese su contraseña *"
              required
              class="form-input"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="toggle-password"
            >
              <i :class="showPassword ? 'ti ti-eye-off' : 'ti ti-eye'"></i>
            </button>
          </div>

          <div class="form-group password-group">
            <input
              v-model="formData.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirmar contraseña *"
              required
              class="form-input"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="toggle-password"
            >
              <i :class="showConfirmPassword ? 'ti ti-eye-off' : 'ti ti-eye'"></i>
            </button>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Registrando...' : 'Crear Cuenta' }}
          </button>
        </form>

        <div class="divider">
          <span>o</span>
        </div>

        <button type="button" class="btn-google" @click="handleGoogleRegister" :disabled="isSubmitting">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          <span>Registrarse con Google</span>
        </button>

        <div class="login-link">
          ¿Ya tiene una cuenta? <router-link to="/login">Inicia sesión</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ShopHeader from '@/components/ShopHeader.vue'

const router = useRouter()

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Cargar el SDK de Google
onMounted(() => {
  loadGoogleSDK()
})

let tokenClient = null

const loadGoogleSDK = () => {
  if (document.getElementById('google-signin-sdk')) {
    return
  }

  const script = document.createElement('script')
  script.id = 'google-signin-sdk'
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = initializeGoogleSignIn
  document.head.appendChild(script)
}

const initializeGoogleSignIn = () => {
  if (window.google && window.google.accounts) {
    // Usar OAuth2 con popup en lugar de One Tap para evitar problemas de CORS
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '246931242894-86ad5bp4tf5se9gv2knb2hsllmsrqvii.apps.googleusercontent.com',
      scope: 'email profile openid',
      callback: handleGoogleTokenResponse,
    })
  }
}

const handleGoogleRegister = () => {
  // Limpiar mensajes de error previos
  errorMessage.value = ''
  successMessage.value = ''

  if (tokenClient) {
    // Abrir popup de Google para seleccionar cuenta
    tokenClient.requestAccessToken({ prompt: 'select_account' })
  } else {
    errorMessage.value = 'El servicio de Google no está disponible. Por favor, recarga la página.'
  }
}

const handleGoogleTokenResponse = async (tokenResponse) => {
  if (tokenResponse.error) {
    console.error('Error de Google OAuth:', tokenResponse.error)
    errorMessage.value = 'Error al autenticar con Google. Por favor, intenta de nuevo.'
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    // Obtener información del usuario usando el access token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenResponse.access_token}`
      }
    })

    if (!userInfoResponse.ok) {
      throw new Error('No se pudo obtener la información del usuario')
    }

    const userInfo = await userInfoResponse.json()

    // Enviar al backend (el backend necesitará manejar access tokens también)
    const result = await axios.post('http://localhost:3000/api/v1/auth/google-oauth', {
      access_token: tokenResponse.access_token,
      email: userInfo.email,
      given_name: userInfo.given_name,
      family_name: userInfo.family_name,
      picture: userInfo.picture,
      sub: userInfo.sub
    })

    if (result.data.success) {
      successMessage.value = 'Registro con Google exitoso. Redirigiendo...'

      // Guardar token y datos del usuario
      if (result.data.data.token) {
        localStorage.setItem('ecommerce_token', result.data.data.token)
        localStorage.setItem('ecommerce_customer', JSON.stringify(result.data.data.user))
      }

      // Redirigir al perfil después de 1 segundo
      setTimeout(() => {
        router.push('/profile')
      }, 1000)
    } else {
      errorMessage.value = result.data.message || 'Error al registrarse con Google'
    }
  } catch (error) {
    console.error('Error al registrarse con Google:', error)
    errorMessage.value = error.response?.data?.message || 'Error al conectar con Google. Por favor, intenta de nuevo.'
  } finally {
    isSubmitting.value = false
  }
}

const handleGoogleCallback = async (response) => {
  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    const result = await axios.post('http://localhost:3000/api/v1/auth/google', {
      token: response.credential
    })

    if (result.data.success) {
      successMessage.value = 'Registro con Google exitoso. Redirigiendo...'

      // Guardar token y datos del usuario
      if (result.data.data.token) {
        localStorage.setItem('ecommerce_token', result.data.data.token)
        localStorage.setItem('ecommerce_customer', JSON.stringify(result.data.data.user))
      }

      // Redirigir al perfil después de 1 segundo
      setTimeout(() => {
        router.push('/profile')
      }, 1000)
    }
  } catch (error) {
    console.error('Error al registrarse con Google:', error)
    errorMessage.value = error.response?.data?.message || 'Error al registrarse con Google. Por favor intente nuevamente.'
  } finally {
    isSubmitting.value = false
  }
}

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  // Validar que las contraseñas coincidan
  if (formData.value.password !== formData.value.confirmPassword) {
    errorMessage.value = 'Las contraseñas no coinciden'
    return
  }

  // Validar longitud de contraseña
  if (formData.value.password.length < 6) {
    errorMessage.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  isSubmitting.value = true

  try {
    const response = await axios.post('http://localhost:3000/api/v1/ecommerce/customers/register', {
      first_name: formData.value.firstName,
      last_name: formData.value.lastName,
      email: formData.value.email,
      phone: formData.value.phone,
      password: formData.value.password
    })

    if (response.data.success) {
      successMessage.value = 'Registro exitoso. Redirigiendo...'

      // Guardar token si viene en la respuesta
      if (response.data.token) {
        localStorage.setItem('ecommerce_token', response.data.token)
        localStorage.setItem('ecommerce_customer', JSON.stringify(response.data.customer))
      }

      // Redirigir al perfil después de 2 segundos
      setTimeout(() => {
        router.push('/profile')
      }, 2000)
    }
  } catch (error) {
    console.error('Error al registrar:', error)
    errorMessage.value = error.response?.data?.message || 'Error al crear la cuenta. Por favor intente nuevamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.register-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 3rem 1rem;
}

.register-card {
  background: white;
  border-radius: 15px;
  padding: 3rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.register-card h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-group {
  position: relative;
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

.password-group {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  color: #FF9F43;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 0.875rem;
  border-radius: 6px;
  font-size: 0.9rem;
  border: 1px solid #f5c6cb;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 0.875rem;
  border-radius: 6px;
  font-size: 0.9rem;
  border: 1px solid #c3e6cb;
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  background: #FF9F43;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 0.5px;
}

.btn-submit:hover:not(:disabled) {
  background: #e68a2e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 159, 67, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.divider span {
  padding: 0 1rem;
  color: #999;
  font-size: 0.9rem;
}

.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-google:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #bbb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-google:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-google svg {
  flex-shrink: 0;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
  font-size: 0.95rem;
}

.login-link a {
  color: #FF9F43;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .register-card {
    padding: 2rem 1.5rem;
  }

  .register-card h1 {
    font-size: 1.75rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 2rem 1rem;
  }

  .register-card {
    padding: 1.5rem 1rem;
  }

  .register-card h1 {
    font-size: 1.5rem;
  }
}
</style>
