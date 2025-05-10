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
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-brand-blue-50 via-white to-white">
        <div className="container-custom px-4 sm:px-6">
          {/* Hero heading and Translation Interface */}
          <div className="max-w-5xl mx-auto mb-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white shadow-lg rounded-xl overflow-hidden border border-ui-gray-200 transform transition-all hover:shadow-xl"
            >
            </motion.div>
          </div>
          
          {/* Translation Interface */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 px-4 py-4"> {/* Added padding here */}
              {/* Input Section */}
              <div className="border-b md:border-b-0 md:border-r border-ui-gray-200 pr-2 md:pr-4"> {/* Added padding here */}
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

              {/* Output Section */}{" "}
              <div>
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

      {/* Features Section - Improved with modern cards */}
      <section className="py-16 md:py-20 bg-brand-blue-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-black mb-4 relative inline-block">
              Powerful Translation Features
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-brand-blue-200 rounded-full"></span>
            </h2>
            <p className="text-lg text-ui-gray-600 max-w-3xl mx-auto">
              Beyond basic translation, Sema offers a comprehensive suite of language tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-ui-gray-100 flex flex-col h-full">
              <div className="bg-brand-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-5">
                <FaGlobe className="text-brand-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-brand-black mb-3">Text Translation</h3>
              <p className="text-ui-gray-600 mb-5 flex-grow">
                Translate text between 200+ languages with high accuracy and natural-sounding results.
              </p>
              <Link 
                to="/translate" 
                className="mt-auto inline-flex items-center text-brand-blue-600 hover:text-brand-blue-700 font-medium group"
              >
                Try it now <FaArrowRight className="inline-block ml-1.5 text-xs transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-ui-gray-100 flex flex-col h-full">
              <div className="bg-brand-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-5">
                <FaComments className="text-brand-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-brand-black mb-3">Multilingual Chat</h3>
              <p className="text-ui-gray-600 mb-5 flex-grow">
                Chat with our AI assistant in your language and receive responses translated automatically.
              </p>
              <Link 
                to="/chat" 
                className="mt-auto inline-flex items-center text-brand-blue-600 hover:text-brand-blue-700 font-medium group"
              >
                Start chatting <FaArrowRight className="inline-block ml-1.5 text-xs transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-ui-gray-100 flex flex-col h-full">
              <div className="bg-brand-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-5">
                <FaCode className="text-brand-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-brand-black mb-3">Developer API</h3>
              <p className="text-ui-gray-600 mb-5 flex-grow">
                Integrate our translation capabilities into your applications with our powerful API.
              </p>
              <Link 
                to="/account/api-keys" 
                className="mt-auto inline-flex items-center text-brand-blue-600 hover:text-brand-blue-700 font-medium group"
              >
                Get API access <FaArrowRight className="inline-block ml-1.5 text-xs transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-brand-blue-600 to-brand-blue-700 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to break language barriers?
          </h2>
          <p className="text-xl text-brand-blue-100 max-w-2xl mx-auto mb-8">
            Join thousands of people and businesses using Sema to communicate globally.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3 bg-white text-brand-blue-700 hover:bg-brand-blue-50 font-medium rounded-md transition-colors shadow-md hover:shadow-lg"
            >
              Sign Up Free
            </Link>
            <Link
              to="/translate"
              className="inline-flex items-center px-8 py-3 bg-transparent hover:bg-brand-blue-500 text-white font-medium rounded-md border border-white transition-colors"
            >
              Try Without Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home 