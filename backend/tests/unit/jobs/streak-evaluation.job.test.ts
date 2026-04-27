jest.mock('../../../src/services/streak.service');
jest.mock('../../../src/config/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

import { streakEvaluationJob } from '../../../src/jobs/streak-evaluation.job';
import { StreakService } from '../../../src/services/streak.service';

describe('streakEvaluationJob', () => {
  let streakServiceInstance: any;

  beforeEach(() => {
    streakServiceInstance = {
      getAtRiskStreaks: jest.fn()
    };
    (StreakService as any).mockImplementation(() => streakServiceInstance);
  });

  it('should return count of at-risk streaks', async () => {
    streakServiceInstance.getAtRiskStreaks.mockResolvedValue([{}, {}, {}]);
    const result = await streakEvaluationJob({} as any);
    expect(result.atRiskCount).toBe(3);
  });

  it('should handle zero at-risk streaks', async () => {
    streakServiceInstance.getAtRiskStreaks.mockResolvedValue([]);
    const result = await streakEvaluationJob({} as any);
    expect(result.atRiskCount).toBe(0);
  });

  it('should re-throw errors', async () => {
    streakServiceInstance.getAtRiskStreaks.mockRejectedValue(new Error('Service error'));
    await expect(streakEvaluationJob({} as any)).rejects.toThrow('Service error');
  });
});
