import {
  TranslationRequest,
  TranslationResponse,
  LanguageDetectionRequest,
  LanguageDetectionResponse,
  LanguagesResponse,
  APIError
} from '../types/translation';
import { cacheService } from './cacheService';
import { CACHE_KEYS, CACHE_TTL, CACHE_STORAGE } from '../constants/cacheKeys';

class TranslationAPIService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || '';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    console.log('🚀 [API] Making request:', {
      url,
      method: options.method || 'GET',
      hasBody: !!options.body,
      bodyPreview: options.body ? JSON.stringify(JSON.parse(options.body as string)).substring(0, 200) : 'none'
    });

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      console.log('📥 [API] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorData: APIError = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
          status_code: response.status
        }));

        console.error('❌ [API] Request failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });

        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      console.log('✅ [API] Response data:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ [API] Request error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Translation Methods
  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const endpoint = '/api/v1/translate';

    console.log('🌐 [TranslationAPI] Starting API call:', {
      endpoint,
      request: {
        text: request.text.substring(0, 100) + (request.text.length > 100 ? '...' : ''),
        source_language: request.source_language || 'auto',
        target_language: request.target_language,
        textLength: request.text.length
      }
    });

    // Validate request
    if (!request.text || !request.text.trim()) {
      console.error('❌ [TranslationAPI] Validation failed: Empty text');
      throw new Error('Text cannot be empty');
    }

    if (!request.target_language) {
      console.error('❌ [TranslationAPI] Validation failed: No target language');
      throw new Error('Target language is required');
    }

    console.log('✅ [TranslationAPI] Request validation passed');

    // Check cache first
    const cacheKey = CACHE_KEYS.TRANSLATION(
      request.text,
      request.source_language || 'auto',
      request.target_language
    );

    console.log('🗄️ [TranslationAPI] Checking cache with key:', cacheKey);

    return cacheService.getOrSet(
      cacheKey,
      async () => {
        console.log('📡 [TranslationAPI] Cache miss, making HTTP request...');
        const response = await this.makeRequest<TranslationResponse>(endpoint, {
          method: 'POST',
          body: JSON.stringify(request),
        });
        console.log('📡 [TranslationAPI] HTTP response received:', response);
        return response;
      },
      {
        ttl: CACHE_TTL.TRANSLATIONS,
        storage: CACHE_STORAGE.TRANSLATIONS
      }
    );
  }

  async detectLanguage(request: LanguageDetectionRequest): Promise<LanguageDetectionResponse> {
    const endpoint = '/api/v1/detect-language';

    if (!request.text || !request.text.trim()) {
      throw new Error('Text cannot be empty');
    }

    // Check cache first
    const cacheKey = CACHE_KEYS.LANGUAGE_DETECTION(request.text);

    return cacheService.getOrSet(
      cacheKey,
      () => this.makeRequest<LanguageDetectionResponse>(endpoint, {
        method: 'POST',
        body: JSON.stringify(request),
      }),
      {
        ttl: CACHE_TTL.LANGUAGE_DETECTION,
        storage: CACHE_STORAGE.LANGUAGE_DETECTION
      }
    );
  }

  // Language Information Methods
  async getAllLanguages(): Promise<LanguagesResponse> {
    return cacheService.getOrSet(
      CACHE_KEYS.LANGUAGES_ALL,
      () => this.makeRequest<LanguagesResponse>('/api/v1/languages'),
      {
        ttl: CACHE_TTL.LANGUAGES,
        storage: CACHE_STORAGE.LANGUAGES
      }
    );
  }

  async getPopularLanguages(): Promise<LanguagesResponse> {
    return cacheService.getOrSet(
      CACHE_KEYS.LANGUAGES_POPULAR,
      () => this.makeRequest<LanguagesResponse>('/api/v1/languages/popular'),
      {
        ttl: CACHE_TTL.LANGUAGES,
        storage: CACHE_STORAGE.LANGUAGES
      }
    );
  }

  async getLanguagesByRegion(region: string): Promise<LanguagesResponse> {
    const cacheKey = CACHE_KEYS.LANGUAGES_BY_REGION(region);

    return cacheService.getOrSet(
      cacheKey,
      () => this.makeRequest<LanguagesResponse>(`/api/v1/languages/region/${region}`),
      {
        ttl: CACHE_TTL.LANGUAGES,
        storage: CACHE_STORAGE.LANGUAGES
      }
    );
  }

  async searchLanguages(query: string): Promise<LanguagesResponse> {
    if (query.length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }

    const cacheKey = CACHE_KEYS.LANGUAGE_SEARCH(query);

    return cacheService.getOrSet(
      cacheKey,
      () => this.makeRequest<LanguagesResponse>(`/api/v1/languages/search?q=${encodeURIComponent(query)}`),
      {
        ttl: CACHE_TTL.LANGUAGES,
        storage: CACHE_STORAGE.LANGUAGES
      }
    );
  }

  // Health Check
  async checkHealth(): Promise<{ status: string }> {
    return cacheService.getOrSet(
      CACHE_KEYS.API_STATUS,
      () => this.makeRequest<{ status: string }>('/status'),
      {
        ttl: CACHE_TTL.API_STATUS,
        storage: CACHE_STORAGE.API_STATUS
      }
    );
  }

  // Utility Methods
  isValidLanguageCode(code: string): boolean {
    // Basic validation for FLORES-200 format
    return /^[a-z]{3}_[A-Z][a-z]{3}$/.test(code) || code === 'auto';
  }

  formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }


}

// Create singleton instance
export const translationAPI = new TranslationAPIService();

// Export class for testing
export { TranslationAPIService };
