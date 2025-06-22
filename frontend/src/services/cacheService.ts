// Cache Service - Frontend Caching Best Practices Implementation

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  version?: string; // For cache versioning
}

interface CacheConfig {
  defaultTTL: number;
  maxMemoryItems: number;
  enablePersistence: boolean;
  version: string;
}

type CacheStorage = 'memory' | 'localStorage' | 'sessionStorage';

class CacheService {
  private memoryCache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes default
      maxMemoryItems: 100,
      enablePersistence: true,
      version: '1.0.0',
      ...config
    };

    // Clean up expired items on initialization
    this.cleanup();

    // Set up periodic cleanup (every 5 minutes)
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Set cache item with TTL and storage type
   */
  set<T>(
    key: string,
    data: T,
    options: {
      ttl?: number;
      storage?: CacheStorage;
      version?: string;
    } = {}
  ): void {
    const {
      ttl = this.config.defaultTTL,
      storage = 'memory',
      version = this.config.version
    } = options;

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version
    };

    try {
      switch (storage) {
        case 'memory':
          this.setMemoryCache(key, cacheItem);
          break;
        case 'localStorage':
          if (this.config.enablePersistence) {
            localStorage.setItem(this.getCacheKey(key), JSON.stringify(cacheItem));
          }
          break;
        case 'sessionStorage':
          sessionStorage.setItem(this.getCacheKey(key), JSON.stringify(cacheItem));
          break;
      }
    } catch (error) {
      console.warn(`Cache set failed for key ${key}:`, error);
      // Fallback to memory cache
      if (storage !== 'memory') {
        this.setMemoryCache(key, cacheItem);
      }
    }
  }

  /**
   * Get cache item with automatic expiration check
   */
  get<T>(key: string, storage: CacheStorage = 'memory'): T | null {
    try {
      let cacheItem: CacheItem<T> | null = null;

      switch (storage) {
        case 'memory':
          cacheItem = this.memoryCache.get(key) || null;
          break;
        case 'localStorage':
          const localData = localStorage.getItem(this.getCacheKey(key));
          cacheItem = localData ? JSON.parse(localData) : null;
          break;
        case 'sessionStorage':
          const sessionData = sessionStorage.getItem(this.getCacheKey(key));
          cacheItem = sessionData ? JSON.parse(sessionData) : null;
          break;
      }

      if (!cacheItem) return null;

      // Check if cache is expired
      if (this.isExpired(cacheItem)) {
        this.delete(key, storage);
        return null;
      }

      // Check version compatibility
      if (cacheItem.version && cacheItem.version !== this.config.version) {
        this.delete(key, storage);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn(`Cache get failed for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete cache item
   */
  delete(key: string, storage: CacheStorage = 'memory'): void {
    try {
      switch (storage) {
        case 'memory':
          this.memoryCache.delete(key);
          break;
        case 'localStorage':
          localStorage.removeItem(this.getCacheKey(key));
          break;
        case 'sessionStorage':
          sessionStorage.removeItem(this.getCacheKey(key));
          break;
      }
    } catch (error) {
      console.warn(`Cache delete failed for key ${key}:`, error);
    }
  }

  /**
   * Clear all cache for a specific storage type
   */
  clear(storage: CacheStorage = 'memory'): void {
    try {
      switch (storage) {
        case 'memory':
          this.memoryCache.clear();
          break;
        case 'localStorage':
          this.clearStorageByPrefix(localStorage);
          break;
        case 'sessionStorage':
          this.clearStorageByPrefix(sessionStorage);
          break;
      }
    } catch (error) {
      console.warn(`Cache clear failed for storage ${storage}:`, error);
    }
  }

  /**
   * Get or set pattern - fetch data if not cached
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: number;
      storage?: CacheStorage;
      version?: string;
    } = {}
  ): Promise<T> {
    const cached = this.get<T>(key, options.storage);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, options);
    return data;
  }

  /**
   * Check if cache item exists and is valid
   */
  has(key: string, storage: CacheStorage = 'memory'): boolean {
    return this.get(key, storage) !== null;
  }



  /**
   * Private helper methods
   */
  private setMemoryCache<T>(key: string, cacheItem: CacheItem<T>): void {
    // Implement LRU eviction if memory cache is full
    if (this.memoryCache.size >= this.config.maxMemoryItems) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }
    this.memoryCache.set(key, cacheItem);
  }

  private isExpired<T>(cacheItem: CacheItem<T>): boolean {
    return Date.now() - cacheItem.timestamp > cacheItem.ttl;
  }

  private getCacheKey(key: string): string {
    return `sema_cache_${key}`;
  }

  private clearStorageByPrefix(storage: Storage): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith('sema_cache_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => storage.removeItem(key));
  }



  private cleanup(): void {
    // Clean memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (this.isExpired(item)) {
        this.memoryCache.delete(key);
      }
    }

    // Clean localStorage
    this.cleanupStorage(localStorage);

    // Clean sessionStorage
    this.cleanupStorage(sessionStorage);
  }

  private cleanupStorage(storage: Storage): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith('sema_cache_')) {
          const data = storage.getItem(key);
          if (data) {
            const cacheItem = JSON.parse(data);
            if (this.isExpired(cacheItem) ||
                (cacheItem.version && cacheItem.version !== this.config.version)) {
              keysToRemove.push(key);
            }
          }
        }
      }
      keysToRemove.forEach(key => storage.removeItem(key));
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }
}

// Create singleton instance
export const cacheService = new CacheService({
  defaultTTL: 30 * 60 * 1000, // 30 minutes for languages
  maxMemoryItems: 200,
  enablePersistence: true,
  version: '1.0.0'
});

// Export class for testing
export { CacheService };
