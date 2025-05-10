import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaGlobe, FaArrowRight, FaComments, FaCode, FaExchangeAlt } from 'react-icons/fa'
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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
        duration: 0.5
      }
    }
  }

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container-custom max-w-4xl">
          {/* Simple Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-medium text-brand-black">
              Sema Translator
            </h1>
          </div>

          {/* Translation Interface */}
          <div className="bg-white shadow-sm border border-ui-gray-200 rounded-md overflow-hidden">
            {/* Language Selection Row */}
            <div className="flex items-center border-b border-ui-gray-200 p-3">
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
                className={`mx-2 p-2 rounded ${
                  !sourceLang ? 'text-ui-gray-300 cursor-not-allowed' : 'text-ui-gray-600 hover:bg-ui-gray-100'
                }`}
                aria-label="Swap languages"
              >
                <FaExchangeAlt />
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
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Input Section */}
              <div className="border-b md:border-b-0 md:border-r border-ui-gray-200">
                <TranslationTextArea
                  value={inputText}
                  onChange={setInputText}
                  placeholder="Enter text"
                  showTTS={false}
                  height="h-40"
                  showCharCount={true}
                />
              </div>

              {/* Output Section */}
              <div>
                <TranslationTextArea
                  value={outputText}
                  isReadOnly={true}
                  placeholder="Translation"
                  isLoading={isLoading}
                  detectedLanguage={detectedLanguage}
                  showTTS={true}
                  height="h-40"
                />
              </div>
            </div>
            
            {/* Footer Tools */}
            <div className="flex justify-end items-center border-t border-ui-gray-200 p-3 bg-ui-gray-50">
              <Link 
                to="/translate" 
                className="text-sm text-brand-green-600 hover:text-brand-green-700 font-medium"
              >
                Advanced translation tools
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Language Map Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-black mb-4">
              Global Language Coverage
            </h2>
            <p className="text-lg text-ui-gray-700 max-w-3xl mx-auto">
              Our platform supports over 200 languages across every region of the world, including low-resource and indigenous languages.
            </p>
          </div>

          {/* Language Map - Placeholder (would be a react-world-map component) */}
          <div className="bg-ui-gray-100 h-96 rounded-xl flex items-center justify-center">
            <div className="text-center text-ui-gray-600">
              <FaGlobe className="mx-auto text-5xl mb-4 text-brand-teal-400" />
              <p className="font-medium">Interactive language map coming soon</p>
              <p className="text-sm mt-2">Supporting 200+ languages across the globe</p>
            </div>
          </div>

          {/* Language Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg border border-ui-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-brand-black mb-2">200+</h3>
              <p className="text-ui-gray-700">Languages Supported</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-ui-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-brand-black mb-2">54+</h3>
              <p className="text-ui-gray-700">African Languages</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-ui-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-brand-black mb-2">30+</h3>
              <p className="text-ui-gray-700">Indigenous Languages</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-ui-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-black mb-4">
              Powerful Translation Features
            </h2>
            <p className="text-lg text-ui-gray-700 max-w-3xl mx-auto">
              Beyond basic translation, Sema offers a comprehensive suite of language tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-smooth">
              <div className="bg-brand-teal-100 w-14 h-14 rounded-full flex items-center justify-center mb-5">
                <FaGlobe className="text-brand-teal-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-brand-black mb-3">Text Translation</h3>
              <p className="text-ui-gray-700">
                Translate text between 200+ languages with high accuracy and natural-sounding results.
              </p>
              <Link 
                to="/translate" 
                className="mt-4 inline-block text-brand-teal-500 hover:text-brand-teal-600 font-medium"
              >
                Try it now <FaArrowRight className="inline-block ml-1" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-smooth">
              <div className="bg-brand-teal-100 w-14 h-14 rounded-full flex items-center justify-center mb-5">
                <FaComments className="text-brand-teal-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-brand-black mb-3">Multilingual Chat</h3>
              <p className="text-ui-gray-700">
                Chat with our AI assistant in your language and receive responses translated automatically.
              </p>
              <Link 
                to="/chat" 
                className="mt-4 inline-block text-brand-teal-500 hover:text-brand-teal-600 font-medium"
              >
                Start chatting <FaArrowRight className="inline-block ml-1" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-smooth">
              <div className="bg-brand-teal-100 w-14 h-14 rounded-full flex items-center justify-center mb-5">
                <FaCode className="text-brand-teal-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-brand-black mb-3">Developer API</h3>
              <p className="text-ui-gray-700">
                Integrate our translation capabilities into your applications with our powerful API.
              </p>
              <Link 
                to="/account/api-keys" 
                className="mt-4 inline-block text-brand-teal-500 hover:text-brand-teal-600 font-medium"
              >
                Get API access <FaArrowRight className="inline-block ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brand-teal-500 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to break language barriers?
          </h2>
          <p className="text-lg text-brand-teal-50 max-w-2xl mx-auto mb-8">
            Join thousands of people and businesses using Sema to communicate globally.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3 bg-white text-brand-teal-600 hover:bg-brand-teal-50 font-medium rounded-md transition-colors"
            >
              Sign Up Free
            </Link>
            <Link
              to="/translate"
              className="inline-flex items-center px-8 py-3 bg-transparent hover:bg-brand-teal-600 text-white font-medium rounded-md border border-white transition-colors"
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