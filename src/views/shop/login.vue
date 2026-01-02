<template>
  <div class="shop-auth">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>{{ isLogin ? 'Iniciar Sesión' : 'Crear Cuenta' }}</h2>
          <p>{{ isLogin ? 'Accede a tu cuenta' : 'Regístrate para hacer pedidos' }}</p>
        </div>

        <!-- Login Form -->
        <form v-if="isLogin" @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label>Email</label>
            <input
              v-model="loginForm.email"
              type="email"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            <i v-if="loading" class="mdi mdi-loading mdi-spin"></i>
            <span v-else>Iniciar Sesión</span>
          </button>

          <p class="toggle-text">
            ¿No tienes cuenta?
            <a @click.prevent="isLogin = false" href="#">Regístrate aquí</a>
          </p>
        </form>

        <!-- Register Form -->
        <form v-else @submit.prevent="handleRegister" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre *</label>
              <input
                v-model="registerForm.first_name"
                type="text"
                placeholder="Juan"
                required
              />
            </div>

            <div class="form-group">
              <label>Apellido *</label>
              <input
                v-model="registerForm.last_name"
                type="text"
                placeholder="Pérez"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input
              v-model="registerForm.email"
              type="email"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label>Teléfono</label>
            <input
              v-model="registerForm.phone"
              type="tel"
              placeholder="+504 0000-0000"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Tipo de Documento</label>
              <select v-model="registerForm.document_type">
                <option value="dni">DNI</option>
                <option value="rtn">RTN</option>
                <option value="passport">Pasaporte</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div class="form-group">
              <label>Número de Documento</label>
              <input
                v-model="registerForm.document_number"
                type="text"
                placeholder="0000-0000-00000"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Contraseña * (mínimo 6 caracteres)</label>
            <input
              v-model="registerForm.password"
              type="password"
              placeholder="••••••••"
              required
              minlength="6"
            />
          </div>

          <div class="form-group">
            <label>Confirmar Contraseña *</label>
            <input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              minlength="6"
            />
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            <i v-if="loading" class="mdi mdi-loading mdi-spin"></i>
            <span v-else>Crear Cuenta</span>
          </button>

          <p class="toggle-text">
            ¿Ya tienes cuenta?
            <a @click.prevent="isLogin = true" href="#">Inicia sesión aquí</a>
          </p>
        </form>

        <div class="back-to-shop">
          <router-link to="/shop">
            <i class="mdi mdi-arrow-left"></i>
            Volver a la tienda
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/api/ecommerce'

export default {
  name: 'ShopLogin',
  setup() {
    const router = useRouter()

    const isLogin = ref(true)
    const loading = ref(false)

    const loginForm = ref({
      email: '',
      password: ''
    })

    const registerForm = ref({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      document_type: 'dni',
      document_number: '',
      password: '',
      confirmPassword: ''
    })

    const handleLogin = async () => {
      try {
        loading.value = true
        const response = await authService.login(
          loginForm.value.email,
          loginForm.value.password
        )

        if (response.success) {
          alert('¡Bienvenido!')
          router.push('/shop')
        }
      } catch (error) {
        console.error('Login error:', error)
        alert(error.response?.data?.message || 'Error al iniciar sesión')
      } finally {
        loading.value = false
      }
    }

    const handleRegister = async () => {
      if (registerForm.value.password !== registerForm.value.confirmPassword) {
        alert('Las contraseñas no coinciden')
        return
      }

      if (registerForm.value.password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres')
        return
      }

      try {
        loading.value = true
        const { confirmPassword, ...registerData } = registerForm.value
        const response = await authService.register(registerData)

        if (response.success) {
          alert('¡Cuenta creada exitosamente!')
          router.push('/shop')
        }
      } catch (error) {
        console.error('Register error:', error)
        alert(error.response?.data?.message || 'Error al crear cuenta')
      } finally {
        loading.value = false
      }
    }

    return {
      isLogin,
      loading,
      loginForm,
      registerForm,
      handleLogin,
      handleRegister
    }
  }
}
</script>

<style scoped>
.shop-auth {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 600px;
}

.auth-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h2 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 2rem;
}

.auth-header p {
  margin: 0;
  color: #666;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-text {
  text-align: center;
  color: #666;
  margin-top: 1rem;
}

.toggle-text a {
  color: #667eea;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
}

.toggle-text a:hover {
  text-decoration: underline;
}

.back-to-shop {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.back-to-shop a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.back-to-shop a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .auth-card {
    padding: 1.5rem;
  }
}
</style>
