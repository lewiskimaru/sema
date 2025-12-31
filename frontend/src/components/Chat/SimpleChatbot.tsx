import React, { useState } from 'react';
import { SimpleChatMessage, TranslationMessage, ChatMessage } from '../../types/translation';
import { useTranslation } from '../../hooks/useTranslation';
import { translationFlowService } from '../../services/translationFlowService';
import MessageList from './MessageList';
import InputArea from './InputArea';

interface SimpleChatbotProps {
  isCentered?: boolean;
  onFirstMessage?: () => void;
  welcomeContent?: React.ReactNode;
}

export default function SimpleChatbot({ isCentered = false, onFirstMessage, welcomeContent }: SimpleChatbotProps) {
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
        content: '', // Empty content, dots animation will be shown
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
        // 4. Update AI message with clean result and User message with detected language
        setMessages(prev => prev.map(msg => {
          // Update AI Message
          if (msg.id === aiMessageId) {
            return {
              ...msg,
              content: result?.translated_text?.trim() || 'Translation failed',
              isLoading: false,
              error: !result,
              translationData: {
                ...msg.translationData!,
                translatedText: result?.translated_text?.trim()
              }
            };
          }

          // Update User Message with detected language
          if (msg.id === userMessage.id && result?.source_language) {
            return {
              ...msg,
              translationData: {
                ...msg.translationData!,
                sourceLanguage: result.source_language
              }
            };
          }

          return msg;
        }));

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
      // Handle chat messages with translation flow
      const chatMsg = messageContent as ChatMessage;

      // 1. Add user message immediately
      const userMessage: SimpleChatMessage = {
        id: generateId(),
        role: 'user',
        content: chatMsg.text,
        timestamp: new Date()
      };

      // 2. Add loading AI message
      const aiMessageId = generateId();
      const aiMessage: SimpleChatMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: '', // Empty content, dots animation will be shown
        timestamp: new Date(),
        isLoading: true
      };

      // Add both messages to state
      setMessages(prev => [...prev, userMessage, aiMessage]);
      console.log('✅ [SimpleChatbot] Added user message and loading AI message');

      // 3. Process chat with translation flow
      try {
        console.log('🤖 [SimpleChatbot] Starting chat translation flow...');

        // The loading dots animation will be shown automatically

        // Process the complete flow
        const flowResult = await translationFlowService.processMessage({
          text: chatMsg.text,
          conversationHistory: [] // TODO: Add conversation history
        });

        console.log('✅ [SimpleChatbot] Chat translation flow completed');

        // Update user message with chat data
        setMessages(prev => prev.map(msg => {
          if (msg.id === userMessage.id) {
            return {
              ...msg,
              chatData: {
                originalText: flowResult.userMessage.original,
                translatedText: flowResult.userMessage.translated,
                detectedLanguage: flowResult.userMessage.detectedLanguage,
                model: flowResult.metadata.model,
                processingTime: flowResult.metadata.processingTime,
                tokens: flowResult.metadata.tokens,
                translationUsed: flowResult.metadata.translationUsed
              }
            };
          }
          if (msg.id === aiMessageId) {
            return {
              ...msg,
              content: flowResult.aiResponse.displayText,
              isLoading: false,
              chatData: {
                originalText: flowResult.aiResponse.original,
                translatedText: flowResult.aiResponse.translated,
                detectedLanguage: flowResult.metadata.sourceLanguage,
                model: flowResult.metadata.model,
                processingTime: flowResult.metadata.processingTime,
                tokens: flowResult.metadata.tokens,
                translationUsed: flowResult.metadata.translationUsed
              }
            };
          }
          return msg;
        }));

      } catch (error: any) {
        console.error('❌ [SimpleChatbot] Chat translation flow failed:', error);

        // Update AI message with error
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessageId
            ? {
              ...msg,
              content: 'Chat failed. Please try again.',
              isLoading: false,
              error: true
            }
            : msg
        ));
      }
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
          <div className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto">
            {welcomeContent && (
              <div className="w-full max-w-[800px] mb-8 px-4 flex justify-center">
                {welcomeContent}
              </div>
            )}
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
