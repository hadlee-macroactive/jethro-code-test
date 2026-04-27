import { LeaderboardService } from '../../../src/services/leaderboard.service';

jest.mock('../../../src/db/client', () => ({
  __esModule: true,
  default: {
    leaderboard: {
      findFirst: jest.fn()
    }
  }
}));

jest.mock('../../../src/services/cache.service');
jest.mock('../../../src/config/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

import prisma from '../../../src/db/client';
import { CacheService } from '../../../src/services/cache.service';

describe('LeaderboardService', () => {
  let service: LeaderboardService;
  let cacheInstance: any;

  beforeEach(() => {
    cacheInstance = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      del: jest.fn()
    };
    (CacheService as any).mockImplementation(() => cacheInstance);
    service = new LeaderboardService();
  });

  describe('getLeaderboard', () => {
    it('should return cached leaderboard when available', async () => {
      const cached = { leaderboardType: 'weekly', entries: [] };
      cacheInstance.get.mockResolvedValue(cached);

      const result = await service.getLeaderboard(100, 'weekly');
      expect(result).toEqual(cached);
      expect(prisma.leaderboard.findFirst).not.toHaveBeenCalled();
    });

    it('should return empty structure when no leaderboard found', async () => {
      (prisma.leaderboard.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.getLeaderboard(100, 'weekly');
      expect(result).toEqual({
        leaderboardType: 'weekly',
        periodStart: null,
        periodEnd: null,
        entries: [],
        currentUser: null
      });
    });

    it('should fetch and cache leaderboard from DB', async () => {
      const dbLeaderboard = {
        periodStart: new Date('2024-01-15'),
        periodEnd: new Date('2024-01-22'),
        entries: [{ userId: 1, rank: 1, score: 100 }],
        lastRefreshed: new Date()
      };
      (prisma.leaderboard.findFirst as jest.Mock).mockResolvedValue(dbLeaderboard);

      const result = await service.getLeaderboard(100, 'weekly');

      expect(result.entries).toHaveLength(1);
      expect(cacheInstance.set).toHaveBeenCalledWith(
        'leaderboard:100:weekly:current',
        expect.anything(),
        300
      );
    });

    it('should filter by periodStart when provided', async () => {
      (prisma.leaderboard.findFirst as jest.Mock).mockResolvedValue(null);

      await service.getLeaderboard(100, 'weekly', '2024-01-15');

      expect(prisma.leaderboard.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            periodStart: { gte: new Date('2024-01-15') }
          })
        })
      );
    });
  });

  describe('refreshLeaderboard', () => {
    it('should complete without error', async () => {
      await expect(
        service.refreshLeaderboard(100, 'weekly')
      ).resolves.toBeUndefined();
    });
  });
});
