import { useState } from 'react';
import { InputArea } from '../Chat';

interface HomePageProps {
  isLoggedIn: boolean;
}

export default function HomePage({ isLoggedIn }: HomePageProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (messageData: any, mode: string) => {
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: typeof messageData === 'string' ? messageData : messageData.text,
      mode,
      timestamp: new Date(),
      ...(mode === 'translate' && typeof messageData === 'object' && {
        languages: {
          source: messageData.sourceLanguage,
          target: messageData.targetLanguage
        }
      })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API response
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: mode === 'translate'
          ? `Translation: ${userMessage.content}`
          : `I received your message: ${userMessage.content}`,
        mode,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {messages.length === 0 ? (
        /* Centered welcome state with InputArea */
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[800px] mx-auto px-4 sm:px-0">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-800 mb-4">
                Welcome to Sema
              </h1>
              <p className="text-gray-600 mb-6">
                {isLoggedIn
                  ? "Start a conversation or translate text using the input area below."
                  : "Try our translation and chat features. No signup required to get started."
                }
              </p>
            </div>
            <InputArea onSendMessage={handleSendMessage} isCentered={true} />
          </div>
        </div>
      ) : (
        /* Chat mode with messages */
        <>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="w-full max-w-[800px] mx-auto px-4 sm:px-0 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.mode === 'translate' && message.type === 'user' && message.languages && (
                    <div className="text-xs opacity-75 mb-1">
                      {message.languages.source === 'auto' ? 'Auto-detect' : message.languages.source.toUpperCase()} → {message.languages.target.toUpperCase()}
                    </div>
                  )}
                  <div>{message.content}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm">Processing...</span>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
          <InputArea onSendMessage={handleSendMessage} isCentered={false} />
        </>
      )}
    </div>
  );
}
