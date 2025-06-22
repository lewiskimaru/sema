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

  // Auto-detect option for source language
  const autoDetectOption: Language = {
    name: 'Auto Detect',
    native_name: 'Auto Detect',
    region: 'System',
    script: 'Auto'
  };

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
    <div
      ref={dropdownRef}
      className="language-selector-row border-b border-[#EFEFEF] bg-white"
      style={{
        animation: 'slideUp 0.2s ease-out'
      }}
    >
      {/* Header with search - Row 3a */}
      <div className="p-3 border-b border-[#EFEFEF] bg-[#FAFAFA]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-[#333]">
            {isSource ? 'Select Source Language' : 'Select Target Language'}
          </h3>
          <div className="flex items-center gap-2">
            {/* Filter Buttons */}
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
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    activeFilter === filter.key
                      ? 'bg-[#333] text-white'
                      : 'bg-white text-[#333] hover:bg-[#E5E5E5] border border-[#E5E5E5]'
                  }`}
                  title={`Filter by ${filter.label}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#E5E5E5] rounded-full transition-colors"
              title="Close language selector"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666]" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search languages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#333] focus:border-[#333] bg-white"
          />
        </div>
      </div>

      {/* Language Grid - Row 3b */}
      <div className="p-4 max-h-[300px] overflow-y-auto">
        {loading && (
          <div className="text-center text-[#666] text-sm py-8">
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
              <div className="text-center text-[#666] text-sm py-8">
                {searchQuery
                  ? `No languages found matching "${searchQuery}"`
                  : `No languages found for ${activeFilter}`
                }
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {Object.entries(filteredLanguages).map(([code, lang]) => (
                  <button
                    key={code}
                    onClick={() => handleSelect(code)}
                    className={`p-3 rounded-lg border transition-all duration-200 text-left hover:shadow-sm ${
                      selectedLanguage === code
                        ? 'bg-[#333] text-white border-[#333]'
                        : 'bg-white border-[#E5E5E5] hover:border-[#333] hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <div className={`font-medium text-sm truncate ${
                      selectedLanguage === code ? 'text-white' : 'text-black'
                    }`}>{lang.name}</div>
                    {lang.native_name !== lang.name && (
                      <div className={`text-xs truncate mt-1 ${
                        selectedLanguage === code ? 'text-gray-200' : 'text-[#666]'
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
  );
}
