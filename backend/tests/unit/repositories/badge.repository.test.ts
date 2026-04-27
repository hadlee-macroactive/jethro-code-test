import { BadgeRepository } from '../../../src/db/repositories/badge.repository';

const mockPrisma = {
  badge: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn()
  },
  userBadge: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn()
  },
  badgeProgress: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    upsert: jest.fn()
  },
  badgeCriteria: {
    findMany: jest.fn()
  }
};

const makeBadgeRecord = (overrides = {}) => ({
  id: 'badge-1',
  badgeCode: '3_day_streak',
  badgeCategory: 'consistency',
  name: '3 Day Streak',
  description: 'Get a 3 day streak',
  iconUrl: null,
  rarity: 'common',
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

describe('BadgeRepository', () => {
  let repository: BadgeRepository;

  beforeEach(() => {
    repository = new BadgeRepository(mockPrisma as any);
  });

  describe('findByCode', () => {
    it('should find badge by badgeCode', async () => {
      mockPrisma.badge.findUnique.mockResolvedValue(makeBadgeRecord());
      const result = await repository.findByCode('3_day_streak');
      expect(mockPrisma.badge.findUnique).toHaveBeenCalledWith({ where: { badgeCode: '3_day_streak' } });
      expect(result).not.toBeNull();
      expect(result!.badgeCode).toBe('3_day_streak');
    });

    it('should return null when badge not found', async () => {
      mockPrisma.badge.findUnique.mockResolvedValue(null);
      const result = await repository.findByCode('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('findActive', () => {
    it('should return only active badges ordered by displayOrder', async () => {
      mockPrisma.badge.findMany.mockResolvedValue([
        makeBadgeRecord({ displayOrder: 1 }),
        makeBadgeRecord({ id: 'badge-2', badgeCode: '7_day_streak', displayOrder: 2 })
      ]);

      const result = await repository.findActive();
      expect(mockPrisma.badge.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' }
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('findUserBadges', () => {
    it('should find user badges with badge details', async () => {
      const badgeRecord = makeBadgeRecord();
      mockPrisma.userBadge.findMany.mockResolvedValue([{
        id: 'ub-1',
        userId: BigInt(1),
        badgeId: 'badge-1',
        creatorId: BigInt(100),
        awardedAt: new Date(),
        awardedBy: 'system',
        awardReason: 'Milestone',
        progressPercentage: 100,
        isDisplayed: true,
        displayPriority: 0,
        metadata: {},
        badge: badgeRecord
      }]);

      const result = await repository.findUserBadges(1, 100);
      expect(result).toHaveLength(1);
      expect(result[0].badge.badgeCode).toBe('3_day_streak');
      expect(result[0].userId).toBe(1);
    });
  });

  describe('create', () => {
    it('should create badge with provided data', async () => {
      mockPrisma.badge.create.mockResolvedValue(makeBadgeRecord());

      await repository.create({
        badgeCode: '3_day_streak',
        badgeCategory: 'consistency',
        name: '3 Day Streak',
        description: 'Get a 3 day streak',
        rarity: 'common'
      });

      expect(mockPrisma.badge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            badgeCode: '3_day_streak',
            isActive: true
          })
        })
      );
    });
  });

  describe('upsertProgress', () => {
    it('should upsert badge progress with BigInt conversion', async () => {
      const mockProgress = {
        id: 'prog-1',
        userId: BigInt(1),
        badgeId: 'badge-1',
        creatorId: BigInt(100),
        progressPercentage: 50,
        currentValue: 1.5,
        targetValue: 3,
        lastUpdated: new Date()
      };
      mockPrisma.badgeProgress.upsert.mockResolvedValue(mockProgress);

      const result = await repository.upsertProgress({
        userId: 1,
        badgeId: 'badge-1',
        creatorId: 100,
        progressPercentage: 50,
        currentValue: 1.5,
        targetValue: 3
      });

      expect(mockPrisma.badgeProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            uq_badge_progress: {
              userId: BigInt(1),
              badgeId: 'badge-1',
              creatorId: BigInt(100)
            }
          }
        })
      );
      expect(result.userId).toBe(1);
    });
  });

  describe('findBadgeCriteria', () => {
    it('should find criteria for badge', async () => {
      mockPrisma.badgeCriteria.findMany.mockResolvedValue([{
        id: 'crit-1',
        badgeId: 'badge-1',
        criterionType: 'streak_days',
        comparisonOperator: '>=',
        thresholdValue: 3,
        timePeriodDays: null,
        streakType: 'workout',
        isRequired: true,
        metadata: {},
        createdAt: new Date()
      }]);

      const result = await repository.findBadgeCriteria('badge-1');
      expect(result).toHaveLength(1);
      expect(result[0].criterionType).toBe('streak_days');
    });

    it('should filter by criterionType when provided', async () => {
      mockPrisma.badgeCriteria.findMany.mockResolvedValue([]);
      await repository.findBadgeCriteria('badge-1', 'streak_days');
      expect(mockPrisma.badgeCriteria.findMany).toHaveBeenCalledWith({
        where: { badgeId: 'badge-1', criterionType: 'streak_days' }
      });
    });
  });
});
