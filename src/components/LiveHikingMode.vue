<template>
  <div class="live-hiking-mode">
    <div class="mode-header">
      <h3 class="section-title">Live Hiking</h3>
      <div class="live-indicator" :class="{ active: isLiveHiking }">
        <span class="live-dot"></span>
        {{ isLiveHiking ? 'LIVE' : 'OFFLINE' }}
      </div>
    </div>
    
    <!-- Not Hiking State -->
    <div v-if="!isLiveHiking && !appStore.currentRoute" class="empty-state">
      <p>Plan a route to start your hike</p>
    </div>
    
    <!-- Ready to Start Hiking -->
    <div v-else-if="!isLiveHiking && appStore.currentRoute" class="ready-to-start">
      <div class="route-preview">
        <h4>{{ appStore.currentRoute.name || 'Your Route' }}</h4>
        <div class="route-meta">
          <span>⏱️ {{ formatDuration(appStore.currentRoute.metrics?.totalMin) }}</span>
          <span>📍 {{ appStore.currentRoute.segments?.length || 0 }} segments</span>
        </div>
      </div>
      
      <div class="location-sharing-prompt" v-if="!authStore.visibilitySettings.showLiveLocation">
        <p class="prompt-text">
          <span class="icon">📍</span>
          Enable location sharing to discover nearby hikers and let others find you
        </p>
        <label class="checkbox-label">
          <input
            v-model="enableLocationSharing"
            type="checkbox"
          />
          Share my live location during this hike
        </label>
      </div>
      
      <button
        class="start-hike-button"
        @click="handleStartHike"
        :disabled="loading"
      >
        {{ loading ? 'Starting...' : 'Start Hike' }}
      </button>
    </div>
    
    <!-- Active Hiking State -->
    <div v-else class="active-hiking">
      <div class="hiking-info">
        <div class="hike-status">
          <h4>{{ appStore.currentRoute?.name || 'Hiking' }}</h4>
          <p class="started-time">Started {{ formatTime(hikeStartTime) }}</p>
        </div>
        
        <div class="hike-stats">
          <div class="stat-item">
            <span class="stat-label">Duration</span>
            <span class="stat-value">{{ formatElapsedTime }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Sharing</span>
            <span class="stat-value">{{ authStore.visibilitySettings.showLiveLocation ? 'On' : 'Off' }}</span>
          </div>
        </div>
      </div>
      
      <!-- Nearby Hikers Count -->
      <div v-if="nearbyHikersCount > 0" class="nearby-hikers-badge">
        <span class="icon">👥</span>
        {{ nearbyHikersCount }} {{ nearbyHikersCount === 1 ? 'hiker' : 'hikers' }} nearby
      </div>
      
      <!-- Action Buttons -->
      <div class="hike-actions">
        <button
          class="action-button emergency"
          @click="handleEmergencyExit"
          :disabled="loading"
        >
          🚨 Emergency Exit
        </button>
        
        <button
          class="action-button secondary"
          @click="toggleLocationSharing"
          :disabled="loading"
        >
          {{ authStore.visibilitySettings.showLiveLocation ? '📍 Stop Sharing' : '📍 Share Location' }}
        </button>
      </div>
      
      <button
        class="end-hike-button"
        @click="handleEndHike"
        :disabled="loading"
      >
        {{ loading ? 'Ending...' : 'End Hike' }}
      </button>
    </div>
    
    <!-- Error Display -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '../stores/appStore.js'
import { useAuthStore } from '../stores/authStore.js'
import { api } from '../api/api.js'

const props = defineProps({
  nearbyHikersCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['hike-started', 'hike-ended', 'emergency-exit'])

const appStore = useAppStore()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref(null)
const enableLocationSharing = ref(true)
const hikeStartTime = ref(null)
const elapsedSeconds = ref(0)

let updateInterval = null

const isLiveHiking = computed(() => {
  return hikeStartTime.value !== null
})

const formatDuration = (minutes) => {
  if (!minutes) return 'N/A'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const formatElapsedTime = computed(() => {
  const hours = Math.floor(elapsedSeconds.value / 3600)
  const minutes = Math.floor((elapsedSeconds.value % 3600) / 60)
  const seconds = elapsedSeconds.value % 60
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`
})

const startElapsedTimer = () => {
  updateInterval = setInterval(() => {
    if (hikeStartTime.value) {
      const now = Date.now()
      const elapsed = Math.floor((now - hikeStartTime.value) / 1000)
      elapsedSeconds.value = elapsed
    }
  }, 1000)
}

const stopElapsedTimer = () => {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
}

const handleStartHike = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Enable location sharing if checkbox is checked
    if (enableLocationSharing.value && !authStore.visibilitySettings.showLiveLocation) {
      await authStore.startLiveHiking()
    }
    
    // Set start time
    hikeStartTime.value = Date.now()
    elapsedSeconds.value = 0
    
    // Start elapsed time counter
    startElapsedTimer()
    
    // Emit event
    emit('hike-started', {
      route: appStore.currentRoute,
      startTime: hikeStartTime.value,
      locationSharingEnabled: authStore.visibilitySettings.showLiveLocation
    })
    
    console.log('Hike started:', {
      route: appStore.currentRoute?.name,
      locationSharing: authStore.visibilitySettings.showLiveLocation
    })
    
  } catch (err) {
    error.value = err.message || 'Failed to start hike'
    console.error('Start hike error:', err)
  } finally {
    loading.value = false
  }
}

const handleEndHike = async () => {
  try {
    loading.value = true
    error.value = null
    
    const endTime = Date.now()
    const duration = hikeStartTime.value ? Math.floor((endTime - hikeStartTime.value) / 1000) : 0
    
    // Stop location sharing
    if (authStore.visibilitySettings.showLiveLocation) {
      await authStore.stopLiveHiking()
    }
    
    // Stop elapsed timer
    stopElapsedTimer()
    
    // Record activity to backend
    if (appStore.currentRoute && authStore.isAuthenticated) {
      try {
        const activityData = {
          activityType: 'hike_completed',
          activityData: {
            routeId: appStore.currentRoute.route_id,
            routeName: appStore.currentRoute.name,
            distance: appStore.currentRoute.metrics?.totalDistance || 0,
            duration: Math.floor(duration / 60), // Convert to minutes
            startTime: new Date(hikeStartTime.value).toISOString(),
            endTime: new Date(endTime).toISOString()
          },
          location: appStore.userLocation ? {
            type: 'Point',
            coordinates: [
              appStore.userLocation.lng || appStore.userLocation.lon,
              appStore.userLocation.lat
            ]
          } : undefined,
          visibility: 'public' // or 'private' based on user preference
        }
        
        await api.recordActivity(
          authStore.sessionToken,
          authStore.userId,
          activityData
        )
        
        console.log('Activity recorded successfully')
      } catch (recordError) {
        console.error('Failed to record activity:', recordError)
        // Don't block hike ending if recording fails
      }
    }
    
    // Emit event
    emit('hike-ended', {
      route: appStore.currentRoute,
      startTime: hikeStartTime.value,
      endTime,
      duration
    })
    
    // Reset state
    hikeStartTime.value = null
    elapsedSeconds.value = 0
    
    console.log('Hike ended:', {
      duration: `${Math.floor(duration / 60)} minutes`
    })
    
  } catch (err) {
    error.value = err.message || 'Failed to end hike'
    console.error('End hike error:', err)
  } finally {
    loading.value = false
  }
}

const handleEmergencyExit = async () => {
  try {
    loading.value = true
    error.value = null
    
    emit('emergency-exit', {
      currentLocation: appStore.userLocation,
      route: appStore.currentRoute
    })
    
    // Plan emergency exit route
    const query = 'I need to exit my hike now and get home'
    await appStore.planRoute(query, authStore.sessionToken)
    
  } catch (err) {
    error.value = err.message || 'Failed to plan emergency exit'
    console.error('Emergency exit error:', err)
  } finally {
    loading.value = false
  }
}

const toggleLocationSharing = async () => {
  try {
    loading.value = true
    error.value = null
    
    if (authStore.visibilitySettings.showLiveLocation) {
      await authStore.stopLiveHiking()
    } else {
      await authStore.startLiveHiking()
    }
    
  } catch (err) {
    error.value = err.message || 'Failed to toggle location sharing'
    console.error('Toggle location sharing error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Check if there's an active hike in localStorage
  const storedStartTime = localStorage.getItem('hikeStartTime')
  if (storedStartTime) {
    hikeStartTime.value = parseInt(storedStartTime, 10)
    startElapsedTimer()
  }
})

onUnmounted(() => {
  stopElapsedTimer()
  
  // Save hike start time to localStorage if active
  if (hikeStartTime.value) {
    localStorage.setItem('hikeStartTime', hikeStartTime.value.toString())
  } else {
    localStorage.removeItem('hikeStartTime')
  }
})
</script>

<style scoped>
.live-hiking-mode {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.mode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: #f0f0f0;
  color: #666666;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.live-indicator.active {
  background: #fee2e2;
  color: #dc2626;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666666;
}

.live-indicator.active .live-dot {
  background: #dc2626;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666666;
}

.ready-to-start {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.route-preview h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #000000;
  margin: 0 0 0.5rem 0;
}

.route-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #666666;
}

.location-sharing-prompt {
  background: #f0f7ff;
  border-left: 4px solid #4285F4;
  padding: 1rem;
  border-radius: 6px;
}

.prompt-text {
  font-size: 0.875rem;
  color: #333333;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.prompt-text .icon {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #4285F4;
}

.start-hike-button,
.end-hike-button {
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

.start-hike-button:hover:not(:disabled),
.end-hike-button:hover:not(:disabled) {
  background: #333333;
  transform: translateY(-1px);
}

.start-hike-button:disabled,
.end-hike-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.active-hiking {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hiking-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
}

.hike-status h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #000000;
  margin: 0 0 0.25rem 0;
}

.started-time {
  font-size: 0.875rem;
  color: #666666;
  margin: 0;
}

.hike-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #000000;
}

.nearby-hikers-badge {
  background: #e8f5e8;
  color: #155724;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hike-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.action-button {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid #e5e5e5;
  background: #ffffff;
  color: #000000;
}

.action-button.emergency {
  background: #dc2626;
  color: #ffffff;
  border-color: #dc2626;
}

.action-button.emergency:hover:not(:disabled) {
  background: #b91c1c;
  border-color: #b91c1c;
}

.action-button.secondary:hover:not(:disabled) {
  border-color: #000000;
  background: #f8f9fa;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.end-hike-button {
  background: #666666;
}

.end-hike-button:hover:not(:disabled) {
  background: #444444;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  border-left: 4px solid #dc2626;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .hike-actions {
    grid-template-columns: 1fr;
  }
  
  .hike-stats {
    grid-template-columns: 1fr;
  }
}
</style>

