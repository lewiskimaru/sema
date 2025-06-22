import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheService } from '../services/cacheService';
import { CACHE_TTL, CACHE_STORAGE } from '../constants/cacheKeys';

type CacheStorage = 'memory' | 'localStorage' | 'sessionStorage';

interface UseCacheOptions {
  ttl?: number;
  storage?: CacheStorage;
  version?: string;
  refreshInterval?: number; // Auto-refresh interval in milliseconds
}

interface UseCacheReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * React hook for caching data with automatic refresh and state management
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions = {}
): UseCacheReturn<T> {
  const {
    ttl = CACHE_TTL.TRANSLATIONS,
    storage = 'memory',
    version
    // refreshInterval - not currently used but reserved for future auto-refresh functionality
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  // Fetch data from cache or API
  const fetchData = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      let result: T;

      if (forceRefresh) {
        // Force refresh: clear cache and fetch fresh data
        cacheService.delete(key, storage);
        result = await fetcher();
        cacheService.set(key, result, { ttl, storage, version });
      } else {
        // Try cache first, then fetch if needed
        result = await cacheService.getOrSet(
          key,
          fetcher,
          { ttl, storage, version }
        );
      }

      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);

      // Try to use cached data if available
      const cachedData = cacheService.get<T>(key, storage);
      if (cachedData) {
        setData(cachedData);
      }
    } finally {
      setIsLoading(false);
    }
  }, [key, ttl, storage, version]); // Removed fetcher from dependencies

  // Refresh data
  const refresh = useCallback(() => fetchData(true), [fetchData]);

  // Initial data fetch - use a ref to track if we've already fetched
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchData();
    }
  }, [key]); // Only depend on key, not fetchData



  return {
    data,
    isLoading,
    error,
    refresh
  };
}

/**
 * Hook for caching languages specifically
 */
export function useLanguageCache() {
  // Create a stable fetcher function
  const fetcher = useCallback(async () => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${apiUrl}/api/v1/languages`);
    if (!response.ok) throw new Error('Failed to fetch languages');
    return response.json();
  }, []);

  return useCache(
    'languages_all',
    fetcher,
    {
      ttl: CACHE_TTL.LANGUAGES,
      storage: CACHE_STORAGE.LANGUAGES
    }
  );
}


