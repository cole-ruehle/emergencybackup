<template>
  <div v-if="show" class="auth-modal-overlay" @click.self="handleClose">
    <div class="auth-modal">
      <button class="close-button" @click="handleClose">×</button>
      
      <div class="auth-modal-content">
        <h2 class="modal-title">{{ isLogin ? 'Welcome Back' : 'Create Account' }}</h2>
        <p class="modal-subtitle">
          {{ isLogin ? 'Sign in to continue your hiking journey' : 'Join the TrailLink community' }}
        </p>
        
        <!-- Error Display -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <!-- Login Form -->
        <form v-if="isLogin" @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="login-username">Username</label>
            <input
              id="login-username"
              v-model="loginForm.username"
              type="text"
              placeholder="Enter your username"
              class="form-input"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="login-password">Password</label>
            <input
              id="login-password"
              v-model="loginForm.password"
              type="password"
              placeholder="Enter your password"
              class="form-input"
              required
            />
          </div>
          
          <button type="submit" class="submit-button" :disabled="loading">
            {{ loading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>
        
        <!-- Register Form -->
        <form v-else @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label for="register-username">Username</label>
            <input
              id="register-username"
              v-model="registerForm.username"
              type="text"
              placeholder="Choose a username (min 3 characters)"
              class="form-input"
              minlength="3"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="register-email">Email</label>
            <input
              id="register-email"
              v-model="registerForm.email"
              type="email"
              placeholder="Enter your email"
              class="form-input"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="register-password">Password</label>
            <input
              id="register-password"
              v-model="registerForm.password"
              type="password"
              placeholder="Choose a password (min 8 characters)"
              class="form-input"
              minlength="8"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="register-confirm-password">Confirm Password</label>
            <input
              id="register-confirm-password"
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="Confirm your password"
              class="form-input"
              required
            />
          </div>
          
          <button type="submit" class="submit-button" :disabled="loading">
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>
        
        <!-- Toggle Login/Register -->
        <div class="toggle-mode">
          <p v-if="isLogin">
            Don't have an account?
            <button type="button" @click="toggleMode" class="toggle-button">
              Sign Up
            </button>
          </p>
          <p v-else>
            Already have an account?
            <button type="button" @click="toggleMode" class="toggle-button">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/authStore.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  defaultMode: {
    type: String,
    default: 'login', // 'login' or 'register'
    validator: (value) => ['login', 'register'].includes(value)
  }
})

const emit = defineEmits(['close', 'success'])

const authStore = useAuthStore()

const isLogin = ref(props.defaultMode === 'login')
const loading = ref(false)
const error = ref(null)

const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = null
  
  // Clear forms
  loginForm.value = {
    username: '',
    password: ''
  }
  
  registerForm.value = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  }
}

const handleClose = () => {
  if (!loading.value) {
    error.value = null
    emit('close')
  }
}

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = null
    
    await authStore.login(loginForm.value.username, loginForm.value.password)
    
    // Success - close modal and notify parent
    emit('success', { mode: 'login' })
    emit('close')
    
    // Clear form
    loginForm.value = {
      username: '',
      password: ''
    }
    
  } catch (err) {
    error.value = err.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Validate passwords match
    if (registerForm.value.password !== registerForm.value.confirmPassword) {
      error.value = 'Passwords do not match'
      loading.value = false
      return
    }
    
    // Validate password length
    if (registerForm.value.password.length < 8) {
      error.value = 'Password must be at least 8 characters long'
      loading.value = false
      return
    }
    
    // Validate username length
    if (registerForm.value.username.length < 3) {
      error.value = 'Username must be at least 3 characters long'
      loading.value = false
      return
    }
    
    await authStore.register(
      registerForm.value.username,
      registerForm.value.password,
      registerForm.value.email
    )
    
    // Success - close modal and notify parent
    emit('success', { mode: 'register' })
    emit('close')
    
    // Clear form
    registerForm.value = {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
    
  } catch (err) {
    error.value = err.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}

// Reset mode when defaultMode prop changes
watch(() => props.defaultMode, (newMode) => {
  isLogin.value = newMode === 'login'
})

// Watch auth store errors
watch(() => authStore.error, (newError) => {
  if (newError) {
    error.value = newError
  }
})
</script>

<style scoped>
.auth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.auth-modal {
  background: #ffffff;
  border-radius: 8px;
  max-width: 450px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: #666666;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: color 0.2s ease;
  z-index: 1;
}

.close-button:hover {
  color: #000000;
}

.auth-modal-content {
  padding: 2.5rem 2rem;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #000000;
  margin-bottom: 0.5rem;
}

.modal-subtitle {
  font-size: 0.95rem;
  color: #666666;
  margin-bottom: 2rem;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  border-left: 4px solid #dc2626;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333333;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  font-family: 'Inter', sans-serif;
}

.form-input:focus {
  outline: none;
  border-color: #000000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.submit-button {
  background: #000000;
  color: #ffffff;
  border: none;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background: #333333;
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.toggle-mode {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e5e5;
  text-align: center;
}

.toggle-mode p {
  font-size: 0.875rem;
  color: #666666;
  margin: 0;
}

.toggle-button {
  background: none;
  border: none;
  color: #000000;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-left: 0.25rem;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.toggle-button:hover {
  color: #333333;
}

@media (max-width: 768px) {
  .auth-modal {
    width: 95%;
  }
  
  .auth-modal-content {
    padding: 2rem 1.5rem;
  }
  
  .modal-title {
    font-size: 1.5rem;
  }
}
</style>

