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
const ChatPage = lazy(() => import('./pages/Chat'))
const LanguagesPage = lazy(() => import('./pages/Languages'))
const LoginPage = lazy(() => import('./pages/auth/Login'))
const RegisterPage = lazy(() => import('./pages/auth/Register'))
const ProfilePage = lazy(() => import('./pages/account/Profile'))
const ApiKeysPage = lazy(() => import('./pages/account/ApiKeys'))
const TranslationHistoryPage = lazy(() => import('./pages/account/TranslationHistory'))
const ChatHistoryPage = lazy(() => import('./pages/account/ChatHistory'))
const NotFoundPage = lazy(() => import('./pages/NotFound'))

// Loading fallback
import LoadingScreen from './components/ui/LoadingScreen'

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
          </Route>

          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected routes with main layout */}
          <Route element={<MainLayout />}>
            <Route element={<ProtectedRoute />}>
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/account/profile" element={<ProfilePage />} />
              <Route path="/account/api-keys" element={<ApiKeysPage />} />
              <Route path="/account/history/translations" element={<TranslationHistoryPage />} />
              <Route path="/account/history/chat" element={<ChatHistoryPage />} />
            </Route>
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
