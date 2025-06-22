import { useState, useCallback, useRef } from 'react';
import { translationAPI } from '../services/translationAPI';
import {
  TranslationRequest,
  TranslationResponse,
  TranslationState,
  TranslationHistoryItem,
  LanguageDetectionResponse
} from '../types/translation';

export const useTranslation = () => {
  const [state, setState] = useState<TranslationState>({
    isLoading: false,
    result: null,
    error: null,
    history: []
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Cancel any ongoing translation
  const cancelTranslation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Clear results
  const clearResult = useCallback(() => {
    setState(prev => ({ ...prev, result: null, error: null }));
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, history: [] }));
  }, []);

  // Main translation function
  const translate = useCallback(async (request: TranslationRequest): Promise<TranslationResponse | null> => {
    console.log('🔄 [Translation] Starting translation request:', {
      text: request.text.substring(0, 100) + (request.text.length > 100 ? '...' : ''),
      sourceLanguage: request.source_language || 'auto',
      targetLanguage: request.target_language,
      textLength: request.text.length
    });

    // Cancel any ongoing request
    cancelTranslation();

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    console.log('📤 [Translation] State updated to loading, calling API...');

    try {
      const response = await translationAPI.translate(request);

      console.log('✅ [Translation] API response received:', {
        translatedText: response.translated_text?.substring(0, 100) + (response.translated_text?.length > 100 ? '...' : ''),
        sourceLanguage: response.source_language,
        targetLanguage: response.target_language,
        confidenceScore: response.confidence_score,
        processingTime: response.processing_time
      });

      // Create history item
      const historyItem: TranslationHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        request,
        response
      };

      setState(prev => ({
        ...prev,
        isLoading: false,
        result: response,
        history: [historyItem, ...prev.history.slice(0, 49)] // Keep last 50 items
      }));

      console.log('✅ [Translation] State updated with result');
      return response;
    } catch (error) {
      console.error('❌ [Translation] Error occurred:', error);
      const errorMessage = translationAPI.formatError(error);

      console.log('❌ [Translation] Formatted error message:', errorMessage);

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      console.log('❌ [Translation] State updated with error');
      return null;
    } finally {
      abortControllerRef.current = null;
      console.log('🔄 [Translation] Request completed, cleanup done');
    }
  }, [cancelTranslation]);

  // Auto-detect and translate
  const translateWithAutoDetect = useCallback(async (
    text: string,
    targetLanguage: string
  ): Promise<TranslationResponse | null> => {
    console.log('🔍 [Translation] Auto-detect translation requested:', {
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      targetLanguage
    });

    const request: TranslationRequest = {
      text,
      target_language: targetLanguage
      // source_language is omitted for auto-detection
    };

    return translate(request);
  }, [translate]);

  // Translate with specified source language
  const translateWithSource = useCallback(async (
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<TranslationResponse | null> => {
    console.log('🎯 [Translation] Source-specified translation requested:', {
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      sourceLanguage,
      targetLanguage
    });

    const request: TranslationRequest = {
      text,
      source_language: sourceLanguage,
      target_language: targetLanguage
    };

    return translate(request);
  }, [translate]);

  // Language detection only
  const detectLanguage = useCallback(async (text: string): Promise<LanguageDetectionResponse | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await translationAPI.detectLanguage({ text });
      setState(prev => ({ ...prev, isLoading: false }));
      return response;
    } catch (error) {
      const errorMessage = translationAPI.formatError(error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  // Get translation from history
  const getHistoryItem = useCallback((id: string): TranslationHistoryItem | null => {
    return state.history.find(item => item.id === id) || null;
  }, [state.history]);

  // Remove item from history
  const removeHistoryItem = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      history: prev.history.filter(item => item.id !== id)
    }));
  }, []);

  return {
    // State
    isLoading: state.isLoading,
    result: state.result,
    error: state.error,
    history: state.history,

    // Actions
    translate,
    translateWithAutoDetect,
    translateWithSource,
    detectLanguage,
    cancelTranslation,
    clearError,
    clearResult,
    clearHistory,
    getHistoryItem,
    removeHistoryItem
  };
};
