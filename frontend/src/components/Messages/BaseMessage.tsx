import { useState } from 'react';
import { Copy, Edit, RotateCcw, Volume2, CheckCircle } from 'lucide-react';

interface BaseMessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
  onCopy?: () => void;
  onEdit?: () => void;
  onRetry?: () => void;
  onListen?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export default function BaseMessage({
  content,
  isUser,
  timestamp,
  onCopy,
  onEdit,
  onRetry,
  onListen,
  className = '',
  children
}: BaseMessageProps) {
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleCopy = async () => {
    console.log('📋 [BaseMessage] Copy button clicked, content:', content.substring(0, 100) + (content.length > 100 ? '...' : ''));
    try {
      await navigator.clipboard.writeText(content);
      console.log('✅ [BaseMessage] Text copied to clipboard successfully');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch (error) {
      console.error('❌ [BaseMessage] Failed to copy text:', error);
      // Fallback for browsers that don't support clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        console.log('✅ [BaseMessage] Text copied using fallback method');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        onCopy?.();
      } catch (fallbackError) {
        console.error('❌ [BaseMessage] Fallback copy method also failed:', fallbackError);
      }
    }
  };

  const handleListen = () => {
    if (!onListen) return;

    setIsListening(true);
    // Future implementation for text-to-speech
    setTimeout(() => setIsListening(false), 1000);
    onListen();
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`message-container ${isUser ? 'user-message' : 'ai-message'} ${className}`}>
      <div className="flex w-full">
        {/* Message Content */}
        <div className={`message-wrapper ${isUser ? 'ml-auto' : 'mr-auto'} max-w-[80%] sm:max-w-[70%] md:max-w-[60%]`}>
          <div className={`message-content ${isUser
              ? 'bg-[#F8F9FA] dark:bg-[#27272A] border border-[#E5E5E5] dark:border-[#3F3F46]'
              : 'bg-transparent'
            } rounded-lg p-4 relative group`}>

            {/* Message Text */}
            <div className={`message-text text-sm text-[#333] dark:text-[#E4E4E7] ${isUser ? 'text-left' : 'text-left'}`}>
              {content}
            </div>

            {/* Additional Content (for specialized message types) */}
            {children && (
              <div className="message-extra mt-3">
                {children}
              </div>
            )}

            {/* Timestamp */}
            <div className={`message-timestamp text-xs text-[#666] dark:text-[#A1A1AA] mt-2 ${isUser ? 'text-right' : 'text-left'}`}>
              {formatTimestamp(timestamp)}
            </div>
          </div>

          {/* Message Actions - Below the message content */}
          <div className={`message-actions mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
            <div className="flex items-center gap-1 bg-white dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#3F3F46] rounded-md shadow-sm p-1">

              {/* Copy Action */}
              <button
                onClick={handleCopy}
                className="action-button p-1.5 hover:bg-[#F0F0F0] dark:hover:bg-[#27272A] rounded transition-colors"
                title="Copy message"
                disabled={copied}
              >
                {copied ? (
                  <CheckCircle size={14} className="text-green-600" />
                ) : (
                  <Copy size={14} className="text-[#666] dark:text-[#A1A1AA]" />
                )}
              </button>

              {/* Listen Action (Currently Inactive) */}
              <button
                onClick={handleListen}
                className="action-button p-1.5 hover:bg-[#F0F0F0] dark:hover:bg-[#27272A] rounded transition-colors opacity-50 cursor-not-allowed"
                title="Listen to message (Coming soon)"
                disabled={true}
              >
                <Volume2 size={14} className={`text-[#666] dark:text-[#A1A1AA] ${isListening ? 'animate-pulse' : ''}`} />
              </button>

              {/* Edit/Retry Action */}
              {isUser && onEdit && (
                <button
                  onClick={onEdit}
                  className="action-button p-1.5 hover:bg-[#F0F0F0] dark:hover:bg-[#27272A] rounded transition-colors"
                  title="Edit message"
                >
                  <Edit size={14} className="text-[#666] dark:text-[#A1A1AA]" />
                </button>
              )}

              {!isUser && onRetry && (
                <button
                  onClick={onRetry}
                  className="action-button p-1.5 hover:bg-[#F0F0F0] dark:hover:bg-[#27272A] rounded transition-colors"
                  title="Retry response"
                >
                  <RotateCcw size={14} className="text-[#666] dark:text-[#A1A1AA]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
