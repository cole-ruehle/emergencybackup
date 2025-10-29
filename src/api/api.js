// API service for LLM orchestration backend

const API_BASE_URL = 'http://localhost:8000' // Update with your backend URL

export const api = {
  // Plan route using LLM + Google Maps
  async planRoute(query, userLocation, preferences = {}, currentRoute = null) {
    try {
      const requestBody = {
        query,
        userLocation,
        preferences
      }
      
      // Include current route context if available
      if (currentRoute) {
        requestBody.currentRoute = currentRoute
      }
      
      const response = await fetch(`${API_BASE_URL}/api/plan-route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Plan route API error:', error)
      throw error
    }
  },

  // Send state + action to backend for LLM orchestration
  async orchestrate(state, action) {
    try {
      const response = await fetch(`${API_BASE_URL}/orchestrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state,
          action
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Orchestration API error:', error)
      throw error
    }
  },

  // Optional: Get pre-rendered display artifacts
  async render(routeId) {
    try {
      const response = await fetch(`${API_BASE_URL}/render`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ routeId })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Render API error:', error)
      throw error
    }
  },

  // Health check
  async health() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`)
      return response.ok
    } catch (error) {
      return false
    }
  }
}
