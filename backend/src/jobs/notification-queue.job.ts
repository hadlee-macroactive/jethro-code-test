import { Job } from 'bull';
import { NotificationService } from '../services/notification.service';
import { logger } from '../config/logger';

export async function notificationQueueJob(job: Job) {
  logger.info('Processing notification queue job');

  const notificationService = new NotificationService();

  try {
    const { payloads } = job.data;

    if (payloads && Array.isArray(payloads)) {
      await notificationService.sendBatch(payloads);
    }

    logger.info('Notification queue job completed');

    return { processed: payloads?.length || 0 };
  } catch (error) {
    logger.error('Notification queue job failed', error);
    throw error;
  }
}
