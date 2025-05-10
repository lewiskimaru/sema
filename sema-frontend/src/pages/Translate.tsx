import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaHistory, FaShare, FaCog, FaRegSave, FaExchangeAlt } from 'react-icons/fa'
import TranslationTextArea from '../components/ui/TranslationTextArea'
import LanguageSelector from '../components/ui/LanguageSelector'
import { getSupportedLanguages, translateText, getTranslationHistory } from '../services/translation'
import { Language } from '../services/translation'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-toastify'

const Translate = () => {
  // State for translation functionality
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [sourceLang, setSourceLang] = useState<string | null>(null)
  const [targetLang, setTargetLang] = useState<string>('eng_Latn')
  const [languages, setLanguages] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [detectedLanguage, setDetectedLanguage] = useState<string | undefined>()
  
  // Advanced features state
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [maxCharacterLimit, setMaxCharacterLimit] = useState(5000)
  const [autoTranslate, setAutoTranslate] = useState(true)
  const [translationDelay, setTranslationDelay] = useState(800) // ms
  
  // Auth state
  const { isAuthenticated } = useAuthStore()
  
  // Refs
  const translateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Load languages on component mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const langData = await getSupportedLanguages()
        setLanguages(langData)
      } catch (error) {
        console.error('Failed to fetch languages:', error)
        toast.error('Failed to load languages. Please refresh the page.')
      }
    }

    fetchLanguages()
  }, [])
  
  // Load user's translation history if authenticated
  useEffect(() => {
    if (isAuthenticated && showHistory) {
      fetchTranslationHistory()
    }
  }, [isAuthenticated, showHistory])
  
  const fetchTranslationHistory = async () => {
    if (!isAuthenticated) return
    
    setIsHistoryLoading(true)
    try {
      const historyData = await getTranslationHistory(1, 10)
      setHistory(historyData)
    } catch (error) {
      console.error('Failed to fetch translation history:', error)
      toast.error('Failed to load translation history')
    } finally {
      setIsHistoryLoading(false)
    }
  }

  // Handle translation (either manual or auto)
  const handleTranslate = async () => {
    if (!inputText.trim() || !targetLang) return

    setIsLoading(true)
    setOutputText('')

    try {
      const result = await translateText(inputText, targetLang, sourceLang || undefined)
      setOutputText(result.translated_text)

      // Update the detected language if source language was auto-detected
      if (!sourceLang && result.detected_source_lang) {
        setDetectedLanguage(
          languages.find(lang => lang.code === result.detected_source_lang)?.name || 
          result.detected_source_lang
        )
      }
    } catch (error) {
      console.error('Translation error:', error)
      toast.error('Translation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-translate with debounce
  useEffect(() => {
    if (!autoTranslate || !inputText.trim()) {
      if (translateTimeoutRef.current) {
        clearTimeout(translateTimeoutRef.current)
      }
      if (!inputText.trim()) {
        setOutputText('')
        setDetectedLanguage(undefined)
      }
      return
    }
    
    if (translateTimeoutRef.current) {
      clearTimeout(translateTimeoutRef.current)
    }
    
    translateTimeoutRef.current = setTimeout(() => {
      handleTranslate()
    }, translationDelay)
    
    return () => {
      if (translateTimeoutRef.current) {
        clearTimeout(translateTimeoutRef.current)
      }
    }
  }, [inputText, sourceLang, targetLang, autoTranslate, translationDelay])
  
  // Swap languages
  const handleSwapLanguages = () => {
    // Can't swap if source is auto-detect
    if (!sourceLang) {
      toast.info('Cannot swap when source language is set to auto-detect')
      return
    }
    
    const temp = sourceLang
    setSourceLang(targetLang)
    setTargetLang(temp)
    
    // Also swap the text
    setInputText(outputText)
    setOutputText(inputText)
  }
  
  // Save translation to history (if authenticated)
  const handleSaveTranslation = () => {
    if (!isAuthenticated) {
      toast.info('Please log in to save translations')
      return
    }
    
    if (!inputText.trim() || !outputText.trim()) {
      toast.info('Nothing to save')
      return
    }
    
    toast.success('Translation saved to history')
    // In a real implementation, this would make an API call to save the translation
    // For now, we'll just refresh the history
    if (showHistory) {
      fetchTranslationHistory()
    }
  }
  
  // Share translation
  const handleShareTranslation = () => {
    if (!inputText.trim() || !outputText.trim()) {
      toast.info('Nothing to share')
      return
    }
    
    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'Sema Translation',
        text: `${inputText}\n\n${outputText}`,
        url: window.location.href,
      }).catch(err => {
        console.error('Share failed:', err)
        // Fallback to clipboard
        fallbackShare()
      })
    } else {
      // Fallback to clipboard
      fallbackShare()
    }
  }
  
  const fallbackShare = () => {
    const shareText = `${inputText}\n\n${outputText}`
    navigator.clipboard.writeText(shareText)
    toast.success('Translation copied to clipboard')
  }
  
  // Handle language click from history
  const loadTranslationFromHistory = (historyItem: any) => {
    setInputText(historyItem.original_text)
    setOutputText(historyItem.translated_text)
    setSourceLang(historyItem.source_lang_detected || historyItem.source_lang_provided)
    setTargetLang(historyItem.target_lang)
    setShowHistory(false)
  }

  return (
    <div className="py-8 pb-16">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-black mb-3">
            Advanced Translation
          </h1>
          <p className="text-lg text-ui-gray-700">
            Translate text between 200+ languages with advanced options and features.
          </p>
        </div>
        
        {/* Main translation interface */}
        <div className="bg-white rounded-xl shadow-smooth p-6 mb-8">
          <div className="flex flex-wrap mb-6 justify-between">
            {/* Language selectors */}
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
              <div className="w-[calc(50%-18px)]">
                <LanguageSelector
                  languages={languages}
                  selectedLanguage={sourceLang}
                  onSelectLanguage={setSourceLang}
                  showAutoDetect={true}
                  isSource={true}
                  label="From"
                />
              </div>
              
              <button 
                onClick={handleSwapLanguages}
                className="p-2 rounded-full bg-ui-gray-100 hover:bg-ui-gray-200 text-ui-gray-700 transition-colors"
                title="Swap languages"
                aria-label="Swap languages"
                disabled={!sourceLang}
              >
                <FaExchangeAlt />
              </button>
              
              <div className="w-[calc(50%-18px)]">
                <LanguageSelector
                  languages={languages}
                  selectedLanguage={targetLang}
                  onSelectLanguage={setTargetLang}
                  label="To"
                />
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center p-2 rounded ${showHistory ? 'bg-brand-teal-100 text-brand-teal-600' : 'bg-ui-gray-100 text-ui-gray-700 hover:bg-ui-gray-200'}`}
                title="View history"
                aria-label="View history"
              >
                <FaHistory className="mr-1" />
                <span>History</span>
              </button>
              
              <button
                onClick={handleSaveTranslation}
                className="flex items-center p-2 rounded bg-ui-gray-100 text-ui-gray-700 hover:bg-ui-gray-200"
                title="Save translation"
                aria-label="Save translation"
              >
                <FaRegSave className="mr-1" />
                <span>Save</span>
              </button>
              
              <button
                onClick={handleShareTranslation}
                className="flex items-center p-2 rounded bg-ui-gray-100 text-ui-gray-700 hover:bg-ui-gray-200"
                title="Share translation"
                aria-label="Share translation"
              >
                <FaShare className="mr-1" />
                <span>Share</span>
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center p-2 rounded ${showSettings ? 'bg-brand-teal-100 text-brand-teal-600' : 'bg-ui-gray-100 text-ui-gray-700 hover:bg-ui-gray-200'}`}
                title="Translation settings"
                aria-label="Translation settings"
              >
                <FaCog className="mr-1" />
                <span>Settings</span>
              </button>
            </div>
          </div>
          
          {/* Settings panel - conditionally rendered */}
          {showSettings && (
            <div className="mb-6 p-4 bg-ui-gray-50 rounded-lg border border-ui-gray-200">
              <h3 className="text-lg font-medium text-brand-black mb-3">Translation Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={autoTranslate}
                      onChange={(e) => setAutoTranslate(e.target.checked)}
                      className="mr-2 h-4 w-4 text-brand-teal-500 rounded focus:ring-brand-teal-400"
                    />
                    <span>Auto-translate</span>
                  </label>
                  
                  {autoTranslate && (
                    <div className="ml-6">
                      <label className="block text-sm mb-1">Translation delay (ms)</label>
                      <input
                        type="range"
                        min="300"
                        max="2000"
                        step="100"
                        value={translationDelay}
                        onChange={(e) => setTranslationDelay(Number(e.target.value))}
                        className="w-full max-w-xs"
                      />
                      <div className="text-sm text-ui-gray-600">{translationDelay}ms</div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block mb-2">
                    <span className="block mb-1">Maximum character limit</span>
                    <input
                      type="number"
                      min="1000"
                      max="10000"
                      value={maxCharacterLimit}
                      onChange={(e) => setMaxCharacterLimit(Number(e.target.value))}
                      className="px-3 py-1.5 border border-ui-gray-300 rounded-md w-24"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {/* History panel - conditionally rendered */}
          {showHistory && (
            <div className="mb-6 p-4 bg-ui-gray-50 rounded-lg border border-ui-gray-200">
              <h3 className="text-lg font-medium text-brand-black mb-3">Translation History</h3>
              
              {isHistoryLoading ? (
                <div className="py-4 text-center text-ui-gray-500">
                  Loading history...
                </div>
              ) : !isAuthenticated ? (
                <div className="py-4 text-center text-ui-gray-500">
                  Please log in to view your translation history
                </div>
              ) : history.length === 0 ? (
                <div className="py-4 text-center text-ui-gray-500">
                  No translation history found
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  <ul className="divide-y divide-ui-gray-200">
                    {history.map((item, index) => (
                      <li 
                        key={index}
                        className="py-2 px-1 hover:bg-ui-gray-100 cursor-pointer transition-colors rounded"
                        onClick={() => loadTranslationFromHistory(item)}
                      >
                        <div className="flex justify-between mb-1">
                          <div className="text-sm font-medium">
                            {item.source_lang_detected || item.source_lang_provided || 'Auto'} → {item.target_lang}
                          </div>
                          <div className="text-xs text-ui-gray-500">
                            {new Date(item.request_timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-sm line-clamp-1 text-ui-gray-700">
                          {item.original_text}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Translation text areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <TranslationTextArea
                value={inputText}
                onChange={setInputText}
                placeholder="Enter text to translate"
                showTTS={false}
                height="h-64"
                maxLength={maxCharacterLimit}
                showCharCount={true}
              />
              
              {!autoTranslate && (
                <div className="mt-4">
                  <button
                    onClick={handleTranslate}
                    disabled={!inputText.trim() || isLoading}
                    className="btn-primary w-full"
                  >
                    Translate
                  </button>
                </div>
              )}
            </div>
            
            <div>
              <TranslationTextArea
                value={outputText}
                isReadOnly={true}
                placeholder="Translation will appear here"
                isLoading={isLoading}
                detectedLanguage={detectedLanguage}
                showTTS={true}
                height="h-64"
                showCharCount={false}
              />
            </div>
          </div>
        </div>
        
        {/* Additional info section */}
        <div className="bg-ui-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-brand-black mb-3">About Sema Translation</h2>
          <p className="text-ui-gray-700 mb-4">
            Sema Translator uses state-of-the-art machine learning models to provide high-quality translations across 200+ languages, including many low-resource and indigenous languages.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <h3 className="font-medium text-brand-black mb-1">Key Features</h3>
              <ul className="text-sm text-ui-gray-700 space-y-1">
                <li>• Auto language detection</li>
                <li>• 200+ languages supported</li>
                <li>• Fast & accurate translations</li>
                <li>• Translation history</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-brand-black mb-1">Popular Languages</h3>
              <ul className="text-sm text-ui-gray-700 space-y-1">
                <li>• English, Spanish, French</li>
                <li>• Chinese, Japanese, Korean</li>
                <li>• Arabic, Hindi, Russian</li>
                <li>• Swahili, Yoruba, Zulu</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-brand-black mb-1">Usage Tips</h3>
              <ul className="text-sm text-ui-gray-700 space-y-1">
                <li>• Save translations for later use</li>
                <li>• Adjust settings for your needs</li>
                <li>• Use text-to-speech to hear pronunciations</li>
                <li>• Share translations easily</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Translate 