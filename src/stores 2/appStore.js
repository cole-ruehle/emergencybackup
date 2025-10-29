import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/api.js'

export const useAppStore = defineStore('app', () => {
  // Core UI State (matching your spec)
  const origin = ref('')
  const home = ref('')
  const destinationHint = ref('')
  const currentRoute = ref(null)
  const userLocation = ref(null)
  
  // User Preferences
  const prefs = ref({
    avoid: { tolls: false, highways: false },
    modePriority: ['transit', 'walking'],
    minHikeMinutes: 30,
    accessibility: false
  })
  
  // Time constraints
  const time = ref({
    type: 'depart_at', // or 'arrive_by'
    iso: new Date().toISOString()
  })
  
  // Context
  const context = ref({
    daylight: {
      sunriseIso: '',
      sunsetIso: ''
    },
    detourLimitMin: 20,
    locale: 'en-US',
    units: 'metric'
  })
  
  // Debug limits
  const debugLimits = ref({
    maxCandidatePlaces: 5,
    maxAlternatives: 3
  })
  
  // Recent actions
  const buttonsPressed = ref([])
  
  // App state
  const loading = ref(false)
  const error = ref(null)
  
  // Computed state for API calls
  const uiState = computed(() => ({
    origin: origin.value,
    home: home.value,
    destinationHint: destinationHint.value,
    currentRoute: currentRoute.value,
    prefs: prefs.value,
    time: time.value,
    context: context.value,
    buttonsPressed: buttonsPressed.value,
    userLocation: userLocation.value,
    debugLimits: debugLimits.value
  }))
  
  // Actions
  const setOrigin = (value) => {
    origin.value = value
  }
  
  const setHome = (value) => {
    home.value = value
  }
  
  const setDestinationHint = (value) => {
    destinationHint.value = value
  }
  
  const setCurrentRoute = (route) => {
    currentRoute.value = route
  }
  
  const setUserLocation = (location) => {
    userLocation.value = location
  }
  
  const addButtonPress = (action) => {
    buttonsPressed.value = [action, ...buttonsPressed.value.slice(0, 4)] // Keep last 5
  }
  
  const setLoading = (value) => {
    loading.value = value
  }
  
  const setError = (errorMessage) => {
    error.value = errorMessage
  }
  
  const clearError = () => {
    error.value = null
  }
  
  const updatePrefs = (newPrefs) => {
    prefs.value = { ...prefs.value, ...newPrefs }
  }
  
  const updateTime = (newTime) => {
    time.value = { ...time.value, ...newTime }
  }
  
  const updateContext = (newContext) => {
    context.value = { ...context.value, ...newContext }
  }
  
  // Get user's current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          resolve(location)
        },
        (error) => {
          console.warn('Geolocation error:', error.message)
          // Don't reject, just use fallback
          const fallbackLocation = { lat: 42.3601, lng: -71.0589 }
          setUserLocation(fallbackLocation)
          resolve(fallbackLocation)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }
  
  // Plan route using LLM + Google Maps
  const planRoute = async (query) => {
    try {
      setLoading(true)
      clearError()
      
      // Ensure we have a valid user location
      let location = userLocation.value
      if (!location || !location.lat || !location.lng) {
        // Fallback to Boston if no user location
        location = { lat: 42.3601, lng: -71.0589 }
        console.warn('No user location found, using fallback location:', location)
      }
      
      // Convert preferences to the format expected by backend
      const preferences = {
        duration: prefs.value.minHikeMinutes ? Math.ceil(prefs.value.minHikeMinutes / 60) : undefined,
        transportModes: prefs.value.modePriority || ['transit', 'walking'],
        avoid: Object.keys(prefs.value.avoid || {}).filter(key => prefs.value.avoid[key]),
        accessibility: prefs.value.accessibility || false
      }
      
      // Include current route context for modifications
      const currentRouteContext = currentRoute.value ? {
        routeId: currentRoute.value.route_id,
        routeName: currentRoute.value.name,
        currentDestination: currentRoute.value.destination,
        currentOrigin: currentRoute.value.origin,
        currentSegments: currentRoute.value.segments,
        currentWaypoints: currentRoute.value.waypoints
      } : null
      
      console.log('Sending request to backend:', { 
        query, 
        userLocation: location, 
        preferences,
        currentRoute: currentRouteContext
      })
      
      const response = await api.planRoute(query, location, preferences, currentRouteContext)
      
      if (response.route) {
        setCurrentRoute(response.route)
        addButtonPress('plan_route')
        return response
      } else {
        throw new Error('No route returned from backend')
      }
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }
  
  return {
    // State
    origin,
    home,
    destinationHint,
    currentRoute,
    userLocation,
    prefs,
    time,
    context,
    debugLimits,
    buttonsPressed,
    loading,
    error,
    uiState,
    
    // Actions
    setOrigin,
    setHome,
    setDestinationHint,
    setCurrentRoute,
    setUserLocation,
    addButtonPress,
    setLoading,
    setError,
    clearError,
    updatePrefs,
    updateTime,
    updateContext,
    getCurrentLocation,
    planRoute
  }
})