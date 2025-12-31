import { useState, useRef } from 'react';
import { ArrowUp, ChevronDown, Languages, MessageSquare, X } from 'lucide-react';
import InlineLanguageSelector from '../Translation/InlineLanguageSelector';
import SettingsDropdown from '../Settings/SettingsDropdown';
import { useLanguageCache } from '../../hooks/useCache';
import { TranslationMessage, ChatMessage } from '../../types/translation';

interface InputAreaProps {
  onSendMessage: (message: any, mode: string) => void;
  isCentered?: boolean;
}

export default function InputArea({ onSendMessage, isCentered = false }: InputAreaProps) {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState('translate'); // 'translate' or 'chat'
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [textareaFocused, setTextareaFocused] = useState(false);

  // Language selection for translation mode
  const [sourceLanguage, setSourceLanguage] = useState('auto'); // 'auto' for auto-detect
  const [targetLanguage, setTargetLanguage] = useState('eng_Latn'); // Default to English
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [showTargetSelector, setShowTargetSelector] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);



  // Language cache hook
  const { data: languagesData } = useLanguageCache();
  const languages = languagesData?.languages || {};

  // Helper function to get language name
  const getLanguageName = (code: string) => {
    if (code === 'auto') return 'Detect Language';
    const language = languages[code];
    return language ? language.name : code;
  };

  const handleSend = async () => {
    console.log('🎯 [InputArea] Send button clicked:', {
      hasText: !!inputText.trim(),
      hasFile: !!stagedFile,
      mode,
      sourceLanguage,
      targetLanguage
    });

    if (!inputText.trim() && !stagedFile) {
      console.log('⚠️ [InputArea] No content to send, aborting');
      return;
    }

    if (mode === 'translate') {
      console.log('🔄 [InputArea] Handling translation mode');
      // Handle translation
      const translationMessage: TranslationMessage = {
        text: inputText,
        sourceLanguage,
        targetLanguage,
        file: stagedFile || undefined
      };

      console.log('📝 [InputArea] Created translation message:', {
        text: inputText.substring(0, 100) + (inputText.length > 100 ? '...' : ''),
        sourceLanguage,
        targetLanguage,
        hasFile: !!stagedFile
      });

      // Send the translation message to parent (ChatContainer will handle the actual translation)
      console.log('📤 [InputArea] Sending translation message to parent');
      onSendMessage(translationMessage, mode);
    } else {
      console.log('💬 [InputArea] Handling chat mode');
      // Handle chat message
      const chatMessage: ChatMessage = {
        text: inputText,
        file: stagedFile || undefined
      };
      console.log('📤 [InputArea] Sending chat message to parent');
      onSendMessage(chatMessage, mode);
    }

    // Clear input
    console.log('🧹 [InputArea] Clearing input fields');
    setInputText('');
    setStagedFile(null);
  };

  const getPlaceholderText = () => {
    if (stagedFile) {
      return "Add a message for your document (optional)";
    }
    return mode === 'translate'
      ? "Enter text to translate or drag & drop a file"
      : "Chat mode is currently disabled";
  };

  // Simple input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  // Swap source and target languages
  const handleSwapLanguages = () => {
    if (sourceLanguage !== 'auto') {
      const temp = sourceLanguage;
      setSourceLanguage(targetLanguage);
      setTargetLanguage(temp);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setStagedFile(e.dataTransfer.files[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow Shift+Enter for line breaks
        return;
      } else {
        // Send message on Enter (not Ctrl+Enter as per original design)
        e.preventDefault();
        handleSend();
      }
    }
  };

  if (isCentered) {
    // CENTERED MODE: Just render the input wrapper, no additional containers
    return (
      <div
        className={`input-area-wrapper ${isDragging ? 'dragging' : ''} ${textareaFocused ? 'focused' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Row 0: Language Selector (when active) - Appears above everything */}
        {(showSourceSelector || showTargetSelector) && (
          <InlineLanguageSelector
            isSource={showSourceSelector}
            selectedLanguage={showSourceSelector ? sourceLanguage : targetLanguage}
            onSelectLanguage={showSourceSelector ? setSourceLanguage : setTargetLanguage}
            onClose={() => {
              setShowSourceSelector(false);
              setShowTargetSelector(false);
            }}
            isOpen={showSourceSelector || showTargetSelector}
          />
        )}

        {/* Row 1: Language Selector Bar (only in translate mode) */}
        {mode === 'translate' && (
          <div className="language-selector-bar p-2 px-3 border-b border-[#EFEFEF] dark:border-[#27272A] flex justify-between">
            <div className="flex-1 flex justify-start">
              <button
                onClick={() => {
                  if (showSourceSelector) {
                    // If already open, close it
                    setShowSourceSelector(false);
                  } else {
                    // If closed, open it and close target selector
                    setShowSourceSelector(true);
                    setShowTargetSelector(false);
                  }
                }}
                className={`language-button px-2 py-1 rounded text-sm flex items-center gap-1 transition-colors ${showSourceSelector
                  ? 'bg-[#F0F0F0] text-black border-2 border-[#333] dark:bg-[#27272A] dark:text-white dark:border-[#E4E4E7]'
                  : 'hover:bg-[#F0F0F0] text-black dark:text-[#E4E4E7] dark:hover:bg-[#27272A]'
                  }`}
                title="Select source language"
              >
                <span>{getLanguageName(sourceLanguage)}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${showSourceSelector ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSwapLanguages}
                className="swap-button p-1 rounded-full hover:bg-[#F0F0F0] dark:hover:bg-[#27272A]"
                title="Swap languages"
                disabled={sourceLanguage === 'auto'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 16l-4-4m0 0l4-4m-4 4h18M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>

            <div className="flex-1 flex justify-start">
              <button
                onClick={() => {
                  if (showTargetSelector) {
                    // If already open, close it
                    setShowTargetSelector(false);
                  } else {
                    // If closed, open it and close source selector
                    setShowTargetSelector(true);
                    setShowSourceSelector(false);
                  }
                }}
                className={`language-button px-2 py-1 rounded text-sm flex items-center gap-1 transition-colors ${showTargetSelector
                  ? 'bg-[#F0F0F0] text-black border-2 border-[#333] dark:bg-[#27272A] dark:text-white dark:border-[#E4E4E7]'
                  : 'hover:bg-[#F0F0F0] text-black dark:text-[#E4E4E7] dark:hover:bg-[#27272A]'
                  }`}
                title="Select target language"
              >
                <span>{getLanguageName(targetLanguage)}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${showTargetSelector ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Row 2: Text Input Field */}
        <div className="input-text-area relative">
          {stagedFile && (
            <div className="staged-file">
              <span className="truncate flex-1">{stagedFile.name}</span>
              <button
                className="p-1 hover:bg-[#EFEFEF] dark:hover:bg-[#3F3F46] rounded-full"
                onClick={() => setStagedFile(null)}
                title="Remove file"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <textarea
            ref={textareaRef}
            className="w-full resize-none outline-none min-h-[40px] bg-transparent text-black dark:text-[#E4E4E7] placeholder-gray-500 dark:placeholder-gray-400 disabled:cursor-not-allowed"
            placeholder={getPlaceholderText()}
            value={inputText}
            onChange={handleInputChange}
            onFocus={() => setTextareaFocused(true)}
            onBlur={() => setTextareaFocused(false)}
            onKeyDown={handleKeyDown}
            rows={Math.min(5, Math.max(1, inputText.split('\n').length))}
            disabled={mode === 'chat'}
          />
        </div>

        {/* Row 3: Action Buttons Bar */}
        <div className="input-actions">
          <div className="flex items-center gap-3">
            {/* A. Document Upload Button - TEMPORARILY DISABLED */}
            {/* <button className="action-button" title="Upload document">
              <Plus size={18} />
            </button> */}

            {/* B. Parameters/Settings Icon - TEMPORARILY DISABLED */}
            {/* <button
              className="action-button"
              title={`${mode === 'translate' ? 'Translation' : 'Chat'} settings`}
              onClick={() => mode === 'translate' && setShowTargetSelector(true)}
            >
              <SlidersHorizontal size={18} />
            </button> */}

            {/* B. Settings Dropdown */}
            <SettingsDropdown />

            {/* C. Chat Mode Button */}
            <button
              className={`mode-button ${mode === 'chat' ? 'mode-active' : 'mode-inactive'}`}
              onClick={() => setMode('chat')}
              title="Switch to Chat Mode"
            >
              <MessageSquare size={18} />
            </button>

            {/* D. Translate Mode Button */}
            <button
              className={`mode-button ${mode === 'translate' ? 'mode-active' : 'mode-inactive'}`}
              onClick={() => setMode('translate')}
              title="Switch to Translate Mode"
            >
              <Languages size={18} />
            </button>
          </div>

          {/* F. Send Button */}
          <button
            className={`send-button ${(inputText.trim() || stagedFile) && mode !== 'chat'
              ? 'enabled'
              : 'disabled'
              }`}
            disabled={(!inputText.trim() && !stagedFile) || mode === 'chat'}
            onClick={handleSend}
            title={`${mode === 'translate' ? 'Translate' : 'Send message'} (Enter)`}
          >
            <ArrowUp size={18} />
          </button>
        </div>



        {/* Drag-and-Drop Visual Feedback */}
        {isDragging && (
          <div className="drag-overlay">
            <div className="drag-message">Drop file here</div>
          </div>
        )}
      </div>
    );
  }

  // NON-CENTERED MODE: Standard layout with containers
  return (
    <div className="p-4">
      <div className="w-full max-w-[800px] mx-auto px-4 sm:px-0">
        <div
          className={`input-area-wrapper ${isDragging ? 'dragging' : ''} ${textareaFocused ? 'focused' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Row 0: Language Selector (when active) - Appears above everything */}
          {(showSourceSelector || showTargetSelector) && (
            <InlineLanguageSelector
              isSource={showSourceSelector}
              selectedLanguage={showSourceSelector ? sourceLanguage : targetLanguage}
              onSelectLanguage={showSourceSelector ? setSourceLanguage : setTargetLanguage}
              onClose={() => {
                setShowSourceSelector(false);
                setShowTargetSelector(false);
              }}
              isOpen={showSourceSelector || showTargetSelector}
            />
          )}

          {/* Row 1: Language Selector Bar (only in translate mode) */}
          {mode === 'translate' && (
            <div className="language-selector-bar p-2 px-3 border-b border-[#EFEFEF] dark:border-[#27272A] flex justify-between">
              <div className="flex-1 flex justify-start">
                <button
                  onClick={() => {
                    if (showSourceSelector) {
                      // If already open, close it
                      setShowSourceSelector(false);
                    } else {
                      // If closed, open it and close target selector
                      setShowSourceSelector(true);
                      setShowTargetSelector(false);
                    }
                  }}
                  className={`language-button px-2 py-1 rounded text-sm flex items-center gap-1 transition-colors ${showSourceSelector
                    ? 'bg-[#F0F0F0] text-black border-2 border-[#333] dark:bg-[#27272A] dark:text-white dark:border-[#E4E4E7]'
                    : 'hover:bg-[#F0F0F0] text-black dark:text-[#E4E4E7] dark:hover:bg-[#27272A]'
                    }`}
                  title="Select source language"
                >
                  <span>{getLanguageName(sourceLanguage)}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${showSourceSelector ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSwapLanguages}
                  className="swap-button p-1 rounded-full hover:bg-[#F0F0F0] dark:hover:bg-[#27272A]"
                  title="Swap languages"
                  disabled={sourceLanguage === 'auto'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 16l-4-4m0 0l4-4m-4 4h18M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 flex justify-start">
                <button
                  onClick={() => {
                    if (showTargetSelector) {
                      // If already open, close it
                      setShowTargetSelector(false);
                    } else {
                      // If closed, open it and close source selector
                      setShowTargetSelector(true);
                      setShowSourceSelector(false);
                    }
                  }}
                  className={`language-button px-2 py-1 rounded text-sm flex items-center gap-1 transition-colors ${showTargetSelector
                    ? 'bg-[#F0F0F0] text-black border-2 border-[#333] dark:bg-[#27272A] dark:text-white dark:border-[#E4E4E7]'
                    : 'hover:bg-[#F0F0F0] text-black dark:text-[#E4E4E7] dark:hover:bg-[#27272A]'
                    }`}
                  title="Select target language"
                >
                  <span>{getLanguageName(targetLanguage)}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${showTargetSelector ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Row 2: Text Input Field */}
          <div className="input-text-area relative">
            {stagedFile && (
              <div className="staged-file">
                <span className="truncate flex-1">{stagedFile.name}</span>
                <button
                  className="p-1 hover:bg-[#EFEFEF] dark:hover:bg-[#3F3F46] rounded-full"
                  onClick={() => setStagedFile(null)}
                  title="Remove file"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              className="w-full resize-none outline-none min-h-[40px] bg-transparent text-black dark:text-[#E4E4E7] placeholder-gray-500 dark:placeholder-gray-400 disabled:cursor-not-allowed"
              placeholder={getPlaceholderText()}
              value={inputText}
              onChange={handleInputChange}
              onFocus={() => setTextareaFocused(true)}
              onBlur={() => setTextareaFocused(false)}
              onKeyDown={handleKeyDown}
              rows={Math.min(5, Math.max(1, inputText.split('\n').length))}
              disabled={mode === 'chat'}
            />
          </div>

          {/* Row 3: Action Buttons Bar */}
          <div className="input-actions">
            <div className="flex items-center gap-3">
              {/* A. Document Upload Button - TEMPORARILY DISABLED */}
              {/* <button className="action-button" title="Upload document">
                  <Plus size={18} />
                </button> */}

              {/* B. Parameters/Settings Icon - TEMPORARILY DISABLED */}
              {/* <button
                  className="action-button"
                  title={`${mode === 'translate' ? 'Translation' : 'Chat'} settings`}
                  onClick={() => mode === 'translate' && setShowTargetSelector(true)}
                >
                  <SlidersHorizontal size={18} />
                </button> */}

              {/* B. Settings Dropdown */}
              <SettingsDropdown />

              {/* C. Chat Mode Button */}
              <button
                className={`mode-button ${mode === 'chat' ? 'mode-active' : 'mode-inactive'}`}
                onClick={() => setMode('chat')}
                title="Switch to Chat Mode"
              >
                <MessageSquare size={18} />
              </button>

              {/* D. Translate Mode Button */}
              <button
                className={`mode-button ${mode === 'translate' ? 'mode-active' : 'mode-inactive'}`}
                onClick={() => setMode('translate')}
                title="Switch to Translate Mode"
              >
                <Languages size={18} />
              </button>
            </div>

            {/* F. Send Button */}
            <button
              className={`send-button ${(inputText.trim() || stagedFile) && mode !== 'chat'
                ? 'enabled'
                : 'disabled'
                }`}
              disabled={(!inputText.trim() && !stagedFile) || mode === 'chat'}
              onClick={handleSend}
              title={`${mode === 'translate' ? 'Translate' : 'Send message'} (Enter)`}
            >
              <ArrowUp size={18} />
            </button>
          </div>



          {/* Drag-and-Drop Visual Feedback */}
          {isDragging && (
            <div className="drag-overlay">
              <div className="drag-message">Drop file here</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
