// Translation API Types
export interface TranslationRequest {
  text: string;
  target_language: string;
  source_language?: string;
}

export interface TranslationResponse {
  translated_text: string;
  source_language: string;
  target_language: string;
  confidence_score?: number;
  processing_time?: number;
}

export interface LanguageDetectionRequest {
  text: string;
}

export interface LanguageDetectionResponse {
  detected_language: string;
  confidence_score: number;
  processing_time?: number;
}

export interface Language {
  name: string;
  native_name: string;
  region: string;
  script: string;
}

export interface LanguagesResponse {
  languages: Record<string, Language>;
  total_count: number;
}

// UI State Types
export interface TranslationState {
  isLoading: boolean;
  result: TranslationResponse | null;
  error: string | null;
  history: TranslationHistoryItem[];
}

export interface TranslationHistoryItem {
  id: string;
  timestamp: number;
  request: TranslationRequest;
  response: TranslationResponse;
}

// API Error Types
export interface APIError {
  detail: string;
  status_code?: number;
  error_type?: string;
}

// Translation Mode Types
export type TranslationMode = 'translate' | 'chat';

// Message Types for InputArea
export interface TranslationMessage {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  file?: File;
}

export interface ChatMessage {
  text: string;
  file?: File;
}

// Simple message structure following React chatbot best practices
export interface SimpleChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  error?: boolean;
  // For translation messages, include additional data
  translationData?: {
    sourceText: string;
    sourceLanguage: string;
    targetLanguage: string;
    translatedText?: string;
  };
}
