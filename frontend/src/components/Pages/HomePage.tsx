import { useState } from 'react';
import SimpleChatbot from '../Chat/SimpleChatbot';

interface HomePageProps {
  isLoggedIn: boolean;
}

export default function HomePage({ isLoggedIn }: HomePageProps) {
  const [hasStartedChat, setHasStartedChat] = useState(false);

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Welcome Message - Only show before first message */}
      {!hasStartedChat && (
        <div className="flex-shrink-0 text-center pt-8 pb-4 px-4">
          <div className="max-w-[800px] mx-auto">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
              Welcome to Sema
            </h1>
            <p className="text-gray-600 mb-2">
              {isLoggedIn
                ? "Start a conversation or translate text using the input area below."
                : "Try our translation and chat features. No signup required to get started."
              }
            </p>
          </div>
        </div>
      )}

      {/* Chat Interface - Always present, grows to fill remaining space */}
      <div className="flex-1 min-h-0">
        <SimpleChatbot
          isCentered={true}
          onFirstMessage={() => setHasStartedChat(true)}
        />
      </div>
    </div>
  );
}
