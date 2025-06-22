import { translationAPI } from './translationAPI';
import { chatService, ChatMessage } from './chatService';

export interface TranslationFlowRequest {
  text: string;
  conversationHistory?: ChatMessage[];
}

export interface TranslationFlowResponse {
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
}

export interface TranslationFlowError {
  message: string;
  step: 'detection' | 'translation' | 'chat' | 'response_translation';
  details?: any;
}

/**
 * Service that orchestrates the complete translation + chat flow
 */
export class TranslationFlowService {
  private static instance: TranslationFlowService;

  private constructor() {}

  static getInstance(): TranslationFlowService {
    if (!TranslationFlowService.instance) {
      TranslationFlowService.instance = new TranslationFlowService();
    }
    return TranslationFlowService.instance;
  }

  /**
   * Process a chat message with automatic translation
   */
  async processMessage(request: TranslationFlowRequest): Promise<TranslationFlowResponse> {
    const startTime = Date.now();

    try {
      console.log('🔄 [TranslationFlow] Starting translation flow for message:', request.text);

      // Step 1: Detect language
      console.log('🔍 [TranslationFlow] Step 1: Detecting language...');
      const detectionResult = await translationAPI.detectLanguage({ text: request.text });
      const detectedLanguage = detectionResult.detected_language;
      const isEnglish = detectedLanguage === 'eng_Latn';

      console.log('🌍 [TranslationFlow] Detected language:', detectedLanguage);

      // Step 2: Translate to English if needed
      let englishText = request.text;
      let userTranslated = false;

      if (!isEnglish) {
        console.log('🔄 [TranslationFlow] Step 2: Translating to English...');
        const translationResult = await translationAPI.translate({
          text: request.text,
          source_language: detectedLanguage,
          target_language: 'eng_Latn'
        });
        englishText = translationResult.translated_text;
        userTranslated = true;
        console.log('✅ [TranslationFlow] Translated to English:', englishText);
      } else {
        console.log('✅ [TranslationFlow] Message already in English, skipping translation');
      }

      // Step 3: Send to chat API
      console.log('🤖 [TranslationFlow] Step 3: Sending to chat API...');
      const chatResponse = await chatService.chat(englishText, request.conversationHistory);
      console.log('✅ [TranslationFlow] Received chat response');

      // Step 4: Translate response back if needed
      let finalResponse = chatResponse.content;
      let responseTranslated = false;

      if (!isEnglish) {
        console.log('🔄 [TranslationFlow] Step 4: Translating response back to', detectedLanguage);
        const responseTranslationResult = await translationAPI.translate({
          text: chatResponse.content,
          source_language: 'eng_Latn',
          target_language: detectedLanguage
        });
        finalResponse = responseTranslationResult.translated_text;
        responseTranslated = true;
        console.log('✅ [TranslationFlow] Translated response back to original language');
      } else {
        console.log('✅ [TranslationFlow] Response kept in English');
      }

      const totalProcessingTime = (Date.now() - startTime) / 1000;

      const result: TranslationFlowResponse = {
        userMessage: {
          original: request.text,
          translated: userTranslated ? englishText : undefined,
          detectedLanguage,
          displayText: request.text
        },
        aiResponse: {
          original: chatResponse.content,
          translated: responseTranslated ? finalResponse : undefined,
          targetLanguage: detectedLanguage,
          displayText: finalResponse
        },
        metadata: {
          model: chatResponse.model,
          processingTime: totalProcessingTime,
          tokens: chatResponse.tokens,
          translationUsed: userTranslated || responseTranslated,
          sourceLanguage: detectedLanguage,
          targetLanguage: detectedLanguage
        }
      };

      console.log('🎉 [TranslationFlow] Translation flow completed successfully');
      console.log('⏱️ [TranslationFlow] Total processing time:', totalProcessingTime + 's');

      return result;

    } catch (error: any) {
      console.error('❌ [TranslationFlow] Error in translation flow:', error);

      // Determine which step failed
      let step: TranslationFlowError['step'] = 'chat';
      let message = 'An error occurred during processing';

      if (error.message?.includes('detect') || error.message?.includes('language')) {
        step = 'detection';
        message = 'Failed to detect language';
      } else if (error.message?.includes('translat')) {
        step = 'translation';
        message = 'Translation failed';
      } else if (error.message?.includes('chat') || error.message?.includes('AI')) {
        step = 'chat';
        message = 'AI chat failed';
      }

      throw {
        message,
        step,
        details: error
      } as TranslationFlowError;
    }
  }

  /**
   * Get language name from language code
   */
  async getLanguageName(languageCode: string): Promise<string> {
    try {
      const languagesResponse = await translationAPI.getAllLanguages();
      const language = languagesResponse.languages[languageCode];
      return language?.name || languageCode;
    } catch (error) {
      console.warn('Failed to get language name for:', languageCode);
      return languageCode;
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return chatService.isConfigured();
  }
}

// Export singleton instance
export const translationFlowService = TranslationFlowService.getInstance();
