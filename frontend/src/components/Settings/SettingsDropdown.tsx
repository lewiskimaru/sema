import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, Cpu, Palette, HelpCircle, ChevronRight } from 'lucide-react';

interface SettingsDropdownProps {
  className?: string;
}

interface SettingsItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  component?: React.ComponentType<{ isSubmenu?: boolean }>;
  isActive: boolean;
}

export default function SettingsDropdown({ className = '' }: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const submenuTimeoutRef = useRef<number | null>(null);

  const settingsItems: SettingsItem[] = [
    {
      id: 'models',
      label: 'Model Settings',
      icon: <Cpu size={16} />,
      description: 'Configure AI models and parameters',
      isActive: false
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: <Palette size={16} />,
      description: 'Customize theme and display options',
      isActive: false
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: <HelpCircle size={16} />,
      description: 'Get help and view documentation',
      isActive: false
    }
  ];

  // Calculate button position when opening dropdown
  const updateButtonPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;

      setButtonPosition({
        top: isMobile ? rect.bottom + 8 : rect.top,
        right: isMobile ? 20 : window.innerWidth - rect.right
      });
    }
  };

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveSubmenu(null);
        setHoveredItem(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle escape key and window resize
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setActiveSubmenu(null);
        setHoveredItem(null);
      }
    };

    const handleResize = () => {
      if (isOpen) {
        updateButtonPosition();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('resize', handleResize);
      return () => {
        document.removeEventListener('keydown', handleEscape);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen]);

  const handleItemHover = (itemId: string) => {
    // Clear any existing timeout
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
    }

    setHoveredItem(itemId);

    const item = settingsItems.find(item => item.id === itemId);
    if (item?.isActive && item.component) {
      // Small delay before showing submenu
      submenuTimeoutRef.current = setTimeout(() => {
        setActiveSubmenu(itemId);
      }, 200);
    }
  };

  const handleItemLeave = () => {
    // Clear timeout when leaving item
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
    }

    // Delay hiding submenu to allow mouse movement
    submenuTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
      setActiveSubmenu(null);
    }, 300);
  };

  const handleSubmenuEnter = () => {
    // Cancel hiding when entering submenu
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
    }
  };

  const handleSubmenuLeave = () => {
    // Hide submenu when leaving
    setActiveSubmenu(null);
    setHoveredItem(null);
  };

  const handleItemClick = (item: SettingsItem) => {
    if (!item.isActive) return;

    if (item.component) {
      setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
    }
  };

  const handleToggleDropdown = () => {
    if (!isOpen) {
      updateButtonPosition();
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Settings Button */}
      <button
        ref={buttonRef}
        onClick={handleToggleDropdown}
        className={`settings-trigger p-2 hover:bg-[#F0F0F0] rounded-full transition-colors ${className}`}
        title="Settings"
        aria-label="Open settings menu"
      >
        <Settings size={18} className="text-[#666]" />
      </button>

      {/* Dropdown Menu - Rendered via Portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="settings-menu fixed w-64 bg-white border border-[#E5E5E5] rounded-lg shadow-xl z-[9999]"
          style={{
            top: window.innerWidth < 640
              ? `${buttonPosition.top}px`
              : `${Math.max(20, buttonPosition.top - 320)}px`,
            right: `${buttonPosition.right}px`,
            left: window.innerWidth < 640 ? `${buttonPosition.right}px` : 'auto',
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {/* Header */}
          <div className="p-3 border-b border-[#E5E5E5] bg-[#FAFAFA] rounded-t-lg">
            <h3 className="text-sm font-semibold text-[#333]">Settings</h3>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {settingsItems.map((item) => (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => handleItemHover(item.id)}
                onMouseLeave={handleItemLeave}
              >
                <button
                  onClick={() => handleItemClick(item)}
                  className={`w-full px-4 py-3 text-left hover:bg-[#F8F9FA] transition-colors flex items-center justify-between ${
                    !item.isActive ? 'opacity-50 cursor-not-allowed' : ''
                  } ${hoveredItem === item.id ? 'bg-[#F8F9FA]' : ''}`}
                  disabled={!item.isActive}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-[#666]">{item.icon}</div>
                    <div>
                      <div className="text-sm font-medium text-[#333]">{item.label}</div>
                      <div className="text-xs text-[#666] mt-0.5">{item.description}</div>
                    </div>
                  </div>
                  {item.isActive && item.component && (
                    <ChevronRight size={14} className="text-[#666]" />
                  )}
                </button>

                {/* Submenu */}
                {activeSubmenu === item.id && item.component && createPortal(
                  <div
                    className="submenu-container fixed z-[10000] bg-white border border-[#E5E5E5] rounded-lg shadow-xl"
                    style={{
                      top: `${buttonPosition.top - 320}px`,
                      right: `${buttonPosition.right - 320}px`, // Position to the left of main menu
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}
                    onMouseEnter={handleSubmenuEnter}
                    onMouseLeave={handleSubmenuLeave}
                  >
                    <item.component isSubmenu={true} />
                  </div>,
                  document.body
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#E5E5E5] bg-[#FAFAFA] rounded-b-lg">
            <div className="text-xs text-[#666] text-center">
              More settings coming soon
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
