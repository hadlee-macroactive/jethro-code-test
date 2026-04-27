import { StreakRepository } from '../../../src/db/repositories/streak.repository';

// Mock PrismaClient
const mockPrisma = {
  streak: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  streakHistory: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn()
  },
  streakFreeze: {
    create: jest.fn(),
    findMany: jest.fn()
  }
};

describe('StreakRepository', () => {
  let repository: StreakRepository;

  beforeEach(() => {
    repository = new StreakRepository(mockPrisma as any);
  });

  describe('findByUserAndCreator', () => {
    it('should query streaks with correct userId and creatorId', async () => {
      const mockRecords = [{
        id: 'streak-1',
        userId: BigInt(1),
        creatorId: BigInt(100),
        streakType: 'workout',
        currentCount: 5,
        longestCount: 10,
        lastActivityDate: new Date(),
        streakStartDate: new Date(),
        isActive: true,
        nextMilestone: 7,
        milestoneProgress: 71,
        freezeAvailable: true,
        freezeUsedCount: 0,
        freezeLastUsed: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }];
      mockPrisma.streak.findMany.mockResolvedValue(mockRecords);

      const result = await repository.findByUserAndCreator(1, 100);

      expect(mockPrisma.streak.findMany).toHaveBeenCalledWith({
        where: { userId: BigInt(1), creatorId: BigInt(100) },
        orderBy: { streakType: 'asc' }
      });
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(1);
      expect(result[0].creatorId).toBe(100);
    });
  });

  describe('findByUserAndType', () => {
    it('should find streak by composite unique key', async () => {
      const mockRecord = {
        id: 'streak-1',
        userId: BigInt(1),
        creatorId: BigInt(100),
        streakType: 'workout',
        currentCount: 5,
        longestCount: 10,
        lastActivityDate: new Date(),
        streakStartDate: new Date(),
        isActive: true,
        nextMilestone: 7,
        milestoneProgress: 71,
        freezeAvailable: true,
        freezeUsedCount: 0,
        freezeLastUsed: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockPrisma.streak.findUnique.mockResolvedValue(mockRecord);

      const result = await repository.findByUserAndType(1, 100, 'workout');

      expect(mockPrisma.streak.findUnique).toHaveBeenCalledWith({
        where: {
          uq_user_creator_type: {
            userId: BigInt(1),
            creatorId: BigInt(100),
            streakType: 'workout'
          }
        }
      });
      expect(result).not.toBeNull();
      expect(result!.userId).toBe(1);
    });

    it('should return null when not found', async () => {
      mockPrisma.streak.findUnique.mockResolvedValue(null);
      const result = await repository.findByUserAndType(1, 100, 'workout');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find streak by id', async () => {
      const mockRecord = {
        id: 'streak-1',
        userId: BigInt(1),
        creatorId: BigInt(100),
        streakType: 'workout',
        currentCount: 5,
        longestCount: 10,
        lastActivityDate: new Date(),
        streakStartDate: new Date(),
        isActive: true,
        nextMilestone: 7,
        milestoneProgress: 71,
        freezeAvailable: true,
        freezeUsedCount: 0,
        freezeLastUsed: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockPrisma.streak.findUnique.mockResolvedValue(mockRecord);

      const result = await repository.findById('streak-1');
      expect(mockPrisma.streak.findUnique).toHaveBeenCalledWith({ where: { id: 'streak-1' } });
      expect(result).not.toBeNull();
      expect(result!.id).toBe('streak-1');
    });
  });

  describe('create', () => {
    it('should create streak with BigInt conversion', async () => {
      const mockRecord = {
        id: 'streak-new',
        userId: BigInt(1),
        creatorId: BigInt(100),
        streakType: 'workout',
        currentCount: 1,
        longestCount: 1,
        lastActivityDate: new Date(),
        streakStartDate: new Date(),
        isActive: true,
        nextMilestone: 3,
        milestoneProgress: 0,
        freezeAvailable: true,
        freezeUsedCount: 0,
        freezeLastUsed: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockPrisma.streak.create.mockResolvedValue(mockRecord);

      const result = await repository.create({
        userId: 1,
        creatorId: 100,
        streakType: 'workout',
        lastActivityDate: new Date()
      });

      expect(mockPrisma.streak.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: BigInt(1),
            creatorId: BigInt(100)
          })
        })
      );
      expect(result.userId).toBe(1);
    });
  });

  describe('update', () => {
    it('should update streak fields', async () => {
      const mockRecord = {
        id: 'streak-1',
        userId: BigInt(1),
        creatorId: BigInt(100),
        streakType: 'workout',
        currentCount: 6,
        longestCount: 10,
        lastActivityDate: new Date(),
        streakStartDate: new Date(),
        isActive: true,
        nextMilestone: 7,
        milestoneProgress: 85,
        freezeAvailable: true,
        freezeUsedCount: 0,
        freezeLastUsed: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockPrisma.streak.update.mockResolvedValue(mockRecord);

      const result = await repository.update('streak-1', { currentCount: 6 });
      expect(mockPrisma.streak.update).toHaveBeenCalledWith({
        where: { id: 'streak-1' },
        data: { currentCount: 6 }
      });
      expect(result.currentCount).toBe(6);
    });
  });

  describe('createHistory', () => {
    it('should create history record with BigInt conversion', async () => {
      const mockRecord = {
        id: 'hist-1',
        streakId: 'streak-1',
        userId: BigInt(1),
        creatorId: BigInt(100),
        streakType: 'workout',
        eventType: 'incremented',
        previousCount: 5,
        newCount: 6,
        milestoneAchieved: null,
        reason: 'Qualifying activity',
        snapshot: {},
        createdAt: new Date()
      };
      mockPrisma.streakHistory.create.mockResolvedValue(mockRecord);

      const result = await repository.createHistory({
        streakId: 'streak-1',
        userId: 1,
        creatorId: 100,
        streakType: 'workout',
        eventType: 'incremented',
        previousCount: 5,
        newCount: 6,
        milestoneAchieved: null,
        reason: 'Qualifying activity',
        snapshot: {}
      });

      expect(mockPrisma.streakHistory.create).toHaveBeenCalled();
      expect(result.userId).toBe(1);
    });
  });

  describe('getHistory', () => {
    it('should return paginated history', async () => {
      mockPrisma.streakHistory.findMany.mockResolvedValue([]);
      mockPrisma.streakHistory.count.mockResolvedValue(0);

      const result = await repository.getHistory(1, 100, undefined, 10, 0);

      expect(result).toEqual({ history: [], total: 0 });
      expect(mockPrisma.streakHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10, skip: 0 })
      );
    });
  });

  describe('findStreaksNeedingReset', () => {
    it('should find active streaks with lastActivity before date', async () => {
      mockPrisma.streak.findMany.mockResolvedValue([]);

      const beforeDate = new Date('2024-01-14');
      await repository.findStreaksNeedingReset(beforeDate);

      expect(mockPrisma.streak.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          lastActivityDate: { lt: beforeDate }
        }
      });
    });
  });
});
