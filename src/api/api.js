// API service for TrailLink backend
// Version 1.0.0 - Updated with full authentication and social features

const API_BASE_URL = 'http://localhost:8000/api' // Updated base URL

export const api = {
  // ==================== User Management ====================
  
  async register(username, password, email) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Register API error:', error)
      throw error
    }
  },

  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Login API error:', error)
      throw error
    }
  },

  async authenticate(sessionToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Authenticate API error:', error)
      throw error
    }
  },

  async logout(sessionToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Logout API error:', error)
      throw error
    }
  },

  async updatePassword(sessionToken, userId, oldPassword, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/updatePassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, userId, oldPassword, newPassword })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Update password API error:', error)
      throw error
    }
  },

  async getUserProfile(sessionToken, userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/getUserProfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, userId })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Get user profile API error:', error)
      throw error
    }
  },

  // ==================== Profile Management ====================

  async createProfile(sessionToken, userId, displayName, bio, experienceLevel) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/createProfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, userId, displayName, bio, experienceLevel })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Create profile API error:', error)
      throw error
    }
  },

  async updateProfile(sessionToken, userId, profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/updateProfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, userId, ...profileData })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Update profile API error:', error)
      throw error
    }
  },

  async setVisibility(sessionToken, userId, visibilitySettings) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/setVisibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, userId, ...visibilitySettings })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Set visibility API error:', error)
      throw error
    }
  },

  async getProfile(sessionToken, userId, viewerUserId = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/getProfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, userId, viewerUserId })
      })
      
      const data = await response.json()
      // Profile can be null if not found or private
      return data
    } catch (error) {
      console.error('Get profile API error:', error)
      throw error
    }
  },

  async deleteProfile(sessionToken, userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/deleteProfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, userId })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Delete profile API error:', error)
      throw error
    }
  },

  async getNearbyActiveHikers(sessionToken, userId, location, radius = 5000) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/getNearbyActiveHikers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          userId,
          location: {
            type: 'Point',
            coordinates: [location.lng || location.lon, location.lat]
          },
          radius
        })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Get nearby active hikers API error:', error)
      throw error
    }
  },

  // ==================== Activity & History ====================

  async getUserHistory(sessionToken, userId, limit = 50, activityType = null) {
    try {
      const body = { sessionToken, userId, limit }
      if (activityType) body.activityType = activityType
      
      const response = await fetch(`${API_BASE_URL}/userHistory/getUserHistory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Get user history API error:', error)
      throw error
    }
  },

  async getUserStats(sessionToken, userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/userHistory/getUserStats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, userId })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Get user stats API error:', error)
      throw error
    }
  },

  async getPublicFeed(location = null, radius = null, limit = 50) {
    try {
      const body = { limit }
      if (location) body.location = location
      if (radius) body.radius = radius
      
      const response = await fetch(`${API_BASE_URL}/userHistory/getPublicFeed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Get public feed API error:', error)
      throw error
    }
  },

  async getPopularRoutes(timeWindow, limit = 20) {
    try {
      const response = await fetch(`${API_BASE_URL}/userHistory/getPopularRoutes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeWindow, limit })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Get popular routes API error:', error)
      throw error
    }
  },

  async recordActivity(sessionToken, userId, activityData) {
    try {
      const response = await fetch(`${API_BASE_URL}/UserHistory/recordActivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionToken, 
          userId, 
          ...activityData 
        })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Record activity API error:', error)
      throw error
    }
  },

  async getUserAchievements(sessionToken, userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/UserHistory/getUserAchievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, userId })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Get user achievements API error:', error)
      throw error
    }
  },

  // ==================== Route Planning (LLM) ====================

  async planRoute(sessionToken, query, userLocation, preferences = {}, currentRoute = null) {
    try {
      const requestBody = {
        sessionToken,
        query,
        userLocation,
        preferences
      }
      
      // Include current route context if available
      if (currentRoute) {
        requestBody.currentRoute = currentRoute
      }
      
      const response = await fetch(`${API_BASE_URL}/llmRoutePlanner/planRoute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Plan route API error:', error)
      throw error
    }
  },

  async getGlobalStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/llmRoutePlanner/getGlobalStats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Get global stats API error:', error)
      throw error
    }
  },

  // ==================== Location Services ====================

  async searchLocations(query, limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/UnifiedRouting/searchLocations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Search locations API error:', error)
      throw error
    }
  },

  async geocodeAddress(address, limit = 5) {
    try {
      const response = await fetch(`${API_BASE_URL}/LocationSearch/geocodeAddress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, limit })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Geocode address API error:', error)
      throw error
    }
  },

  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(`${API_BASE_URL}/LocationSearch/reverseGeocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      })
      
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      return data
    } catch (error) {
      console.error('Reverse geocode API error:', error)
      throw error
    }
  },

  // ==================== Legacy/Utility ====================

  // Health check (no auth required)
  async health() {
    try {
      const response = await fetch('http://localhost:8000/api/health')
      return response.ok
    } catch (error) {
      return false
    }
  }
}
