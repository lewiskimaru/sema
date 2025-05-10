import apiClient from './apiClient'

interface TranslationRequest {
  text: string
  source_lang?: string
  target_lang: string
}

interface TranslationResponse {
  translated_text: string
  detected_source_lang?: string
  source_lang?: string
  target_lang: string
  model_used?: string
}

export const translateText = async (
  text: string,
  targetLang: string,
  sourceLang?: string
): Promise<TranslationResponse> => {
  try {
    const payload: TranslationRequest = {
      text,
      target_lang: targetLang,
    }

    // Only add source_lang if it's provided
    if (sourceLang) {
      payload.source_lang = sourceLang
    }

    const response = await apiClient.post<TranslationResponse>('/translate/text', payload)
    return response.data
  } catch (error) {
    console.error('Translation error:', error)
    throw error
  }
}

// Interface for language data
export interface Language {
  code: string
  name: string
  native_name?: string
  region?: string
  country?: string
}

// Interface for grouped languages by region
export interface LanguagesByRegion {
  [region: string]: Language[]
}

// Get all supported languages
export const getSupportedLanguages = async (): Promise<Language[]> => {
  try {
    const response = await apiClient.get<Language[]>('/languages')
    return response.data
  } catch (error) {
    console.error('Failed to fetch languages:', error)
    throw error
  }
}

// Get languages grouped by region
export const getLanguagesByRegion = async (): Promise<LanguagesByRegion> => {
  try {
    const response = await apiClient.get<LanguagesByRegion>('/languages/grouped')
    return response.data
  } catch (error) {
    console.error('Failed to fetch languages by region:', error)
    throw error
  }
}

// Detect language of a text
export const detectLanguage = async (text: string): Promise<{ detected_lang: string; confidence?: number }> => {
  try {
    const response = await apiClient.post('/detect-language', { text })
    return response.data
  } catch (error) {
    console.error('Language detection error:', error)
    throw error
  }
}

// Get translation history for authenticated user
export const getTranslationHistory = async (page = 1, limit = 10): Promise<any> => {
  try {
    const response = await apiClient.get(`/history/translations?page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch translation history:', error)
    throw error
  }
}

export default {
  translateText,
  getSupportedLanguages,
  getLanguagesByRegion,
  detectLanguage,
  getTranslationHistory,
} 