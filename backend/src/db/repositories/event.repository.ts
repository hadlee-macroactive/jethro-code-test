import { PrismaClient } from '@prisma/client';
import type { StreakEvent } from '../../types/streak.types';

export class EventRepository {
  constructor(private prisma: PrismaClient) {}

  async findBySourceId(
    userId: number,
    creatorId: number,
    streakType: string,
    eventDate: Date,
    sourceEventId: string
  ): Promise<StreakEvent | null> {
    const record = await this.prisma.streakEvent.findUnique({
      where: {
        uq_streak_event: {
          userId: BigInt(userId),
          creatorId: BigInt(creatorId),
          streakType,
          eventDate,
          sourceEventId
        }
      }
    });
    return record ? this.mapToEvent(record) : null;
  }

  async create(data: {
    userId: number;
    creatorId: number;
    streakType: string;
    eventDate: Date;
    activityCount: number;
    qualified: boolean;
    eventSource: string;
    sourceEventId: string;
    metadata: Record<string, unknown>;
  }): Promise<StreakEvent> {
    const record = await this.prisma.streakEvent.create({
      data: {
        userId: BigInt(data.userId),
        creatorId: BigInt(data.creatorId),
        streakType: data.streakType,
        eventDate: data.eventDate,
        activityCount: data.activityCount,
        qualified: data.qualified,
        eventSource: data.eventSource,
        sourceEventId: data.sourceEventId,
        metadata: data.metadata as any
      }
    });
    return this.mapToEvent(record);
  }

  async findByUserAndDateRange(
    userId: number,
    creatorId: number,
    streakType: string,
    startDate: Date,
    endDate: Date
  ): Promise<StreakEvent[]> {
    const records = await this.prisma.streakEvent.findMany({
      where: {
        userId: BigInt(userId),
        creatorId: BigInt(creatorId),
        streakType,
        eventDate: { gte: startDate, lte: endDate },
        qualified: true
      },
      orderBy: { eventDate: 'asc' }
    });
    return records.map(this.mapToEvent);
  }

  private mapToEvent(record: any): StreakEvent {
    return {
      id: record.id,
      userId: Number(record.userId),
      creatorId: Number(record.creatorId),
      streakType: record.streakType,
      eventDate: record.eventDate,
      activityCount: record.activityCount,
      qualified: record.qualified,
      eventSource: record.eventSource,
      sourceEventId: record.sourceEventId,
      metadata: record.metadata || {},
      createdAt: record.createdAt
    };
  }
}
