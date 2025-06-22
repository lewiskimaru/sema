import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ArrowUp, BookOpen, ChevronDown, Clock, Code, Copy, Globe, Info, Languages, LogOut, MessageSquare, Pencil, Plus, RotateCcw, SlidersHorizontal, ThumbsDown, ThumbsUp, Upload, User } from 'lucide-react';

// Import SidebarItem component
import SidebarItem from './components/Sidebar/SidebarItem';
import './index.css';

// Import Language Selector
import LanguageSelector from './components/Translation/LanguageSelector';

// Import new components
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import ForgotPasswordPage from './components/Auth/ForgotPasswordPage';
import AboutPage from './components/Pages/AboutPage';
import RecentsPage from './components/Pages/RecentsPage';
import DiscoverPage from './components/Pages/DiscoverPage';
import LanguagesPage from './components/Pages/LanguagesPage';
import DeveloperPage from './components/Pages/DeveloperPage';

// Main App Component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(true); // Default to guest mode
  const [guestQueryCount, setGuestQueryCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load Inter font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Check if user is logged in
    const user = localStorage.getItem('semaUser');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.isLoggedIn) {
          setIsLoggedIn(true);
          setIsGuest(false);
        } else {
          // Invalid user data, treat as guest
          localStorage.removeItem('semaUser');
          initializeGuestSession();
        }
      } catch (error) {
        // Corrupted user data, treat as guest
        localStorage.removeItem('semaUser');
        initializeGuestSession();
      }
    } else {
      // No user data, initialize guest session
      initializeGuestSession();
    }

    setIsInitialized(true);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const initializeGuestSession = () => {
    const guestSession = localStorage.getItem('semaGuestSession');
    if (!guestSession) {
      localStorage.setItem('semaGuestSession', JSON.stringify({
        queryCount: 0,
        startTime: Date.now(),
        hasSeenSignupPrompt: false
      }));
      setGuestQueryCount(0);
    } else {
      try {
        const sessionData = JSON.parse(guestSession);
        setGuestQueryCount(sessionData.queryCount || 0);
      } catch (error) {
        // Corrupted guest session, reset
        localStorage.setItem('semaGuestSession', JSON.stringify({
          queryCount: 0,
          startTime: Date.now(),
          hasSeenSignupPrompt: false
        }));
        setGuestQueryCount(0);
      }
    }
    setIsGuest(true);
    setIsLoggedIn(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('semaUser');
    setIsLoggedIn(false);
    // Initialize new guest session
    initializeGuestSession();
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsGuest(false);
    // Clear guest session when user logs in
    localStorage.removeItem('semaGuestSession');
  };

  // Show loading state until initialization is complete
  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-[#555555]">Loading Sema AI...</p>
        </div>
      </div>
    );
  }



  return (
    <Router>
      <div className="h-screen flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
        <Routes>
          <Route path="/login" element={!isLoggedIn ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/signup" element={!isLoggedIn ? <SignupPage onSignup={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={!isLoggedIn ? <ForgotPasswordPage /> : <Navigate to="/" />} />

          <Route path="/*" element={
            isLoggedIn || isGuest ? (
              <>
                <TopBar onLogout={handleLogout} isGuest={isGuest} guestQueryCount={guestQueryCount} />
                <div className="flex flex-1 overflow-hidden">
                  <Sidebar isLoggedIn={isLoggedIn} isGuest={isGuest} />
                  <Routes>
                    <Route path="/" element={<MainContent isGuest={isGuest} onPromptSignup={handleLogin} onQueryCountUpdate={setGuestQueryCount} />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/recents" element={<RecentsPage />} />
                    <Route path="/discover" element={<DiscoverPage />} />
                    <Route path="/languages" element={<LanguagesPage />} />
                    <Route path="/developer" element={<DeveloperPage />} />
                  </Routes>
                </div>
              </>
            ) : (
              <Navigate to="/login" />
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}

// Top Bar Component
function TopBar({ onLogout, isGuest, guestQueryCount = 0 }) {
  const [hasSession, setHasSession] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('Guest');

  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    if (!isGuest) {
      // Get user name from localStorage for logged in users
      const user = localStorage.getItem('semaUser');
      if (user) {
        const userData = JSON.parse(user);
        if (userData.name) {
          setUserName(userData.name);
        } else if (userData.email) {
          // Use the part before @ in email as name
          setUserName(userData.email.split('@')[0]);
        }
      }
    } else {
      setUserName('Guest');
    }

    // Add click outside handler
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isGuest]);

  return (
    <div className="border-b border-[#DCDCDC] p-3 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h1 className="font-bold text-lg">Sema AI</h1>
        {isGuest && (
          <div className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            <span className="text-xs text-blue-700 font-medium">Guest Mode ({guestQueryCount}/5)</span>
          </div>
        )}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-1 hover:bg-[#F0F0F0] px-2 py-1 rounded text-xs text-[#777777]"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>Current Chat</span>
            <span className="text-xs">▾</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#DCDCDC] rounded shadow-lg p-1 w-40 z-10">
              <button className="w-full text-left p-1.5 text-xs hover:bg-[#F0F0F0] rounded">Rename</button>
              <button className="w-full text-left p-1.5 text-xs hover:bg-[#F0F0F0] text-red-600 rounded">Delete</button>
            </div>
          )}
        </div>
      </div>

      <div className="relative" ref={userDropdownRef}>
        <button
          className="hover:bg-[#F0F0F0] p-2 rounded-full"
          onClick={() => setUserDropdownOpen(!userDropdownOpen)}
        >
          <User size={20} className="text-[#555555]" />
        </button>

        {userDropdownOpen && (
          <div className="absolute top-full right-0 mt-1 bg-white border border-[#DCDCDC] rounded shadow-lg p-2 w-48 z-10">
            {!isGuest && (
              <button className="w-full text-left p-2 hover:bg-[#F0F0F0] rounded flex items-center gap-2">
                <User size={16} />
                Profile
              </button>
            )}
            {isGuest ? (
              <Link
                to="/signup"
                className="w-full text-left p-2 hover:bg-[#F0F0F0] rounded flex items-center gap-2 text-blue-600"
              >
                <User size={16} />
                Sign Up
              </Link>
            ) : (
              <button
                className="w-full text-left p-2 hover:bg-[#F0F0F0] rounded flex items-center gap-2 text-red-600"
                onClick={onLogout}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Sidebar Component
function Sidebar({ isLoggedIn, isGuest }) {
  const [userName, setUserName] = useState('Guest');
  const [activeItem, setActiveItem] = useState('home');
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    if (!isGuest) {
      // Get user name from localStorage for logged in users
      const user = localStorage.getItem('semaUser');
      if (user) {
        const userData = JSON.parse(user);
        if (userData.name) {
          setUserName(userData.name);
        } else if (userData.email) {
          // Use the part before @ in email as name
          setUserName(userData.email.split('@')[0]);
        }
      }
    } else {
      setUserName('Guest');
    }
  }, [isGuest]);

  // Generate skeleton loading elements for extensions
  const renderSkeletonItems = (count = 3) => (
    <div className="p-3">
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="skeleton-item" style={{ width: `${Math.floor(Math.random() * 30) + 70}%` }}></div>
      ))}
    </div>
  );

  // Extensions content for different sidebar items
  const recentsExtension = (
    <div className="p-2">
      <div className="px-3 py-2 font-medium text-sm">Recent Sessions</div>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        <button className="w-full text-left px-3 py-2 text-sm hover:bg-[#E5E5E5] rounded">Spanish Translation</button>
        <button className="w-full text-left px-3 py-2 text-sm hover:bg-[#E5E5E5] rounded">French Document</button>
        <button className="w-full text-left px-3 py-2 text-sm hover:bg-[#E5E5E5] rounded">Travel Chat</button>
        <button className="w-full text-left px-3 py-2 text-sm hover:bg-[#E5E5E5] rounded text-[#777777]">View all...</button>
      </div>
    </div>
  );

  const discoverExtension = (
    <div className="p-2">
      <div className="px-3 py-2 font-medium text-sm">Discover</div>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        <button className="w-full text-left px-3 py-2 text-sm hover:bg-[#E5E5E5] rounded">Featured Articles</button>
        <button className="w-full text-left px-3 py-2 text-sm hover:bg-[#E5E5E5] rounded">Learning Resources</button>
        <button className="w-full text-left px-3 py-2 text-sm hover:bg-[#E5E5E5] rounded">Language Guides</button>
      </div>
    </div>
  );

  const languagesExtension = (
    <div className="p-2">
      <div className="px-3 py-2 font-medium text-sm">Languages</div>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        <button className="w-full text-left px-3 py-2 text-sm hover:bg-[#E5E5E5] rounded">English</button>
        <button className="w-full text-left px-3 py-2 text-sm hover:bg-[#E5E5E5] rounded">Spanish</button>
        <button className="w-full text-left px-3 py-2 text-sm hover:bg-[#E5E5E5] rounded">French</button>
        <button className="w-full text-left px-3 py-2 text-sm hover:bg-[#E5E5E5] rounded">German</button>
        <button className="w-full text-left px-3 py-2 text-sm hover:bg-[#E5E5E5] rounded">Chinese</button>
        <button className="w-full text-left px-3 py-2 text-sm hover:bg-[#E5E5E5] rounded text-[#777777]">View all...</button>
      </div>
    </div>
  );

  const aboutExtension = (
    <div className="p-3 space-y-2">
      <div className="font-medium">About Sema AI</div>
      <p className="text-sm text-[#555555]">
        Breaking language barriers with state-of-the-art AI translation technology. Powered by Meta's NLLB.
      </p>
      <Link to="/about" className="text-sm text-black hover:underline block">
        Learn more →
      </Link>
    </div>
  );

  return (
    <div className="sidebar border-r border-[#DCDCDC] flex flex-col py-4">
      <div className="flex flex-col items-center gap-4">
        <SidebarItem
          icon={<Plus size={20} />}
          title="New"
          isNew={true}
          onClick={() => {
            // This would reset the conversation in the main content
            setShowNewChat(true);
          }}
        />

        {!isGuest && (
          <SidebarItem
            icon={<Clock size={20} />}
            title="Recents"
            to="/recents"
            isActive={activeItem === 'recents'}
            extensionContent={recentsExtension}
          />
        )}

        <SidebarItem
          icon={<Globe size={20} />}
          title="Discover"
          to="/discover"
          isActive={activeItem === 'discover'}
          extensionContent={discoverExtension}
        />

        <SidebarItem
          icon={<Languages size={20} />}
          title="Languages"
          to="/languages"
          isActive={activeItem === 'languages'}
          extensionContent={languagesExtension}
        />
      </div>

      <div className="mt-auto flex flex-col items-center gap-4">
        <SidebarItem
          icon={<BookOpen size={20} />}
          title="Learn"
          isActive={activeItem === 'learn'}
          extensionContent={renderSkeletonItems(4)}
        />

        <SidebarItem
          icon={<Info size={20} />}
          title="About"
          to="/about"
          isActive={activeItem === 'about'}
          extensionContent={aboutExtension}
        />

        <SidebarItem
          icon={<Code size={20} />}
          title="Developer"
          to="/developer"
          isActive={activeItem === 'developer'}
        />
      </div>
    </div>
  );
}

// Main Content Component
function MainContent({ isGuest, onPromptSignup, onQueryCountUpdate }) {
  const [hasFirstQuery, setHasFirstQuery] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [guestQueryCount, setGuestQueryCount] = useState(0);

  useEffect(() => {
    if (isGuest) {
      const guestSession = localStorage.getItem('semaGuestSession');
      if (guestSession) {
        const sessionData = JSON.parse(guestSession);
        setGuestQueryCount(sessionData.queryCount);
      }
    }
  }, [isGuest]);

  const handleSendMessage = (message, mode) => {
    if (!hasFirstQuery) {
      setHasFirstQuery(true);
    }

    // Handle guest query counting
    if (isGuest) {
      const guestSession = localStorage.getItem('semaGuestSession');
      const sessionData = guestSession ? JSON.parse(guestSession) : { queryCount: 0, startTime: Date.now(), hasSeenSignupPrompt: false };

      sessionData.queryCount += 1;
      setGuestQueryCount(sessionData.queryCount);
      localStorage.setItem('semaGuestSession', JSON.stringify(sessionData));

      // Update parent component's query count
      if (onQueryCountUpdate) {
        onQueryCountUpdate(sessionData.queryCount);
      }

      // Show signup prompt after 5 queries
      if (sessionData.queryCount >= 5 && !sessionData.hasSeenSignupPrompt) {
        setShowSignupPrompt(true);
        sessionData.hasSeenSignupPrompt = true;
        localStorage.setItem('semaGuestSession', JSON.stringify(sessionData));
      }
    }

    // Add user message
    setMessages([...messages, { id: Date.now(), text: message, sender: 'user', mode }]);

    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = mode === 'translate'
        ? `Translation: ${message}`
        : `AI response to: ${message}`;
      setMessages(prev => [...prev, { id: Date.now(), text: aiResponse, sender: 'ai', mode }]);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {!hasFirstQuery ? (
        <WelcomeView onSendMessage={handleSendMessage} isGuest={isGuest} guestQueryCount={guestQueryCount} />
      ) : (
        <>
          <ConversationView messages={messages} isTyping={isTyping} />
          <InputArea onSendMessage={handleSendMessage} />
        </>
      )}

      {/* Signup Prompt Modal */}
      {showSignupPrompt && (
        <SignupPromptModal
          onSignup={onPromptSignup}
          onContinueAsGuest={() => setShowSignupPrompt(false)}
          onClose={() => setShowSignupPrompt(false)}
        />
      )}
    </div>
  );
}

// Welcome View Component
function WelcomeView({ onSendMessage, isGuest, guestQueryCount }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="welcome-animation mb-8">
        <div>Experience AI in your native language</div>
        <div>Experimentar IA en tu idioma nativo</div>
        <div>Découvrez l'IA dans votre langue maternelle</div>
        <div>Erleben Sie KI in Ihrer Muttersprache</div>
        <div>体验用您的母语与AI交流</div>
        <div>Experience AI in your native language</div>
      </div>

      {isGuest && (
        <div className="mb-6 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
            <h3 className="font-medium text-blue-900 mb-2">Welcome to Sema AI!</h3>
            <p className="text-sm text-blue-700 mb-2">
              You're using Sema AI as a guest. Try it out with up to 5 free queries!
            </p>
            <div className="text-xs text-blue-600">
              Queries used: {guestQueryCount}/5
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl">
        <InputArea onSendMessage={onSendMessage} isCentered={true} />
      </div>
      {/* Welcome screen bottom area */}
    </div>
  );
}

// Conversation View Component
function ConversationView({ messages, isTyping }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(message => (
        <div key={message.id} className={`${message.sender === 'user' ? 'message-user' : 'message-ai'} relative group`}>
          {message.mode === 'translate' && message.sender === 'user' && message.languages && (
            <div className="text-xs text-[#555555] mb-1 flex items-center gap-1">
              <span>{message.languages.source}</span>
              <span>→</span>
              <span>{message.languages.target}</span>
            </div>
          )}

          <p>{typeof message.text === 'string' ? message.text :
             (message.text && message.text.text ? message.text.text : JSON.stringify(message.text))}</p>

          {message.mode === 'translate' && message.sender === 'ai' && (
            <div className="mt-2 pt-2 border-t border-[#EFEFEF] text-xs text-[#555555]">
              Translated with Sema AI
            </div>
          )}

          <div className="absolute bottom-0 right-0 transform translate-y-full opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 p-1">
            {message.sender === 'user' ? (
              <>
                <button className="p-1 hover:bg-[#EAEAEA] rounded">
                  <Copy size={16} />
                </button>
                <button className="p-1 hover:bg-[#EAEAEA] rounded">
                  <Pencil size={16} />
                </button>
              </>
            ) : (
              <>
                <button className="p-1 hover:bg-[#EAEAEA] rounded">
                  <RotateCcw size={16} />
                </button>
                <button className="p-1 hover:bg-[#EAEAEA] rounded">
                  <Copy size={16} />
                </button>
                <button className="p-1 hover:bg-[#EAEAEA] rounded">
                  <ThumbsUp size={16} />
                </button>
                <button className="p-1 hover:bg-[#EAEAEA] rounded">
                  <ThumbsDown size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="message-ai">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
    </div>
  );
}

// Input Area Component
function InputArea({ onSendMessage, isCentered = false }) {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState('translate'); // 'translate' or 'chat'
  const [stagedFile, setStagedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [textareaFocused, setTextareaFocused] = useState(false);

  // Language selection for translation mode
  const [sourceLanguage, setSourceLanguage] = useState('auto'); // 'auto' for auto-detect
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [showTargetSelector, setShowTargetSelector] = useState(false);

  // For @language functionality
  const [showLanguageSuggestions, setShowLanguageSuggestions] = useState(false);
  const [languageSuggestions, setLanguageSuggestions] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);

  const textareaRef = useRef(null);

  // Helper functions for language selection
  const getLanguageName = (code) => {
    if (code === 'auto') return 'Detect Language';

    const languages = {
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
      return "Add a message (optional)...";
    }
    return mode === 'translate'
      ? "Translate text, drop file, or use @lang..."
      : "Ask Sema anything...";
  };

  // Handle @language functionality
  const handleInputChange = (e) => {
    const newText = e.target.value;
    setInputText(newText);

    if (mode === 'translate') {
      // Check for @language functionality
      const curPos = e.target.selectionStart;
      setCursorPosition(curPos);

      const textBeforeCursor = newText.substring(0, curPos);
      const atSignIndex = textBeforeCursor.lastIndexOf('@');

      if (atSignIndex !== -1 && !textBeforeCursor.substring(atSignIndex + 1).includes(' ')) {
        const query = textBeforeCursor.substring(atSignIndex + 1).toLowerCase();

        // Filter languages based on the query
        const suggestions = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Arabic', 'Hindi', 'Russian']
          .filter(lang => lang.toLowerCase().includes(query));

        if (suggestions.length > 0) {
          setLanguageSuggestions(suggestions);
          setShowLanguageSuggestions(true);
        } else {
          setShowLanguageSuggestions(false);
        }
      } else {
        setShowLanguageSuggestions(false);
      }
    }
  };

  const selectLanguageSuggestion = (language) => {
    // Map language name to code
    const languageCodes = {
      'English': 'en',
      'Spanish': 'es',
      'French': 'fr',
      'German': 'de',
      'Chinese': 'zh',
      'Arabic': 'ar',
      'Hindi': 'hi',
      'Russian': 'ru'
    };

    setTargetLanguage(languageCodes[language] || 'en');

    // Remove the @lang part from the input
    const textBeforeCursor = inputText.substring(0, cursorPosition);
    const atSignIndex = textBeforeCursor.lastIndexOf('@');

    if (atSignIndex !== -1) {
      const newText = inputText.substring(0, atSignIndex) + inputText.substring(cursorPosition);
      setInputText(newText);
    }

    setShowLanguageSuggestions(false);

    // Focus back on textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Swap source and target languages
  const handleSwapLanguages = () => {
    if (sourceLanguage !== 'auto') {
      const temp = sourceLanguage;
      setSourceLanguage(targetLanguage);
      setTargetLanguage(temp);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setStagedFile(e.dataTransfer.files[0]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow Shift+Enter for line breaks
        return;
      } else if (e.ctrlKey || !e.ctrlKey) {
        // Both Enter and Ctrl+Enter send the message
        e.preventDefault();
        handleSend();
      }
    }
  };

  return (
    <div className={`${isCentered ? '' : 'border-t border-[#DCDCDC]'} p-3 ${isCentered ? 'input-area-container' : ''}`}>
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

        {/* Text Input Row */}
        <div className="input-text-area relative">
          {stagedFile && (
            <div className="staged-file">
              <span className="truncate flex-1">{stagedFile.name}</span>
              <button
                className="p-1 hover:bg-[#EFEFEF] rounded-full"
                onClick={() => setStagedFile(null)}
                title="Remove file"
              >
                ✕
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
            onBlur={() => {
              setTextareaFocused(false);
              // Hide language suggestions when textarea loses focus
              setTimeout(() => setShowLanguageSuggestions(false), 100);
            }}
            onKeyDown={handleKeyDown}
            rows={Math.min(5, Math.max(1, inputText.split('\n').length))}
          />

          {/* Language suggestions dropdown for @language functionality */}
          {showLanguageSuggestions && (
            <div className="absolute z-10 bg-white border border-[#DCDCDC] rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
              {languageSuggestions.map((lang) => (
                <div
                  key={lang}
                  className="p-2 hover:bg-[#F0F0F0] cursor-pointer"
                  onClick={() => selectLanguageSuggestion(lang)}
                >
                  {lang}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="input-actions">
          <div className="flex items-center gap-3">
            <button className="action-button" title="Upload document">
              <Upload size={18} />
            </button>

            <button
              className="action-button"
              title={`${mode === 'translate' ? 'Translation' : 'Chat'} settings`}
              onClick={() => mode === 'translate' && setShowTargetSelector(true)}
            >
              <SlidersHorizontal size={18} />
            </button>

            <button
              className={`mode-button ${mode === 'chat' ? 'mode-active' : 'mode-inactive'}`}
              onClick={() => setMode('chat')}
              title="Switch to Chat Mode"
            >
              <MessageSquare size={18} />
            </button>

            <button
              className={`mode-button ${mode === 'translate' ? 'mode-active' : 'mode-inactive'}`}
              onClick={() => setMode('translate')}
              title="Switch to Translate Mode"
            >
              <Languages size={18} />
            </button>
          </div>

          <button
            className={`send-button ${
              inputText.trim() || stagedFile
                ? 'enabled'
                : 'disabled'
            }`}
            disabled={!inputText.trim() && !stagedFile}
            onClick={handleSend}
            title={`${mode === 'translate' ? 'Translate' : 'Send message'} (Enter or Ctrl+Enter)`}
          >
            <ArrowUp size={18} />
          </button>
        </div>

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
  );
}

// Signup Prompt Modal Component
function SignupPromptModal({ onSignup, onContinueAsGuest, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">Enjoying Sema AI?</h2>
          <p className="text-[#555555] text-sm">
            You've used your 5 free queries! Sign up to continue using Sema AI with unlimited access.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onSignup}
            className="w-full bg-black hover:bg-[#333333] text-white font-medium py-3 rounded transition-colors"
          >
            Sign Up for Free
          </button>

          <button
            onClick={onContinueAsGuest}
            className="w-full border border-[#DCDCDC] hover:bg-[#F0F0F0] text-[#555555] font-medium py-3 rounded transition-colors"
          >
            Continue as Guest
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-xs text-[#777777] hover:underline"
          >
            Maybe later
          </button>
        </div>

        <div className="mt-4 text-xs text-[#777777] text-center">
          <p>✓ Unlimited queries</p>
          <p>✓ Save conversation history</p>
          <p>✓ Access to premium features</p>
        </div>
      </div>
    </div>
  );
}

// Removed: About, Learn, and LanguagesPage components have been moved to separate files

export default App;
