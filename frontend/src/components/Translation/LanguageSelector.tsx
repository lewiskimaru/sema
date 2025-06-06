import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';

// Mock data for languages (based on Meta's NLLB supported languages)
const allLanguages = [
  { code: 'auto', name: 'Detect Language', native: '' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'zh', name: 'Chinese (Simplified)', native: '中文' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá' },
  { code: 'haw', name: 'Hawaiian', native: 'ʻŌlelo Hawaiʻi' },
  { code: 'mn', name: 'Mongolian', native: 'Монгол' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' }
];

// Common languages for quick selection
const commonLanguages = ['auto', 'en', 'es', 'fr', 'de', 'zh', 'ar'];

type LanguageSelectorProps = {
  isSource: boolean;
  selectedLanguage: string;
  onSelectLanguage: (code: string) => void;
  onClose: () => void;
  position?: { width: number; bottom: number } | null;
};

export default function LanguageSelector({
  isSource,
  selectedLanguage,
  onSelectLanguage,
  onClose,
  position
}: LanguageSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLanguages, setFilteredLanguages] = useState(allLanguages);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus the search input when the dropdown opens
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    
    // Filter languages based on search query
    if (searchQuery) {
      const filtered = allLanguages.filter(lang => 
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.native.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLanguages(filtered);
    } else {
      setFilteredLanguages(allLanguages);
    }
    
    // Handle clicks outside the dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchQuery, onClose]);

  // Handle language selection
  const handleSelect = (code: string) => {
    onSelectLanguage(code);
    onClose();
  };

  // Check if dropdown should open upward
  const shouldOpenUpward = () => {
    if (!position) return false;
    const viewportHeight = window.innerHeight;
    const positionBottom = position.bottom;
    const dropdownHeight = 450; // Approximate height of dropdown
    
    return positionBottom + dropdownHeight > viewportHeight - 50; // 50px buffer
  };
  
  const dropdownPosition = shouldOpenUpward() ? 
    { bottom: '100%', marginBottom: '8px', left: '0' } : 
    { top: '100%', marginTop: '8px', left: '0' };

  return (
    <div className="language-dropdown-container" style={{
      ...dropdownPosition,
      width: position ? `${position.width}px` : '100%',
      animation: 'fadeIn 0.2s ease-in-out'
    }}>
      <div 
        ref={dropdownRef}
        className="bg-white rounded-lg border border-[#EFEFEF] w-full flex flex-col"
      >
        <div className="p-3 border-b border-[#EFEFEF] flex items-center gap-2">
          <button onClick={onClose} className="p-1 hover:bg-[#F0F0F0] rounded-full">
            <ArrowLeft size={18} />
          </button>
          <h3 className="text-base font-medium">
            {isSource ? "Select source language" : "Select target language"}
          </h3>
        </div>
        
        <div className="p-3 border-b border-[#EFEFEF]">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-[#DCDCDC] rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#555555]" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#555555] p-1 hover:bg-[#F0F0F0] rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        
        {!searchQuery && isSource && (
          <div className="p-4 border-b border-[#EFEFEF]">
            <div 
              className="p-2 rounded-lg hover:bg-[#F0F0F0] cursor-pointer"
              onClick={() => handleSelect('auto')}
            >
              <div className="font-medium">Detect Language</div>
              <div className="text-sm text-[#555555]">Automatically detect the source language</div>
            </div>
          </div>
        )}
        
        {!searchQuery && (
          <div className="p-4 border-b border-[#EFEFEF]">
            <div className="text-sm font-medium text-[#555555] mb-2">Frequently Used</div>
            <div className="flex flex-wrap gap-2">
              {commonLanguages
                .filter(code => isSource || code !== 'auto') // Don't show "Detect Language" for target
                .map(code => {
                  const lang = allLanguages.find(l => l.code === code);
                  if (!lang) return null;
                  return (
                    <button
                      key={code}
                      onClick={() => handleSelect(code)}
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        selectedLanguage === code 
                          ? 'bg-black text-white' 
                          : 'bg-[#F0F0F0] hover:bg-[#E0E0E0]'
                      }`}
                    >
                      {lang.name}
                    </button>
                  );
                })}
            </div>
          </div>
        )}
        
        <div className="overflow-y-auto max-h-[400px] p-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1">
            {filteredLanguages
              .filter(lang => isSource || lang.code !== 'auto') // Don't show "Detect Language" for target
              .map(lang => (
                <div
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`p-2 rounded hover:bg-[#F0F0F0] cursor-pointer ${
                    selectedLanguage === lang.code ? 'bg-[#F0F0F0]' : ''
                  }`}
                >
                  <div className="font-medium text-sm">{lang.name}</div>
                  {lang.native && lang.code !== 'en' && (
                    <div className="text-xs text-[#555555]">{lang.native}</div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
