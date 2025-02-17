import { CacheService } from "@/services/cache/cache";
import { LRUCache as LRU } from "lru-cache";

export default class LRUCacheService implements CacheService {
  private cache: LRU<string, any>;

  constructor(maxAge: number = 86400) {
    this.cache = new LRU({
      ttl: maxAge,
      max: 1000,
    });
  }

  async get(key: string): Promise<any> {
    return this.cache.get(key);
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    this.cache.set(key, value, {
      ttl,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }
}
