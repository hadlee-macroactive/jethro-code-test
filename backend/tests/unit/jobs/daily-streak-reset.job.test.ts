jest.mock('../../../src/services/streak.service');
jest.mock('../../../src/config/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));
jest.mock('../../../src/utils/streak.utils', () => ({
  shouldBreakStreak: jest.fn()
}));

import { dailyStreakResetJob } from '../../../src/jobs/daily-streak-reset.job';
import { StreakService } from '../../../src/services/streak.service';
import { shouldBreakStreak } from '../../../src/utils/streak.utils';
import { Streak, StreakType } from '../../../src/types/streak.types';

const makeStreak = (overrides: Partial<Streak> = {}): Streak => ({
  id: 'streak-1',
  userId: 1,
  creatorId: 100,
  streakType: StreakType.WORKOUT,
  currentCount: 5,
  longestCount: 10,
  lastActivityDate: new Date('2024-01-01'),
  streakStartDate: new Date('2024-01-01'),
  isActive: true,
  nextMilestone: 7,
  milestoneProgress: 71,
  freezeAvailable: true,
  freezeUsedCount: 0,
  freezeLastUsed: null,
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

describe('dailyStreakResetJob', () => {
  let streakServiceInstance: any;

  beforeEach(() => {
    streakServiceInstance = {
      getStreaksNeedingCheck: jest.fn(),
      hasFreezeForDate: jest.fn(),
      breakStreak: jest.fn()
    };
    (StreakService as any).mockImplementation(() => streakServiceInstance);
  });

  it('should break streaks that need resetting without freeze', async () => {
    const streak = makeStreak();
    streakServiceInstance.getStreaksNeedingCheck.mockResolvedValue([streak]);
    streakServiceInstance.hasFreezeForDate.mockResolvedValue(false);
    (shouldBreakStreak as jest.Mock).mockReturnValue(true);

    const result = await dailyStreakResetJob({} as any);

    expect(streakServiceInstance.breakStreak).toHaveBeenCalledWith('streak-1');
    expect(result.broken.withoutFreeze).toBe(1);
  });

  it('should not break streaks with freeze', async () => {
    const streak = makeStreak();
    streakServiceInstance.getStreaksNeedingCheck.mockResolvedValue([streak]);
    streakServiceInstance.hasFreezeForDate.mockResolvedValue(true);

    const result = await dailyStreakResetJob({} as any);

    expect(streakServiceInstance.breakStreak).not.toHaveBeenCalled();
    expect(result.broken.withFreeze).toBe(1);
  });

  it('should handle empty streak list', async () => {
    streakServiceInstance.getStreaksNeedingCheck.mockResolvedValue([]);
    const result = await dailyStreakResetJob({} as any);
    expect(result.totalChecked).toBe(0);
  });

  it('should re-throw errors', async () => {
    streakServiceInstance.getStreaksNeedingCheck.mockRejectedValue(new Error('DB error'));
    await expect(dailyStreakResetJob({} as any)).rejects.toThrow('DB error');
  });
});
