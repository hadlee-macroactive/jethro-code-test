jest.mock('../../../src/services/leaderboard.service');
jest.mock('../../../src/config/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

import { leaderboardRefreshJob } from '../../../src/jobs/leaderboard-refresh.job';
import { LeaderboardService } from '../../../src/services/leaderboard.service';

describe('leaderboardRefreshJob', () => {
  let leaderboardServiceInstance: any;

  beforeEach(() => {
    leaderboardServiceInstance = {
      refreshLeaderboard: jest.fn()
    };
    (LeaderboardService as any).mockImplementation(() => leaderboardServiceInstance);
  });

  it('should refresh leaderboard with job data', async () => {
    const job = { data: { creatorId: 100, leaderboardType: 'weekly' } } as any;
    const result = await leaderboardRefreshJob(job);
    expect(leaderboardServiceInstance.refreshLeaderboard).toHaveBeenCalledWith(100, 'weekly');
    expect(result.refreshed).toBe(true);
  });

  it('should skip when no creatorId in job data', async () => {
    const job = { data: {} } as any;
    const result = await leaderboardRefreshJob(job);
    expect(leaderboardServiceInstance.refreshLeaderboard).not.toHaveBeenCalled();
    expect(result.refreshed).toBe(true);
  });

  it('should re-throw errors', async () => {
    leaderboardServiceInstance.refreshLeaderboard.mockRejectedValue(new Error('Refresh error'));
    const job = { data: { creatorId: 100, leaderboardType: 'weekly' } } as any;
    await expect(leaderboardRefreshJob(job)).rejects.toThrow('Refresh error');
  });
});
