<template>
  <div id="app">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <h1>TrailLink</h1>
          <p class="tagline">LLM-Powered Route Planning</p>
        </div>
        <div class="header-actions">
          <div class="status-indicator" :class="{ offline: !backendConnected }">
            {{ backendConnected ? 'Online' : 'Offline' }}
          </div>
          <button class="menu-toggle" @click="toggleMenu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>

    <!-- Slide-out Navigation -->
    <div class="nav-overlay" :class="{ active: showMenu }" @click="closeMenu">
      <nav class="slide-nav" :class="{ active: showMenu }">
        <button class="close-nav" @click="closeMenu">×</button>
        <div class="nav-content">
          <h3>Menu</h3>
          
          <!-- Show user info if authenticated -->
          <div v-if="authStore.isAuthenticated" class="user-info">
            <div class="user-avatar">{{ displayName.charAt(0).toUpperCase() }}</div>
            <div class="user-details">
              <p class="user-name">{{ displayName }}</p>
              <p class="user-email">{{ authStore.userProfile?.email }}</p>
            </div>
          </div>
          
          <div class="nav-actions">
            <!-- Show different buttons based on auth state -->
            <template v-if="authStore.isAuthenticated">
              <button class="nav-button primary" @click="handleGetStarted">Plan a Route</button>
              <button class="nav-button secondary" @click="handleSignOut">Sign Out</button>
            </template>
            <template v-else>
              <button class="nav-button primary" @click="handleGetStarted">Get Started</button>
              <button class="nav-button secondary" @click="handleSignIn">Sign In</button>
            </template>
          </div>
        </div>
      </nav>
    </div>
    
    <!-- Auth Modal -->
    <AuthModal 
      :show="showAuthModal"
      :default-mode="authModalMode"
      @close="showAuthModal = false"
      @success="handleAuthSuccess"
    />
    
    <!-- Main Content -->
    <main class="app-main">
      <!-- Error Display -->
      <div v-if="appStore.error" class="error-banner">
        <span>{{ appStore.error }}</span>
        <button @click="appStore.clearError" class="dismiss-error">×</button>
      </div>

      <!-- Route Inputs -->
      <RouteInputs />
      
      <!-- Action Buttons -->
      <ActionButtons />
      
      <!-- Live Hiking Mode (only show for authenticated users) -->
      <LiveHikingMode
        v-if="authStore.isAuthenticated"
        :nearby-hikers-count="nearbyHikersCount"
        @hike-started="handleHikeStarted"
        @hike-ended="handleHikeEnded"
        @emergency-exit="handleEmergencyExit"
      />
      
      <!-- Nearby Hikers (only show when location sharing is enabled) -->
      <NearbyHikers
        v-if="authStore.isAuthenticated && authStore.visibilitySettings.showLiveLocation"
        :user-location="appStore.userLocation"
        :search-radius="5000"
        @hiker-selected="handleHikerSelected"
        @hikers-updated="handleHikersUpdated"
      />
      
      <!-- Community Feed (always visible) -->
      <CommunityFeed
        :user-location="appStore.userLocation"
        :radius="50000"
      />
      
      <!-- Map Display -->
      <div v-if="appStore.currentRoute" class="map-section">
        <h3 class="section-title">Your Route</h3>
        <GoogleMap 
          :route="appStore.currentRoute"
          :user-location="appStore.userLocation"
          height="500px"
          @location-selected="handleLocationSelected"
        />
        
        <!-- Route Details -->
        <div v-if="appStore.currentRoute" class="route-details">
          <div class="detail-item">
            <span class="label">Total Time:</span>
            <span class="value">{{ formatTime(appStore.currentRoute.metrics?.totalMin || 0) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">ETA:</span>
            <span class="value">{{ formatETA(appStore.currentRoute.metrics?.etaArrival) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Route ID:</span>
            <span class="value">{{ appStore.currentRoute.route_id || 'N/A' }}</span>
          </div>
        </div>
        
        <!-- Route Segments -->
        <div v-if="appStore.currentRoute?.segments" class="route-segments">
          <h4 class="segments-title">Route Steps</h4>
          <div class="segments-list">
            <div 
              v-for="(segment, index) in appStore.currentRoute.segments" 
              :key="index"
              class="segment-item"
              :class="`segment-${segment.mode}`"
            >
              <div class="segment-icon">
                <span v-if="segment.mode === 'transit'">🚌</span>
                <span v-else-if="segment.mode === 'hiking'">🥾</span>
                <span v-else-if="segment.mode === 'walking'">🚶</span>
                <span v-else>📍</span>
              </div>
              <div class="segment-content">
                <div class="segment-instructions">{{ segment.instructions }}</div>
                <div class="segment-metrics">
                  <span class="distance">{{ formatDistance(segment.distance) }}</span>
                  <span class="duration">{{ formatDuration(segment.duration) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Suggestions -->
        <div v-if="appStore.currentRoute?.suggestions" class="route-suggestions">
          <h4 class="suggestions-title">Tips & Suggestions</h4>
          <ul class="suggestions-list">
            <li v-for="(suggestion, index) in appStore.currentRoute.suggestions" :key="index" class="suggestion-item">
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="appStore.loading" class="loading-section">
        <LoadingSpinner message="Planning your route..." />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAppStore } from './stores/appStore.js'
import { useAuthStore } from './stores/authStore.js'
import { api } from './api/api.js'
import { formatTime } from './utils/helpers.js'

// Helper functions
const formatETA = (etaString) => {
  if (!etaString) return 'N/A'
  try {
    const date = new Date(etaString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  } catch (error) {
    return etaString
  }
}

const formatDistance = (distance) => {
  if (!distance) return 'N/A'
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance.toFixed(1)}km`
}

const formatDuration = (duration) => {
  if (!duration) return 'N/A'
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}
import RouteInputs from './components/RouteInputs.vue'
import ActionButtons from './components/ActionButtons.vue'
import GoogleMap from './components/GoogleMap.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'
import AuthModal from './components/AuthModal.vue'
import LiveHikingMode from './components/LiveHikingMode.vue'
import NearbyHikers from './components/NearbyHikers.vue'
import CommunityFeed from './components/CommunityFeed.vue'

const appStore = useAppStore()
const authStore = useAuthStore()

const showMenu = ref(false)
const showAuthModal = ref(false)
const authModalMode = ref('login')
const backendConnected = ref(false)
const nearbyHikers = ref([])

const displayName = computed(() => {
  return authStore.profileData?.displayName || authStore.userProfile?.username || 'User'
})

const nearbyHikersCount = computed(() => {
  return nearbyHikers.value.length
})

const handleHikersUpdated = (hikers) => {
  nearbyHikers.value = hikers
}

const handleHikerSelected = (hiker) => {
  console.log('Hiker selected:', hiker)
  // TODO: Center map on hiker location or show hiker details
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const closeMenu = () => {
  showMenu.value = false
}

const handleGetStarted = () => {
  if (!authStore.isAuthenticated) {
    // Show login modal
    showAuthModal.value = true
    authModalMode.value = 'register'
    closeMenu()
  } else {
    // Scroll to route inputs
    const routeInputs = document.querySelector('.route-inputs')
    if (routeInputs) {
      routeInputs.scrollIntoView({ behavior: 'smooth' })
    }
    closeMenu()
  }
}

const handleSignIn = () => {
  showAuthModal.value = true
  authModalMode.value = 'login'
  closeMenu()
}

const handleSignOut = async () => {
  await authStore.logout()
  closeMenu()
  appStore.setCurrentRoute(null)
}

const handleAuthSuccess = (data) => {
  console.log('Authentication successful:', data)
  // Optionally scroll to inputs after login
  setTimeout(() => {
    const routeInputs = document.querySelector('.route-inputs')
    if (routeInputs) {
      routeInputs.scrollIntoView({ behavior: 'smooth' })
    }
  }, 500)
}

const handleLocationSelected = (location) => {
  appStore.setUserLocation(location)
  console.log('Location selected:', location)
}

const handleHikeStarted = (data) => {
  console.log('Hike started:', data)
  // TODO: Could record hike start to backend or show notification
}

const handleHikeEnded = (data) => {
  console.log('Hike ended:', data)
  // TODO: Record hike completion to backend via UserHistory API
  // Could show completion modal with stats
}

const handleEmergencyExit = (data) => {
  console.log('Emergency exit requested:', data)
  // Emergency route planning is handled by LiveHikingMode component
}

// Check backend connection
const checkBackendConnection = async () => {
  try {
    backendConnected.value = await api.health()
  } catch (error) {
    backendConnected.value = false
  }
}

onMounted(async () => {
  // Initialize authentication
  const isAuthenticated = await authStore.initialize()
  
  if (!isAuthenticated) {
    // Show login modal if not authenticated
    setTimeout(() => {
      showAuthModal.value = true
      authModalMode.value = 'login'
    }, 1000)
  }
  
  checkBackendConnection()
  
  // Check connection every 30 seconds
  setInterval(checkBackendConnection, 30000)
})
</script>

<style>
/* Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #ffffff;
  color: #000000;
  line-height: 1.6;
  font-weight: 400;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.app-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  padding: 1.5rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo h1 {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #000000;
  margin: 0;
}

.tagline {
  font-size: 0.875rem;
  color: #666666;
  margin: 0;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.status-indicator {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: #f0f0f0;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-indicator.offline {
  background: #fee2e2;
  color: #dc2626;
}

/* Menu Toggle */
.menu-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.menu-toggle span {
  width: 20px;
  height: 2px;
  background-color: #000000;
  transition: all 0.3s ease;
}

.menu-toggle:hover span {
  background-color: #666666;
}

/* Slide-out Navigation */
.nav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.nav-overlay.active {
  opacity: 1;
  visibility: visible;
}

.slide-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 320px;
  height: 100%;
  background-color: #000000;
  color: #ffffff;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 1001;
}

.slide-nav.active {
  transform: translateX(0);
}

.close-nav {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

.nav-content {
  padding: 4rem 2rem 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.nav-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 2rem;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #ffffff;
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-email {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 200px;
}

.nav-button {
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #ffffff;
  background: none;
  color: #ffffff;
}

.nav-button.primary {
  background-color: #ffffff;
  color: #000000;
}

.nav-button.primary:hover {
  background-color: #f0f0f0;
}

.nav-button.secondary:hover {
  background-color: #ffffff;
  color: #000000;
}

/* Main Content */
.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Error Banner */
.error-banner {
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid #dc2626;
}

.dismiss-error {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
}

/* Map Section */
.map-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #000000;
}

/* Route Details */
.route-details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item .label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #666666;
}

.detail-item .value {
  font-size: 1rem;
  font-weight: 600;
  color: #000000;
}

/* Route Segments */
.route-segments {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  margin-top: 1rem;
  padding: 1.5rem;
}

.segments-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #000000;
}

.segments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.segment-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #e5e5e5;
}

.segment-item.segment-transit {
  background: #f0f7ff;
  border-left-color: #4285F4;
}

.segment-item.segment-hiking {
  background: #f0f9f0;
  border-left-color: #34A853;
}

.segment-item.segment-walking {
  background: #f0f9f0;
  border-left-color: #34A853;
}

.segment-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.segment-content {
  flex: 1;
}

.segment-instructions {
  font-size: 1rem;
  font-weight: 500;
  color: #000000;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.segment-metrics {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #666666;
}

.segment-metrics .distance {
  font-weight: 500;
}

.segment-metrics .duration {
  font-weight: 500;
}

/* Route Suggestions */
.route-suggestions {
  background: #fff8e1;
  border: 1px solid #ffcc02;
  border-radius: 8px;
  margin-top: 1rem;
  padding: 1.5rem;
}

.suggestions-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #000000;
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #ffcc02;
  font-size: 0.875rem;
  color: #333333;
  line-height: 1.4;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item::before {
  content: "💡";
  margin-right: 0.5rem;
}

/* Loading Section */
.loading-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }
  
  .app-main {
    padding: 1rem;
  }
  
  .slide-nav {
    width: 100%;
  }
  
  .nav-content {
    padding: 3rem 1rem 2rem;
  }
  
  .route-details {
    grid-template-columns: 1fr;
  }
}
</style>