// redis-cache.service.ts
import { CacheService } from "@/services/cache/cache";
import { createClient } from "redis";

export default class RedisCacheService implements CacheService {
  private client;

  constructor() {
    this.client = createClient({
      socket: {
        port: 6379,
        host: process.env.REDIS_ADDRESS
          ? process.env.REDIS_ADDRESS
          : "localhost",
      },
    });

    this.client.connect();
  }

  async get(key: string): Promise<any> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const stringValue = JSON.stringify(value);
    if (ttl) {
      await this.client.setEx(key, ttl, stringValue);
    } else {
      await this.client.set(key, stringValue);
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
}
