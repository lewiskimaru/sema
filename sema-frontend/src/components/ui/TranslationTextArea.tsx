import { useState, useRef, useEffect } from 'react'
import { FaCopy, FaVolumeUp, FaTimes } from 'react-icons/fa'
import { motion } from 'framer-motion'

interface TranslationTextAreaProps {
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  isReadOnly?: boolean
  showCopy?: boolean
  showClear?: boolean
  showTTS?: boolean
  showCharCount?: boolean
  maxLength?: number
  height?: string
  isLoading?: boolean
  detectedLanguage?: string
  labelText?: string
}

const TranslationTextArea = ({
  value,
  onChange,
  placeholder = 'Enter text',
  isReadOnly = false,
  showCopy = true,
  showClear = true,
  showTTS = false,
  showCharCount = true,
  maxLength = 5000,
  height = 'h-48',
  isLoading = false,
  detectedLanguage,
  labelText
}: TranslationTextAreaProps) => {
  const [isCopied, setIsCopied] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const synthesis = typeof window !== 'undefined' ? window.speechSynthesis : undefined

  // Focus the textarea when it's created if not readonly
  useEffect(() => {
    if (textAreaRef.current && !isReadOnly) {
      textAreaRef.current.focus()
    }
  }, [isReadOnly])

  // Handle copy to clipboard
  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  // Handle text-to-speech
  const handleTTS = () => {
    if (synthesis && value) {
      // Stop any current speech
      synthesis.cancel()
      
      if (isPlaying) {
        setIsPlaying(false)
        return
      }
      
      const utterance = new SpeechSynthesisUtterance(value)
      
      // Set language if detected or default to English
      if (detectedLanguage) {
        utterance.lang = detectedLanguage
      }
      
      // Handle speech start and end events
      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
      
      synthesis.speak(utterance)
    }
  }

  // Handle clear text
  const handleClear = () => {
    if (onChange) {
      onChange('')
    }
  }

  // Handle text input
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      // Limit to maxLength
      if (maxLength && e.target.value.length > maxLength) {
        onChange(e.target.value.slice(0, maxLength))
      } else {
        onChange(e.target.value)
      }
    }
  }

  return (
    <div className="w-full">
      {labelText && (
        <label className="block text-sm font-medium text-ui-gray-700 mb-1">
          {labelText}
        </label>
      )}
      
      <div className={`relative border rounded-lg transition-all overflow-hidden
                     ${isReadOnly ? 'bg-ui-gray-50 border-ui-gray-200' : 'bg-white border-ui-gray-300'}
                     ${isLoading ? 'bg-ui-gray-50' : ''}`}>
        {/* Text area */}
        <textarea
          ref={textAreaRef}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={isReadOnly || isLoading}
          disabled={isLoading}
          className={`w-full px-4 py-3 ${height} resize-none focus:outline-none
                    bg-transparent text-ui-gray-800 text-lg placeholder-ui-gray-400
                    ${isLoading ? 'opacity-50' : 'opacity-100'}`}
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="absolute bottom-2 right-2 flex items-center space-x-1.5">
          {/* Text-to-speech button (if enabled) */}
          {showTTS && value && (
            <motion.button
              type="button"
              onClick={handleTTS}
              className={`p-1.5 rounded-full ${isPlaying ? 'bg-brand-teal-100 text-brand-teal-600' : 'bg-ui-gray-100 text-ui-gray-600'} 
                        hover:bg-brand-teal-100 hover:text-brand-teal-600 transition-colors`}
              whileTap={{ scale: 0.95 }}
              aria-label={isPlaying ? 'Stop speaking' : 'Speak text'}
              title={isPlaying ? 'Stop speaking' : 'Speak text'}
            >
              <FaVolumeUp className="h-4 w-4" />
            </motion.button>
          )}
          
          {/* Clear button (if not readonly and there's text) */}
          {showClear && !isReadOnly && value && (
            <motion.button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-full bg-ui-gray-100 text-ui-gray-600 hover:bg-ui-gray-200 transition-colors"
              whileTap={{ scale: 0.95 }}
              aria-label="Clear text"
              title="Clear text"
            >
              <FaTimes className="h-4 w-4" />
            </motion.button>
          )}
          
          {/* Copy button (if enabled and there's text) */}
          {showCopy && value && (
            <motion.button
              type="button"
              onClick={handleCopy}
              className={`p-1.5 rounded-full ${isCopied ? 'bg-brand-teal-100 text-brand-teal-600' : 'bg-ui-gray-100 text-ui-gray-600'} 
                        hover:bg-brand-teal-100 hover:text-brand-teal-600 transition-colors`}
              whileTap={{ scale: 0.95 }}
              aria-label={isCopied ? 'Copied!' : 'Copy to clipboard'}
              title={isCopied ? 'Copied!' : 'Copy to clipboard'}
            >
              <FaCopy className="h-4 w-4" />
            </motion.button>
          )}
        </div>
        
        {/* Character counter */}
        {showCharCount && (
          <div className="absolute bottom-2 left-3 text-xs text-ui-gray-500">
            {value.length} / {maxLength}
          </div>
        )}
      </div>
      
      {/* Detected language indicator */}
      {detectedLanguage && isReadOnly && (
        <div className="mt-1 text-xs text-ui-gray-500">
          Detected language: {detectedLanguage}
        </div>
      )}
    </div>
  )
}

export default TranslationTextArea 