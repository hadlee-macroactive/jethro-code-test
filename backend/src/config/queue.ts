import Queue from 'bull';
import { logger } from './logger';
import { isRedisAvailable } from './redis';

let streakQueue: Queue.Queue | null = null;

export async function initQueue(): Promise<Queue.Queue | null> {
  if (!isRedisAvailable()) {
    logger.warn('Redis not available - background jobs disabled');
    return null;
  }

  try {
    streakQueue = new Queue('streaks-badges', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined
      },
      prefix: 'streaks-badges'
    });

    streakQueue.on('error', (error) => {
      logger.error('Queue error', error);
    });

    streakQueue.on('failed', (job, error) => {
      logger.error(`Job ${job.id} failed`, error);
    });

    logger.info('Queue initialized');
    return streakQueue;
  } catch (error: any) {
    logger.warn('Queue initialization failed, background jobs disabled:', error.message);
    return null;
  }
}

export function getQueue(): Queue.Queue | null {
  return streakQueue;
}
