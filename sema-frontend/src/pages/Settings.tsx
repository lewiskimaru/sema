import { useState, useEffect } from 'react'
import { FaUser, FaPalette, FaBell, FaLanguage, FaSave, FaMoon, FaSun, FaTrash } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { TranslationService } from '../services/translation'

// Define setting types
interface UserProfile {
  name: string
  email: string
  avatar: string | null
  bio: string
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  fontSize: 'small' | 'medium' | 'large'
  reducedMotion: boolean
}

interface NotificationSettings {
  email: boolean
  browser: boolean
  translationCompleted: boolean
  newFeatures: boolean
}

interface TranslationSettings {
  defaultSourceLanguage: string
  defaultTargetLanguage: string
  autoDetect: boolean
  saveHistory: boolean
  useNeuralTranslation: boolean
}

const Settings = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, updateUser } = useAuthStore()
  
  // State for current active tab
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications' | 'translation'>('profile')
  
  // State for user settings
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.displayName || '',
    email: user?.email || '',
    avatar: user?.photoURL || null,
    bio: user?.bio || '',
  })
  
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'system',
    fontSize: 'medium',
    reducedMotion: false,
  })
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    browser: true,
    translationCompleted: true,
    newFeatures: true,
  })
  
  const [translation, setTranslation] = useState<TranslationSettings>({
    defaultSourceLanguage: 'auto',
    defaultTargetLanguage: 'en',
    autoDetect: true,
    saveHistory: true,
    useNeuralTranslation: true,
  })
  
  // State for languages
  const [languages, setLanguages] = useState<{code: string, name: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  
  // Load settings on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: '/settings' } })
      return
    }
    
    // Load settings from local storage or API
    loadSettings()
    
    // Load languages
    loadLanguages()
  }, [isAuthenticated, navigate])
  
  const loadSettings = () => {
    // In a real app, these would be loaded from an API
    // For demo, we'll use mock data with user info where available
    
    // Try to load from localStorage if available
    try {
      const savedAppearance = localStorage.getItem('appearance_settings')
      if (savedAppearance) {
        setAppearance(JSON.parse(savedAppearance))
      }
      
      const savedTranslation = localStorage.getItem('translation_settings')
      if (savedTranslation) {
        setTranslation(JSON.parse(savedTranslation))
      }
      
      const savedNotifications = localStorage.getItem('notification_settings')
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }
  
  const loadLanguages = async () => {
    try {
      setLoading(true)
      const translationService = new TranslationService()
      const langs = await translationService.getSupportedLanguages()
      setLanguages(langs)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load languages:', error)
      setLoading(false)
    }
  }
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }
  
  const handleAppearanceChange = (key: keyof AppearanceSettings, value: any) => {
    setAppearance(prev => {
      const newSettings = { ...prev, [key]: value }
      // Save to localStorage
      localStorage.setItem('appearance_settings', JSON.stringify(newSettings))
      return newSettings
    })
    
    // Apply theme change immediately
    if (key === 'theme') {
      applyTheme(value)
    }
  }
  
  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => {
      const newSettings = { ...prev, [key]: value }
      // Save to localStorage
      localStorage.setItem('notification_settings', JSON.stringify(newSettings))
      return newSettings
    })
  }
  
  const handleTranslationChange = (key: keyof TranslationSettings, value: any) => {
    setTranslation(prev => {
      const newSettings = { ...prev, [key]: value }
      // Save to localStorage
      localStorage.setItem('translation_settings', JSON.stringify(newSettings))
      return newSettings
    })
  }
  
  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    // Logic to apply theme would go here
    // This is a simplified version
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (theme === 'system') {
      document.documentElement.classList.toggle('dark', prefersDark)
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }
  
  const handleSaveProfile = async () => {
    try {
      setSaveLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user in auth store (in a real app, this would call an API)
      updateUser({
        ...user,
        displayName: profile.name,
        bio: profile.bio,
      })
      
      toast.success('Profile updated successfully')
      setSaveLoading(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to update profile')
      setSaveLoading(false)
    }
  }
  
  const handleDeleteAccount = () => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In a real app, this would call an API to delete the account
      toast.info('Account deletion scheduled. You will receive a confirmation email.')
      
      // Log the user out
      setTimeout(() => {
        logout()
        navigate('/')
      }, 2000)
    }
  }
  
  if (!isAuthenticated) {
    return null // We'll redirect in the useEffect
  }
  
  return (
    <div className="py-8 pb-16">
      <div className="container-custom">
        <div className="mx-auto max-w-4xl bg-white rounded-xl shadow-smooth overflow-hidden">
          <div className="md:flex">
            {/* Sidebar */}
            <div className="md:w-64 bg-ui-gray-50 p-4 border-r border-ui-gray-200">
              <h2 className="text-lg font-bold text-brand-black mb-6">Settings</h2>
              
              <nav className="space-y-1">
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-brand-teal-100 text-brand-teal-900'
                      : 'hover:bg-ui-gray-100 text-ui-gray-700'
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  <FaUser className={activeTab === 'profile' ? 'text-brand-teal-600' : 'text-ui-gray-500'} />
                  <span>Profile</span>
                </button>
                
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === 'appearance'
                      ? 'bg-brand-teal-100 text-brand-teal-900'
                      : 'hover:bg-ui-gray-100 text-ui-gray-700'
                  }`}
                  onClick={() => setActiveTab('appearance')}
                >
                  <FaPalette className={activeTab === 'appearance' ? 'text-brand-teal-600' : 'text-ui-gray-500'} />
                  <span>Appearance</span>
                </button>
                
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-brand-teal-100 text-brand-teal-900'
                      : 'hover:bg-ui-gray-100 text-ui-gray-700'
                  }`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <FaBell className={activeTab === 'notifications' ? 'text-brand-teal-600' : 'text-ui-gray-500'} />
                  <span>Notifications</span>
                </button>
                
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === 'translation'
                      ? 'bg-brand-teal-100 text-brand-teal-900'
                      : 'hover:bg-ui-gray-100 text-ui-gray-700'
                  }`}
                  onClick={() => setActiveTab('translation')}
                >
                  <FaLanguage className={activeTab === 'translation' ? 'text-brand-teal-600' : 'text-ui-gray-500'} />
                  <span>Translation</span>
                </button>
              </nav>
            </div>
            
            {/* Main content */}
            <div className="flex-1 p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-brand-black">
                  {activeTab === 'profile' && 'Profile Settings'}
                  {activeTab === 'appearance' && 'Appearance Settings'}
                  {activeTab === 'notifications' && 'Notification Settings'}
                  {activeTab === 'translation' && 'Translation Settings'}
                </h1>
                <p className="text-ui-gray-600 mt-1">
                  {activeTab === 'profile' && 'Manage your personal information and account details'}
                  {activeTab === 'appearance' && 'Customize how Sema Translator looks and feels'}
                  {activeTab === 'notifications' && 'Control how and when you receive notifications'}
                  {activeTab === 'translation' && 'Configure your default translation preferences'}
                </p>
              </div>
              
              <div>
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      <div className="w-24 h-24 rounded-full bg-ui-gray-200 flex items-center justify-center overflow-hidden">
                        {profile.avatar ? (
                          <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                          <FaUser className="text-4xl text-ui-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div>
                          <button className="btn-secondary">Change Profile Picture</button>
                        </div>
                        
                        <div className="text-sm text-ui-gray-600">
                          Recommended: Square image, at least 400x400px
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-ui-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={profile.name}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-ui-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal-400 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-ui-gray-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={profile.email}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-ui-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal-400 focus:border-transparent"
                          disabled
                        />
                        <p className="mt-1 text-sm text-ui-gray-500">Your email cannot be changed</p>
                      </div>
                      
                      <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-ui-gray-700 mb-1">Bio</label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={profile.bio}
                          onChange={handleProfileChange}
                          rows={4}
                          className="w-full px-3 py-2 border border-ui-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal-400 focus:border-transparent"
                          placeholder="Tell us a bit about yourself"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between pt-4">
                      <button 
                        className="btn-primary flex items-center gap-2"
                        onClick={handleSaveProfile}
                        disabled={saveLoading}
                      >
                        <FaSave /> {saveLoading ? 'Saving...' : 'Save Profile'}
                      </button>
                      
                      <button 
                        className="text-ui-red-600 hover:text-ui-red-700 flex items-center gap-2"
                        onClick={handleDeleteAccount}
                      >
                        <FaTrash /> Delete Account
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-brand-black mb-4">Theme</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div 
                          className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all ${
                            appearance.theme === 'light' ? 'border-brand-teal-400 bg-brand-teal-50' : 'border-ui-gray-200 hover:border-brand-teal-300'
                          }`}
                          onClick={() => handleAppearanceChange('theme', 'light')}
                        >
                          <div className="w-16 h-16 bg-white border border-ui-gray-200 rounded-full flex items-center justify-center mb-3">
                            <FaSun className="text-yellow-500 text-2xl" />
                          </div>
                          <span className="font-medium">Light</span>
                        </div>
                        
                        <div 
                          className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all ${
                            appearance.theme === 'dark' ? 'border-brand-teal-400 bg-brand-teal-50' : 'border-ui-gray-200 hover:border-brand-teal-300'
                          }`}
                          onClick={() => handleAppearanceChange('theme', 'dark')}
                        >
                          <div className="w-16 h-16 bg-gray-900 border border-gray-700 rounded-full flex items-center justify-center mb-3">
                            <FaMoon className="text-gray-100 text-2xl" />
                          </div>
                          <span className="font-medium">Dark</span>
                        </div>
                        
                        <div 
                          className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all ${
                            appearance.theme === 'system' ? 'border-brand-teal-400 bg-brand-teal-50' : 'border-ui-gray-200 hover:border-brand-teal-300'
                          }`}
                          onClick={() => handleAppearanceChange('theme', 'system')}
                        >
                          <div className="w-16 h-16 bg-gradient-to-br from-white to-gray-900 border border-ui-gray-200 rounded-full flex items-center justify-center mb-3">
                            <div className="flex">
                              <FaSun className="text-yellow-500 text-xl" />
                              <FaMoon className="text-gray-100 text-xl -ml-1" />
                            </div>
                          </div>
                          <span className="font-medium">System</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-brand-black mb-4">Font Size</h3>
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-brand-teal-500"
                            name="fontSize"
                            checked={appearance.fontSize === 'small'}
                            onChange={() => handleAppearanceChange('fontSize', 'small')}
                          />
                          <span className="ml-2 text-sm">Small</span>
                        </label>
                        
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-brand-teal-500"
                            name="fontSize"
                            checked={appearance.fontSize === 'medium'}
                            onChange={() => handleAppearanceChange('fontSize', 'medium')}
                          />
                          <span className="ml-2 text-base">Medium</span>
                        </label>
                        
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-brand-teal-500"
                            name="fontSize"
                            checked={appearance.fontSize === 'large'}
                            onChange={() => handleAppearanceChange('fontSize', 'large')}
                          />
                          <span className="ml-2 text-lg">Large</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-brand-black mb-4">Accessibility</h3>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox text-brand-teal-500"
                          checked={appearance.reducedMotion}
                          onChange={() => handleAppearanceChange('reducedMotion', !appearance.reducedMotion)}
                        />
                        <span className="ml-2">Reduce animations and motion</span>
                      </label>
                    </div>
                  </div>
                )}
                
                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-brand-black mb-4">Notification Channels</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 border border-ui-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <span className="font-medium">Email Notifications</span>
                          </div>
                          <div>
                            <input
                              type="checkbox"
                              className="form-checkbox text-brand-teal-500 h-5 w-5"
                              checked={notifications.email}
                              onChange={() => handleNotificationChange('email', !notifications.email)}
                            />
                          </div>
                        </label>
                        
                        <label className="flex items-center justify-between p-3 border border-ui-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <span className="font-medium">Browser Notifications</span>
                          </div>
                          <div>
                            <input
                              type="checkbox"
                              className="form-checkbox text-brand-teal-500 h-5 w-5"
                              checked={notifications.browser}
                              onChange={() => handleNotificationChange('browser', !notifications.browser)}
                            />
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-brand-black mb-4">Notification Types</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 border border-ui-gray-200 rounded-lg">
                          <div>
                            <span className="font-medium">Translation Completed</span>
                            <p className="text-sm text-ui-gray-600 mt-1">Receive notifications when long translations are complete</p>
                          </div>
                          <div>
                            <input
                              type="checkbox"
                              className="form-checkbox text-brand-teal-500 h-5 w-5"
                              checked={notifications.translationCompleted}
                              onChange={() => handleNotificationChange('translationCompleted', !notifications.translationCompleted)}
                            />
                          </div>
                        </label>
                        
                        <label className="flex items-center justify-between p-3 border border-ui-gray-200 rounded-lg">
                          <div>
                            <span className="font-medium">New Features & Updates</span>
                            <p className="text-sm text-ui-gray-600 mt-1">Stay informed about new languages and features</p>
                          </div>
                          <div>
                            <input
                              type="checkbox"
                              className="form-checkbox text-brand-teal-500 h-5 w-5"
                              checked={notifications.newFeatures}
                              onChange={() => handleNotificationChange('newFeatures', !notifications.newFeatures)}
                            />
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Translation Tab */}
                {activeTab === 'translation' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-brand-black mb-4">Default Languages</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="defaultSourceLanguage" className="block text-sm font-medium text-ui-gray-700 mb-1">
                            Default Source Language
                          </label>
                          <select
                            id="defaultSourceLanguage"
                            className="w-full px-3 py-2 border border-ui-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal-400 focus:border-transparent"
                            value={translation.defaultSourceLanguage}
                            onChange={(e) => handleTranslationChange('defaultSourceLanguage', e.target.value)}
                          >
                            <option value="auto">Auto-detect (Recommended)</option>
                            {languages.map(lang => (
                              <option key={lang.code} value={lang.code}>
                                {lang.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="defaultTargetLanguage" className="block text-sm font-medium text-ui-gray-700 mb-1">
                            Default Target Language
                          </label>
                          <select
                            id="defaultTargetLanguage"
                            className="w-full px-3 py-2 border border-ui-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal-400 focus:border-transparent"
                            value={translation.defaultTargetLanguage}
                            onChange={(e) => handleTranslationChange('defaultTargetLanguage', e.target.value)}
                          >
                            {languages.map(lang => (
                              <option key={lang.code} value={lang.code}>
                                {lang.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-brand-black mb-4">Translation Options</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 border border-ui-gray-200 rounded-lg">
                          <div>
                            <span className="font-medium">Auto-detect Language</span>
                            <p className="text-sm text-ui-gray-600 mt-1">Automatically detect the source language</p>
                          </div>
                          <div>
                            <input
                              type="checkbox"
                              className="form-checkbox text-brand-teal-500 h-5 w-5"
                              checked={translation.autoDetect}
                              onChange={() => handleTranslationChange('autoDetect', !translation.autoDetect)}
                            />
                          </div>
                        </label>
                        
                        <label className="flex items-center justify-between p-3 border border-ui-gray-200 rounded-lg">
                          <div>
                            <span className="font-medium">Save Translation History</span>
                            <p className="text-sm text-ui-gray-600 mt-1">Keep a record of your translations</p>
                          </div>
                          <div>
                            <input
                              type="checkbox"
                              className="form-checkbox text-brand-teal-500 h-5 w-5"
                              checked={translation.saveHistory}
                              onChange={() => handleTranslationChange('saveHistory', !translation.saveHistory)}
                            />
                          </div>
                        </label>
                        
                        <label className="flex items-center justify-between p-3 border border-ui-gray-200 rounded-lg">
                          <div>
                            <span className="font-medium">Neural Machine Translation</span>
                            <p className="text-sm text-ui-gray-600 mt-1">Use advanced AI for higher quality translations (may be slower)</p>
                          </div>
                          <div>
                            <input
                              type="checkbox"
                              className="form-checkbox text-brand-teal-500 h-5 w-5"
                              checked={translation.useNeuralTranslation}
                              onChange={() => handleTranslationChange('useNeuralTranslation', !translation.useNeuralTranslation)}
                            />
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings 