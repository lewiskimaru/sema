import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'

// Layouts
import MainLayout from './components/layouts/MainLayout'
import AuthLayout from './components/layouts/AuthLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Lazy loaded pages for better performance
const HomePage = lazy(() => import('./pages/Home'))
const TranslatePage = lazy(() => import('./pages/Translate'))
const LanguagesPage = lazy(() => import('./pages/Languages'))
const NotFoundPage = lazy(() => import('./pages/NotFound'))

// Loading fallback
import LoadingScreen from './components/ui/LoadingScreen'

// Placeholder component for missing pages
const PlaceholderPage = () => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold mb-4">Coming Soon</h1>
    <p>This page is under construction.</p>
  </div>
)

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public routes with main layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/translate" element={<TranslatePage />} />
            <Route path="/languages" element={<LanguagesPage />} />
            
            {/* Placeholder routes for missing pages */}
            <Route path="/chat" element={<PlaceholderPage />} />
            <Route path="/account/profile" element={<PlaceholderPage />} />
            <Route path="/account/api-keys" element={<PlaceholderPage />} />
            <Route path="/account/history/translations" element={<PlaceholderPage />} />
            <Route path="/account/history/chat" element={<PlaceholderPage />} />
          </Route>

          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<PlaceholderPage />} />
            <Route path="/register" element={<PlaceholderPage />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  )
}

export default App
