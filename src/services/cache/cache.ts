import LRUCacheService from "@/services/cache/providers/lruCacheService";
import RedisCacheService from "@/services/cache/providers/redisCacheService";

export interface CacheService {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

let cacheSingleton: CacheService | null = null;

export function useCache(): CacheService {
  const cacheProvider = process.env.CACHE_PROVIDER;

  if (cacheSingleton) {
    return cacheSingleton;
  }

  if (cacheProvider === "redis") {
    cacheSingleton = new RedisCacheService();
  } else {
    cacheSingleton = new LRUCacheService();
  }
  return cacheSingleton;
}
