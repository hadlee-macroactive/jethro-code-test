import Queue from 'bull';
import { dailyStreakResetJob } from './daily-streak-reset.job';
import { streakEvaluationJob } from './streak-evaluation.job';
import { badgeProgressJob } from './badge-progress.job';
import { leaderboardRefreshJob } from './leaderboard-refresh.job';
import { atRiskCheckJob } from './at-risk-check.job';
import { notificationQueueJob } from './notification-queue.job';
import { logger } from '../config/logger';

export async function registerJobs(queue: Queue.Queue) {
  // Daily streak reset - runs at midnight UTC
  queue.process('daily-streak-reset', dailyStreakResetJob);

  // Streak evaluation - runs every 6 hours
  queue.process('streak-evaluation', streakEvaluationJob);

  // Badge progress update - runs every hour
  queue.process('badge-progress', badgeProgressJob);

  // Leaderboard refresh - runs every hour
  queue.process('leaderboard-refresh', leaderboardRefreshJob);

  // At-risk notification check - runs every 2 hours
  queue.process('at-risk-check', atRiskCheckJob);

  // Notification queue processor
  queue.process('notification-queue', notificationQueueJob);

  // Schedule recurring jobs
  const isWorker = process.env.WORKER_MODE === 'true';

  if (!isWorker) {
    // Only schedule from main process
    queue.add('daily-streak-reset', {}, {
      repeat: { cron: '0 0 * * *' }, // Daily at midnight UTC
      removeOnComplete: true
    });

    queue.add('streak-evaluation', {}, {
      repeat: { cron: '0 */6 * * *' }, // Every 6 hours
      removeOnComplete: true
    });

    queue.add('badge-progress', {}, {
      repeat: { cron: '0 * * * *' }, // Every hour
      removeOnComplete: true
    });

    queue.add('at-risk-check', {}, {
      repeat: { cron: '0 */2 * * *' }, // Every 2 hours
      removeOnComplete: true
    });
  }

  logger.info('Background jobs registered');
}
