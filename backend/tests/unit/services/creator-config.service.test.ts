import { CreatorConfigService } from '../../../src/services/creator-config.service';

jest.mock('../../../src/db/client', () => ({
  __esModule: true,
  default: {
    creatorConfiguration: {
      findUnique: jest.fn(),
      upsert: jest.fn()
    }
  }
}));

jest.mock('../../../src/services/cache.service');
jest.mock('../../../src/config/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

import prisma from '../../../src/db/client';
import { CacheService } from '../../../src/services/cache.service';

describe('CreatorConfigService', () => {
  let service: CreatorConfigService;
  let cacheInstance: any;

  beforeEach(() => {
    cacheInstance = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      del: jest.fn()
    };
    (CacheService as any).mockImplementation(() => cacheInstance);
    service = new CreatorConfigService();
  });

  describe('getConfig', () => {
    it('should return defaults when no config exists', async () => {
      (prisma.creatorConfiguration.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.getConfig(100);

      expect(result.creatorId).toBe(100);
      expect(result.featureFlags.streaksEnabled).toBe(true);
      expect(result.featureFlags.badgesEnabled).toBe(true);
    });

    it('should return cached config', async () => {
      const cachedConfig = { creatorId: 100, streakSettings: {} };
      cacheInstance.get.mockResolvedValue(cachedConfig);

      const result = await service.getConfig(100);
      expect(result).toEqual(cachedConfig);
      expect(prisma.creatorConfiguration.findUnique).not.toHaveBeenCalled();
    });

    it('should return config from DB and cache it', async () => {
      const dbConfig = {
        id: 'config-1',
        creatorId: BigInt(100),
        streakSettings: { freezeEnabled: true },
        badgeSettings: {},
        leaderboardSettings: {},
        notificationSettings: {},
        featureFlags: { streaksEnabled: true },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      (prisma.creatorConfiguration.findUnique as jest.Mock).mockResolvedValue(dbConfig);

      const result = await service.getConfig(100) as any;

      expect(result.creatorId).toBe(100);
      expect(result.streakSettings).toEqual({ freezeEnabled: true });
      expect(cacheInstance.set).toHaveBeenCalledWith(
        'creator_config:100',
        expect.anything(),
        600
      );
    });
  });

  describe('updateConfig', () => {
    it('should upsert config and invalidate cache', async () => {
      (prisma.creatorConfiguration.upsert as jest.Mock).mockResolvedValue({
        id: 'config-1',
        creatorId: BigInt(100)
      });

      await service.updateConfig(100, {
        streakSettings: { freezeEnabled: false }
      });

      expect(prisma.creatorConfiguration.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { creatorId: BigInt(100) },
          update: expect.objectContaining({
            streakSettings: { freezeEnabled: false }
          })
        })
      );
      expect(cacheInstance.del).toHaveBeenCalledWith('creator_config:100');
    });
  });
});
