import { useState, useEffect } from 'react';
import InputArea from './InputArea';
import { MessageContainer, TranslationMessage as TranslationMessageComponent, ChatMessage as ChatMessageComponent } from '../Messages';
import { useTranslation } from '../../hooks/useTranslation';
import { TranslationMessage, ChatMessage, ChatProcessingState } from '../../types/translation';
import { translationFlowService } from '../../services/translationFlowService';

interface ChatContainerProps {
  isCentered?: boolean;
  onFirstMessage?: () => void;
}

interface Message {
  id: string;
  type: 'chat' | 'translation';
  timestamp: Date;
  content: TranslationMessage | ChatMessage;
  mode: string;
  isLoading?: boolean;
  error?: string;
  // For translation messages, store the translation result
  translationResult?: {
    translated_text: string;
    source_language: string;
    target_language: string;
    confidence_score?: number;
    processing_time?: number;
  };
  // For chat messages with translation flow
  chatFlowResult?: {
    userMessage: {
      original: string;
      translated?: string;
      detectedLanguage: string;
      displayText: string;
    };
    aiResponse: {
      original: string;
      translated?: string;
      targetLanguage: string;
      displayText: string;
    };
    metadata: {
      model: string;
      processingTime: number;
      tokens?: number;
      translationUsed: boolean;
      sourceLanguage: string;
      targetLanguage: string;
    };
  };
  // Processing state for chat flow
  processingState?: ChatProcessingState;
  processingStep?: string;
}

export default function ChatContainer({ isCentered = false, onFirstMessage }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranslationId, setCurrentTranslationId] = useState<string | null>(null);

  const translation = useTranslation();

  console.log('🔄 [ChatContainer] Render - Current state:', {
    messagesCount: messages.length,
    currentTranslationId,
    translationLoading: translation.isLoading,
    translationResult: !!translation.result,
    translationError: !!translation.error
  });

  // Handle translation result updates
  useEffect(() => {
    if (currentTranslationId && translation.result && !translation.isLoading) {
      console.log('✅ [ChatContainer] Translation result received, updating message:', {
        messageId: currentTranslationId,
        result: translation.result
      });

      setMessages(prev => prev.map(msg =>
        msg.id === currentTranslationId
          ? {
            ...msg,
            isLoading: false,
            translationResult: translation.result || undefined,
            error: undefined
          }
          : msg
      ));

      setCurrentTranslationId(null);
    }
  }, [translation.result, translation.isLoading, currentTranslationId]);

  // Handle translation errors
  useEffect(() => {
    if (currentTranslationId && translation.error && !translation.isLoading) {
      console.log('❌ [ChatContainer] Translation error received, updating message:', {
        messageId: currentTranslationId,
        error: translation.error
      });

      setMessages(prev => prev.map(msg =>
        msg.id === currentTranslationId
          ? {
            ...msg,
            isLoading: false,
            error: translation.error || undefined,
            translationResult: undefined
          }
          : msg
      ));

      setCurrentTranslationId(null);
    }
  }, [translation.error, translation.isLoading, currentTranslationId]);

  const handleSendMessage = async (messageContent: TranslationMessage | ChatMessage, mode: string) => {
    console.log('💬 [ChatContainer] Message sent:', {
      mode,
      content: mode === 'translate'
        ? {
          text: (messageContent as TranslationMessage).text.substring(0, 100) + ((messageContent as TranslationMessage).text.length > 100 ? '...' : ''),
          sourceLanguage: (messageContent as TranslationMessage).sourceLanguage,
          targetLanguage: (messageContent as TranslationMessage).targetLanguage
        }
        : {
          text: (messageContent as ChatMessage).text.substring(0, 100) + ((messageContent as ChatMessage).text.length > 100 ? '...' : '')
        }
    });

    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const userMessage: Message = {
      id: messageId,
      type: mode as 'chat' | 'translation',
      timestamp: new Date(),
      content: messageContent,
      mode,
      isLoading: mode === 'translate' || mode === 'chat', // Set loading for both translation and chat messages
      processingState: mode === 'chat' ? 'detecting' : undefined,
      processingStep: mode === 'chat' ? 'Detecting language...' : undefined
    };

    // Add user message to history immediately
    setMessages(prev => {
      console.log('📝 [ChatContainer] Adding user message to history');
      return [...prev, userMessage];
    });

    // Notify parent of first message if needed
    if (messages.length === 0 && onFirstMessage) {
      console.log('🎯 [ChatContainer] First message sent, notifying parent');
      onFirstMessage();
    }

    // Handle translation
    if (mode === 'translate') {
      const translationMsg = messageContent as TranslationMessage;
      setCurrentTranslationId(messageId);

      try {
        console.log('🚀 [ChatContainer] Starting translation process...');

        if (translationMsg.sourceLanguage === 'auto') {
          console.log('🔍 [ChatContainer] Using auto-detect translation');
          await translation.translateWithAutoDetect(translationMsg.text, translationMsg.targetLanguage);
        } else {
          console.log('🎯 [ChatContainer] Using source-specified translation');
          await translation.translateWithSource(
            translationMsg.text,
            translationMsg.sourceLanguage,
            translationMsg.targetLanguage
          );
        }

        console.log('✅ [ChatContainer] Translation API call completed');
        // Note: useEffect will handle updating the message with results

      } catch (error) {
        console.error('❌ [ChatContainer] Translation failed:', error);
        // Note: useEffect will handle updating the message with errors
      }
      // Note: currentTranslationId will be cleared by useEffect when result/error is received
    }

    // Handle chat with translation flow
    if (mode === 'chat') {
      const chatMsg = messageContent as ChatMessage;

      try {
        console.log('🤖 [ChatContainer] Starting chat translation flow...');

        // Update processing state
        const updateProcessingState = (state: ChatProcessingState, step: string) => {
          setMessages(prev => prev.map(msg =>
            msg.id === messageId
              ? { ...msg, processingState: state, processingStep: step }
              : msg
          ));
        };

        // Step 1: Language detection
        updateProcessingState('detecting', 'Detecting language...');

        // Step 2: Translation (if needed)
        updateProcessingState('translating', 'Translating to English...');

        // Step 3: Chat API
        updateProcessingState('chatting', 'AI is thinking...');

        // Step 4: Response translation (if needed)
        updateProcessingState('responding', 'Translating response...');

        // Process the complete flow
        const flowResult = await translationFlowService.processMessage({
          text: chatMsg.text,
          conversationHistory: [] // TODO: Add conversation history from previous messages
        });

        console.log('✅ [ChatContainer] Chat translation flow completed');

        // Add AI response message
        const aiMessageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const aiMessage: Message = {
          id: aiMessageId,
          type: 'chat',
          timestamp: new Date(),
          content: { text: flowResult.aiResponse.displayText },
          mode: 'chat',
          isLoading: false,
          chatFlowResult: flowResult,
          processingState: 'complete' as ChatProcessingState
        };

        // Update user message with results and add AI response
        setMessages(prev => [
          ...prev.map(msg =>
            msg.id === messageId
              ? {
                ...msg,
                isLoading: false,
                chatFlowResult: flowResult,
                processingState: 'complete' as ChatProcessingState,
                processingStep: undefined
              }
              : msg
          ),
          aiMessage
        ]);

      } catch (error: any) {
        console.error('❌ [ChatContainer] Chat translation flow failed:', error);

        // Update message with error
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? {
              ...msg,
              isLoading: false,
              error: error.message || 'Chat failed',
              processingState: 'error' as ChatProcessingState,
              processingStep: undefined
            }
            : msg
        ));
      }
    }
  };

  const handleRetryTranslation = (messageId: string) => {
    console.log('🔄 [ChatContainer] Retry translation requested for message:', messageId);

    const message = messages.find(m => m.id === messageId);
    if (!message || message.type !== 'translation') {
      console.log('⚠️ [ChatContainer] Message not found or not a translation message');
      return;
    }

    const translationMsg = message.content as TranslationMessage;
    console.log('🔄 [ChatContainer] Retrying translation for:', {
      text: translationMsg.text.substring(0, 50) + '...',
      sourceLanguage: translationMsg.sourceLanguage,
      targetLanguage: translationMsg.targetLanguage
    });

    // Set message to loading state
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, isLoading: true, error: undefined, translationResult: undefined }
        : msg
    ));

    setCurrentTranslationId(messageId);

    // Retry translation
    const retryTranslation = async () => {
      try {
        if (translationMsg.sourceLanguage === 'auto') {
          await translation.translateWithAutoDetect(translationMsg.text, translationMsg.targetLanguage);
        } else {
          await translation.translateWithSource(translationMsg.text, translationMsg.sourceLanguage, translationMsg.targetLanguage);
        }

        console.log('✅ [ChatContainer] Retry translation API call completed');
        // Note: useEffect will handle updating the message with results
      } catch (error) {
        console.error('❌ [ChatContainer] Retry translation failed:', error);
        // Note: useEffect will handle updating the message with errors
      }
      // Note: currentTranslationId will be cleared by useEffect
    };

    retryTranslation();
  };

  const handleEditMessage = (messageId: string) => {
    console.log('✏️ [ChatContainer] Edit message requested for ID:', messageId);
    // For now, just log the action - full edit functionality can be implemented later
    const message = messages.find(m => m.id === messageId);
    if (message) {
      console.log('📝 [ChatContainer] Message to edit:', {
        id: messageId,
        type: message.type,
        content: message.type === 'translation'
          ? (message.content as TranslationMessage).text.substring(0, 100) + '...'
          : (message.content as ChatMessage).text.substring(0, 100) + '...'
      });
      // TODO: Implement edit functionality - could open input area with pre-filled content
      alert('Edit functionality coming soon!');
    }
  };



  // Render messages function
  const renderMessages = () => {
    console.log('🎨 [ChatContainer] Rendering messages:', { count: messages.length });

    return messages.map((message) => {
      console.log('🎨 [ChatContainer] Rendering message:', {
        id: message.id,
        type: message.type,
        isLoading: message.isLoading,
        hasTranslationResult: !!message.translationResult,
        error: message.error
      });

      if (message.type === 'translation') {
        return (
          <div key={message.id}>
            <TranslationMessageComponent
              sourceText={(message.content as TranslationMessage).text}
              sourceLanguage={message.translationResult?.source_language || (message.content as TranslationMessage).sourceLanguage}
              targetLanguage={(message.content as TranslationMessage).targetLanguage}
              translation={message.translationResult}
              timestamp={message.timestamp}
              onRetry={() => handleRetryTranslation(message.id)}
              onEdit={() => handleEditMessage(message.id)}
              isLoading={message.isLoading || false}
              error={message.error}
            />
          </div>
        );
      } else {
        // Chat message
        const isUserMessage = !message.chatFlowResult || message.id.includes(message.timestamp.getTime().toString());
        const displayContent = isUserMessage
          ? (message.content as ChatMessage).text
          : message.chatFlowResult?.aiResponse.displayText || (message.content as ChatMessage).text;

        return (
          <div key={message.id}>
            <ChatMessageComponent
              content={displayContent}
              isUser={isUserMessage}
              timestamp={message.timestamp}
              onEdit={isUserMessage ? () => handleEditMessage(message.id) : undefined}
              isLoading={message.isLoading || false}
              error={message.error}
              metadata={message.chatFlowResult ? {
                model: message.chatFlowResult.metadata.model,
                tokens: message.chatFlowResult.metadata.tokens,
                processingTime: message.chatFlowResult.metadata.processingTime
              } : undefined}
            />
            {/* Show processing state for chat messages */}
            {message.processingState && message.processingState !== 'complete' && message.processingStep && (
              <div className="text-xs text-gray-500 mt-1 ml-4">
                {message.processingStep}
              </div>
            )}
            {/* Show translation metadata for user messages if translation was used */}
            {isUserMessage && message.chatFlowResult?.metadata.translationUsed && (
              <div className="text-xs text-gray-500 mt-1 ml-4">
                Translated from {message.chatFlowResult.userMessage.detectedLanguage}
              </div>
            )}
          </div>
        );
      }
    });
  };

  if (isCentered) {
    // Simple condition: show messages area if we have any messages
    if (messages.length > 0) {
      console.log('🎨 [ChatContainer] Rendering centered layout with messages');
      return (
        <div className="flex flex-col h-full">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            <MessageContainer>
              {renderMessages()}
            </MessageContainer>
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
    } else {
      console.log('🎨 [ChatContainer] Rendering centered layout without messages (pre-message state)');
      // PRE-FIRST-MESSAGE: Just the input area (parent handles centering)
      return (
        <InputArea
          onSendMessage={handleSendMessage}
          isCentered={true}
        />
      );
    }
  }

  // Non-centered layout
  console.log('🎨 [ChatContainer] Rendering non-centered layout');
  return (
    <div className="flex flex-col h-full">
      {/* Messages Area - Show if we have messages */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <MessageContainer>
            {renderMessages()}
          </MessageContainer>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0">
        <InputArea
          onSendMessage={handleSendMessage}
          isCentered={false}
        />
      </div>
    </div>
  );
}
