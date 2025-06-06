import { useState, useEffect } from 'react';
import { ChevronDown, Globe, Info, Search, Star } from 'lucide-react';

// Mock data for languages (based on Meta's NLLB supported languages)
const allLanguages = [
  { code: 'en', name: 'English', proficiency: 'Native', region: 'Global', popularity: 'Very High', 
    nllbSupport: 'High Quality' },
  { code: 'es', name: 'Spanish', proficiency: 'Learning', region: 'Europe/Americas', popularity: 'Very High', 
    nllbSupport: 'High Quality' },
  { code: 'fr', name: 'French', proficiency: 'Intermediate', region: 'Europe/Africa', popularity: 'High', 
    nllbSupport: 'High Quality' },
  { code: 'de', name: 'German', proficiency: 'Beginner', region: 'Europe', popularity: 'High', 
    nllbSupport: 'High Quality' },
  { code: 'zh', name: 'Chinese (Simplified)', proficiency: 'None', region: 'Asia', popularity: 'Very High', 
    nllbSupport: 'High Quality' },
  { code: 'ar', name: 'Arabic', proficiency: 'None', region: 'Middle East/North Africa', popularity: 'High', 
    nllbSupport: 'High Quality' },
  { code: 'hi', name: 'Hindi', proficiency: 'None', region: 'South Asia', popularity: 'High', 
    nllbSupport: 'High Quality' },
  { code: 'ru', name: 'Russian', proficiency: 'None', region: 'Eurasia', popularity: 'High', 
    nllbSupport: 'High Quality' },
  { code: 'pt', name: 'Portuguese', proficiency: 'None', region: 'Europe/South America', popularity: 'High', 
    nllbSupport: 'High Quality' },
  { code: 'ja', name: 'Japanese', proficiency: 'None', region: 'Asia', popularity: 'High', 
    nllbSupport: 'High Quality' },
  { code: 'sw', name: 'Swahili', proficiency: 'None', region: 'Africa', popularity: 'Medium', 
    nllbSupport: 'Medium Quality' },
  { code: 'yo', name: 'Yoruba', proficiency: 'None', region: 'Africa', popularity: 'Low', 
    nllbSupport: 'Medium Quality' },
  { code: 'haw', name: 'Hawaiian', proficiency: 'None', region: 'Oceania', popularity: 'Very Low', 
    nllbSupport: 'Low Quality' },
  { code: 'mn', name: 'Mongolian', proficiency: 'None', region: 'Asia', popularity: 'Low', 
    nllbSupport: 'Medium Quality' },
  { code: 'gu', name: 'Gujarati', proficiency: 'None', region: 'South Asia', popularity: 'Medium', 
    nllbSupport: 'Medium Quality' }
];

// Regions for filtering
const regions = [
  "All Regions", "Africa", "Americas", "Asia", "Europe", "Middle East", "Oceania", "Global"
];

export default function LanguagesPage() {
  const [languages, setLanguages] = useState(allLanguages);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState(['en', 'es', 'fr']);
  const [infoVisible, setInfoVisible] = useState(false);

  // Filter languages based on search query, region, and favorites
  useEffect(() => {
    let filtered = allLanguages;
    
    if (searchQuery) {
      filtered = filtered.filter(lang => 
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedRegion !== 'All Regions') {
      filtered = filtered.filter(lang => lang.region.includes(selectedRegion));
    }
    
    if (favoritesOnly) {
      filtered = filtered.filter(lang => favorites.includes(lang.code));
    }
    
    setLanguages(filtered);
  }, [searchQuery, selectedRegion, favoritesOnly, favorites]);

  const toggleFavorite = (code: string) => {
    if (favorites.includes(code)) {
      setFavorites(favorites.filter(c => c !== code));
    } else {
      setFavorites([...favorites, code]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Globe size={24} />
            <div>
              <h1 className="text-2xl font-bold">Languages</h1>
              <p className="text-[#555555]">
                Powered by Meta's No Language Left Behind (NLLB)
                <button 
                  className="ml-1 inline-flex items-center text-black hover:underline"
                  onClick={() => setInfoVisible(!infoVisible)}
                >
                  <Info size={14} />
                </button>
              </p>
            </div>
          </div>
        </div>
        
        {infoVisible && (
          <div className="mb-6 p-4 bg-[#F8F8F8] border border-[#EFEFEF] rounded-lg">
            <h2 className="text-lg font-medium mb-2">About NLLB</h2>
            <p className="text-sm text-[#555555] mb-3">
              Meta's No Language Left Behind (NLLB) is an open-source machine translation model that supports 200+ languages, 
              including many low-resource languages that are often overlooked in translation technology.
            </p>
            <p className="text-sm text-[#555555]">
              Language quality ratings indicate the general translation quality level available for each language pair.
              High-resource languages typically have higher quality translations.
            </p>
            <button 
              className="mt-3 text-sm text-black hover:underline"
              onClick={() => setInfoVisible(false)}
            >
              Close
            </button>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#DCDCDC] rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-black"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#555555]" />
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <button className="px-4 py-2 border border-[#DCDCDC] rounded-lg flex items-center gap-2 bg-white">
                {selectedRegion} <ChevronDown size={16} />
              </button>
              <div className="absolute z-10 mt-1 w-48 bg-white border border-[#EFEFEF] rounded-lg shadow-lg hidden">
                {regions.map(region => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className="block w-full text-left px-4 py-2 hover:bg-[#F0F0F0]"
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                favoritesOnly 
                  ? 'bg-black text-white' 
                  : 'border border-[#DCDCDC] bg-white text-[#555555]'
              }`}
            >
              <Star size={16} />
              Favorites
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {languages.length > 0 ? (
            languages.map(language => (
              <div 
                key={language.code} 
                className="border border-[#EFEFEF] rounded-lg p-4 hover:bg-[#FAFAFA] transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-medium">{language.name}</h3>
                    <p className="text-sm text-[#555555]">{language.region}</p>
                  </div>
                  <button 
                    onClick={() => toggleFavorite(language.code)}
                    className={`p-2 rounded-full ${
                      favorites.includes(language.code) 
                        ? 'text-yellow-500' 
                        : 'text-[#CCCCCC] hover:text-[#555555]'
                    }`}
                  >
                    <Star size={16} />
                  </button>
                </div>
                
                <div className="flex justify-between mb-3">
                  <div className="text-sm">
                    <span className="text-[#555555]">Popularity: </span>
                    <span>{language.popularity}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-[#555555]">NLLB: </span>
                    <span>{language.nllbSupport}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      language.proficiency === 'Native' ? 'bg-green-100 text-green-800' :
                      language.proficiency === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                      language.proficiency === 'Learning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {language.proficiency !== 'None' ? language.proficiency : 'Not Started'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="text-black hover:underline">Practice</button>
                    <button className="text-black hover:underline">Set as Target</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 border border-dashed border-[#DCDCDC] rounded-lg bg-[#FAFAFA]">
              <p className="text-lg text-[#555555] mb-2">No languages found</p>
              <p className="text-sm text-[#777777]">
                Try adjusting your search or filters
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRegion('All Regions');
                  setFavoritesOnly(false);
                }}
                className="mt-4 text-black hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
