import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/api.js'

export const useAuthStore = defineStore('auth', () => {
  // ==================== State ====================
  
  const sessionToken = ref(null)
  const userId = ref(null)
  const userProfile = ref(null)
  const profileData = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // Privacy settings
  const visibilitySettings = ref({
    showLiveLocation: false,
    profileVisibility: 'public',
    shareStats: true,
    shareHomeLocation: false
  })
  
  // User stats
  const userStats = ref(null)
  
  // ==================== Computed ====================
  
  const isAuthenticated = computed(() => {
    return !!sessionToken.value && !!userId.value
  })
  
  const isLiveHiking = computed(() => {
    return visibilitySettings.value.showLiveLocation
  })
  
  // ==================== Persistence ====================
  
  const loadFromLocalStorage = () => {
    try {
      const token = localStorage.getItem('sessionToken')
      const id = localStorage.getItem('userId')
      const profile = localStorage.getItem('userProfile')
      const profileDataStored = localStorage.getItem('profileData')
      const visibility = localStorage.getItem('visibilitySettings')
      
      if (token) sessionToken.value = token
      if (id) userId.value = id
      if (profile) userProfile.value = JSON.parse(profile)
      if (profileDataStored) profileData.value = JSON.parse(profileDataStored)
      if (visibility) visibilitySettings.value = JSON.parse(visibility)
      
      return !!token && !!id
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      return false
    }
  }
  
  const saveToLocalStorage = () => {
    try {
      if (sessionToken.value) {
        localStorage.setItem('sessionToken', sessionToken.value)
      }
      if (userId.value) {
        localStorage.setItem('userId', userId.value)
      }
      if (userProfile.value) {
        localStorage.setItem('userProfile', JSON.stringify(userProfile.value))
      }
      if (profileData.value) {
        localStorage.setItem('profileData', JSON.stringify(profileData.value))
      }
      if (visibilitySettings.value) {
        localStorage.setItem('visibilitySettings', JSON.stringify(visibilitySettings.value))
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }
  
  const clearLocalStorage = () => {
    localStorage.removeItem('sessionToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('userProfile')
    localStorage.removeItem('profileData')
    localStorage.removeItem('visibilitySettings')
  }
  
  // ==================== Actions ====================
  
  const setError = (message) => {
    error.value = message
  }
  
  const clearError = () => {
    error.value = null
  }
  
  // Register new user
  const register = async (username, password, email) => {
    try {
      loading.value = true
      clearError()
      
      const response = await api.register(username, password, email)
      
      if (response.userId) {
        // Auto-login after registration
        const loginResponse = await api.login(username, password)
        
        sessionToken.value = loginResponse.sessionToken
        userId.value = loginResponse.userId
        
        saveToLocalStorage()
        
        // Fetch initial profile data
        await fetchUserProfile()
        await fetchProfileData()
        
        return response
      }
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  // Login existing user
  const login = async (username, password) => {
    try {
      loading.value = true
      clearError()
      
      const response = await api.login(username, password)
      
      sessionToken.value = response.sessionToken
      userId.value = response.userId
      
      saveToLocalStorage()
      
      // Fetch user data
      await fetchUserProfile()
      await fetchProfileData()
      
      return response
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  // Logout user
  const logout = async () => {
    try {
      loading.value = true
      
      if (sessionToken.value) {
        await api.logout(sessionToken.value)
      }
      
      // Clear state
      sessionToken.value = null
      userId.value = null
      userProfile.value = null
      profileData.value = null
      userStats.value = null
      
      clearLocalStorage()
      clearError()
      
    } catch (error) {
      console.error('Logout error:', error)
      // Clear state anyway
      sessionToken.value = null
      userId.value = null
      userProfile.value = null
      profileData.value = null
      clearLocalStorage()
    } finally {
      loading.value = false
    }
  }
  
  // Validate session token
  const validateSession = async () => {
    try {
      if (!sessionToken.value) {
        return false
      }
      
      const response = await api.authenticate(sessionToken.value)
      
      if (response.userId) {
        userId.value = response.userId
        return true
      }
      
      return false
    } catch (error) {
      console.error('Session validation failed:', error)
      // Clear invalid session
      await logout()
      return false
    }
  }
  
  // Fetch user account info
  const fetchUserProfile = async () => {
    try {
      if (!sessionToken.value || !userId.value) return
      
      const response = await api.getUserProfile(sessionToken.value, userId.value)
      userProfile.value = response
      saveToLocalStorage()
      
      return response
    } catch (error) {
      console.error('Fetch user profile error:', error)
      throw error
    }
  }
  
  // Fetch user profile data (display name, bio, etc.)
  const fetchProfileData = async () => {
    try {
      if (!sessionToken.value || !userId.value) return
      
      const response = await api.getProfile(sessionToken.value, userId.value)
      
      if (response.profile) {
        profileData.value = response.profile
        
        // Also get visibility settings if available
        // Note: API spec doesn't have a get visibility endpoint, so we'll use defaults
        // and update when user changes them
      }
      
      if (response.stats) {
        userStats.value = response.stats
      }
      
      saveToLocalStorage()
      
      return response
    } catch (error) {
      console.error('Fetch profile data error:', error)
      // Profile might not exist yet, that's okay
      return null
    }
  }
  
  // Update profile
  const updateProfile = async (profileUpdates) => {
    try {
      loading.value = true
      clearError()
      
      if (!sessionToken.value || !userId.value) {
        throw new Error('Not authenticated')
      }
      
      await api.updateProfile(sessionToken.value, userId.value, profileUpdates)
      
      // Refresh profile data
      await fetchProfileData()
      
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  // Update visibility settings
  const updateVisibility = async (settings) => {
    try {
      loading.value = true
      clearError()
      
      if (!sessionToken.value || !userId.value) {
        throw new Error('Not authenticated')
      }
      
      // Merge new settings with existing ones
      const allSettings = {
        ...visibilitySettings.value,
        ...settings
      }
      
      // Backend requires ALL visibility fields to be sent together
      await api.setVisibility(sessionToken.value, userId.value, allSettings)
      
      // Update local state
      visibilitySettings.value = allSettings
      
      saveToLocalStorage()
      
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  // Start live hiking (enable location sharing)
  const startLiveHiking = async () => {
    try {
      await updateVisibility({ showLiveLocation: true })
    } catch (error) {
      console.error('Failed to start live hiking:', error)
      throw error
    }
  }
  
  // Stop live hiking (disable location sharing)
  const stopLiveHiking = async () => {
    try {
      await updateVisibility({ showLiveLocation: false })
    } catch (error) {
      console.error('Failed to stop live hiking:', error)
      throw error
    }
  }
  
  // Fetch user stats
  const fetchUserStats = async () => {
    try {
      if (!sessionToken.value || !userId.value) return
      
      const response = await api.getUserStats(sessionToken.value, userId.value)
      userStats.value = response.stats
      
      return response.stats
    } catch (error) {
      console.error('Fetch user stats error:', error)
      throw error
    }
  }
  
  // Update password
  const updatePassword = async (oldPassword, newPassword) => {
    try {
      loading.value = true
      clearError()
      
      if (!sessionToken.value || !userId.value) {
        throw new Error('Not authenticated')
      }
      
      await api.updatePassword(sessionToken.value, userId.value, oldPassword, newPassword)
      
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  // Initialize auth (check localStorage and validate session)
  const initialize = async () => {
    const hasStoredSession = loadFromLocalStorage()
    
    if (hasStoredSession) {
      const isValid = await validateSession()
      
      if (isValid) {
        // Refresh user data
        await fetchUserProfile()
        await fetchProfileData()
        return true
      }
    }
    
    return false
  }
  
  // ==================== Return ====================
  
  return {
    // State
    sessionToken,
    userId,
    userProfile,
    profileData,
    visibilitySettings,
    userStats,
    loading,
    error,
    
    // Computed
    isAuthenticated,
    isLiveHiking,
    
    // Actions
    register,
    login,
    logout,
    validateSession,
    fetchUserProfile,
    fetchProfileData,
    updateProfile,
    updateVisibility,
    startLiveHiking,
    stopLiveHiking,
    fetchUserStats,
    updatePassword,
    initialize,
    setError,
    clearError
  }
})

