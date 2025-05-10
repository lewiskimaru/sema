import { useState, useEffect, useRef } from 'react'
import { FaChevronDown, FaGlobe } from 'react-icons/fa'
import { Language } from '../../services/translation'

interface LanguageSelectorProps {
  languages: Language[]
  selectedLanguage: string | null
  onSelectLanguage: (langCode: string | null) => void
  placeholder?: string
  showAutoDetect?: boolean
  label?: string
  isSource?: boolean
  disabled?: boolean
}

const LanguageSelector = ({
  languages,
  selectedLanguage,
  onSelectLanguage,
  placeholder = 'Select language',
  showAutoDetect = false,
  label,
  isSource = false,
  disabled = false
}: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  // Filter languages based on search query
  const filteredLanguages = languages.filter(lang => {
    const query = searchQuery.toLowerCase()
    return (
      lang.name.toLowerCase().includes(query) ||
      (lang.native_name && lang.native_name.toLowerCase().includes(query)) ||
      lang.code.toLowerCase().includes(query)
    )
  })

  // Get selected language name for display
  const getSelectedLanguageName = () => {
    if (!selectedLanguage) {
      return isSource && showAutoDetect ? 'Detect language' : placeholder
    }
    
    const selected = languages.find(lang => lang.code === selectedLanguage)
    return selected ? selected.name : selectedLanguage
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-ui-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        className={`relative w-full flex items-center justify-between px-4 py-2.5 text-left 
                   border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-400
                   ${disabled 
                     ? 'bg-ui-gray-100 cursor-not-allowed text-ui-gray-500 border-ui-gray-300' 
                     : 'bg-white hover:bg-ui-gray-50 text-ui-gray-800 border-ui-gray-300'
                   }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-disabled={disabled}
      >
        <span className="flex items-center">
          {(!selectedLanguage && isSource && showAutoDetect) && (
            <FaGlobe className="mr-2 text-brand-blue-500" />
          )}
          <span className="font-medium">{getSelectedLanguageName()}</span>
        </span>
        <FaChevronDown 
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-ui-gray-200">
          <div className="p-2">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                className="w-full border border-ui-gray-300 rounded-md py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-brand-blue-400 focus:border-transparent"
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="mt-2 max-h-60 overflow-auto">
              <ul className="py-1">
                {/* Auto-detect option */}
                {isSource && showAutoDetect && (
                  <li>
                    <button
                      type="button"
                      className={`flex items-center w-full px-3 py-2 text-left rounded-md
                               ${!selectedLanguage 
                                 ? 'bg-brand-blue-50 text-brand-blue-700'
                                 : 'text-ui-gray-800 hover:bg-ui-gray-100'
                               }`}
                      onClick={() => {
                        onSelectLanguage(null)
                        setIsOpen(false)
                        setSearchQuery('')
                      }}
                    >
                      <FaGlobe className="mr-2 text-brand-blue-500" />
                      <span>Detect language</span>
                    </button>
                  </li>
                )}
                
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((language) => (
                    <li key={language.code}>
                      <button
                        type="button"
                        className={`w-full px-3 py-2 text-left rounded-md
                                 ${selectedLanguage === language.code
                                   ? 'bg-brand-blue-50 text-brand-blue-700'
                                   : 'text-ui-gray-800 hover:bg-ui-gray-100'
                                 }`}
                        onClick={() => {
                          onSelectLanguage(language.code)
                          setIsOpen(false)
                          setSearchQuery('')
                        }}
                      >
                        <div>
                          <span className="font-medium">{language.name}</span>
                          {language.native_name && language.native_name !== language.name && (
                            <span className="ml-2 text-sm text-ui-gray-500">
                              {language.native_name}
                            </span>
                          )}
                        </div>
                        {language.region && (
                          <div className="text-xs text-ui-gray-500">
                            {language.region}
                          </div>
                        )}
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-3 text-center text-ui-gray-500">
                    No languages found
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LanguageSelector 