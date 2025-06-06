import { useState } from 'react';
import { Clock, Languages, MessageSquare, Search, Squircle, Trash2 } from 'lucide-react';

// Mock data for recent translations and chats
const mockRecents = [
  {
    id: 1,
    type: 'translation',
    title: 'Business Email to Spanish Client',
    sourceLang: 'English',
    targetLang: 'Spanish',
    date: 'Today, 10:23 AM',
    preview: 'Dear valued customer, we are pleased to inform you that your order has been shipped...'
  },
  {
    id: 2,
    type: 'chat',
    title: 'Travel Phrases in Japanese',
    date: 'Today, 9:45 AM',
    preview: 'Can you teach me some essential Japanese travel phrases?'
  },
  {
    id: 3,
    type: 'translation',
    title: 'Technical Documentation',
    sourceLang: 'English',
    targetLang: 'German',
    date: 'Yesterday, 3:12 PM',
    preview: 'The installation process requires administrative privileges to properly configure...'
  },
  {
    id: 4,
    type: 'chat',
    title: 'French Grammar Help',
    date: 'Yesterday, 11:30 AM',
    preview: 'I need help understanding how to use the passé composé correctly.'
  },
  {
    id: 5,
    type: 'translation',
    title: 'Marketing Materials',
    sourceLang: 'English',
    targetLang: 'Chinese',
    date: 'May 26, 2025',
    preview: 'Our new product line features cutting-edge technology designed to enhance...'
  },
  {
    id: 6,
    type: 'chat',
    title: 'Italian Language Learning',
    date: 'May 25, 2025',
    preview: 'What are some effective ways to practice Italian conversation?'
  },
  {
    id: 7,
    type: 'translation',
    title: 'Academic Paper Abstract',
    sourceLang: 'English',
    targetLang: 'French',
    date: 'May 23, 2025',
    preview: 'This research examines the correlation between climate patterns and agricultural yields...'
  }
];

export default function RecentsPage() {
  const [recents, setRecents] = useState(mockRecents);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  // Filter recents based on search query and filter type
  const filteredRecents = recents.filter(recent => {
    const matchesSearch = recent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recent.preview.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      activeFilter === 'all' || 
      (activeFilter === 'translations' && recent.type === 'translation') ||
      (activeFilter === 'chats' && recent.type === 'chat');
    
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: number) => {
    setRecents(prevRecents => prevRecents.filter(recent => recent.id !== id));
    setDropdownOpen(null);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Clock size={24} />
            <h1 className="text-2xl font-bold">Recent Activity</h1>
          </div>
          
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search recent items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#DCDCDC] rounded-full w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#555555]" />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex gap-4 border-b border-[#EFEFEF]">
            <button
              onClick={() => setActiveFilter('all')}
              className={`py-2 px-4 ${activeFilter === 'all' ? 'border-b-2 border-black font-medium' : 'text-[#555555]'}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('translations')}
              className={`py-2 px-4 flex items-center gap-2 ${activeFilter === 'translations' ? 'border-b-2 border-black font-medium' : 'text-[#555555]'}`}
            >
              <Languages size={16} />
              Translations
            </button>
            <button
              onClick={() => setActiveFilter('chats')}
              className={`py-2 px-4 flex items-center gap-2 ${activeFilter === 'chats' ? 'border-b-2 border-black font-medium' : 'text-[#555555]'}`}
            >
              <MessageSquare size={16} />
              Chats
            </button>
          </div>
        </div>
        
        {filteredRecents.length > 0 ? (
          <div className="space-y-4">
            {filteredRecents.map(recent => (
              <div key={recent.id} className="border border-[#EFEFEF] rounded-lg p-4 hover:bg-[#FAFAFA] transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {recent.type === 'translation' ? (
                        <Languages size={16} className="text-[#555555]" />
                      ) : (
                        <MessageSquare size={16} className="text-[#555555]" />
                      )}
                      <h3 className="font-medium">{recent.title}</h3>
                    </div>
                    
                    {recent.type === 'translation' && (
                      <div className="flex items-center gap-1 text-sm text-[#555555] mb-2">
                        <span>{recent.sourceLang}</span>
                        <span>→</span>
                        <span>{recent.targetLang}</span>
                      </div>
                    )}
                    
                    <p className="text-sm text-[#555555] mb-2">{recent.date}</p>
                    <p className="text-sm truncate max-w-3xl">{recent.preview}</p>
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setDropdownOpen(dropdownOpen === recent.id ? null : recent.id)}
                      className="p-2 hover:bg-[#EFEFEF] rounded-full"
                    >
                      <Squircle size={16} />
                    </button>
                    
                    {dropdownOpen === recent.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-[#EFEFEF] rounded-lg shadow-lg z-10">
                        <button 
                          onClick={() => handleDelete(recent.id)}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-[#F0F0F0]"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-[#DCDCDC] rounded-lg bg-[#FAFAFA]">
            <p className="text-lg text-[#555555] mb-2">No recent activity found</p>
            <p className="text-sm text-[#777777]">
              {searchQuery ? 
                "Try a different search term or filter" : 
                "Your recent translations and chats will appear here"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
