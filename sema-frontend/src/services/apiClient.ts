import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { toast } from 'react-toastify'

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://sematranslate-translator.hf.space'

// Create a custom axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Allow cookies to be sent with requests (for JWT authentication)
  withCredentials: true,
})

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Any request modifications (like adding headers) can go here
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Any successful response transformations can go here
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status
      const data = error.response.data as any

      // Handle different error statuses
      switch (status) {
        case 400:
          // Bad request
          if (data.message) {
            toast.error(data.message)
          } else {
            toast.error('Invalid input. Please check your data.')
          }
          break
        case 401:
          // Unauthorized
          toast.error('You need to log in to access this resource.')
          
          // Redirect to login page if not already there
          if (window.location.pathname !== '/login') {
            // We don't want to directly import the router here to avoid circular dependencies
            // So we manually redirect using the window location
            window.location.href = '/login'
          }
          break
        case 403:
          // Forbidden
          toast.error('You do not have permission to access this resource.')
          break
        case 404:
          // Not found
          toast.error('The requested resource was not found.')
          break
        case 429:
          // Too many requests
          toast.error('Too many requests. Please try again later.')
          break
        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          toast.error('Something went wrong on our side. Please try again later.')
          break
        default:
          // Other errors
          if (data.message) {
            toast.error(data.message)
          } else {
            toast.error('An unexpected error occurred.')
          }
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('Could not connect to the server. Please check your internet connection.')
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error('An error occurred while setting up the request.')
    }

    return Promise.reject(error)
  }
)

export default apiClient 