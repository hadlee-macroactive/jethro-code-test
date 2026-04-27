import { PrismaClient } from '@prisma/client';
import type {
  Streak,
  StreakHistory,
  StreakFreeze,
  CreateStreakInput,
  UpdateStreakInput
} from '../../types/streak.types';

export class StreakRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUserAndCreator(userId: number, creatorId: number): Promise<Streak[]> {
    const records = await this.prisma.streak.findMany({
      where: { userId: BigInt(userId), creatorId: BigInt(creatorId) },
      orderBy: { streakType: 'asc' }
    });
    return records.map(this.mapToStreak);
  }

  async findByUserAndType(
    userId: number,
    creatorId: number,
    streakType: string
  ): Promise<Streak | null> {
    const record = await this.prisma.streak.findUnique({
      where: {
        uq_user_creator_type: {
          userId: BigInt(userId),
          creatorId: BigInt(creatorId),
          streakType
        }
      }
    });
    return record ? this.mapToStreak(record) : null;
  }

  async findById(id: string): Promise<Streak | null> {
    const record = await this.prisma.streak.findUnique({ where: { id } });
    return record ? this.mapToStreak(record) : null;
  }

  async findActive(): Promise<Streak[]> {
    const records = await this.prisma.streak.findMany({
      where: { isActive: true }
    });
    return records.map(this.mapToStreak);
  }

  async findByCreatorAndType(creatorId: number, streakType: string): Promise<Streak[]> {
    const records = await this.prisma.streak.findMany({
      where: { creatorId: BigInt(creatorId), streakType, isActive: true },
      orderBy: { currentCount: 'desc' }
    });
    return records.map(this.mapToStreak);
  }

  async create(data: CreateStreakInput): Promise<Streak> {
    const record = await this.prisma.streak.create({
      data: {
        userId: BigInt(data.userId),
        creatorId: BigInt(data.creatorId),
        streakType: data.streakType,
        currentCount: 1,
        longestCount: 1,
        lastActivityDate: data.lastActivityDate,
        streakStartDate: data.lastActivityDate,
        isActive: true,
        nextMilestone: 3,
        milestoneProgress: 0,
        freezeAvailable: true,
        freezeUsedCount: 0,
        metadata: (data.metadata || {}) as any
      }
    });
    return this.mapToStreak(record);
  }

  async update(id: string, data: Partial<UpdateStreakInput>): Promise<Streak> {
    const record = await this.prisma.streak.update({
      where: { id },
      data: data as any
    });
    return this.mapToStreak(record);
  }

  async createHistory(data: {
    streakId: string;
    userId: number;
    creatorId: number;
    streakType: string;
    eventType: string;
    previousCount: number | null;
    newCount: number;
    milestoneAchieved: number | null;
    reason: string | null;
    snapshot: Record<string, unknown>;
  }): Promise<StreakHistory> {
    const record = await this.prisma.streakHistory.create({
      data: {
        ...data,
        userId: BigInt(data.userId),
        creatorId: BigInt(data.creatorId),
        snapshot: data.snapshot as any
      }
    });
    return this.mapToHistory(record);
  }

  async createFreeze(data: {
    userId: number;
    creatorId: number;
    streakType: string;
    freezeDate: Date;
    streakCountAtFreeze: number;
    reason: string | null;
  }): Promise<StreakFreeze> {
    const record = await this.prisma.streakFreeze.create({
      data: {
        userId: BigInt(data.userId),
        creatorId: BigInt(data.creatorId),
        streakType: data.streakType,
        freezeDate: data.freezeDate,
        streakCountAtFreeze: data.streakCountAtFreeze,
        reason: data.reason
      }
    });
    return this.mapToFreeze(record);
  }

  async findFreezesForDate(
    userId: number,
    creatorId: number,
    streakType: string,
    date: Date
  ): Promise<StreakFreeze[]> {
    const records = await this.prisma.streakFreeze.findMany({
      where: {
        userId: BigInt(userId),
        creatorId: BigInt(creatorId),
        streakType,
        freezeDate: date
      }
    });
    return records.map(this.mapToFreeze);
  }

  async getHistory(
    userId: number,
    creatorId: number,
    streakType?: string,
    limit = 20,
    offset = 0
  ): Promise<{ history: StreakHistory[]; total: number }> {
    const where = {
      userId: BigInt(userId),
      creatorId: BigInt(creatorId),
      ...(streakType && { streakType })
    };

    const [records, total] = await Promise.all([
      this.prisma.streakHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      this.prisma.streakHistory.count({ where })
    ]);

    return {
      history: records.map(this.mapToHistory),
      total
    };
  }

  async findStreaksNeedingReset(date: Date): Promise<Streak[]> {
    const records = await this.prisma.streak.findMany({
      where: {
        isActive: true,
        lastActivityDate: { lt: date }
      }
    });
    return records.map(this.mapToStreak);
  }

  private mapToStreak(record: any): Streak {
    return {
      id: record.id,
      userId: Number(record.userId),
      creatorId: Number(record.creatorId),
      streakType: record.streakType,
      currentCount: record.currentCount,
      longestCount: record.longestCount,
      lastActivityDate: record.lastActivityDate,
      streakStartDate: record.streakStartDate,
      isActive: record.isActive,
      nextMilestone: record.nextMilestone,
      milestoneProgress: record.milestoneProgress,
      freezeAvailable: record.freezeAvailable,
      freezeUsedCount: record.freezeUsedCount,
      freezeLastUsed: record.freezeLastUsed,
      metadata: record.metadata || {},
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  private mapToHistory(record: any): StreakHistory {
    return {
      id: record.id,
      streakId: record.streakId,
      userId: Number(record.userId),
      creatorId: Number(record.creatorId),
      streakType: record.streakType,
      eventType: record.eventType,
      previousCount: record.previousCount,
      newCount: record.newCount,
      milestoneAchieved: record.milestoneAchieved,
      reason: record.reason,
      snapshot: record.snapshot || {},
      createdAt: record.createdAt
    };
  }

  private mapToFreeze(record: any): StreakFreeze {
    return {
      id: record.id,
      userId: Number(record.userId),
      creatorId: Number(record.creatorId),
      streakType: record.streakType,
      freezeDate: record.freezeDate,
      streakCountAtFreeze: record.streakCountAtFreeze,
      reason: record.reason,
      createdAt: record.createdAt
    };
  }
}
