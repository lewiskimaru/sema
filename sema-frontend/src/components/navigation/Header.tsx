import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const location = useLocation()
  
  // Close mobile menu when route changes
  if (isMenuOpen && location.pathname) {
    setIsMenuOpen(false)
  }
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Sema Translator" className="h-8" />
            <div className="flex items-center">
              <span className="text-2xl font-bold text-brand-black">Sema</span>
              <span className="text-brand-teal-500 font-medium">Translator</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink 
              to="/translate" 
              className={({ isActive }) => 
                `text-base font-medium transition-colors ${
                  isActive 
                    ? 'text-brand-teal-500 border-b-2 border-brand-teal-500 pb-1' 
                    : 'text-ui-gray-700 hover:text-brand-teal-500'
                }`
              }
            >
              Translate
            </NavLink>
            <NavLink 
              to="/languages" 
              className={({ isActive }) => 
                `text-base font-medium transition-colors ${
                  isActive 
                    ? 'text-brand-teal-500 border-b-2 border-brand-teal-500 pb-1' 
                    : 'text-ui-gray-700 hover:text-brand-teal-500'
                }`
              }
            >
              Languages
            </NavLink>
            {isAuthenticated && (
              <NavLink 
                to="/chat" 
                className={({ isActive }) => 
                  `text-base font-medium transition-colors ${
                    isActive 
                      ? 'text-brand-teal-500 border-b-2 border-brand-teal-500 pb-1' 
                      : 'text-ui-gray-700 hover:text-brand-teal-500'
                  }`
                }
              >
                Chat
              </NavLink>
            )}
          </nav>
          
          {/* Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative group">
                <button 
                  className="flex items-center space-x-2 text-ui-gray-800 hover:text-brand-teal-500"
                  aria-label="Account menu"
                >
                  <FaUserCircle className="text-xl" />
                  <span className="font-medium">{user?.display_name || 'Account'}</span>
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                  <div className="py-1">
                    <Link to="/account/profile" className="block px-4 py-2 text-sm text-ui-gray-700 hover:bg-ui-gray-100">
                      Profile
                    </Link>
                    <Link to="/account/history/translations" className="block px-4 py-2 text-sm text-ui-gray-700 hover:bg-ui-gray-100">
                      Translation History
                    </Link>
                    <Link to="/account/history/chat" className="block px-4 py-2 text-sm text-ui-gray-700 hover:bg-ui-gray-100">
                      Chat History
                    </Link>
                    <Link to="/account/api-keys" className="block px-4 py-2 text-sm text-ui-gray-700 hover:bg-ui-gray-100">
                      API Keys
                    </Link>
                    <button 
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-ui-gray-700 hover:bg-ui-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-ui-gray-700 hover:text-brand-teal-500 font-medium"
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-ui-gray-700 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container-custom py-4 border-t border-ui-gray-200">
              <nav className="flex flex-col space-y-4">
                <NavLink 
                  to="/translate" 
                  className={({ isActive }) => 
                    `text-base font-medium py-2 transition-colors ${
                      isActive 
                        ? 'text-brand-teal-500' 
                        : 'text-ui-gray-700'
                    }`
                  }
                >
                  Translate
                </NavLink>
                <NavLink 
                  to="/languages" 
                  className={({ isActive }) => 
                    `text-base font-medium py-2 transition-colors ${
                      isActive 
                        ? 'text-brand-teal-500' 
                        : 'text-ui-gray-700'
                    }`
                  }
                >
                  Languages
                </NavLink>
                {isAuthenticated && (
                  <NavLink 
                    to="/chat" 
                    className={({ isActive }) => 
                      `text-base font-medium py-2 transition-colors ${
                        isActive 
                          ? 'text-brand-teal-500' 
                          : 'text-ui-gray-700'
                      }`
                    }
                  >
                    Chat
                  </NavLink>
                )}
                
                {isAuthenticated ? (
                  <>
                    <hr className="border-ui-gray-200" />
                    <Link 
                      to="/account/profile" 
                      className="text-base font-medium py-2 text-ui-gray-700"
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/account/history/translations" 
                      className="text-base font-medium py-2 text-ui-gray-700"
                    >
                      Translation History
                    </Link>
                    <Link 
                      to="/account/history/chat" 
                      className="text-base font-medium py-2 text-ui-gray-700"
                    >
                      Chat History
                    </Link>
                    <Link 
                      to="/account/api-keys" 
                      className="text-base font-medium py-2 text-ui-gray-700"
                    >
                      API Keys
                    </Link>
                    <button 
                      onClick={logout}
                      className="text-base font-medium py-2 text-ui-gray-700 text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <hr className="border-ui-gray-200" />
                    <Link 
                      to="/login" 
                      className="text-base font-medium py-2 text-ui-gray-700"
                    >
                      Log in
                    </Link>
                    <Link 
                      to="/register" 
                      className="text-base font-medium py-2 text-brand-teal-500"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header 