import { getRedisClient } from '../config/redis';
import { logger } from '../config/logger';

export class CacheService {
  private redis() {
    return getRedisClient();
  }

  async get(key: string): Promise<unknown> {
    try {
      const client = this.redis();
      if (!client) return null;
      const value = await client.get(key);
      if (!value) return null;
      return JSON.parse(value);
    } catch (error) {
      logger.error(`Cache get error for key: ${key}`, error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      const client = this.redis();
      if (!client) return;
      const str = JSON.stringify(value);
      if (ttl) {
        await client.setex(key, ttl, str);
      } else {
        await client.set(key, str);
      }
    } catch (error) {
      logger.error(`Cache set error for key: ${key}`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      const client = this.redis();
      if (!client) return;
      await client.del(key);
    } catch (error) {
      logger.error(`Cache del error for key: ${key}`, error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const client = this.redis();
      if (!client) return;
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch (error) {
      logger.error(`Cache delPattern error for: ${pattern}`, error);
    }
  }

  async invalidateUser(userId: number): Promise<void> {
    await this.delPattern(`streaks:${userId}:*`);
    await this.delPattern(`badges:${userId}:*`);
    await this.delPattern(`leaderboard:${userId}:*`);
  }

  async invalidateCreator(creatorId: number): Promise<void> {
    await this.delPattern(`badge_catalog:${creatorId}:*`);
    await this.delPattern(`leaderboard:creator:${creatorId}:*`);
  }
}
