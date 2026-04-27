import { Job } from 'bull';
import { StreakService } from '../services/streak.service';
import { NotificationService } from '../services/notification.service';
import { logger } from '../config/logger';

export async function atRiskCheckJob(_job: Job) {
  logger.info('Starting at-risk check job');

  const streakService = new StreakService();
  const notificationService = new NotificationService();

  try {
    const atRiskStreaks = await streakService.getAtRiskStreaks();

    for (const streak of atRiskStreaks) {
      const hoursRemaining = streak.hoursUntilBreak || 0;
      await notificationService.sendStreakAtRisk(streak, hoursRemaining);
    }

    logger.info(`At-risk notifications sent: ${atRiskStreaks.length}`);

    return { notified: atRiskStreaks.length };
  } catch (error) {
    logger.error('At-risk check failed', error);
    throw error;
  }
}
