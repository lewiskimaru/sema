import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import LoadingScreen from '../ui/LoadingScreen'

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuthStore()

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Render the protected content
  return <Outlet />
}

export default ProtectedRoute 