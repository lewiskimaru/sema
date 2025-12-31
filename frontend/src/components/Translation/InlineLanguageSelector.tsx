import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useLanguageCache } from '../../hooks/useCache';

interface Language {
  name: string;
  native_name: string;
  region: string;
  script: string;
}

// interface LanguagesResponse {
//   languages: Record<string, Language>;
//   total_count: number;
// }

interface InlineLanguageSelectorProps {
  isSource: boolean;
  selectedLanguage: string;
  onSelectLanguage: (code: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

// Auto-detect option constant - defined outside to maintain reference stability
const autoDetectOption: Language = {
  name: 'Auto Detect',
  native_name: 'Auto Detect',
  region: 'System',
  script: 'Auto'
};

export default function InlineLanguageSelector({
  isSource,
  selectedLanguage,
  onSelectLanguage,
  onClose,
  isOpen
}: InlineLanguageSelectorProps) {
  const [filteredLanguages, setFilteredLanguages] = useState<Record<string, Language>>({});
  const [popularLanguages, setPopularLanguages] = useState<Record<string, Language>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'popular' | 'africa' | 'europe' | 'asia' | 'americas'>('all');

  // Use cached languages
  const { data: languagesData, isLoading: loading, error: cacheError } = useLanguageCache();

  const languages = languagesData?.languages || {};
  const error = cacheError;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);



  // Auto-detect option removed from here (moved outside)

  // Setup languages when data is available
  useEffect(() => {
    if (!languages || Object.keys(languages).length === 0) return;

    // Add auto-detect option for source language
    const allLanguages = isSource
      ? { 'auto': autoDetectOption, ...languages }
      : languages;

    setFilteredLanguages(allLanguages);

    // Set popular languages (first 12 for better grid layout)
    const popularCodes = ['eng_Latn', 'spa_Latn', 'fra_Latn', 'deu_Latn', 'cmn_Hans', 'ara_Arab',
      'hin_Deva', 'rus_Cyrl', 'por_Latn', 'jpn_Jpan', 'swh_Latn', 'kor_Hang'];
    const popular = popularCodes.reduce((acc, code) => {
      if (allLanguages[code]) {
        acc[code] = allLanguages[code];
      }
      return acc;
    }, {} as Record<string, Language>);

    // Add auto-detect to popular languages for source selector
    if (isSource) {
      popular['auto'] = autoDetectOption;
    }

    setPopularLanguages(popular);
  }, [languages, isSource, autoDetectOption]);


  // Filter languages based on search query and active filter
  useEffect(() => {
    let baseLanguages = languages;

    // Add auto-detect option for source language
    const allLanguages = isSource
      ? { 'auto': autoDetectOption, ...languages }
      : languages;

    // Apply region/type filter first
    if (activeFilter === 'popular') {
      baseLanguages = popularLanguages;
    } else if (activeFilter !== 'all') {
      const regionMap = {
        'africa': 'Africa',
        'europe': 'Europe',
        'asia': 'Asia',
        'americas': 'Americas'
      };
      const targetRegion = regionMap[activeFilter];
      baseLanguages = Object.entries(allLanguages).reduce((acc, [code, lang]) => {
        if ((lang as Language).region === targetRegion || (isSource && code === 'auto')) {
          acc[code] = lang as Language;
        }
        return acc;
      }, {} as Record<string, Language>);
    } else {
      // For 'all' filter, use all languages including auto-detect
      baseLanguages = allLanguages;
    }

    // Apply search filter
    if (!searchQuery.trim()) {
      setFilteredLanguages(baseLanguages);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = Object.entries(baseLanguages).reduce((acc, [code, lang]) => {
      // Special handling for auto-detect
      if (code === 'auto') {
        if (query.includes('auto') || query.includes('detect')) {
          acc[code] = lang as Language;
        }
      } else if (
        (lang as Language).name.toLowerCase().includes(query) ||
        (lang as Language).native_name.toLowerCase().includes(query) ||
        code.toLowerCase().includes(query)
      ) {
        acc[code] = lang as Language;
      }
      return acc;
    }, {} as Record<string, Language>);

    setFilteredLanguages(filtered);
  }, [searchQuery, languages, popularLanguages, activeFilter, isSource, autoDetectOption]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle language selection
  const handleSelect = (code: string) => {
    onSelectLanguage(code);
    onClose();
    setSearchQuery(''); // Reset search
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes slideUpMobile { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      <div
        ref={dropdownRef}
        className="bg-white dark:bg-[#18181B] fixed inset-x-0 bottom-0 z-50 h-[85vh] rounded-t-3xl shadow-2xl flex flex-col transform transition-transform md:static md:h-auto md:rounded-none md:shadow-none md:border-b md:border-[#EFEFEF] dark:md:border-[#27272A] md:transform-none select-none"
        style={{
          animation: window.innerWidth < 768 ? 'slideUpMobile 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
        }}
      >
        {/* Mobile Drag Handle Area */}
        <div className="md:hidden w-full flex justify-center py-4 cursor-grab active:cursor-grabbing border-b border-gray-100" onClick={onClose}>
          <div className="w-16 h-1.5 bg-gray-300 rounded-full opacity-50"></div>
        </div>
        {/* Header with search - Row 3a */}
        <div className="p-4 md:p-3 border-b border-[#EFEFEF] dark:border-[#27272A] bg-white md:bg-[#FAFAFA] dark:bg-[#18181B]">
          <div className="flex flex-col gap-4 md:gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg md:text-sm font-semibold text-gray-900 md:text-[#333] dark:text-white">
                {isSource ? 'Translate from' : 'Translate to'}
              </h3>

              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#27272A] rounded-full transition-colors md:hidden"
                title="Close"
              >
                <X size={20} className="text-gray-500 dark:text-[#A1A1AA]" />
              </button>

              {/* Desktop Filters (Inline) */}
              <div className="hidden md:flex items-center gap-2">
                {/* Filter Buttons Desktop */}
                <div className="flex items-center gap-1">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'popular', label: 'Popular' },
                    { key: 'africa', label: 'Africa' },
                    { key: 'europe', label: 'Europe' },
                    { key: 'asia', label: 'Asia' },
                    { key: 'americas', label: 'Americas' }
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setActiveFilter(filter.key as any)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors flex-shrink-0 ${activeFilter === filter.key
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#27272A] dark:text-[#A1A1AA] dark:hover:bg-[#3F3F46]'
                        }`}
                      title={`Filter by ${filter.label}`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <button onClick={onClose} className="p-1 hover:bg-[#E5E5E5] dark:hover:bg-[#27272A] rounded-full"><X size={16} className="dark:text-[#A1A1AA]" /></button>
              </div>
            </div>

            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 md:py-2 bg-gray-50 md:bg-white dark:bg-[#27272A] border-0 md:border md:border-[#E5E5E5] dark:border-[#3F3F46] rounded-xl md:rounded-md text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-black/5 md:focus:ring-[#333] dark:focus:ring-[#52525B] dark:text-white dark:placeholder-gray-500 transition-all"
              />
            </div>

            {/* Mobile Filters (Scrollable Row) */}
            <div className="flex md:hidden overflow-x-auto no-scrollbar gap-2 pb-1 -mx-4 px-4 mask-fade-right">
              {[
                { key: 'all', label: 'All' },
                { key: 'popular', label: 'Popular' },
                { key: 'africa', label: 'Africa' },
                { key: 'europe', label: 'Europe' },
                { key: 'asia', label: 'Asia' },
                { key: 'americas', label: 'Americas' }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all border ${activeFilter === filter.key
                    ? 'bg-black text-white border-black shadow-md dark:bg-white dark:text-black dark:border-white'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 dark:bg-[#27272A] dark:text-[#A1A1AA] dark:border-[#3F3F46]'
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Language Grid - Row 3b */}
        <div className="p-4 overflow-y-auto flex-1 md:max-h-[300px]">
          {loading && (
            <div className="text-center text-[#666] dark:text-[#A1A1AA] text-sm py-8">
              Loading languages...
            </div>
          )}

          {error && (
            <div className="text-center text-red-600 text-sm py-8">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {Object.keys(filteredLanguages).length === 0 ? (
                <div className="text-center text-gray-500 py-12 flex flex-col items-center">
                  <Search size={32} className="mb-3 text-gray-300" />
                  <p>No languages found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-8">
                  {Object.entries(filteredLanguages).map(([code, lang]) => (
                    <button
                      key={code}
                      onClick={() => handleSelect(code)}
                      className={`group p-4 md:p-3 rounded-xl md:rounded-lg border text-left transition-all duration-200 hover:shadow-md active:scale-[0.98] ${selectedLanguage === code
                        ? 'bg-black text-white border-black shadow-lg ring-1 ring-black/10 dark:bg-white dark:text-black dark:border-white'
                        : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50 dark:bg-[#18181B] dark:border-[#27272A] dark:hover:bg-[#27272A] dark:hover:border-[#3F3F46]'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold text-base md:text-sm ${selectedLanguage === code ? 'text-white dark:text-black' : 'text-gray-900 group-hover:text-black dark:text-[#E4E4E7] dark:group-hover:text-white'
                          }`}>{lang.name}</span>

                        {selectedLanguage === code && <div className="w-2 h-2 rounded-full bg-green-400"></div>}
                      </div>

                      {lang.native_name !== lang.name && (
                        <div className={`text-sm md:text-xs mt-1 truncate ${selectedLanguage === code ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 group-hover:text-gray-600 dark:text-[#71717A] dark:group-hover:text-[#A1A1AA]'
                          }`}>
                          {lang.native_name}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
