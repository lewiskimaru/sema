import { useState } from 'react';
import SimpleChatbot from '../components/Chat/SimpleChatbot';

interface HomePageProps {
  isLoggedIn: boolean;
}

export default function HomePage({ isLoggedIn }: HomePageProps) {
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const welcomeContent = (
    <div className="text-center w-full">
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3 tracking-tight">
        Welcome to Sema
      </h1>
      <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
        {isLoggedIn
          ? "Start a conversation or translate text using the input area below."
          : "Try translation and chat features."
        }
      </p>
    </div>
  );

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Chat Interface - Wraps content to ensure vertical centering */}
      <div className="flex-1 min-h-0">
        <SimpleChatbot
          isCentered={true}
          onFirstMessage={() => setHasStartedChat(true)}
          welcomeContent={!hasStartedChat ? welcomeContent : null}
        />
      </div>
    </div>
  );
}
