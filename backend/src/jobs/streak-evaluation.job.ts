import { Job } from 'bull';
import { StreakService } from '../services/streak.service';
import { logger } from '../config/logger';

export async function streakEvaluationJob(_job: Job) {
  logger.info('Starting streak evaluation job');

  const streakService = new StreakService();

  try {
    const atRiskStreaks = await streakService.getAtRiskStreaks();

    logger.info(`Found ${atRiskStreaks.length} at-risk streaks`);

    return { atRiskCount: atRiskStreaks.length };
  } catch (error) {
    logger.error('Streak evaluation failed', error);
    throw error;
  }
}
