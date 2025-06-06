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
      className={`relative flex flex-col items-center justify-center p-1 transition-all duration-200 ${
        isActive ? 'text-black' : 'text-[#555555] hover:text-black'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={itemRef}
    >
      <div className={`p-2 ${
        isNew 
          ? 'bg-black text-white rounded-full' 
          : isActive 
            ? 'bg-[#EAEAEA] rounded-lg' 
            : 'hover:bg-[#EAEAEA] rounded-lg'
      }`}>
        {icon}
      </div>
      <span className="text-xs mt-1">{title}</span>
      
      {/* Extension that appears on hover */}
      {extensionContent && showExtension && (
        <div 
          className="absolute left-full ml-2 w-56 shadow-sm border border-[#EFEFEF] z-50 origin-left"
          style={{
            top: '0',
            bottom: '0',
            height: 'calc(100vh - 64px)', // Adjust based on your topbar height
            animation: 'none',
            backgroundColor: '#FAFAFA', // Match sidebar background color
            borderRadius: '0' // Remove rounded corners
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className="h-full overflow-y-auto"
            style={{
              animation: showExtension ? 'content-slide-in 0.3s ease-out forwards' : 'none'
            }}
          >
            {extensionContent}
          </div>
        </div>
      )}
    </div>
  );
  
  if (to) {
    return (
      <Link to={to} className="no-underline">
        {itemContent}
      </Link>
    );
  }
  
  return (
    <button 
      onClick={onClick} 
      className="bg-transparent border-0 cursor-pointer w-full text-inherit"
    >
      {itemContent}
    </button>
  );
}
