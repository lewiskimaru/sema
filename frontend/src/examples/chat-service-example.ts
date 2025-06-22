// Example usage of the Chat Service with Translation Flow
// This file demonstrates how to use the chat service in your components

import { useState } from 'react';
import { translationFlowService } from '../services/translationFlowService';
import { chatService } from '../services/chatService';

// Example 1: Simple chat with automatic translation
export async function simpleChatExample() {
  console.log('🤖 Simple Chat Example');

  try {
    const result = await translationFlowService.processMessage({
      text: 'Hola, ¿cómo estás?',
      conversationHistory: []
    });

    console.log('User message:', result.userMessage.displayText);
    console.log('AI response:', result.aiResponse.displayText);
    console.log('Translation used:', result.metadata.translationUsed);
    console.log('Processing time:', result.metadata.processingTime + 's');

    return result;
  } catch (error) {
    console.error('Chat failed:', error);
    throw error;
  }
}

// Example 2: Chat with conversation history
export async function conversationExample() {
  console.log('💬 Conversation Example');

  const conversationHistory = [
    { role: 'user' as const, content: 'Hello, my name is John' },
    { role: 'assistant' as const, content: 'Nice to meet you, John! How can I help you today?' }
  ];

  try {
    const result = await translationFlowService.processMessage({
      text: 'What is the weather like today?',
      conversationHistory
    });

    console.log('Conversation context maintained');
    console.log('AI response:', result.aiResponse.displayText);

    return result;
  } catch (error) {
    console.error('Conversation failed:', error);
    throw error;
  }
}

// Example 3: Direct chat service usage (English only)
export async function directChatExample() {
  console.log('🎯 Direct Chat Example');

  try {
    const response = await chatService.chat('What is artificial intelligence?');

    console.log('AI response:', response.content);
    console.log('Model:', response.model);
    console.log('Processing time:', response.processingTime + 's');
    console.log('Tokens used:', response.tokens);

    return response;
  } catch (error) {
    console.error('Direct chat failed:', error);
    throw error;
  }
}

// Example 4: Multi-language conversation
export async function multiLanguageExample() {
  console.log('🌍 Multi-language Example');

  const messages = [
    'Hello, how are you?',           // English
    'Hola, ¿cómo estás?',          // Spanish
    'Habari ya asubuhi',           // Swahili
    'Bonjour, comment allez-vous?' // French
  ];

  const results = [];

  for (const message of messages) {
    try {
      console.log(`\nProcessing: "${message}"`);

      const result = await translationFlowService.processMessage({
        text: message,
        conversationHistory: []
      });

      console.log(`Detected: ${result.userMessage.detectedLanguage}`);
      console.log(`Response: ${result.aiResponse.displayText}`);
      console.log(`Translation used: ${result.metadata.translationUsed}`);

      results.push(result);
    } catch (error) {
      console.error(`Failed to process "${message}":`, error);
    }
  }

  return results;
}

// Example 5: Error handling
export async function errorHandlingExample() {
  console.log('⚠️ Error Handling Example');

  const testCases = [
    '',                    // Empty message
    'x',                   // Very short message
    'A'.repeat(10000),     // Very long message
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\nTesting: "${testCase.substring(0, 50)}${testCase.length > 50 ? '...' : ''}"`);

      const result = await translationFlowService.processMessage({
        text: testCase,
        conversationHistory: []
      });

      console.log('✅ Success:', result.aiResponse.displayText.substring(0, 100));
    } catch (error: any) {
      console.log('❌ Expected error:', error.message);
    }
  }
}

// Example 6: Performance testing
export async function performanceExample() {
  console.log('⚡ Performance Example');

  const testMessages = [
    'Hello',
    'Hola',
    'Bonjour',
    'Guten Tag',
    'Ciao'
  ];

  const startTime = Date.now();
  const results = [];

  // Sequential processing
  console.log('Sequential processing...');
  for (const message of testMessages) {
    const messageStart = Date.now();

    try {
      const result = await translationFlowService.processMessage({
        text: message,
        conversationHistory: []
      });

      const messageTime = Date.now() - messageStart;
      console.log(`"${message}" -> ${messageTime}ms`);

      results.push({ message, result, time: messageTime });
    } catch (error) {
      console.error(`Failed: "${message}"`, error);
    }
  }

  const totalTime = Date.now() - startTime;
  console.log(`Total time: ${totalTime}ms`);
  console.log(`Average time: ${totalTime / testMessages.length}ms`);

  return results;
}

// Example 7: React component integration
export function useChatService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const sendMessage = async (text: string) => {
    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const result = await translationFlowService.processMessage({
        text,
        conversationHistory: messages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .map(m => ({ role: m.role, content: m.content }))
      });

      // Add AI response
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.aiResponse.displayText,
        timestamp: new Date(),
        metadata: result.metadata
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      setError(error.message);

      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        error: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages: () => setMessages([])
  };
}

// Example 8: Configuration check
export function checkConfiguration() {
  console.log('🔧 Configuration Check');

  const config = {
    hfToken: !!import.meta.env.VITE_HF_TOKEN,
    apiUrl: import.meta.env.VITE_API_URL,
    chatServiceConfigured: chatService.isConfigured(),
    translationFlowConfigured: translationFlowService.isConfigured()
  };

  console.log('Configuration:', config);

  if (!config.hfToken) {
    console.warn('⚠️ HuggingFace token not configured');
  }

  if (!config.apiUrl) {
    console.warn('⚠️ API URL not configured');
  }

  if (config.chatServiceConfigured && config.translationFlowConfigured) {
    console.log('✅ All services properly configured');
  } else {
    console.warn('⚠️ Some services not properly configured');
  }

  return config;
}

// Run examples (for testing)
export async function runAllExamples() {
  console.log('🧪 Running All Chat Service Examples');
  console.log('=====================================');

  // Check configuration first
  const config = checkConfiguration();
  if (!config.chatServiceConfigured) {
    console.error('❌ Chat service not configured, skipping examples');
    return;
  }

  try {
    await simpleChatExample();
    await conversationExample();
    await directChatExample();
    await multiLanguageExample();
    await errorHandlingExample();
    await performanceExample();

    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Examples failed:', error);
  }
}
