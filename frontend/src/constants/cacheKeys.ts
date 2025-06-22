// Cache Keys - Centralized cache key management

// Unicode-safe hash function for cache keys
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

export const CACHE_KEYS = {
  // Language-related caches
  LANGUAGES_ALL: 'languages_all',
  LANGUAGES_POPULAR: 'languages_popular',
  LANGUAGES_BY_REGION: (region: string) => `languages_region_${region}`,
  LANGUAGE_SEARCH: (query: string) => `languages_search_${query.toLowerCase()}`,

  // Translation caches
  TRANSLATION: (text: string, source: string, target: string) =>
    `translation_${simpleHash(text)}_${source}_${target}`,
  LANGUAGE_DETECTION: (text: string) =>
    `detection_${simpleHash(text)}`,

  // API health and status
  API_STATUS: 'api_status'
} as const;

// Cache TTL configurations (in milliseconds)
export const CACHE_TTL = {
  // Long-term caches (rarely change)
  LANGUAGES: 24 * 60 * 60 * 1000, // 24 hours

  // Medium-term caches
  TRANSLATIONS: 60 * 60 * 1000, // 1 hour
  LANGUAGE_DETECTION: 30 * 60 * 1000, // 30 minutes

  // Short-term caches
  API_STATUS: 5 * 60 * 1000 // 5 minutes
} as const;

// Cache storage type configurations
export const CACHE_STORAGE = {
  // Persistent storage (survives browser restart)
  LANGUAGES: 'localStorage' as const,

  // Session storage (survives page refresh, not browser restart)
  TRANSLATIONS: 'sessionStorage' as const,
  LANGUAGE_DETECTION: 'sessionStorage' as const,

  // Memory storage (fastest, but lost on page refresh)
  API_STATUS: 'memory' as const
} as const;
