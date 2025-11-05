<template>
  <div class="community-feed">
    <div class="feed-header">
      <h3 class="section-title">Community Activity</h3>
      <div class="view-toggle">
        <button
          class="toggle-btn"
          :class="{ active: activeView === 'recent' }"
          @click="activeView = 'recent'"
        >
          Recent
        </button>
        <button
          class="toggle-btn"
          :class="{ active: activeView === 'popular' }"
          @click="activeView = 'popular'"
        >
          Popular
        </button>
      </div>
    </div>
    
    <!-- Recent Activity Feed -->
    <div v-if="activeView === 'recent'" class="feed-content">
      <div v-if="loading && activities.length === 0" class="loading-state">
        <p>Loading recent activities...</p>
      </div>
      
      <div v-else-if="activities.length === 0" class="empty-state">
        <p>No recent activities in your area</p>
      </div>
      
      <div v-else class="activities-list">
        <div
          v-for="activity in activities"
          :key="activity.entryId"
          class="activity-card"
        >
          <div class="activity-icon">
            {{ getActivityIcon(activity.activityType) }}
          </div>
          
          <div class="activity-content">
            <p class="activity-text">
              <span class="activity-type">{{ formatActivityType(activity.activityType) }}</span>
              <span v-if="activity.activityData?.routeName" class="route-name">
                {{ activity.activityData.routeName }}
              </span>
            </p>
            
            <div class="activity-meta">
              <span class="timestamp">{{ formatTimestamp(activity.timestamp) }}</span>
              <span v-if="activity.location" class="location">
                {{ formatLocation(activity.location) }}
              </span>
            </div>
            
            <div v-if="activity.activityData" class="activity-stats">
              <span v-if="activity.activityData.distance" class="stat">
                📏 {{ formatDistance(activity.activityData.distance) }}
              </span>
              <span v-if="activity.activityData.duration" class="stat">
                ⏱️ {{ formatDuration(activity.activityData.duration) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <button
        v-if="activities.length > 0 && !loading"
        class="load-more-btn"
        @click="loadMoreActivities"
        :disabled="loading"
      >
        {{ loading ? 'Loading...' : 'Load More' }}
      </button>
    </div>
    
    <!-- Popular Routes -->
    <div v-else class="feed-content">
      <div class="time-window-selector">
        <button
          v-for="window in timeWindows"
          :key="window.value"
          class="window-btn"
          :class="{ active: selectedTimeWindow === window.value }"
          @click="selectedTimeWindow = window.value"
        >
          {{ window.label }}
        </button>
      </div>
      
      <div v-if="loading && popularRoutes.length === 0" class="loading-state">
        <p>Loading popular routes...</p>
      </div>
      
      <div v-else-if="popularRoutes.length === 0" class="empty-state">
        <p>No popular routes this {{ selectedTimeWindow }}</p>
      </div>
      
      <div v-else class="popular-routes-list">
        <div
          v-for="(route, index) in popularRoutes"
          :key="route.routeId"
          class="popular-route-card"
        >
          <div class="route-rank">
            <span class="rank-number">{{ index + 1 }}</span>
          </div>
          
          <div class="route-details">
            <h4 class="route-name">{{ route.routeName || `Route ${route.routeId}` }}</h4>
            <div class="route-stats">
              <span class="stat">{{ route.count }} {{ route.count === 1 ? 'hike' : 'hikes' }}</span>
              <span v-if="route.avgRating" class="stat">⭐ {{ route.avgRating.toFixed(1) }}</span>
            </div>
          </div>
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
import { ref, watch, onMounted } from 'vue'
import { useAppStore } from '../stores/appStore.js'
import { api } from '../api/api.js'

const props = defineProps({
  userLocation: {
    type: Object,
    default: null
  },
  radius: {
    type: Number,
    default: 50000 // 50km
  }
})

const appStore = useAppStore()

const activeView = ref('recent')
const activities = ref([])
const popularRoutes = ref([])
const loading = ref(false)
const error = ref(null)
const limit = ref(20)

const selectedTimeWindow = ref('week')
const timeWindows = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' }
]

const getActivityIcon = (type) => {
  const icons = {
    hike_completed: '🥾',
    route_saved: '⭐',
    route_planned: '🗺️',
    trail_rated: '⭐',
    poi_visited: '📍'
  }
  return icons[type] || '📌'
}

const formatActivityType = (type) => {
  const types = {
    hike_completed: 'Completed hike',
    route_saved: 'Saved route',
    route_planned: 'Planned route',
    trail_rated: 'Rated trail',
    poi_visited: 'Visited'
  }
  return types[type] || type.replace('_', ' ')
}

const formatTimestamp = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString()
}

const formatLocation = (location) => {
  if (!location || !location.coordinates) return ''
  
  const [lng, lat] = location.coordinates
  return `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`
}

const formatDistance = (distance) => {
  if (!distance && distance !== 0) return ''
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance.toFixed(1)}km`
}

const formatDuration = (duration) => {
  if (!duration && duration !== 0) return ''
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const fetchRecentActivities = async () => {
  try {
    loading.value = true
    error.value = null
    
    const location = props.userLocation || appStore.userLocation
    
    const requestBody = {
      limit: limit.value
    }
    
    if (location && location.lat && location.lng) {
      requestBody.location = {
        type: 'Point',
        coordinates: [location.lng || location.lon, location.lat]
      }
      requestBody.radius = props.radius
    }
    
    const response = await api.getPublicFeed(
      requestBody.location,
      requestBody.radius,
      requestBody.limit
    )
    
    if (response.entries) {
      activities.value = response.entries
    } else {
      activities.value = []
    }
    
  } catch (err) {
    console.error('Failed to fetch recent activities:', err)
    error.value = err.message || 'Failed to load activities'
    activities.value = []
  } finally {
    loading.value = false
  }
}

const fetchPopularRoutes = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await api.getPopularRoutes(selectedTimeWindow.value, 10)
    
    if (response.routes) {
      popularRoutes.value = response.routes
    } else {
      popularRoutes.value = []
    }
    
  } catch (err) {
    console.error('Failed to fetch popular routes:', err)
    error.value = err.message || 'Failed to load popular routes'
    popularRoutes.value = []
  } finally {
    loading.value = false
  }
}

const loadMoreActivities = () => {
  limit.value += 20
  fetchRecentActivities()
}

// Watch for view changes
watch(activeView, (newView) => {
  if (newView === 'recent' && activities.value.length === 0) {
    fetchRecentActivities()
  } else if (newView === 'popular' && popularRoutes.value.length === 0) {
    fetchPopularRoutes()
  }
})

// Watch for time window changes
watch(selectedTimeWindow, () => {
  if (activeView.value === 'popular') {
    fetchPopularRoutes()
  }
})

onMounted(() => {
  fetchRecentActivities()
})
</script>

<style scoped>
.community-feed {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.feed-header {
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

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.toggle-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #666666;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: #000000;
  color: #ffffff;
  border-color: #000000;
}

.toggle-btn:hover:not(.active) {
  border-color: #000000;
}

.feed-content {
  min-height: 200px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666666;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.activity-card:hover {
  border-color: #000000;
  background: #f8f9fa;
}

.activity-icon {
  width: 40px;
  height: 40px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: 0.95rem;
  color: #000000;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.activity-type {
  font-weight: 600;
}

.route-name {
  color: #666666;
  margin-left: 0.5rem;
}

.activity-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8125rem;
  color: #666666;
  margin-bottom: 0.5rem;
}

.activity-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.8125rem;
  color: #666666;
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.load-more-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover:not(:disabled) {
  background: #e5e5e5;
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.time-window-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.window-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #666666;
  font-size: 0.8125rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.window-btn.active {
  background: #000000;
  color: #ffffff;
  border-color: #000000;
}

.window-btn:hover:not(.active) {
  border-color: #000000;
}

.popular-routes-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.popular-route-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.popular-route-card:hover {
  border-color: #000000;
  background: #f8f9fa;
}

.route-rank {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4285F4, #34A853);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rank-number {
  color: #ffffff;
  font-size: 1.125rem;
  font-weight: 700;
}

.route-details {
  flex: 1;
  min-width: 0;
}

.route-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #000000;
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.route-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.8125rem;
  color: #666666;
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
  .feed-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .view-toggle {
    width: 100%;
  }
  
  .toggle-btn {
    flex: 1;
  }
}
</style>

