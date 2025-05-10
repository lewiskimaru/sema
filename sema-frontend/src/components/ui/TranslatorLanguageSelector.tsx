import { useState, useEffect, useRef } from 'react'
import { FaChevronDown, FaRandom, FaStar, FaTimes } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

export type Language = {
  code: string
  name: string
  flag?: string
  isRecent?: boolean
  isPopular?: boolean
}

interface TranslatorLanguageSelectorProps {
  languages: Language[]
  selectedLanguage: Language | null
  onLanguageSelect: (language: Language) => void
  placeholder?: string
  variant?: 'source' | 'target'
  detectLanguage?: boolean
  autoDetectedLanguage?: Language | null
  canRandomize?: boolean
  onRandomize?: () => void
}

const TranslatorLanguageSelector = ({
  languages,
  selectedLanguage,
  onLanguageSelect,
  placeholder = 'Select language',
  variant = 'source',
  detectLanguage = false,
  autoDetectedLanguage = null,
  canRandomize = false,
  onRandomize
}: TranslatorLanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredLanguages, setFilteredLanguages] = useState<Language[]>(languages)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter languages based on search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      setFilteredLanguages(
        languages.filter(
          lang => lang.name.toLowerCase().includes(query) || lang.code.toLowerCase().includes(query)
        )
      )
    } else {
      setFilteredLanguages(languages)
    }
  }, [searchQuery, languages])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(prev => !prev)
    setSearchQuery('')
  }

  // Handle language selection
  const handleLanguageSelect = (language: Language) => {
    onLanguageSelect(language)
    setIsOpen(false)
    setSearchQuery('')
  }

  // Clear selection (for source language only)
  const handleClearSelection = () => {
    if (variant === 'source' && detectLanguage) {
      onLanguageSelect({
        code: 'detect',
        name: 'Detect Language'
      })
      setIsOpen(false)
      setSearchQuery('')
    }
  }

  // Group languages by category
  const popularLanguages = filteredLanguages.filter(lang => lang.isPopular)
  const recentLanguages = filteredLanguages.filter(lang => lang.isRecent && !lang.isPopular)
  const otherLanguages = filteredLanguages.filter(lang => !lang.isPopular && !lang.isRecent)

  // Detect language button (for source variant only)
  const showDetectOption = variant === 'source' && detectLanguage

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected language button */}
      <button
        type="button"
        onClick={toggleDropdown}
        className={`flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-lg 
                   transition-all border ${isOpen ? 'border-brand-blue-400 ring-2 ring-brand-blue-100 bg-white' : 'border-ui-gray-300 bg-white hover:border-brand-blue-300'}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center space-x-2 truncate">
          {/* Show auto-detected language badge for source variant */}
          {variant === 'source' && selectedLanguage?.code === 'detect' && autoDetectedLanguage && (
            <div className="flex items-center">
              <span className="text-ui-gray-500">Detected:</span>
              <div className="flex items-center ml-2">
                {autoDetectedLanguage.flag && (
                  <span className="mr-2">{autoDetectedLanguage.flag}</span>
                )}
                <span className="text-ui-gray-900">{autoDetectedLanguage.name}</span>
              </div>
            </div>
          )}
          
          {/* Show selected language with flag if available */}
          {(selectedLanguage && selectedLanguage.code !== 'detect') && (
            <>
              {selectedLanguage.flag && (
                <span className="text-xl leading-none mr-1">{selectedLanguage.flag}</span>
              )}
              <span className="truncate">{selectedLanguage.name}</span>
            </>
          )}
          
          {/* Show placeholder if no language is selected */}
          {!selectedLanguage && (
            <span className="text-ui-gray-500">{placeholder}</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Clear selection button (for source variant) */}
          {variant === 'source' && selectedLanguage && selectedLanguage.code !== 'detect' && detectLanguage && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                handleClearSelection()
              }}
              className="p-1 text-ui-gray-400 hover:text-ui-gray-600 transition-colors rounded-full hover:bg-ui-gray-100"
              aria-label="Clear selection"
            >
              <FaTimes className="h-3 w-3" />
            </button>
          )}
          
          {/* Randomize button (for target variant) */}
          {variant === 'target' && canRandomize && onRandomize && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                onRandomize()
              }}
              className="p-1 text-ui-gray-400 hover:text-brand-blue-500 transition-colors rounded-full hover:bg-ui-gray-100"
              aria-label="Randomize language"
              title="Select random language"
            >
              <FaRandom className="h-3 w-3" />
            </button>
          )}
          
          <FaChevronDown
            className={`h-3 w-3 text-ui-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-ui-gray-200 overflow-hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* Search input */}
            <div className="p-2 border-b border-ui-gray-200">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search languages..."
                  className="w-full pl-3 pr-8 py-2 text-sm border border-ui-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-400 focus:border-brand-blue-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-ui-gray-400 hover:text-ui-gray-600"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Language list */}
            <div className="max-h-60 overflow-y-auto py-1">
              {/* Detect language option (for source variant) */}
              {showDetectOption && (
                <button
                  type="button"
                  onClick={() => handleLanguageSelect({ code: 'detect', name: 'Detect Language' })}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center hover:bg-brand-blue-50 transition-colors
                            ${selectedLanguage?.code === 'detect' ? 'bg-brand-blue-50 text-brand-blue-700' : 'text-ui-gray-700'}`}
                >
                  <span>Detect Language</span>
                  {selectedLanguage?.code === 'detect' && (
                    <span className="ml-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              )}

              {/* Popular languages section */}
              {popularLanguages.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-medium text-ui-gray-500 bg-ui-gray-50">
                    Popular languages
                  </div>
                  {popularLanguages.map(language => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => handleLanguageSelect(language)}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center hover:bg-brand-blue-50 transition-colors
                              ${selectedLanguage?.code === language.code ? 'bg-brand-blue-50 text-brand-blue-700' : 'text-ui-gray-700'}`}
                    >
                      <div className="flex items-center">
                        {language.flag && (
                          <span className="text-xl leading-none mr-2">{language.flag}</span>
                        )}
                        <span>{language.name}</span>
                        <span className="ml-1.5">
                          <FaStar className="h-3 w-3 text-brand-blue-400" />
                        </span>
                      </div>
                      {selectedLanguage?.code === language.code && (
                        <span className="ml-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Recent languages section */}
              {recentLanguages.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-medium text-ui-gray-500 bg-ui-gray-50">
                    Recent languages
                  </div>
                  {recentLanguages.map(language => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => handleLanguageSelect(language)}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center hover:bg-brand-blue-50 transition-colors
                              ${selectedLanguage?.code === language.code ? 'bg-brand-blue-50 text-brand-blue-700' : 'text-ui-gray-700'}`}
                    >
                      <div className="flex items-center">
                        {language.flag && (
                          <span className="text-xl leading-none mr-2">{language.flag}</span>
                        )}
                        <span>{language.name}</span>
                      </div>
                      {selectedLanguage?.code === language.code && (
                        <span className="ml-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* All other languages */}
              {otherLanguages.length > 0 && (
                <div>
                  {(popularLanguages.length > 0 || recentLanguages.length > 0) && (
                    <div className="px-3 py-1.5 text-xs font-medium text-ui-gray-500 bg-ui-gray-50">
                      All languages
                    </div>
                  )}
                  {otherLanguages.map(language => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => handleLanguageSelect(language)}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center hover:bg-brand-blue-50 transition-colors
                              ${selectedLanguage?.code === language.code ? 'bg-brand-blue-50 text-brand-blue-700' : 'text-ui-gray-700'}`}
                    >
                      <div className="flex items-center">
                        {language.flag && (
                          <span className="text-xl leading-none mr-2">{language.flag}</span>
                        )}
                        <span>{language.name}</span>
                      </div>
                      {selectedLanguage?.code === language.code && (
                        <span className="ml-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {filteredLanguages.length === 0 && (
                <div className="px-4 py-3 text-sm text-ui-gray-500 text-center">
                  No languages found matching "{searchQuery}"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TranslatorLanguageSelector 