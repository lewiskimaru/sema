import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut, Info, ChevronDown, Code, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface TopBarProps {
  onLogout: () => void;
  isLoggedIn: boolean;
}

export default function TopBar({
  onLogout,
  isLoggedIn
}: TopBarProps) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('User');
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/developer':
        return 'Sema API';
      case '/about':
        return 'About Sema';
      default:
        return 'Sema';
    }
  };

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

    // Add click outside handler for dropdowns
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
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
      <div className="bg-white dark:bg-[#09090b] relative z-50 border-b border-transparent">
        <div className="px-6 py-3 flex justify-between items-center bg-white dark:bg-[#09090b] relative z-50">
          {/* Logo - Smaller size */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <span className="text-xl font-semibold text-black dark:text-white tracking-tight">{getPageTitle()}</span>
            </Link>
          </div>

          {/* Desktop Auth Actions - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/developer"
              className="p-1.5 hover:bg-[#F5F5F5] dark:hover:bg-[#27272A] rounded-full transition-colors"
              title="API Documentation"
            >
              <Code size={18} className="text-[#666666] dark:text-[#A1A1AA] hover:text-black dark:hover:text-white transition-colors" />
            </Link>
            <Link
              to="/about"
              className="p-1.5 hover:bg-[#F5F5F5] dark:hover:bg-[#27272A] rounded-full transition-colors"
              title="About Sema AI"
            >
              <Info size={18} className="text-[#666666] dark:text-[#A1A1AA] hover:text-black dark:hover:text-white transition-colors" />
            </Link>
            <button
              onClick={toggleTheme}
              className="p-1.5 hover:bg-[#F5F5F5] dark:hover:bg-[#27272A] rounded-full transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-[#666666] dark:text-[#A1A1AA] hover:text-black dark:hover:text-white transition-colors" />
              ) : (
                <Moon size={18} className="text-[#666666] dark:text-[#A1A1AA] hover:text-black dark:hover:text-white transition-colors" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button - Shown only on mobile */}
          <div className="md:hidden" ref={mobileMenuRef}>
            <button
              className={`hamburger p-2 rounded-lg transition-colors focus:outline-none dark:hover:bg-[#27272A] ${mobileMenuOpen ? 'open' : ''
                }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Expansion Overlay */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-white dark:bg-[#18181B] shadow-xl transition-all duration-300 ease-in-out origin-top z-40 rounded-b-3xl overflow-hidden ${mobileMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
          }`}>
          <div className="px-6 py-4 space-y-3 bg-[#FAFAFA] dark:bg-[#18181B] border-t border-[#E5E5E5] dark:border-[#27272A]">
            <Link
              to="/developer"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#666666] dark:text-[#A1A1AA] hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-[#27272A] rounded-lg transition-all border border-transparent hover:border-[#E5E5E5] dark:hover:border-[#3F3F46] hover:shadow-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Code size={18} />
              API Documentation
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#666666] dark:text-[#A1A1AA] hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-[#27272A] rounded-lg transition-all border border-transparent hover:border-[#E5E5E5] dark:hover:border-[#3F3F46] hover:shadow-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Info size={18} />
              About Sema AI
            </Link>
            <button
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-[#666666] dark:text-[#A1A1AA] hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-[#27272A] rounded-lg transition-all border border-transparent hover:border-[#E5E5E5] dark:hover:border-[#3F3F46] hover:shadow-sm"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>

        {/* Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 md:hidden"
            style={{ top: '60px' }} // Height of TopBar approx
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </div>
    );
  }

  // Logged in - Show full app topbar with user menu
  return (
    <div className="bg-white dark:bg-[#09090b] relative z-50 border-b border-transparent">
      <div className="px-6 py-3 flex justify-between items-center bg-white dark:bg-[#09090b] relative z-50">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <span className="text-xl font-semibold text-black tracking-tight">{getPageTitle()}</span>
          </Link>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Desktop User Menu */}
          <div className="hidden sm:block relative" ref={userDropdownRef}>
            <button
              className="flex items-center gap-2 hover:bg-[#F5F5F5] dark:hover:bg-[#27272A] px-2 py-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E5E5E5] dark:focus:ring-[#3F3F46]"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            >
              <User size={16} className="text-[#666666] dark:text-[#A1A1AA]" />
              <span className="text-sm text-[#666666] dark:text-[#A1A1AA] font-medium">{userName}</span>
              <ChevronDown
                size={12}
                className={`text-[#666666] dark:text-[#A1A1AA] transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {userDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#27272A] rounded-xl shadow-lg p-1 w-48 z-10 animate-in slide-in-from-top-2 duration-200">
                <button className="w-full text-left p-3 hover:bg-[#F5F5F5] dark:hover:bg-[#27272A] rounded-lg flex items-center gap-3 text-sm transition-colors">
                  <User size={16} className="text-[#666666] dark:text-[#A1A1AA]" />
                  <span className="text-[#333] dark:text-[#E4E4E7]">Profile</span>
                </button>
                <div className="border-t border-[#E5E5E5] dark:border-[#27272A] my-1"></div>
                <button
                  className="w-full text-left p-3 hover:bg-[#F5F5F5] dark:hover:bg-[#27272A] rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400 text-sm transition-colors"
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

          {/* Theme Toggle (Desktop) */}
          <button
            onClick={toggleTheme}
            className="hidden sm:flex p-1.5 hover:bg-[#F5F5F5] dark:hover:bg-[#27272A] rounded-full transition-colors ml-1"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-[#666666] dark:text-[#A1A1AA] hover:text-black dark:hover:text-white transition-colors" />
            ) : (
              <Moon size={18} className="text-[#666666] dark:text-[#A1A1AA] hover:text-black dark:hover:text-white transition-colors" />
            )}
          </button>

          {/* Mobile User Menu Button */}
          <div className="sm:hidden" ref={mobileMenuRef}>
            <button
              className={`hamburger p-2 rounded-lg transition-colors focus:outline-none ${mobileMenuOpen ? 'open' : ''
                }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Expansion Overlay */}
      <div className={`sm:hidden absolute top-full left-0 w-full bg-white dark:bg-[#18181B] shadow-xl transition-all duration-300 ease-in-out origin-top z-40 rounded-b-3xl overflow-hidden ${mobileMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
        }`}>
        <div className="px-6 py-4 space-y-3 bg-[#FAFAFA] dark:bg-[#18181B] border-t border-[#E5E5E5] dark:border-[#27272A]">
          <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#27272A] rounded-lg border border-[#E5E5E5] dark:border-[#3F3F46]">
            <User size={18} className="text-[#666666] dark:text-[#A1A1AA]" />
            <span className="text-sm font-medium text-[#333] dark:text-[#E4E4E7]">{userName}</span>
          </div>
          <button
            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-[#666666] dark:text-[#A1A1AA] hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-[#27272A] rounded-lg transition-all border border-transparent hover:border-[#E5E5E5] dark:hover:border-[#3F3F46] hover:shadow-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <User size={18} />
            Profile
          </button>
          <button
            onClick={() => {
              toggleTheme();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-[#666666] dark:text-[#A1A1AA] hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-[#27272A] rounded-lg transition-all border border-transparent hover:border-[#E5E5E5] dark:hover:border-[#3F3F46] hover:shadow-sm"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent"
            onClick={() => {
              onLogout();
              setMobileMenuOpen(false);
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 sm:hidden"
          style={{ top: '60px' }} // Height of TopBar approx
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
