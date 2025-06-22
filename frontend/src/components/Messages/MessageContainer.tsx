import { useRef, useEffect } from 'react';

interface MessageContainerProps {
  children: React.ReactNode;
  className?: string;
  autoScroll?: boolean;
}

export default function MessageContainer({ 
  children, 
  className = '',
  autoScroll = true 
}: MessageContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [children, autoScroll]);

  return (
    <div className={`message-container-wrapper ${className}`}>
      {/* Messages Area */}
      <div className="messages-list space-y-6 p-4">
        <div className="max-w-[800px] mx-auto">
          {children}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
