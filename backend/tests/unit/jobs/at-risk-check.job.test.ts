jest.mock('../../../src/services/streak.service');
jest.mock('../../../src/services/notification.service');
jest.mock('../../../src/config/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

import { atRiskCheckJob } from '../../../src/jobs/at-risk-check.job';
import { StreakService } from '../../../src/services/streak.service';
import { NotificationService } from '../../../src/services/notification.service';
import { Streak, StreakType } from '../../../src/types/streak.types';

const makeAtRiskStreak = (overrides: Partial<Streak> = {}): Streak => ({
  id: 'streak-1',
  userId: 1,
  creatorId: 100,
  streakType: StreakType.WORKOUT,
  currentCount: 5,
  longestCount: 10,
  lastActivityDate: new Date(Date.now() - 20 * 60 * 60 * 1000),
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
  hoursUntilBreak: 4,
  ...overrides
});

describe('atRiskCheckJob', () => {
  let streakServiceInstance: any;
  let notificationServiceInstance: any;

  beforeEach(() => {
    streakServiceInstance = {
      getAtRiskStreaks: jest.fn()
    };
    notificationServiceInstance = {
      sendStreakAtRisk: jest.fn()
    };
    (StreakService as any).mockImplementation(() => streakServiceInstance);
    (NotificationService as any).mockImplementation(() => notificationServiceInstance);
  });

  it('should send notifications for all at-risk streaks', async () => {
    const streaks = [
      makeAtRiskStreak({ id: 's1', userId: 1 }),
      makeAtRiskStreak({ id: 's2', userId: 2 })
    ];
    streakServiceInstance.getAtRiskStreaks.mockResolvedValue(streaks);

    const result = await atRiskCheckJob({} as any);

    expect(notificationServiceInstance.sendStreakAtRisk).toHaveBeenCalledTimes(2);
    expect(result.notified).toBe(2);
  });

  it('should handle no at-risk streaks', async () => {
    streakServiceInstance.getAtRiskStreaks.mockResolvedValue([]);
    const result = await atRiskCheckJob({} as any);
    expect(result.notified).toBe(0);
    expect(notificationServiceInstance.sendStreakAtRisk).not.toHaveBeenCalled();
  });

  it('should re-throw errors', async () => {
    streakServiceInstance.getAtRiskStreaks.mockRejectedValue(new Error('Service error'));
    await expect(atRiskCheckJob({} as any)).rejects.toThrow('Service error');
  });
});
