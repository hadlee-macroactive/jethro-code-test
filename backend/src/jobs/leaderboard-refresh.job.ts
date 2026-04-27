import { Job } from 'bull';
import { LeaderboardService } from '../services/leaderboard.service';
import { logger } from '../config/logger';

export async function leaderboardRefreshJob(job: Job) {
  logger.info('Starting leaderboard refresh job');

  const leaderboardService = new LeaderboardService();

  try {
    const { creatorId, leaderboardType } = job.data;

    if (creatorId && leaderboardType) {
      await leaderboardService.refreshLeaderboard(creatorId, leaderboardType);
    }

    logger.info('Leaderboard refresh completed');

    return { refreshed: true };
  } catch (error) {
    logger.error('Leaderboard refresh failed', error);
    throw error;
  }
}
