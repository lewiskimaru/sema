import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaGlobe, FaArrowRight, FaComments, FaCode, FaExchangeAlt, FaLightbulb, FaMobileAlt, FaBookOpen } from 'react-icons/fa'
import TranslationTextArea from '../components/ui/TranslationTextArea'
import LanguageSelector from '../components/ui/LanguageSelector'
import { getSupportedLanguages, translateText, detectLanguage } from '../services/translation'
import { Language } from '../services/translation'

const Home = () => {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [sourceLang, setSourceLang] = useState<string | null>(null)
  const [targetLang, setTargetLang] = useState<string>('eng_Latn')
  const [languages, setLanguages] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [detectedLanguage, setDetectedLanguage] = useState<string | undefined>()
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch supported languages
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const langData = await getSupportedLanguages()
        setLanguages(langData)
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to fetch languages:', error)
      }
    }

    fetchLanguages()
  }, [])

  // Handle translation
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
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-translate when input, source, or target language changes (with debounce)
  useEffect(() => {
    if (!isInitialized) return;
    
    const timer = setTimeout(() => {
      if (inputText.trim().length > 0) {
        handleTranslate()
      } else {
        setOutputText('')
        setDetectedLanguage(undefined)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [inputText, sourceLang, targetLang, isInitialized])

  // Swap languages
  const handleSwapLanguages = () => {
    if (!sourceLang) return; // Can't swap if auto-detect
    
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    
    // Also swap the text
    setInputText(outputText);
    setOutputText(inputText);
  }

  return (
    <div className="pb-16">
      {/* Translation Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-brand-blue-50 via-white to-white">
        <div className="container-custom px-4 sm:px-6">
          {/* Translation Interface */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white shadow-lg rounded-xl overflow-hidden border border-ui-gray-200 max-w-5xl mx-auto transform transition-all hover:shadow-xl"
          >
            {/* Language Selection Row */}
            <div className="flex items-center border-b border-ui-gray-200 p-5 bg-ui-gray-50">
              <div className="flex-1">
                <LanguageSelector
                  languages={languages}
                  selectedLanguage={sourceLang}
                  onSelectLanguage={setSourceLang}
                  showAutoDetect={true}
                  isSource={true}
                  placeholder="Detect language"
                />
              </div>
              
              <button
                onClick={handleSwapLanguages}
                disabled={!sourceLang}
                className={`mx-4 p-3 rounded-full transition-all duration-300 ${
                  !sourceLang 
                    ? 'text-ui-gray-300 cursor-not-allowed bg-ui-gray-100' 
                    : 'text-brand-blue-500 hover:bg-brand-blue-100 hover:text-brand-blue-600 shadow-sm hover:shadow'
                }`}
                aria-label="Swap languages"
              >
                <FaExchangeAlt className="text-lg" />
              </button>
              
              <div className="flex-1">
                <LanguageSelector
                  languages={languages}
                  selectedLanguage={targetLang}
                  onSelectLanguage={setTargetLang}
                />
              </div>
            </div>
            
 {/* Translation Text Areas */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-0 p-6 md:p-8 w-full max-w-5xl mx-auto"> {/* Increased padding and adjusted width */}
              {/* Input Section */}
 <div className="border-b md:border-b-0 md:border-r border-ui-gray-200 pb-6 md:pb-0 md:pr-4 p-4"> {/* Added padding and border */}
                <TranslationTextArea
                  value={inputText}
                  onChange={setInputText}
                  placeholder="Enter text to translate"
                  showTTS={false}
                  height="h-64"
                  showCharCount={true}
                  labelText="Source Text"
                />
              </div>

 {/* Output Section */}
 <div className="pt-6 md:pt-0 md:pl-4 p-4"> {/* Added padding */}
                <TranslationTextArea
                  value={outputText}
                  isReadOnly={true}
                  placeholder="Translation will appear here"
                  isLoading={isLoading}
                  detectedLanguage={detectedLanguage}
                  showTTS={true}
                  height="h-64"
                  labelText="Translation"
                />
              </div>
            </div>
            
 {/* Footer Tools */}
            <div className="flex justify-between items-center border-t border-ui-gray-200 p-5 bg-ui-gray-50">
              <div className="text-ui-gray-600 text-sm flex items-center">
                {isInitialized ? (
                  <>
                    <FaGlobe className="mr-2 text-brand-blue-400" size={14} />
                    <span className="font-medium">{languages.length}</span> languages available
                  </>
                ) : (
                  'Loading languages...'
                )}
              </div>
              <Link 
                to="/translate" 
                className="text-sm text-brand-blue-600 hover:text-brand-blue-700 font-medium flex items-center group bg-white py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all"
              >
                Advanced translation tools
                <FaArrowRight className="ml-2 text-xs transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
          
 {/* Badge row */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 mt-8"
          >
            <div className="inline-flex items-center px-4 py-2 bg-brand-blue-50 text-brand-blue-700 rounded-full text-sm border border-brand-blue-100 shadow-sm">
              <FaLightbulb className="mr-2 text-brand-blue-500" size={14} />
              AI-powered translation
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-brand-blue-50 text-brand-blue-700 rounded-full text-sm border border-brand-blue-100 shadow-sm">
              <FaMobileAlt className="mr-2 text-brand-blue-500" size={14} />
              Works on all devices
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-brand-blue-50 text-brand-blue-700 rounded-full text-sm border border-brand-blue-100 shadow-sm">
              <FaBookOpen className="mr-2 text-brand-blue-500" size={14} />
              200+ languages supported
            </div>
          </motion.div>
        </div>
      </section>

      {/* Powerful Translation Features */}
      <section className="py-16 md:py-24 bg-ui-gray-100">
        <div className="container-custom px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-blue-800 mb-6 md:mb-8 leading-tight">
 Powerful Translation Features
          </h2>
          <p className="text-lg md:text-xl text-ui-gray-700 mb-12 max-w-3xl mx-auto">
            Beyond basic translation, Sema offers a comprehensive suite of language tools.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Text Translation */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-8 rounded-xl shadow-lg border border-ui-gray-200 text-left transform transition-transform hover:scale-105"
            >
              <FaExchangeAlt className="text-4xl text-brand-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-brand-blue-800 mb-3">Text Translation</h3>
              <p className="text-ui-gray-700 mb-4">
 Translate text between 200+ languages with high accuracy and natural-sounding results.
              </p>
              <Link to="/translate" className="inline-flex items-center text-brand-blue-600 hover:text-brand-blue-700 font-medium group">
 Try it now
 <FaArrowRight className="ml-2 text-sm transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
            
            {/* Feature 2: Multilingual Chat */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 rounded-xl shadow-lg border border-ui-gray-200 text-left transform transition-transform hover:scale-105"
            >
              <FaComments className="text-4xl text-brand-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-brand-blue-800 mb-3">Multilingual Chat</h3>
              <p className="text-ui-gray-700 mb-4">
 Chat with our AI assistant in your preferred language and have responses translated automatically.
              </p>
              <Link to="/chat" className="inline-flex items-center text-brand-blue-600 hover:text-brand-blue-700 font-medium group">
 Start chatting
 <FaArrowRight className="ml-2 text-sm transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
            
            {/* Feature 3: Developer API */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-8 rounded-xl shadow-lg border border-ui-gray-200 text-left transform transition-transform hover:scale-105"
            >
              <FaCode className="text-4xl text-brand-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-brand-blue-800 mb-3">Developer API</h3>
              <p className="text-ui-gray-700 mb-4">
 Integrate our translation capabilities into your applications with our powerful API.
              </p>
              <Link to="/api-docs" className="inline-flex items-center text-brand-blue-600 hover:text-brand-blue-700 font-medium group">
 Get API access
 <FaArrowRight className="ml-2 text-sm transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The footer remains below this content */}
    </div>
  )
}

export default Home 