<template>
  <div class="nearby-hikers">
    <div class="header">
      <h4 class="title">
        <span class="icon">👥</span>
        Nearby Hikers
      </h4>
      <button
        v-if="authStore.isLiveHiking"
        class="refresh-button"
        @click="fetchNearbyHikers"
        :disabled="loading"
      >
        {{ loading ? '⟳' : '↻' }}
      </button>
    </div>
    
    <!-- Not sharing location -->
    <div v-if="!authStore.visibilitySettings.showLiveLocation" class="info-message">
      <p>
        <span class="icon">📍</span>
        Enable location sharing to see nearby hikers
      </p>
    </div>
    
    <!-- Loading state -->
    <div v-else-if="loading && hikers.length === 0" class="loading-state">
      <p>Searching for nearby hikers...</p>
    </div>
    
    <!-- No hikers found -->
    <div v-else-if="hikers.length === 0" class="empty-state">
      <p>No hikers nearby right now</p>
      <p class="hint">Other hikers within {{ formatDistance(searchRadius) }} will appear here</p>
    </div>
    
    <!-- Hikers list -->
    <div v-else class="hikers-list">
      <div
        v-for="hiker in hikers"
        :key="hiker.userId"
        class="hiker-card"
        @click="handleHikerClick(hiker)"
      >
        <div class="hiker-avatar">
          {{ hiker.displayName?.charAt(0).toUpperCase() || '?' }}
        </div>
        
        <div class="hiker-info">
          <h5 class="hiker-name">{{ hiker.displayName || 'Anonymous Hiker' }}</h5>
          <div class="hiker-meta">
            <span class="experience-badge" :class="`level-${hiker.experienceLevel}`">
              {{ formatExperienceLevel(hiker.experienceLevel) }}
            </span>
            <span class="distance">{{ formatDistance(hiker.distance) }} away</span>
          </div>
          <p v-if="hiker.currentActivity" class="current-activity">
            {{ hiker.currentActivity }}
          </p>
        </div>
      </div>
    </div>
    
    <!-- Error display -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/authStore.js'
import { useAppStore } from '../stores/appStore.js'
import { api } from '../api/api.js'

const props = defineProps({
  userLocation: {
    type: Object,
    default: null
  },
  searchRadius: {
    type: Number,
    default: 5000 // 5km
  },
  autoRefresh: {
    type: Boolean,
    default: true
  },
  refreshInterval: {
    type: Number,
    default: 30000 // 30 seconds
  }
})

const emit = defineEmits(['hiker-selected', 'hikers-updated'])

const authStore = useAuthStore()
const appStore = useAppStore()

const hikers = ref([])
const loading = ref(false)
const error = ref(null)

let refreshTimer = null

const formatDistance = (meters) => {
  if (!meters && meters !== 0) return 'N/A'
  
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

const formatExperienceLevel = (level) => {
  const levels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    expert: 'Expert'
  }
  return levels[level] || level
}

const fetchNearbyHikers = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Check if user is authenticated and sharing location
    if (!authStore.isAuthenticated || !authStore.visibilitySettings.showLiveLocation) {
      hikers.value = []
      return
    }
    
    // Use provided location or user's current location
    const location = props.userLocation || appStore.userLocation
    
    if (!location || !location.lat || !location.lng) {
      error.value = 'Location not available'
      return
    }
    
    // Fetch nearby hikers from API
    const response = await api.getNearbyActiveHikers(
      authStore.sessionToken,
      authStore.userId,
      location,
      props.searchRadius
    )
    
    if (response.hikers) {
      hikers.value = response.hikers
      emit('hikers-updated', response.hikers)
    } else {
      hikers.value = []
    }
    
  } catch (err) {
    console.error('Failed to fetch nearby hikers:', err)
    error.value = err.message || 'Failed to load nearby hikers'
    hikers.value = []
  } finally {
    loading.value = false
  }
}

const handleHikerClick = (hiker) => {
  emit('hiker-selected', hiker)
}

const startAutoRefresh = () => {
  if (!props.autoRefresh) return
  
  stopAutoRefresh()
  
  refreshTimer = setInterval(() => {
    if (authStore.visibilitySettings.showLiveLocation) {
      fetchNearbyHikers()
    }
  }, props.refreshInterval)
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// Watch for location sharing changes
watch(() => authStore.visibilitySettings.showLiveLocation, (isSharing) => {
  if (isSharing) {
    fetchNearbyHikers()
    startAutoRefresh()
  } else {
    hikers.value = []
    stopAutoRefresh()
  }
})

// Watch for user location changes
watch(() => props.userLocation, (newLocation) => {
  if (newLocation && authStore.visibilitySettings.showLiveLocation) {
    fetchNearbyHikers()
  }
}, { deep: true })

onMounted(() => {
  if (authStore.visibilitySettings.showLiveLocation) {
    fetchNearbyHikers()
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.nearby-hikers {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title .icon {
  font-size: 1.25rem;
}

.refresh-button {
  background: none;
  border: 1px solid #d1d5db;
  color: #666666;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: all 0.2s ease;
}

.refresh-button:hover:not(:disabled) {
  border-color: #000000;
  color: #000000;
  transform: rotate(180deg);
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.info-message,
.loading-state,
.empty-state {
  text-align: center;
  padding: 1.5rem;
  color: #666666;
}

.info-message {
  background: #f0f7ff;
  border-radius: 6px;
}

.info-message p {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.empty-state .hint {
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

.hikers-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.hiker-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hiker-card:hover {
  border-color: #000000;
  background: #f8f9fa;
  transform: translateY(-1px);
}

.hiker-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4285F4, #34A853);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
}

.hiker-info {
  flex: 1;
  min-width: 0;
}

.hiker-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #000000;
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hiker-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.experience-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.experience-badge.level-beginner {
  background: #e8f5e8;
  color: #155724;
}

.experience-badge.level-intermediate {
  background: #fff8e1;
  color: #856404;
}

.experience-badge.level-advanced {
  background: #f0f7ff;
  color: #1e40af;
}

.experience-badge.level-expert {
  background: #fee2e2;
  color: #dc2626;
}

.distance {
  font-size: 0.75rem;
  color: #666666;
  font-weight: 500;
}

.current-activity {
  font-size: 0.8125rem;
  color: #666666;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  .hiker-card {
    padding: 0.75rem;
  }
  
  .hiker-avatar {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}
</style>

