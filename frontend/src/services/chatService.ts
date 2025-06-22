import { InferenceClient } from "@huggingface/inference";

// Chat service configuration
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;
const CHAT_MODEL = "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B";

// Initialize HuggingFace client
const client = new InferenceClient(HF_TOKEN);

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  content: string;
  model: string;
  processingTime: number;
  tokens?: number;
}

export interface ChatError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Chat service for HuggingFace integration
 */
export class ChatService {
  private static instance: ChatService;

  private constructor() {}

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  /**
   * Send a chat message and get AI response
   */
  async sendMessage(
    messages: ChatMessage[],
    options?: {
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      console.log('🤖 [ChatService] Sending message to HuggingFace API');
      console.log('📝 [ChatService] Messages:', messages);

      if (!HF_TOKEN) {
        throw new Error('HuggingFace token not configured');
      }

      const chatCompletion = await client.chatCompletion({
        provider: "nscale",
        model: CHAT_MODEL,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
      });

      const processingTime = (Date.now() - startTime) / 1000;

      if (!chatCompletion.choices || chatCompletion.choices.length === 0) {
        throw new Error('No response from chat API');
      }

      const response = chatCompletion.choices[0].message;
      
      if (!response || !response.content) {
        throw new Error('Invalid response format from chat API');
      }

      console.log('✅ [ChatService] Received response from HuggingFace API');
      console.log('⏱️ [ChatService] Processing time:', processingTime + 's');

      return {
        content: response.content,
        model: CHAT_MODEL,
        processingTime,
        tokens: chatCompletion.usage?.total_tokens,
      };

    } catch (error: any) {
      const processingTime = (Date.now() - startTime) / 1000;
      
      console.error('❌ [ChatService] Error sending message:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to get AI response';
      let errorCode = 'CHAT_ERROR';

      if (error.message?.includes('token')) {
        errorMessage = 'Authentication failed. Please check HuggingFace token.';
        errorCode = 'AUTH_ERROR';
      } else if (error.message?.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
        errorCode = 'RATE_LIMIT';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection.';
        errorCode = 'NETWORK_ERROR';
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw {
        message: errorMessage,
        code: errorCode,
        details: error,
        processingTime,
      } as ChatError;
    }
  }

  /**
   * Create a simple chat conversation
   */
  async chat(userMessage: string, conversationHistory?: ChatMessage[]): Promise<ChatResponse> {
    const messages: ChatMessage[] = [
      // System message to set context
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.'
      },
      // Include conversation history if provided
      ...(conversationHistory || []),
      // Add the new user message
      {
        role: 'user',
        content: userMessage
      }
    ];

    return this.sendMessage(messages);
  }

  /**
   * Check if the chat service is properly configured
   */
  isConfigured(): boolean {
    return !!HF_TOKEN;
  }

  /**
   * Get the current model being used
   */
  getModel(): string {
    return CHAT_MODEL;
  }
}

// Export singleton instance
export const chatService = ChatService.getInstance();
