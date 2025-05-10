import { useState, useEffect, useMemo } from 'react'
import { FaSearch, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getLanguagesByRegion, Language } from '../services/translation'
import { toast } from 'react-toastify'

// Define a world region type
interface WorldRegion {
  name: string
  code: string
  description: string
  iconColor: string 
  languageCount: number
}

const Languages = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [languagesByRegion, setLanguagesByRegion] = useState<Record<string, Language[]>>({})
  const [loading, setLoading] = useState(true)
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  
  // Define world regions (simplified for demo)
  const worldRegions: WorldRegion[] = [
    {
      name: 'Africa',
      code: 'africa',
      description: 'Home to over 2,000 languages across the continent',
      iconColor: 'text-yellow-500',
      languageCount: 0,
    },
    {
      name: 'Asia',
      code: 'asia',
      description: 'The most linguistically diverse continent',
      iconColor: 'text-red-500',
      languageCount: 0,
    },
    {
      name: 'Europe',
      code: 'europe',
      description: 'Features many Romance, Germanic, and Slavic languages',
      iconColor: 'text-blue-500',
      languageCount: 0,
    },
    {
      name: 'North America',
      code: 'north_america',
      description: 'Includes indigenous languages of the US, Canada, and Mexico',
      iconColor: 'text-green-500',
      languageCount: 0,
    },
    {
      name: 'South America',
      code: 'south_america',
      description: 'Rich with indigenous languages alongside Spanish and Portuguese',
      iconColor: 'text-purple-500',
      languageCount: 0,
    },
    {
      name: 'Oceania',
      code: 'oceania',
      description: 'Includes Australian Aboriginal languages and Pacific island languages',
      iconColor: 'text-indigo-500',
      languageCount: 0,
    },
    {
      name: 'Other',
      code: 'other',
      description: 'Constructed languages and special codes',
      iconColor: 'text-gray-500',
      languageCount: 0,
    }
  ]
  
  // Load languages on component mount
  useEffect(() => {
    fetchLanguages()
  }, [])
  
  const fetchLanguages = async () => {
    try {
      setLoading(true)
      const data = await getLanguagesByRegion()
      setLanguagesByRegion(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch languages:', error)
      toast.error('Failed to load languages. Please refresh the page.')
      setLoading(false)
    }
  }

  // Calculate regionData with counts
  const regionsWithCounts = useMemo(() => {
    return worldRegions.map(region => {
      const regionKey = Object.keys(languagesByRegion).find(key => 
        key.toLowerCase().includes(region.code.toLowerCase())
      )
      
      const count = regionKey ? languagesByRegion[regionKey].length : 0
      
      return {
        ...region,
        languageCount: count
      }
    })
  }, [languagesByRegion])
  
  // Filtered languages based on search query
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) {
      // If no search, return everything organized by region
      return languagesByRegion
    }
    
    // If searching, create a new object with only matching languages
    const results: Record<string, Language[]> = {}
    const query = searchQuery.toLowerCase()
    
    Object.entries(languagesByRegion).forEach(([region, languages]) => {
      const matches = languages.filter(lang => 
        lang.name.toLowerCase().includes(query) || 
        (lang.native_name && lang.native_name.toLowerCase().includes(query)) ||
        lang.code.toLowerCase().includes(query)
      )
      
      if (matches.length > 0) {
        results[region] = matches
      }
    })
    
    return results
  }, [searchQuery, languagesByRegion])
  
  // Total language count
  const totalLanguageCount = useMemo(() => {
    return Object.values(languagesByRegion).reduce((sum, languages) => sum + languages.length, 0)
  }, [languagesByRegion])

  // Handle region click
  const handleRegionClick = (regionCode: string) => {
    setActiveRegion(regionCode === activeRegion ? null : regionCode)
    
    // Clear search when selecting a region
    setSearchQuery('')
    
    // Scroll to the language list if on mobile
    if (window.innerWidth < 768) {
      const element = document.getElementById('language-list')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  }

  return (
    <div className="py-8 pb-16">
      <div className="container-custom">
        <motion.div 
          className="mb-10 text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-brand-black mb-4"
            variants={itemVariants}
          >
            Explore Our Languages
          </motion.h1>
          <motion.p 
            className="text-lg text-ui-gray-700 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Sema Translator supports over 200 languages across every region of the world, including many low-resource and indigenous languages.
          </motion.p>
          
          {/* Search bar */}
          <motion.div 
            className="mt-8 max-w-md mx-auto"
            variants={itemVariants}
          >
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-ui-gray-400" />
              <input
                type="text"
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-ui-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-teal-400 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-ui-gray-400 hover:text-ui-gray-700"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
        
        {/* World map visualization */}
        {!searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-brand-black mb-6 text-center">Language Regions</h2>
            
            {/* Map visualization - as a placeholder, we'll use region cards */}
            <div className="bg-white p-4 rounded-xl shadow-smooth">
              {/* Placeholder for actual map component */}
              <div className="bg-ui-gray-100 rounded-lg p-4 mb-6 text-center">
                <FaGlobe className="text-5xl mx-auto mb-2 text-brand-teal-500" />
                <p className="text-ui-gray-700">Interactive language map visualization would go here</p>
              </div>
              
              {/* Region cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {regionsWithCounts.map((region) => (
                  <div 
                    key={region.code}
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-all
                      ${activeRegion === region.code 
                        ? 'border-brand-teal-400 bg-brand-teal-50' 
                        : 'border-ui-gray-200 bg-white hover:border-brand-teal-300 hover:bg-ui-gray-50'
                      }
                    `}
                    onClick={() => handleRegionClick(region.code)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-brand-black">{region.name}</h3>
                        <p className="text-ui-gray-600 text-sm mt-1">{region.description}</p>
                      </div>
                      <span className={`${region.iconColor} text-xl`}>
                        <FaMapMarkerAlt />
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-medium text-brand-teal-600">
                      {region.languageCount} languages
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Language list */}
        <div id="language-list" className="bg-white rounded-xl shadow-smooth p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand-black">
              {searchQuery 
                ? `Search Results${Object.keys(filteredLanguages).length > 0 ? '' : ' (0)'}`
                : activeRegion 
                  ? `${regionsWithCounts.find(r => r.code === activeRegion)?.name} Languages` 
                  : 'All Languages'
              }
            </h2>
            <div className="text-ui-gray-600 text-sm">
              {!searchQuery && !activeRegion && (
                <span>{totalLanguageCount} languages total</span>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          ) : Object.keys(filteredLanguages).length === 0 ? (
            <div className="text-center py-12 text-ui-gray-500">
              <FaSearch className="text-4xl mx-auto mb-4 opacity-30" />
              <p className="text-lg">No languages found matching "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery('')} 
                className="mt-4 text-brand-teal-500 hover:text-brand-teal-600"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(filteredLanguages)
                // Filter by active region if one is selected
                .filter(([region]) => !activeRegion || region.toLowerCase().includes(activeRegion.toLowerCase()))
                .map(([region, languages]) => (
                  <div key={region}>
                    <h3 className="text-xl font-bold text-brand-black mb-3 pb-2 border-b border-ui-gray-200">
                      {region} <span className="text-brand-teal-500 text-sm font-normal">({languages.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {languages.map((language) => (
                        <Link
                          to={`/translate?target=${language.code}`}
                          key={language.code}
                          className="p-3 border border-ui-gray-200 rounded-lg hover:border-brand-teal-300 hover:bg-ui-gray-50 transition-all"
                        >
                          <div className="font-medium text-brand-black">
                            {language.name}
                          </div>
                          {language.native_name && language.native_name !== language.name && (
                            <div className="text-sm text-ui-gray-600 mt-0.5">
                              {language.native_name}
                            </div>
                          )}
                          <div className="text-xs text-ui-gray-500 mt-1">
                            Code: {language.code}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
        
        {/* Call to action */}
        <div className="mt-12 text-center bg-brand-teal-50 border border-brand-teal-100 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-brand-black mb-3">Ready to Break Language Barriers?</h2>
          <p className="text-ui-gray-700 max-w-2xl mx-auto mb-6">
            Start translating in any of our 200+ languages and experience the power of Sema's AI translation technology.
          </p>
          <Link 
            to="/translate" 
            className="btn-primary px-8 py-3"
          >
            Start Translating
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Languages 