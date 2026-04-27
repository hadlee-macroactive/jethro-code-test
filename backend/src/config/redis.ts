import Redis from 'ioredis';
import { logger } from './logger';

let redisClient: Redis | null = null;
let redisAvailable = false;

export function getRedisClient(): Redis | null {
  if (!redisAvailable) return null;
  return redisClient;
}

export function isRedisAvailable(): boolean {
  return redisAvailable;
}

export async function connectRedis(): Promise<boolean> {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
      tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
      retryStrategy(times) {
        if (times > 3) {
          logger.warn('Redis connection failed after 3 retries, continuing without cache');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      redisAvailable = true;
      logger.info('Redis connected');
    });
    redisClient.on('error', (err) => {
      redisAvailable = false;
      logger.warn('Redis unavailable - running without cache', err.message);
    });

    await redisClient.connect();
    await redisClient.ping();
    redisAvailable = true;
    return true;
  } catch (error: any) {
    logger.warn('Redis not available, continuing without cache:', error.message);
    redisAvailable = false;
    return false;
  }
}

export async function disconnectRedis() {
  if (redisClient) {
    await redisClient.quit().catch(() => {});
    redisClient = null;
    redisAvailable = false;
  }
}
