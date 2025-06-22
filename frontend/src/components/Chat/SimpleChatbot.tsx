import React, { useState } from 'react';
import { SimpleChatMessage, TranslationMessage, ChatMessage } from '../../types/translation';
import { useTranslation } from '../../hooks/useTranslation';
import MessageList from './MessageList';
import InputArea from './InputArea';

interface SimpleChatbotProps {
  isCentered?: boolean;
  onFirstMessage?: () => void;
}

export default function SimpleChatbot({ isCentered = false, onFirstMessage }: SimpleChatbotProps) {
  const [messages, setMessages] = useState<SimpleChatMessage[]>([]);
  const translation = useTranslation();

  console.log('🤖 [SimpleChatbot] Render state:', {
    messagesCount: messages.length,
    isCentered,
    translationLoading: translation.isLoading
  });

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleSendMessage = async (messageContent: TranslationMessage | ChatMessage, mode: string) => {
    console.log('📤 [SimpleChatbot] Sending message:', { mode, content: messageContent });

    // Notify parent of first message
    if (messages.length === 0 && onFirstMessage) {
      console.log('🎯 [SimpleChatbot] First message - notifying parent');
      onFirstMessage();
    }

    if (mode === 'translate') {
      const translationMsg = messageContent as TranslationMessage;

      // 1. Add user message immediately
      const userMessage: SimpleChatMessage = {
        id: generateId(),
        role: 'user',
        content: translationMsg.text,
        timestamp: new Date(),
        translationData: {
          sourceText: translationMsg.text,
          sourceLanguage: translationMsg.sourceLanguage,
          targetLanguage: translationMsg.targetLanguage
        }
      };

      // 2. Add loading AI message
      const aiMessageId = generateId();
      const aiMessage: SimpleChatMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: 'Translating...',
        timestamp: new Date(),
        isLoading: true,
        translationData: {
          sourceText: translationMsg.text,
          sourceLanguage: translationMsg.sourceLanguage,
          targetLanguage: translationMsg.targetLanguage
        }
      };

      // Add both messages to state
      setMessages(prev => [...prev, userMessage, aiMessage]);
      console.log('✅ [SimpleChatbot] Added user message and loading AI message');

      // 3. Call translation API
      try {
        console.log('🔄 [SimpleChatbot] Calling translation API...');
        let result;

        if (translationMsg.sourceLanguage === 'auto') {
          result = await translation.translateWithAutoDetect(translationMsg.text, translationMsg.targetLanguage);
        } else {
          result = await translation.translateWithSource(
            translationMsg.text,
            translationMsg.sourceLanguage,
            translationMsg.targetLanguage
          );
        }

        console.log('✅ [SimpleChatbot] Translation completed:', result);

        // 4. Update AI message with clean result
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: result?.translated_text?.trim() || 'Translation failed',
                isLoading: false,
                error: !result,
                translationData: {
                  ...msg.translationData!,
                  translatedText: result?.translated_text?.trim()
                }
              }
            : msg
        ));

      } catch (error) {
        console.error('❌ [SimpleChatbot] Translation failed:', error);

        // Update AI message with error
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: 'Translation failed',
                isLoading: false,
                error: true
              }
            : msg
        ));
      }

    } else {
      // Handle regular chat messages
      const chatMsg = messageContent as ChatMessage;
      const userMessage: SimpleChatMessage = {
        id: generateId(),
        role: 'user',
        content: chatMsg.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      console.log('✅ [SimpleChatbot] Added chat message');
    }
  };

  // Render logic
  if (isCentered) {
    // Always render the full chat interface when centered
    // This prevents layout jumps and ensures messages are always visible
    console.log('🎨 [SimpleChatbot] Rendering centered chat interface', { messagesCount: messages.length });

    if (messages.length === 0) {
      // Pre-message: Center the input area vertically
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="w-full max-w-[800px] mx-auto p-4">
              <InputArea
                onSendMessage={handleSendMessage}
                isCentered={true}
              />
            </div>
          </div>
        </div>
      );
    } else {
      // Post-message: Standard chat layout
      return (
        <div className="flex flex-col h-full">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[800px] mx-auto">
              <MessageList messages={messages} />
            </div>
          </div>

          {/* Input Area - At bottom */}
          <div className="flex-shrink-0">
            <div className="max-w-[800px] mx-auto p-4">
              <InputArea
                onSendMessage={handleSendMessage}
                isCentered={true}
              />
            </div>
          </div>
        </div>
      );
    }
  } else {
    // Non-centered layout
    console.log('🎨 [SimpleChatbot] Rendering non-centered state');
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[800px] mx-auto">
            {messages.length > 0 && <MessageList messages={messages} />}
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="max-w-[800px] mx-auto p-4">
            <InputArea
              onSendMessage={handleSendMessage}
              isCentered={false}
            />
          </div>
        </div>
      </div>
    );
  }
}
