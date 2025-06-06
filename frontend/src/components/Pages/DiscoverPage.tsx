import { useState, useEffect } from 'react';
import { BookmarkPlus, ChevronRight, Search, Share2 } from 'lucide-react';

// Mock blog data
const mockBlogs = [
  {
    id: 1,
    title: "The Future of AI Translation Technology",
    excerpt: "Recent breakthroughs in machine learning are revolutionizing how we communicate across languages.",
    source: "Tech Insights",
    date: "May 25, 2025",
    image: "https://images.unsplash.com/photo-1677442135131-4d7c2fb5fb0b?q=80&w=1932&auto=format&fit=crop",
    category: "Technology",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Learning a New Language: Science-Backed Methods",
    excerpt: "Researchers have identified the most effective techniques for language acquisition in adults.",
    source: "Learning Daily",
    date: "May 23, 2025",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1471&auto=format&fit=crop",
    category: "Education",
    readTime: "8 min read"
  },
  {
    id: 3,
    title: "The Importance of Preserving Indigenous Languages",
    excerpt: "As globalization accelerates, preserving linguistic diversity becomes increasingly critical.",
    source: "Cultural Heritage",
    date: "May 20, 2025",
    image: "https://images.unsplash.com/photo-1610142991820-e02b2618bbcd?q=80&w=1470&auto=format&fit=crop",
    category: "Culture",
    readTime: "6 min read"
  },
  {
    id: 4,
    title: "Meta's NLLB: Breaking Down Language Barriers",
    excerpt: "How No Language Left Behind is democratizing access to information across 200+ languages.",
    source: "AI Review",
    date: "May 18, 2025",
    image: "https://images.unsplash.com/photo-1606765962248-7ff407b51667?q=80&w=1470&auto=format&fit=crop",
    category: "Technology",
    readTime: "4 min read"
  },
  {
    id: 5,
    title: "Business Communication in a Multilingual World",
    excerpt: "Strategies for companies operating across language barriers in the global marketplace.",
    source: "Business Global",
    date: "May 15, 2025",
    image: "https://images.unsplash.com/photo-1664575599736-c5197c684128?q=80&w=1470&auto=format&fit=crop",
    category: "Business",
    readTime: "7 min read"
  }
];

// Categories for filtering
const categories = [
  "All", "Technology", "Education", "Culture", "Business", "Science", "Travel"
];

export default function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [blogs, setBlogs] = useState(mockBlogs);

  // Filter blogs based on category and search query
  useEffect(() => {
    let filtered = mockBlogs;
    
    if (activeCategory !== "All") {
      filtered = filtered.filter(blog => blog.category === activeCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(blog => 
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setBlogs(filtered);
  }, [activeCategory, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFAFA]">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Discover</h1>
            <p className="text-[#555555]">
              Articles and blogs translated to English
            </p>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#DCDCDC] rounded-full w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#555555]" />
          </div>
        </div>
        
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  activeCategory === category
                    ? 'bg-black text-white'
                    : 'bg-white border border-[#DCDCDC] text-[#555555] hover:bg-[#F0F0F0]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.length > 0 ? (
            blogs.map(blog => (
              <div key={blog.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-[#EFEFEF]">
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#555555]">{blog.source}</span>
                    <span className="text-sm text-[#555555]">{blog.date}</span>
                  </div>
                  <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
                  <p className="text-[#555555] mb-4">{blog.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-xs px-2 py-1 bg-[#F0F0F0] rounded-full mr-2">{blog.category}</span>
                      <span className="text-xs text-[#555555]">{blog.readTime}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-[#F0F0F0] rounded-full">
                        <BookmarkPlus size={18} className="text-[#555555]" />
                      </button>
                      <button className="p-1 hover:bg-[#F0F0F0] rounded-full">
                        <Share2 size={18} className="text-[#555555]" />
                      </button>
                      <button className="p-1 hover:bg-[#F0F0F0] rounded-full">
                        <ChevronRight size={18} className="text-[#555555]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <p className="text-lg text-[#555555]">No articles found matching your criteria.</p>
              <button 
                onClick={() => {
                  setActiveCategory("All");
                  setSearchQuery("");
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
