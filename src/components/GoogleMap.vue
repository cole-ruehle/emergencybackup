<template>
  <div class="map-container">
    <div ref="mapElement" class="map"></div>
    <div v-if="loading" class="map-loading">
      <LoadingSpinner message="Loading map..." />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

const props = defineProps({
  route: {
    type: Object,
    default: null
  },
  userLocation: {
    type: Object,
    default: null
  },
  height: {
    type: String,
    default: '400px'
  }
})

const emit = defineEmits(['map-loaded', 'location-selected'])

const mapElement = ref(null)
const map = ref(null)
const directionsService = ref(null)
const directionsRenderer = ref(null)
const loading = ref(false)

// Load Google Maps API dynamically
const loadGoogleMapsAPI = () => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,directions`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      console.log('Google Maps API loaded')
      resolve()
    }
    
    script.onerror = () => {
      console.error('Failed to load Google Maps API')
      reject(new Error('Failed to load Google Maps API'))
    }
    
    document.head.appendChild(script)
  })
}

// Initialize Google Maps
const initMap = async () => {
  try {
    await loadGoogleMapsAPI()
  } catch (error) {
    console.error('Google Maps API not loaded:', error)
    return
  }

  try {
    loading.value = true
    
    // Create map
    map.value = new window.google.maps.Map(mapElement.value, {
      center: { lat: 42.3601, lng: -71.0589 }, // Boston default
      zoom: 12,
      mapTypeId: 'terrain'
    })
    
    // Initialize services
    directionsService.value = new window.google.maps.DirectionsService()
    directionsRenderer.value = new window.google.maps.DirectionsRenderer({
      draggable: false,
      suppressMarkers: false
    })
    
    directionsRenderer.value.setMap(map.value)
    
    // Add click listener for location selection
    map.value.addListener('click', (event) => {
      const location = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      }
      emit('location-selected', location)
    })
    
    emit('map-loaded', map.value)
    loading.value = false
  } catch (error) {
    console.error('Error initializing map:', error)
    loading.value = false
  }
}

// Render route on map
const renderRoute = (route) => {
  if (!route || !map.value) return
  
  console.log('Rendering route:', route)
  
  // Clear existing markers and polylines
  if (window.routeMarkers) {
    window.routeMarkers.forEach(marker => marker.setMap(null))
  }
  if (window.routePolylines) {
    window.routePolylines.forEach(polyline => polyline.setMap(null))
  }
  
  window.routeMarkers = []
  window.routePolylines = []
  
  // Add origin marker
  if (route.origin) {
    const originMarker = new window.google.maps.Marker({
      position: route.origin,
      map: map.value,
      title: 'Start',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#34A853" stroke="white" stroke-width="2"/>
            <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">S</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24)
      }
    })
    window.routeMarkers.push(originMarker)
  }
  
  // Add destination marker
  if (route.destination) {
    const destMarker = new window.google.maps.Marker({
      position: route.destination,
      map: map.value,
      title: 'Destination',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#EA4335" stroke="white" stroke-width="2"/>
            <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">E</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24)
      }
    })
    window.routeMarkers.push(destMarker)
  }
  
  // Add waypoint markers
  if (route.waypoints) {
    route.waypoints.forEach((waypoint, index) => {
      const waypointMarker = new window.google.maps.Marker({
        position: waypoint,
        map: map.value,
        title: waypoint.name || `Waypoint ${index + 1}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="6" fill="#FF9800" stroke="white" stroke-width="2"/>
              <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${index + 1}</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(20, 20)
        }
      })
      window.routeMarkers.push(waypointMarker)
    })
  }
  
  // Draw route segments
  if (route.segments && route.segments.length > 0) {
    let currentPosition = route.origin
    
    route.segments.forEach((segment, index) => {
      if (segment.waypoints && segment.waypoints.length > 0) {
        const path = [currentPosition, ...segment.waypoints]
        
        const polyline = new window.google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: getSegmentColor(segment.mode),
          strokeOpacity: 0.8,
          strokeWeight: 4,
          map: map.value
        })
        
        window.routePolylines.push(polyline)
        
        // Update current position to last waypoint
        currentPosition = segment.waypoints[segment.waypoints.length - 1]
      }
    })
  }
  
  // Fit map to show all markers
  if (window.routeMarkers.length > 0) {
    const bounds = new window.google.maps.LatLngBounds()
    window.routeMarkers.forEach(marker => {
      bounds.extend(marker.getPosition())
    })
    map.value.fitBounds(bounds)
  }
}

// Get color for different segment modes
const getSegmentColor = (mode) => {
  switch (mode) {
    case 'transit': return '#4285F4'  // Blue for transit
    case 'hiking': return '#34A853'   // Green for hiking
    case 'walking': return '#34A853'  // Green for walking
    case 'driving': return '#FF9800'  // Orange for driving
    default: return '#9E9E9E'         // Gray for unknown
  }
}

// Watch for route changes
watch(() => props.route, (newRoute) => {
  if (newRoute && map.value) {
    renderRoute(newRoute)
  }
}, { deep: true })

// Watch for user location
watch(() => props.userLocation, (location) => {
  if (location && map.value) {
    map.value.setCenter(location)
    new window.google.maps.Marker({
      position: location,
      map: map.value,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24)
      }
    })
  }
})

onMounted(() => {
  nextTick(() => {
    initMap()
  })
})
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: v-bind(height);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.map {
  width: 100%;
  height: 100%;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
</style>
