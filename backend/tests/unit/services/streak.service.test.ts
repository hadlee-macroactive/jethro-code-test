import { StreakService } from '../../../src/services/streak.service';
import { StreakType, Streak } from '../../../src/types/streak.types';

// Mock all dependencies
jest.mock('../../../src/db/client', () => ({
  __esModule: true,
  default: {}
}));

jest.mock('../../../src/db/repositories/streak.repository');
jest.mock('../../../src/db/repositories/event.repository');
jest.mock('../../../src/services/badge.service');
jest.mock('../../../src/services/notification.service');
jest.mock('../../../src/services/cache.service');
jest.mock('../../../src/config/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

import { StreakRepository } from '../../../src/db/repositories/streak.repository';
import { EventRepository } from '../../../src/db/repositories/event.repository';
import { BadgeService } from '../../../src/services/badge.service';
import { NotificationService } from '../../../src/services/notification.service';
import { CacheService } from '../../../src/services/cache.service';

const mockStreakRepo = StreakRepository as jest.MockedClass<typeof StreakRepository>;
const mockEventRepo = EventRepository as jest.MockedClass<typeof EventRepository>;
const mockBadgeService = BadgeService as jest.MockedClass<typeof BadgeService>;
const mockNotificationService = NotificationService as jest.MockedClass<typeof NotificationService>;
const mockCacheService = CacheService as jest.MockedClass<typeof CacheService>;

const makeStreak = (overrides: Partial<Streak> = {}): Streak => ({
  id: 'streak-1',
  userId: 1,
  creatorId: 100,
  streakType: StreakType.WORKOUT,
  currentCount: 5,
  longestCount: 10,
  lastActivityDate: new Date(),
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

describe('StreakService', () => {
  let service: StreakService;
  let streakRepoInstance: jest.Mocked<StreakRepository>;
  let eventRepoInstance: jest.Mocked<EventRepository>;
  let badgeServiceInstance: jest.Mocked<BadgeService>;
  let notificationServiceInstance: jest.Mocked<NotificationService>;
  let cacheServiceInstance: jest.Mocked<CacheService>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock instances
    streakRepoInstance = {
      findByUserAndCreator: jest.fn(),
      findByUserAndType: jest.fn(),
      findById: jest.fn(),
      findActive: jest.fn(),
      findByCreatorAndType: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      createHistory: jest.fn(),
      createFreeze: jest.fn(),
      findFreezesForDate: jest.fn(),
      getHistory: jest.fn(),
      findStreaksNeedingReset: jest.fn()
    } as any;

    eventRepoInstance = {
      findBySourceId: jest.fn(),
      create: jest.fn(),
      findByUserAndDateRange: jest.fn()
    } as any;

    badgeServiceInstance = {
      updateProgressForStreak: jest.fn(),
      awardBadge: jest.fn(),
      getUserBadges: jest.fn(),
      getBadgeCatalog: jest.fn(),
      getBadgeDetail: jest.fn(),
      createCustomBadge: jest.fn(),
      processUserBadges: jest.fn()
    } as any;

    notificationServiceInstance = {
      sendStreakStarted: jest.fn(),
      sendStreakAtRisk: jest.fn(),
      sendMilestoneAchieved: jest.fn(),
      sendStreakBroken: jest.fn(),
      sendFreezeActivated: jest.fn(),
      sendBadgeEarned: jest.fn(),
      sendBadgeProgress: jest.fn(),
      sendBatch: jest.fn()
    } as any;

    cacheServiceInstance = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      del: jest.fn(),
      delPattern: jest.fn(),
      invalidateUser: jest.fn(),
      invalidateCreator: jest.fn()
    } as any;

    // Make constructors return our mock instances
    (mockStreakRepo as any).mockImplementation(() => streakRepoInstance);
    (mockEventRepo as any).mockImplementation(() => eventRepoInstance);
    (mockBadgeService as any).mockImplementation(() => badgeServiceInstance);
    (mockNotificationService as any).mockImplementation(() => notificationServiceInstance);
    (mockCacheService as any).mockImplementation(() => cacheServiceInstance);

    service = new StreakService();
  });

  describe('getUserStreaks', () => {
    it('should return streaks from cache if available', async () => {
      const cachedStreaks = [makeStreak()];
      cacheServiceInstance.get.mockResolvedValue(cachedStreaks);

      const result = await service.getUserStreaks(1, 100);

      expect(result).toEqual(cachedStreaks);
      expect(streakRepoInstance.findByUserAndCreator).not.toHaveBeenCalled();
    });

    it('should fetch from DB and cache when no cache hit', async () => {
      const dbStreaks = [makeStreak()];
      streakRepoInstance.findByUserAndCreator.mockResolvedValue(dbStreaks);

      const result = await service.getUserStreaks(1, 100);

      expect(streakRepoInstance.findByUserAndCreator).toHaveBeenCalledWith(1, 100);
      expect(cacheServiceInstance.set).toHaveBeenCalledWith(
        'streaks:1:100',
        expect.any(Array),
        300
      );
      expect(result).toHaveLength(1);
    });

    it('should enrich streaks with at-risk data', async () => {
      const oldStreak = makeStreak({
        lastActivityDate: new Date(Date.now() - 19 * 60 * 60 * 1000)
      });
      streakRepoInstance.findByUserAndCreator.mockResolvedValue([oldStreak]);

      const result = await service.getUserStreaks(1, 100);

      expect(result[0].isAtRisk).toBe(true);
    });
  });

  describe('processStreakEvent', () => {
    it('should return existing event data for duplicate events', async () => {
      eventRepoInstance.findBySourceId.mockResolvedValue({ id: 'evt-1' } as any);
      const existingStreak = makeStreak();
      streakRepoInstance.findByUserAndType.mockResolvedValue(existingStreak);

      const result = await service.processStreakEvent(
        1, 100, StreakType.WORKOUT, new Date(), 'api', 'src-1'
      );

      expect(result.isFirstActivity).toBe(false);
      expect(result.isNewStreak).toBe(false);
      expect(result.milestoneAchieved).toBeNull();
    });

    it('should create new streak if none exists', async () => {
      eventRepoInstance.findBySourceId.mockResolvedValue(null);
      streakRepoInstance.findByUserAndType.mockResolvedValue(null);

      const newStreak = makeStreak({ currentCount: 1 });
      streakRepoInstance.create.mockResolvedValue(newStreak);
      streakRepoInstance.findByUserAndType
        .mockResolvedValueOnce(null)
        .mockResolvedValue(newStreak);

      const result = await service.processStreakEvent(
        1, 100, StreakType.WORKOUT, new Date(), 'api', 'src-2'
      );

      expect(result.isNewStreak).toBe(true);
      expect(result.newCount).toBe(1);
      expect(notificationServiceInstance.sendStreakStarted).toHaveBeenCalled();
    });

    it('should increment existing streak', async () => {
      eventRepoInstance.findBySourceId.mockResolvedValue(null);
      const existingStreak = makeStreak({ currentCount: 5 });
      const updatedStreak = makeStreak({ currentCount: 6 });
      streakRepoInstance.findByUserAndType
        .mockResolvedValueOnce(existingStreak)
        .mockResolvedValue(updatedStreak);
      streakRepoInstance.update.mockResolvedValue(updatedStreak);

      const result = await service.processStreakEvent(
        1, 100, StreakType.WORKOUT, new Date(), 'api', 'src-3'
      );

      expect(streakRepoInstance.update).toHaveBeenCalled();
      expect(result.newCount).toBe(6);
    });

    it('should invalidate cache after processing', async () => {
      eventRepoInstance.findBySourceId.mockResolvedValue(null);
      streakRepoInstance.findByUserAndType.mockResolvedValue(null);
      streakRepoInstance.create.mockResolvedValue(makeStreak({ currentCount: 1 }));
      streakRepoInstance.findByUserAndType
        .mockResolvedValueOnce(null)
        .mockResolvedValue(makeStreak({ currentCount: 1 }));

      await service.processStreakEvent(1, 100, StreakType.WORKOUT, new Date(), 'api', 'src-4');

      expect(cacheServiceInstance.del).toHaveBeenCalledWith('streaks:1:100');
    });
  });

  describe('activateFreeze', () => {
    it('should activate freeze for valid streak', async () => {
      const streak = makeStreak({ freezeAvailable: true, isActive: true });
      const updatedStreak = makeStreak({
        freezeAvailable: false,
        freezeUsedCount: 1,
        isActive: true
      });
      streakRepoInstance.findByUserAndType.mockResolvedValue(streak);
      streakRepoInstance.update.mockResolvedValue(updatedStreak);

      const result = await service.activateFreeze(1, 100, StreakType.WORKOUT, 'Test');

      expect(streakRepoInstance.createFreeze).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 1, streakType: StreakType.WORKOUT })
      );
      expect(streakRepoInstance.update).toHaveBeenCalledWith(
        'streak-1',
        expect.objectContaining({ freezeAvailable: false })
      );
      expect(result.freezeAvailable).toBe(false);
    });

    it('should throw if streak not found', async () => {
      streakRepoInstance.findByUserAndType.mockResolvedValue(null);
      await expect(
        service.activateFreeze(1, 100, StreakType.WORKOUT)
      ).rejects.toThrow('Streak not found');
    });

    it('should throw if no freeze available', async () => {
      streakRepoInstance.findByUserAndType.mockResolvedValue(
        makeStreak({ freezeAvailable: false })
      );
      await expect(
        service.activateFreeze(1, 100, StreakType.WORKOUT)
      ).rejects.toThrow('No freeze available');
    });

    it('should throw if streak is inactive', async () => {
      streakRepoInstance.findByUserAndType.mockResolvedValue(
        makeStreak({ freezeAvailable: true, isActive: false })
      );
      await expect(
        service.activateFreeze(1, 100, StreakType.WORKOUT)
      ).rejects.toThrow('Cannot freeze inactive streak');
    });
  });

  describe('breakStreak', () => {
    it('should mark streak inactive and record history', async () => {
      const streak = makeStreak();
      streakRepoInstance.findById.mockResolvedValue(streak);

      await service.breakStreak('streak-1');

      expect(streakRepoInstance.createHistory).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'broken', newCount: 0 })
      );
      expect(streakRepoInstance.update).toHaveBeenCalledWith('streak-1', { isActive: false });
      expect(cacheServiceInstance.del).toHaveBeenCalledWith('streaks:1:100');
      expect(notificationServiceInstance.sendStreakBroken).toHaveBeenCalledWith(streak);
    });

    it('should do nothing if streak not found', async () => {
      streakRepoInstance.findById.mockResolvedValue(null);
      await service.breakStreak('nonexistent');
      expect(streakRepoInstance.update).not.toHaveBeenCalled();
    });
  });

  describe('getAtRiskStreaks', () => {
    it('should filter active streaks by hours threshold', async () => {
      const riskyStreak = makeStreak({
        lastActivityDate: new Date(Date.now() - 19 * 60 * 60 * 1000)
      });
      const safeStreak = makeStreak({
        id: 'streak-2',
        lastActivityDate: new Date(Date.now() - 10 * 60 * 60 * 1000)
      });
      streakRepoInstance.findActive.mockResolvedValue([riskyStreak, safeStreak]);

      const result = await service.getAtRiskStreaks();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('streak-1');
    });
  });
});
