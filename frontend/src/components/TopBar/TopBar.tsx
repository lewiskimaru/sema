import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut, Info, ChevronDown, Code, Menu, X } from 'lucide-react';

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
      <>
        <div className="bg-white px-6 py-3 flex justify-between items-center relative z-50">
          {/* Logo - Smaller size */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <span className="text-xl font-semibold text-black tracking-tight">{getPageTitle()}</span>
            </Link>
          </div>

          {/* Desktop Auth Actions - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
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

          {/* Mobile Menu Button - Shown only on mobile */}
          <div className="md:hidden" ref={mobileMenuRef}>
            <button
              className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open menu"
            >
              {mobileMenuOpen ? (
                <X size={20} className="text-[#666666]" />
              ) : (
                <Menu size={20} className="text-[#666666]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-20 z-30 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="md:hidden mobile-menu mobile-menu-enter bg-white border-b border-[#E5E5E5] shadow-lg">
              <div className="px-6 py-4 space-y-3">
                <div className="border-t border-[#E5E5E5] pt-3">
                  <Link
                    to="/developer"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#666666] hover:text-black hover:bg-[#F8F9FA] rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Code size={18} />
                    API Documentation
                  </Link>
                  <Link
                    to="/about"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#666666] hover:text-black hover:bg-[#F8F9FA] rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Info size={18} />
                    About Sema AI
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  // Logged in - Show full app topbar with user menu
  return (
    <>
      <div className="bg-white px-6 py-3 flex justify-between items-center relative z-50">
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
              className="flex items-center gap-2 hover:bg-[#F5F5F5] px-2 py-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E5E5E5]"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            >
              <User size={16} className="text-[#666666]" />
              <span className="text-sm text-[#666666] font-medium">{userName}</span>
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

          {/* Mobile User Menu Button */}
          <div className="sm:hidden" ref={mobileMenuRef}>
            <button
              className="flex items-center gap-2 hover:bg-[#F5F5F5] p-2 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open menu"
            >
              {mobileMenuOpen ? (
                <X size={20} className="text-[#666666]" />
              ) : (
                <Menu size={20} className="text-[#666666]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu for Logged In Users */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-20 z-30 sm:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="sm:hidden mobile-menu mobile-menu-enter bg-white border-b border-[#E5E5E5] shadow-lg">
            <div className="px-6 py-4 space-y-3">
              <div className="flex items-center gap-3 px-4 py-3 bg-[#F8F9FA] rounded-lg">
                <User size={18} className="text-[#666666]" />
                <span className="text-sm font-medium text-[#333]">{userName}</span>
              </div>
              <button
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-[#666666] hover:text-black hover:bg-[#F8F9FA] rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={18} />
                Profile
              </button>
              <button
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        </>
      )}
    </>
  );
}
