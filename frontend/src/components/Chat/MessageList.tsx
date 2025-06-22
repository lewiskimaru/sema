import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check, X } from 'lucide-react';
import { SimpleChatMessage } from '../../types/translation';

interface MessageListProps {
  messages: SimpleChatMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copyStates, setCopyStates] = useState<Record<string, 'idle' | 'success' | 'error'>>({});

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('✅ Text copied to clipboard');
      setCopyStates(prev => ({ ...prev, [messageId]: 'success' }));

      // Reset after 2 seconds
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [messageId]: 'idle' }));
      }, 2000);
    } catch (error) {
      console.error('❌ Failed to copy text, trying fallback:', error);

      // Fallback method for browsers that don't support clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          console.log('✅ Text copied using fallback method');
          setCopyStates(prev => ({ ...prev, [messageId]: 'success' }));
        } else {
          throw new Error('Fallback copy failed');
        }

        // Reset after 2 seconds
        setTimeout(() => {
          setCopyStates(prev => ({ ...prev, [messageId]: 'idle' }));
        }, 2000);
      } catch (fallbackError) {
        console.error('❌ Fallback copy method also failed:', fallbackError);
        setCopyStates(prev => ({ ...prev, [messageId]: 'error' }));

        // Reset after 2 seconds
        setTimeout(() => {
          setCopyStates(prev => ({ ...prev, [messageId]: 'idle' }));
        }, 2000);
      }
    }
  };

  return (
    <div className="p-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="flex flex-col">
          {/* Message Content */}
          <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg ${
              message.role === 'user'
                ? 'bg-[#F8F9FA] border border-[#E5E5E5] text-[#333] p-3'
                : 'bg-transparent text-[#333] p-0'
            }`}>
              {/* Loading State */}
              {message.isLoading ? (
                <div className="flex items-center space-x-2 text-[#666]">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#666]"></div>
                  <span>Translating...</span>
                </div>
              ) : (
                <>
                  {/* Main Content */}
                  <div className="whitespace-pre-wrap">{message.content}</div>

                  {/* Translation Info for User Messages */}
                  {message.role === 'user' && message.translationData && (
                    <div className="mt-2 pt-2 border-t border-[#E5E5E5]">
                      <div className="text-sm text-[#666]">
                        Translation ({message.translationData.sourceLanguage} → {message.translationData.targetLanguage})
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Error State */}
          {message.error && (
            <div className="flex justify-start mt-1">
              <div className="max-w-[80%] bg-red-50 text-red-700 rounded-lg p-2 text-sm border border-red-200">
                Translation failed. Please try again.
              </div>
            </div>
          )}

          {/* Message Actions */}
          {!message.isLoading && !message.error && (
            <div className={`flex mt-1 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <button
                onClick={() => copyToClipboard(message.content, message.id)}
                className={`text-xs px-2 py-1 rounded hover:bg-[#F0F0F0] flex items-center gap-1 transition-colors ${
                  copyStates[message.id] === 'success'
                    ? 'text-green-600'
                    : copyStates[message.id] === 'error'
                    ? 'text-red-600'
                    : 'text-[#666] hover:text-[#333]'
                }`}
                title={
                  copyStates[message.id] === 'success'
                    ? 'Copied!'
                    : copyStates[message.id] === 'error'
                    ? 'Copy failed'
                    : 'Copy message'
                }
              >
                {copyStates[message.id] === 'success' ? (
                  <Check size={12} />
                ) : copyStates[message.id] === 'error' ? (
                  <X size={12} />
                ) : (
                  <Copy size={12} />
                )}
              </button>
            </div>
          )}

          {/* Timestamp */}
          <div className={`text-xs text-[#999] mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      ))}

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
