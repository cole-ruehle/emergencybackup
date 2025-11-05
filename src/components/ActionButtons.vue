<template>
  <div class="action-buttons">
    <h3 class="section-title">Quick Actions</h3>
    <div class="button-grid">
      <button 
        class="action-btn primary" 
        @click="handleAction('add_scenic_stop')"
        :disabled="loading"
      >
        <span class="icon">🏔️</span>
        Add Scenic Stop
      </button>
      
      <button 
        class="action-btn secondary" 
        @click="handleAction('exit_now')"
        :disabled="loading"
      >
        <span class="icon">🚪</span>
        Exit Now
      </button>
      
      <button 
        class="action-btn secondary" 
        @click="handleAction('arrive_by_3pm')"
        :disabled="loading"
      >
        <span class="icon">⏰</span>
        Arrive by 3pm
      </button>
      
      <button 
        class="action-btn secondary" 
        @click="handleAction('find_restrooms')"
        :disabled="loading"
      >
        <span class="icon">🚻</span>
        Find Restrooms
      </button>
      
      <button 
        class="action-btn secondary" 
        @click="handleAction('add_food_stop')"
        :disabled="loading"
      >
        <span class="icon">🍕</span>
        Add Food Stop
      </button>
      
      <button 
        class="action-btn secondary" 
        @click="handleAction('optimize_route')"
        :disabled="loading"
      >
        <span class="icon">⚡</span>
        Optimize Route
      </button>
    </div>
    
    <div v-if="notices.length > 0" class="notices">
      <h4>Updates:</h4>
      <ul>
        <li v-for="notice in notices" :key="notice" class="notice">
          {{ notice }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '../stores/appStore.js'
import { useAuthStore } from '../stores/authStore.js'
import { api } from '../api/api.js'

const appStore = useAppStore()
const authStore = useAuthStore()

const loading = ref(false)
const notices = ref([])

const handleAction = async (action) => {
  try {
    loading.value = true
    appStore.setLoading(true)
    appStore.clearError()
    
    // Check authentication
    if (!authStore.isAuthenticated) {
      appStore.setError('Please sign in to use quick actions')
      loading.value = false
      appStore.setLoading(false)
      return
    }
    
    // Add action to recent buttons pressed
    appStore.addButtonPress(action)
    
    // Convert action to natural language query with context
    const getActionQuery = (action) => {
      const baseQueries = {
        'add_scenic_stop': 'Add a scenic viewpoint or photo spot to my current route',
        'exit_now': 'Find the quickest exit route from my current location',
        'arrive_by_3pm': 'Modify my current route to arrive by 3:00 PM',
        'find_restrooms': 'Find restrooms along my current route',
        'add_food_stop': 'Add a food stop or restaurant to my current route',
        'optimize_route': 'Optimize my current route for better efficiency'
      }
      
      let query = baseQueries[action] || `Please help with: ${action}`
      
      // Add more context if we have a current route
      if (appStore.currentRoute) {
        const routeName = appStore.currentRoute.name || 'my route'
        query = query.replace('my current route', `my current route "${routeName}"`)
        
        // Add specific context for certain actions
        if (action === 'add_scenic_stop' && appStore.currentRoute.destination) {
          query += ` between my current location and ${appStore.currentRoute.destination.name || 'the destination'}`
        }
      }
      
      return query
    }
    
    const query = getActionQuery(action)
    
    // Use the new planRoute method with sessionToken
    const result = await appStore.planRoute(query, authStore.sessionToken)
    
    // Handle successful response
    if (result.route) {
      notices.value = result.suggestions || []
    }
    
    if (result.error) {
      appStore.setError(result.error.message)
      notices.value = [`Error: ${result.error.message}`]
    }
    
  } catch (error) {
    console.error('Action failed:', error)
    appStore.setError(error.message)
    notices.value = [`Error: ${error.message}`]
  } finally {
    loading.value = false
    appStore.setLoading(false)
  }
}
</script>

<style scoped>
.action-buttons {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #000000;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #e5e5e5;
  background: #ffffff;
  color: #000000;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  min-height: 80px;
}

.action-btn:hover:not(:disabled) {
  border-color: #000000;
  background: #f8f9fa;
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.primary {
  background: #000000;
  color: #ffffff;
  border-color: #000000;
}

.action-btn.primary:hover:not(:disabled) {
  background: #333333;
}

.icon {
  font-size: 1.5rem;
  line-height: 1;
}

.notices {
  background: #e8f5e8;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #28a745;
}

.notices h4 {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #155724;
}

.notices ul {
  margin: 0;
  padding-left: 1.25rem;
}

.notice {
  font-size: 0.875rem;
  color: #155724;
  margin-bottom: 0.25rem;
}

.notice:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .button-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-btn {
    min-height: 70px;
    padding: 0.75rem;
  }
}
</style>
