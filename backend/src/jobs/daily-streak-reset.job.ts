import { Job } from 'bull';
import { StreakService } from '../services/streak.service';
import { logger } from '../config/logger';
import { shouldBreakStreak } from '../utils/streak.utils';

export async function dailyStreakResetJob(_job: Job) {
  logger.info('Starting daily streak reset job');

  const streakService = new StreakService();
  const brokenCount = { withFreeze: 0, withoutFreeze: 0 };

  try {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    yesterday.setUTCHours(23, 59, 59, 999);

    const streaksToCheck = await streakService.getStreaksNeedingCheck(yesterday);

    for (const streak of streaksToCheck) {
      const freezeUsed = await streakService.hasFreezeForDate(
        streak.userId,
        streak.creatorId,
        streak.streakType,
        new Date()
      );

      if (!freezeUsed && shouldBreakStreak(streak.lastActivityDate)) {
        await streakService.breakStreak(streak.id);
        brokenCount.withoutFreeze++;
      } else if (freezeUsed) {
        brokenCount.withFreeze++;
      }
    }

    logger.info('Daily streak reset completed', {
      totalChecked: streaksToCheck.length,
      broken: brokenCount.withoutFreeze,
      frozen: brokenCount.withFreeze
    });

    return { totalChecked: streaksToCheck.length, broken: brokenCount };

  } catch (error) {
    logger.error('Daily streak reset failed', error);
    throw error;
  }
}
