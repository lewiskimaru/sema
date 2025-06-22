import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Info, ChevronDown, Code } from 'lucide-react';

interface TopBarProps {
  onLogout: () => void;
  isLoggedIn: boolean;
}

export default function TopBar({
  onLogout,
  isLoggedIn
}: TopBarProps) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('User');
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoggedIn) {
      // Get user name from localStorage for logged in users
      const user = localStorage.getItem('semaUser');
      if (user) {
        try {
          const userData = JSON.parse(user);
          if (userData.name) {
            setUserName(userData.name);
          } else if (userData.email) {
            // Use the part before @ in email as name
            setUserName(userData.email.split('@')[0]);
          }
        } catch (error) {
          setUserName('User');
        }
      }
    }

    // Add click outside handler for dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLoggedIn]);

  // Not logged in - Show clean topbar with logo and auth buttons
  if (!isLoggedIn) {
    return (
      <div className="border-b border-[#E5E5E5] bg-white px-6 py-3 flex justify-between items-center relative z-50">
        {/* Logo - Smaller size */}
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img
            src="/logo/logo.png"
            alt="Sema AI Logo"
            className="h-6 w-auto"
          />
        </Link>

        {/* Auth Actions - Login, Sign Up, Developer, and Info */}
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="px-3 py-1.5 text-sm font-medium text-[#666666] hover:text-black transition-colors rounded-full hover:bg-[#F8F9FA]"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-3 py-1.5 text-sm font-medium bg-black text-white rounded-full hover:bg-[#333333] transition-colors shadow-sm"
          >
            Sign Up
          </Link>
          <Link
            to="/developer"
            className="p-1.5 hover:bg-[#F5F5F5] rounded-full transition-colors"
            title="API Documentation"
          >
            <Code size={18} className="text-[#666666] hover:text-black transition-colors" />
          </Link>
          <Link
            to="/about"
            className="p-1.5 hover:bg-[#F5F5F5] rounded-full transition-colors"
            title="About Sema AI"
          >
            <Info size={18} className="text-[#666666] hover:text-black transition-colors" />
          </Link>
        </div>
      </div>
    );
  }

  // Logged in - Show full app topbar with user menu
  return (
    <div className="border-b border-[#E5E5E5] bg-white px-6 py-3 flex justify-between items-center relative z-50">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img
            src="/logo/logo-black.png"
            alt="Sema AI Logo"
            className="h-6 w-auto"
          />
        </Link>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* User Menu */}
        <div className="relative" ref={userDropdownRef}>
          <button
            className="flex items-center gap-2 hover:bg-[#F5F5F5] px-2 py-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E5E5E5]"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          >
            <User size={16} className="text-[#666666]" />
            <span className="text-sm text-[#666666] hidden sm:block font-medium">{userName}</span>
            <ChevronDown
              size={12}
              className={`text-[#666666] transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {userDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-[#E5E5E5] rounded-xl shadow-lg p-1 w-48 z-10 animate-in slide-in-from-top-2 duration-200">
              <button className="w-full text-left p-3 hover:bg-[#F5F5F5] rounded-lg flex items-center gap-3 text-sm transition-colors">
                <User size={16} className="text-[#666666]" />
                <span>Profile</span>
              </button>
              <div className="border-t border-[#E5E5E5] my-1"></div>
              <button
                className="w-full text-left p-3 hover:bg-[#F5F5F5] rounded-lg flex items-center gap-3 text-red-600 text-sm transition-colors"
                onClick={() => {
                  onLogout();
                  setUserDropdownOpen(false);
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
