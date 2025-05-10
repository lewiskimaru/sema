import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-toastify'
import apiClient from '../services/apiClient'

interface User {
  id: string
  email: string
  display_name?: string
  username?: string
  preferred_lang?: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  accessToken: string | null
  
  // Methods
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: { email: string; password: string; username: string }) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<boolean>
  checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: true,
      accessToken: null,
      
      // Login function
      login: async (email, password) => {
        try {
          // Make API call to login endpoint
          const response = await apiClient.post('/auth/login', { email, password })
          
          // The backend will set HttpOnly cookies for us
          // We just need to update our state
          if (response.data && response.data.user) {
            set({
              isAuthenticated: true,
              user: response.data.user,
              loading: false,
              accessToken: response.data.access_token
            })
            
            // Show success message
            toast.success('Welcome back!')
            return true
          }
          
          return false
        } catch (error) {
          console.error('Login error:', error)
          toast.error('Login failed. Please check your credentials.')
          return false
        }
      },
      
      // Register function
      register: async (userData) => {
        try {
          // Make API call to register endpoint
          const response = await apiClient.post('/auth/register', userData)
          
          if (response.data && response.data.user) {
            set({
              isAuthenticated: true,
              user: response.data.user,
              loading: false,
              accessToken: response.data.access_token
            })
            
            // Show success message
            toast.success('Account created successfully!')
            return true
          }
          
          return false
        } catch (error) {
          console.error('Registration error:', error)
          toast.error('Registration failed. Please try again.')
          return false
        }
      },
      
      // Logout function
      logout: async () => {
        try {
          // Call logout endpoint to clear cookies
          await apiClient.post('/auth/logout')
        } catch (error) {
          console.error('Logout error:', error)
        }
        
        // Clear state regardless of API call result
        set({
          isAuthenticated: false,
          user: null,
          loading: false,
          accessToken: null
        })
        
        // Show success message
        toast.success('You have been logged out.')
      },
      
      // Update user information
      updateUser: async (userData) => {
        try {
          const response = await apiClient.put('/auth/me', userData)
          
          if (response.data && response.data.user) {
            set({
              user: {
                ...get().user,
                ...response.data.user
              }
            })
            
            toast.success('Profile updated successfully!')
            return true
          }
          
          return false
        } catch (error) {
          console.error('Update user error:', error)
          toast.error('Failed to update profile. Please try again.')
          return false
        }
      },
      
      // Check authentication status
      checkAuth: async () => {
        try {
          // First, check if we already have a token and if it's valid
          const { accessToken } = get()
          
          if (accessToken) {
            try {
              const decoded = jwtDecode(accessToken)
              const currentTime = Date.now() / 1000
              
              // If token is expired, we'll try refreshing it
              if (decoded.exp && decoded.exp < currentTime) {
                // The token is expired, let's refresh
                throw new Error('Token expired')
              }
              
              // If we have a valid token, get current user info
              const response = await apiClient.get('/auth/me')
              
              if (response.data && response.data.user) {
                set({
                  isAuthenticated: true,
                  user: response.data.user,
                  loading: false
                })
                
                return true
              }
            } catch (error) {
              // Token is invalid or expired, try refreshing
              console.error('Token validation error:', error)
            }
          }
          
          // Try to refresh the token with the refresh endpoint
          const refreshResponse = await apiClient.post('/auth/refresh')
          
          if (refreshResponse.data && refreshResponse.data.access_token) {
            set({
              isAuthenticated: true,
              user: refreshResponse.data.user,
              loading: false,
              accessToken: refreshResponse.data.access_token
            })
            
            return true
          }
          
          // If we couldn't refresh, user is not authenticated
          set({
            isAuthenticated: false,
            user: null,
            loading: false,
            accessToken: null
          })
          
          return false
        } catch (error) {
          console.error('Auth check error:', error)
          
          // Something went wrong, assume not authenticated
          set({
            isAuthenticated: false,
            user: null,
            loading: false,
            accessToken: null
          })
          
          return false
        }
      }
    }),
    {
      name: 'sema-auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        // Don't persist sensitive data
      })
    }
  )
)

// Initialize auth check when the app loads
setTimeout(() => {
  useAuthStore.getState().checkAuth()
}, 0)

export default useAuthStore 