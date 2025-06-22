import { ReactNode, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface SidebarItemProps {
  icon: ReactNode;
  title: string;
  to?: string;
  onClick?: () => void;
  isActive?: boolean;
  isNew?: boolean;
  extensionContent?: ReactNode;
}

export default function SidebarItem({
  icon,
  title,
  to,
  onClick,
  isActive = false,
  isNew = false,
  extensionContent
}: SidebarItemProps) {
  const [showExtension, setShowExtension] = useState(false);
  // Change from NodeJS.Timeout to number type which is compatible with setTimeout/clearTimeout
  const extensionTimeoutRef = useRef<number | null>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (extensionTimeoutRef.current) {
      clearTimeout(extensionTimeoutRef.current);
      extensionTimeoutRef.current = null;
    }

    if (extensionContent) {
      setShowExtension(true);
    }
  };

  const handleMouseLeave = () => {
    if (extensionContent) {
      extensionTimeoutRef.current = setTimeout(() => {
        setShowExtension(false);
      }, 300); // Slight delay before hiding extension
    }
  };

  useEffect(() => {
    return () => {
      if (extensionTimeoutRef.current) {
        clearTimeout(extensionTimeoutRef.current);
      }
    };
  }, []);

  const itemContent = (
    <div
      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 w-full ${
        isActive
          ? 'bg-[#F5F5F5] text-black border-l-4 border-black'
          : 'text-[#666666] hover:bg-[#F8F9FA] hover:text-black'
      }`}
      ref={itemRef}
    >
      <div className={`flex items-center justify-center ${
        isNew
          ? 'bg-black text-white rounded-full p-2'
          : ''
      }`}>
        {icon}
      </div>
      <span className="text-sm font-medium">{title}</span>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="no-underline block">
        {itemContent}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className="bg-transparent border-0 cursor-pointer w-full text-inherit text-left"
    >
      {itemContent}
    </button>
  );
}
