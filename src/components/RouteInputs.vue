<template>
  <div class="route-inputs">
    <h3 class="section-title">Plan Your Route</h3>
    
    <form @submit.prevent="handleSubmit" class="input-form">
      <div class="input-group">
        <label for="origin">Starting Point</label>
        <input
          id="origin"
          v-model="localOrigin"
          type="text"
          placeholder="Enter your starting location"
          class="input-field"
        />
      </div>
      
      <div class="input-group">
        <label for="home">Home Base</label>
        <input
          id="home"
          v-model="localHome"
          type="text"
          placeholder="Enter your home location"
          class="input-field"
        />
      </div>
      
      <div class="input-group">
        <label for="destination">Destination (Trail)</label>
        <input
          id="destination"
          v-model="localDestination"
          type="text"
          placeholder="e.g., Middlesex Fells, Blue Hills"
          class="input-field"
        />
      </div>
      
      <div class="input-group">
        <label for="departure">Departure Time</label>
        <input
          id="departure"
          v-model="localDepartureTime"
          type="datetime-local"
          class="input-field"
        />
      </div>
      
      <div class="preferences">
        <h4>Preferences</h4>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="localPrefs.avoid.tolls"
              type="checkbox"
            />
            Avoid Tolls
          </label>
          <label class="checkbox-label">
            <input
              v-model="localPrefs.avoid.highways"
              type="checkbox"
            />
            Avoid Highways
          </label>
          <label class="checkbox-label">
            <input
              v-model="localPrefs.accessibility"
              type="checkbox"
            />
            Wheelchair Accessible
          </label>
        </div>
        
        <div class="slider-group">
          <label for="detour-limit">Max Detour (minutes)</label>
          <input
            id="detour-limit"
            v-model="localContext.detourLimitMin"
            type="range"
            min="5"
            max="60"
            step="5"
            class="slider"
          />
          <span class="slider-value">{{ localContext.detourLimitMin }} min</span>
        </div>
      </div>
      
      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? 'Planning...' : 'Plan Route' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAppStore } from '../stores/appStore.js'
import { api } from '../api/api.js'

const appStore = useAppStore()

const loading = ref(false)

// Local form state
const localOrigin = ref('')
const localHome = ref('')
const localDestination = ref('')
const localDepartureTime = ref('')
const localPrefs = ref({
  avoid: { tolls: false, highways: false },
  accessibility: false
})
const localContext = ref({
  detourLimitMin: 20
})

// Sync with store
const syncFromStore = () => {
  localOrigin.value = appStore.origin
  localHome.value = appStore.home
  localDestination.value = appStore.destinationHint
  localPrefs.value = { ...appStore.prefs }
  localContext.value = { ...appStore.context }
  
  // Set default departure time to now
  if (!localDepartureTime.value) {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    localDepartureTime.value = now.toISOString().slice(0, 16)
  }
}

const syncToStore = () => {
  appStore.setOrigin(localOrigin.value)
  appStore.setHome(localHome.value)
  appStore.setDestinationHint(localDestination.value)
  appStore.updatePrefs(localPrefs.value)
  appStore.updateContext(localContext.value)
  
  if (localDepartureTime.value) {
    appStore.updateTime({
      type: 'depart_at',
      iso: new Date(localDepartureTime.value).toISOString()
    })
  }
}

const handleSubmit = async () => {
  try {
    loading.value = true
    appStore.setLoading(true)
    appStore.clearError()
    
    // Sync form data to store
    syncToStore()
    
    // Create a natural language query from the form data
    const query = `Plan a hiking route from ${localOrigin.value || 'my location'} to ${localDestination.value || 'a hiking trail'}. ${localHome.value ? `My home is ${localHome.value}.` : ''} I prefer ${localPrefs.value.avoid.tolls ? 'avoiding tolls' : 'using tolls if needed'} and ${localPrefs.value.avoid.highways ? 'avoiding highways' : 'using highways if needed'}. ${localPrefs.value.accessibility ? 'The route should be wheelchair accessible.' : ''} Maximum detour: ${localContext.value.detourLimitMin} minutes.`
    
    // Use the new planRoute method
    const result = await appStore.planRoute(query)
    
    console.log('Route planning result:', result)
    
  } catch (error) {
    console.error('Route planning failed:', error)
    appStore.setError(error.message)
  } finally {
    loading.value = false
    appStore.setLoading(false)
  }
}

// Watch for store changes
watch(() => appStore.origin, (newVal) => {
  if (newVal !== localOrigin.value) {
    localOrigin.value = newVal
  }
})

watch(() => appStore.home, (newVal) => {
  if (newVal !== localHome.value) {
    localHome.value = newVal
  }
})

watch(() => appStore.destinationHint, (newVal) => {
  if (newVal !== localDestination.value) {
    localDestination.value = newVal
  }
})

onMounted(async () => {
  syncFromStore()
  
  // Try to get user's current location
  try {
    await appStore.getCurrentLocation()
    console.log('User location set:', appStore.userLocation)
  } catch (error) {
    console.warn('Could not get user location:', error.message)
  }
})
</script>

<style scoped>
.route-inputs {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #000000;
}

.input-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333333;
}

.input-field {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: #000000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.preferences {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
}

.preferences h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #000000;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #000000;
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slider-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333333;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #d1d5db;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #000000;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #000000;
  cursor: pointer;
  border: none;
}

.slider-value {
  font-size: 0.875rem;
  color: #666666;
  text-align: center;
}

.submit-btn {
  background: #000000;
  color: #ffffff;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.submit-btn:hover:not(:disabled) {
  background: #333333;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .route-inputs {
    padding: 1rem;
  }
  
  .checkbox-group {
    gap: 0.5rem;
  }
}
</style>
