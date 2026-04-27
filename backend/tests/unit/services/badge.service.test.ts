import { BadgeService } from '../../../src/services/badge.service';
import { Badge, BadgeCriteria, BadgeRarity, BadgeCategory, BadgeCriterionType, ComparisonOperator } from '../../../src/types/badge.types';
import { StreakType } from '../../../src/types/streak.types';

jest.mock('../../../src/db/client', () => ({
  __esModule: true,
  default: {}
}));

jest.mock('../../../src/db/repositories/badge.repository');
jest.mock('../../../src/services/notification.service');
jest.mock('../../../src/services/cache.service');
jest.mock('../../../src/config/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

import { BadgeRepository } from '../../../src/db/repositories/badge.repository';
import { NotificationService } from '../../../src/services/notification.service';
import { CacheService } from '../../../src/services/cache.service';

const makeBadge = (overrides: Partial<Badge> = {}): Badge => ({
  id: 'badge-1',
  badgeCode: '3_day_streak',
  badgeCategory: BadgeCategory.CONSISTENCY,
  name: '3 Day Streak',
  description: 'Get a 3 day streak',
  iconUrl: null,
  rarity: BadgeRarity.COMMON,
  points: 10,
  displayOrder: 1,
  isActive: true,
  isCreatorCustomizable: false,
  requiredBadgeId: null,
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

describe('BadgeService', () => {
  let service: BadgeService;
  let badgeRepoInstance: any;
  let notificationInstance: any;
  let cacheInstance: any;

  beforeEach(() => {
    badgeRepoInstance = {
      findByCode: jest.fn(),
      findById: jest.fn(),
      findActive: jest.fn(),
      findByCategory: jest.fn(),
      findByCriteriaType: jest.fn(),
      findUserBadges: jest.fn(),
      findUserBadge: jest.fn(),
      createUserBadge: jest.fn(),
      findUserProgress: jest.fn(),
      findUserBadgeProgress: jest.fn(),
      upsertProgress: jest.fn(),
      findBadgeCriteria: jest.fn(),
      create: jest.fn()
    };

    notificationInstance = {
      sendBadgeEarned: jest.fn(),
      sendBadgeProgress: jest.fn(),
      sendStreakStarted: jest.fn(),
      sendStreakAtRisk: jest.fn(),
      sendMilestoneAchieved: jest.fn(),
      sendStreakBroken: jest.fn(),
      sendFreezeActivated: jest.fn(),
      sendBatch: jest.fn()
    };

    cacheInstance = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      del: jest.fn(),
      delPattern: jest.fn()
    };

    (BadgeRepository as any).mockImplementation(() => badgeRepoInstance);
    (NotificationService as any).mockImplementation(() => notificationInstance);
    (CacheService as any).mockImplementation(() => cacheInstance);

    service = new BadgeService();
  });

  describe('awardBadge', () => {
    it('should award badge and notify', async () => {
      const badge = makeBadge();
      badgeRepoInstance.findByCode.mockResolvedValue(badge);
      badgeRepoInstance.findUserBadge.mockResolvedValue(null);
      badgeRepoInstance.createUserBadge.mockResolvedValue({
        id: 'ub-1', userId: 1, badgeId: 'badge-1', awardedAt: new Date()
      });
      badgeRepoInstance.upsertProgress.mockResolvedValue({});

      await service.awardBadge(1, 100, '3_day_streak', 'Test reason');

      expect(badgeRepoInstance.createUserBadge).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1, badgeId: 'badge-1', creatorId: 100, progressPercentage: 100
        })
      );
      expect(notificationInstance.sendBadgeEarned).toHaveBeenCalledWith(1, badge);
      expect(cacheInstance.del).toHaveBeenCalledWith('badges:1:100');
    });

    it('should skip awarding if badge already earned', async () => {
      badgeRepoInstance.findByCode.mockResolvedValue(makeBadge());
      badgeRepoInstance.findUserBadge.mockResolvedValue({ id: 'ub-1' });

      const result = await service.awardBadge(1, 100, '3_day_streak', 'Test');

      expect(badgeRepoInstance.createUserBadge).not.toHaveBeenCalled();
      expect(result.id).toBe('ub-1');
    });

    it('should throw if badge code not found', async () => {
      badgeRepoInstance.findByCode.mockResolvedValue(null);
      await expect(
        service.awardBadge(1, 100, 'nonexistent', 'Test')
      ).rejects.toThrow('Badge not found: nonexistent');
    });

    it('should skip notification when notify option is false', async () => {
      badgeRepoInstance.findByCode.mockResolvedValue(makeBadge());
      badgeRepoInstance.findUserBadge.mockResolvedValue(null);
      badgeRepoInstance.createUserBadge.mockResolvedValue({ id: 'ub-1', awardedAt: new Date() });
      badgeRepoInstance.upsertProgress.mockResolvedValue({});

      await service.awardBadge(1, 100, '3_day_streak', 'Test', { notify: false });
      expect(notificationInstance.sendBadgeEarned).not.toHaveBeenCalled();
    });
  });

  describe('getBadgeCatalog', () => {
    it('should return cached catalog when available', async () => {
      const cachedBadges = [makeBadge()];
      cacheInstance.get.mockResolvedValue(cachedBadges);

      const result = await service.getBadgeCatalog(100);
      expect(result).toEqual(cachedBadges);
      expect(badgeRepoInstance.findActive).not.toHaveBeenCalled();
    });

    it('should fetch and cache when no cache', async () => {
      const badges = [makeBadge()];
      badgeRepoInstance.findActive.mockResolvedValue(badges);

      const result = await service.getBadgeCatalog(100);
      expect(badgeRepoInstance.findActive).toHaveBeenCalled();
      expect(cacheInstance.set).toHaveBeenCalled();
      expect(result).toEqual(badges);
    });

    it('should filter by category', async () => {
      const badges = [makeBadge()];
      badgeRepoInstance.findActive.mockResolvedValue(badges);

      await service.getBadgeCatalog(100, 'consistency');
      expect(result => result).toBeTruthy();
    });
  });

  describe('getBadgeDetail', () => {
    it('should return badge with user progress', async () => {
      const badge = makeBadge();
      badgeRepoInstance.findByCode.mockResolvedValue(badge);
      badgeRepoInstance.findUserBadge.mockResolvedValue(null);
      badgeRepoInstance.findUserBadgeProgress.mockResolvedValue({
        progressPercentage: 50,
        currentValue: 1,
        targetValue: 3
      });

      const result = await service.getBadgeDetail(1, 100, '3_day_streak');

      expect(result).not.toBeNull();
      expect(result!.progressPercentage).toBe(50);
      expect(result!.isEarned).toBe(false);
    });

    it('should return null for unknown badge code', async () => {
      badgeRepoInstance.findByCode.mockResolvedValue(null);
      const result = await service.getBadgeDetail(1, 100, 'nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('updateProgressForStreak', () => {
    it('should award badge when criteria met', async () => {
      const badge = makeBadge();
      const criteria: BadgeCriteria[] = [{
        id: 'crit-1',
        badgeId: 'badge-1',
        criterionType: BadgeCriterionType.STREAK_DAYS,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL,
        thresholdValue: 3,
        timePeriodDays: null,
        streakType: StreakType.WORKOUT,
        isRequired: true,
        metadata: {},
        createdAt: new Date()
      }];

      badgeRepoInstance.findByCriteriaType.mockResolvedValue([badge]);
      badgeRepoInstance.findBadgeCriteria.mockResolvedValue(criteria);
      badgeRepoInstance.findByCode.mockResolvedValue(badge);
      badgeRepoInstance.findUserBadge.mockResolvedValue(null);
      badgeRepoInstance.createUserBadge.mockResolvedValue({ id: 'ub-1', awardedAt: new Date() });
      badgeRepoInstance.upsertProgress.mockResolvedValue({});

      await service.updateProgressForStreak(1, 100, {
        streakType: StreakType.WORKOUT,
        currentCount: 5
      });

      expect(badgeRepoInstance.createUserBadge).toHaveBeenCalled();
    });

    it('should update progress when criteria not met', async () => {
      const badge = makeBadge();
      const criteria: BadgeCriteria[] = [{
        id: 'crit-1',
        badgeId: 'badge-1',
        criterionType: BadgeCriterionType.STREAK_DAYS,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL,
        thresholdValue: 7,
        timePeriodDays: null,
        streakType: StreakType.WORKOUT,
        isRequired: true,
        metadata: {},
        createdAt: new Date()
      }];

      badgeRepoInstance.findByCriteriaType.mockResolvedValue([badge]);
      badgeRepoInstance.findBadgeCriteria.mockResolvedValue(criteria);

      await service.updateProgressForStreak(1, 100, {
        streakType: StreakType.WORKOUT,
        currentCount: 3
      });

      expect(badgeRepoInstance.upsertProgress).toHaveBeenCalledWith(
        expect.objectContaining({ progressPercentage: expect.any(Number) })
      );
    });
  });

  describe('createCustomBadge', () => {
    it('should create a new custom badge', async () => {
      badgeRepoInstance.findByCode.mockResolvedValue(null);
      const newBadge = makeBadge({ badgeCode: 'custom_1', name: 'Custom Badge' });
      badgeRepoInstance.create.mockResolvedValue(newBadge);

      const result = await service.createCustomBadge(100, {
        badgeCode: 'custom_1',
        badgeCategory: BadgeCategory.MILESTONE,
        name: 'Custom Badge',
        rarity: BadgeRarity.RARE
      });

      expect(badgeRepoInstance.create).toHaveBeenCalled();
      expect(result.badgeCode).toBe('custom_1');
    });

    it('should throw if badge code exists', async () => {
      badgeRepoInstance.findByCode.mockResolvedValue(makeBadge());
      await expect(
        service.createCustomBadge(100, {
          badgeCode: '3_day_streak',
          badgeCategory: BadgeCategory.CONSISTENCY,
          name: 'Duplicate',
          rarity: BadgeRarity.COMMON
        })
      ).rejects.toThrow('Badge code already exists');
    });
  });
});
