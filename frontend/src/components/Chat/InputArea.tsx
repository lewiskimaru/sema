import { useState, useRef } from 'react';
import { ArrowUp, ChevronDown, Languages, MessageSquare, X } from 'lucide-react';
import LanguageSelector from '../Translation/LanguageSelector';

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
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [showTargetSelector, setShowTargetSelector] = useState(false);



  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper functions for language selection
  const getLanguageName = (code: string) => {
    if (code === 'auto') return 'Detect Language';

    const languages: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'ru': 'Russian',
      'pt': 'Portuguese',
      'ja': 'Japanese'
    };

    return languages[code] || code.toUpperCase();
  };

  const handleSend = () => {
    if (inputText.trim() || stagedFile) {
      // Include language information for translation mode
      const messageData = mode === 'translate'
        ? { text: inputText, sourceLanguage, targetLanguage, file: stagedFile }
        : inputText;

      onSendMessage(messageData, mode);
      setInputText('');
      setStagedFile(null);
    }
  };

  const getPlaceholderText = () => {
    if (stagedFile) {
      return "Add a message for your document (optional)";
    }
    return mode === 'translate'
      ? "Enter text to translate or drag & drop a file"
      : "Message Sema AI or drag & drop a file...";
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
        {/* Language Selector Bar (only in translate mode) */}
        {mode === 'translate' && (
          <div className="language-selector-bar p-2 px-3 border-b border-[#EFEFEF] flex justify-between">
            <div className="flex-1 flex justify-start">
              <button
                onClick={() => setShowSourceSelector(true)}
                className="language-button px-2 py-1 rounded hover:bg-[#F0F0F0] text-sm flex items-center gap-1"
                title="Select source language"
              >
                <span>{getLanguageName(sourceLanguage)}</span>
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSwapLanguages}
                className="swap-button p-1 rounded-full hover:bg-[#F0F0F0]"
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
                onClick={() => setShowTargetSelector(true)}
                className="language-button px-2 py-1 rounded hover:bg-[#F0F0F0] text-sm flex items-center gap-1"
                title="Select target language"
              >
                <span>{getLanguageName(targetLanguage)}</span>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Row 1: Text Input Field */}
        <div className="input-text-area relative">
          {stagedFile && (
            <div className="staged-file">
              <span className="truncate flex-1">{stagedFile.name}</span>
              <button
                className="p-1 hover:bg-[#EFEFEF] rounded-full"
                onClick={() => setStagedFile(null)}
                title="Remove file"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <textarea
            ref={textareaRef}
            className="w-full resize-none outline-none min-h-[40px]"
            placeholder={getPlaceholderText()}
            value={inputText}
            onChange={handleInputChange}
            onFocus={() => setTextareaFocused(true)}
            onBlur={() => setTextareaFocused(false)}
            onKeyDown={handleKeyDown}
            rows={Math.min(5, Math.max(1, inputText.split('\n').length))}
          />
        </div>

        {/* Row 2: Action Buttons Bar */}
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
            className={`send-button ${
              inputText.trim() || stagedFile
                ? 'enabled'
                : 'disabled'
            }`}
            disabled={!inputText.trim() && !stagedFile}
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

        {/* Language selector dropdowns */}
        {showSourceSelector && (
          <div className="absolute left-0 z-50" style={{ width: '100%' }}>
            <LanguageSelector
              isSource={true}
              selectedLanguage={sourceLanguage}
              onSelectLanguage={setSourceLanguage}
              onClose={() => setShowSourceSelector(false)}
              position={textareaRef.current?.getBoundingClientRect()}
            />
          </div>
        )}

        {showTargetSelector && (
          <div className="absolute left-0 z-50" style={{ width: '100%' }}>
            <LanguageSelector
              isSource={false}
              selectedLanguage={targetLanguage}
              onSelectLanguage={setTargetLanguage}
              onClose={() => setShowTargetSelector(false)}
              position={textareaRef.current?.getBoundingClientRect()}
            />
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
            {/* Language Selector Bar (only in translate mode) */}
            {mode === 'translate' && (
              <div className="language-selector-bar p-2 px-3 border-b border-[#EFEFEF] flex justify-between">
                <div className="flex-1 flex justify-start">
                  <button
                    onClick={() => setShowSourceSelector(true)}
                    className="language-button px-2 py-1 rounded hover:bg-[#F0F0F0] text-sm flex items-center gap-1"
                    title="Select source language"
                  >
                    <span>{getLanguageName(sourceLanguage)}</span>
                    <ChevronDown size={14} />
                  </button>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleSwapLanguages}
                    className="swap-button p-1 rounded-full hover:bg-[#F0F0F0]"
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
                    onClick={() => setShowTargetSelector(true)}
                    className="language-button px-2 py-1 rounded hover:bg-[#F0F0F0] text-sm flex items-center gap-1"
                    title="Select target language"
                  >
                    <span>{getLanguageName(targetLanguage)}</span>
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Row 1: Text Input Field */}
            <div className="input-text-area relative">
              {stagedFile && (
                <div className="staged-file">
                  <span className="truncate flex-1">{stagedFile.name}</span>
                  <button
                    className="p-1 hover:bg-[#EFEFEF] rounded-full"
                    onClick={() => setStagedFile(null)}
                    title="Remove file"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <textarea
                ref={textareaRef}
                className="w-full resize-none outline-none min-h-[40px]"
                placeholder={getPlaceholderText()}
                value={inputText}
                onChange={handleInputChange}
                onFocus={() => setTextareaFocused(true)}
                onBlur={() => setTextareaFocused(false)}
                onKeyDown={handleKeyDown}
                rows={Math.min(5, Math.max(1, inputText.split('\n').length))}
              />
            </div>

            {/* Row 2: Action Buttons Bar */}
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
                className={`send-button ${
                  inputText.trim() || stagedFile
                    ? 'enabled'
                    : 'disabled'
                }`}
                disabled={!inputText.trim() && !stagedFile}
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

            {/* Language selector dropdowns */}
            {showSourceSelector && (
              <div className="absolute left-0 z-50" style={{ width: '100%' }}>
                <LanguageSelector
                  isSource={true}
                  selectedLanguage={sourceLanguage}
                  onSelectLanguage={setSourceLanguage}
                  onClose={() => setShowSourceSelector(false)}
                  position={textareaRef.current?.getBoundingClientRect()}
                />
              </div>
            )}

            {showTargetSelector && (
              <div className="absolute left-0 z-50" style={{ width: '100%' }}>
                <LanguageSelector
                  isSource={false}
                  selectedLanguage={targetLanguage}
                  onSelectLanguage={setTargetLanguage}
                  onClose={() => setShowTargetSelector(false)}
                  position={textareaRef.current?.getBoundingClientRect()}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
}
