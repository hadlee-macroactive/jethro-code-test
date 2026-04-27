import { PrismaClient } from '@prisma/client';
import type {
  Badge,
  UserBadge,
  BadgeProgress,
  BadgeCriteria,
  CreateBadgeInput
} from '../../types/badge.types';

export class BadgeRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Badge | null> {
    const record = await this.prisma.badge.findUnique({ where: { id } });
    return record ? this.mapToBadge(record) : null;
  }

  async findByCode(badgeCode: string): Promise<Badge | null> {
    const record = await this.prisma.badge.findUnique({ where: { badgeCode } });
    return record ? this.mapToBadge(record) : null;
  }

  async findActive(): Promise<Badge[]> {
    const records = await this.prisma.badge.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    });
    return records.map(this.mapToBadge);
  }

  async findByCategory(category: string): Promise<Badge[]> {
    const records = await this.prisma.badge.findMany({
      where: { badgeCategory: category, isActive: true },
      orderBy: { displayOrder: 'asc' }
    });
    return records.map(this.mapToBadge);
  }

  async findByCriteriaType(criterionType: string): Promise<Badge[]> {
    const records = await this.prisma.badge.findMany({
      where: {
        isActive: true,
        criteria: {
          some: { criterionType }
        }
      }
    });
    return records.map(this.mapToBadge);
  }

  async create(data: CreateBadgeInput): Promise<Badge> {
    const record = await this.prisma.badge.create({
      data: {
        badgeCode: data.badgeCode,
        badgeCategory: data.badgeCategory,
        name: data.name,
        description: data.description,
        iconUrl: data.iconUrl,
        rarity: data.rarity,
        points: data.points || 0,
        displayOrder: data.displayOrder || 0,
        isActive: true,
        isCreatorCustomizable: true,
        metadata: (data.metadata || {}) as any
      }
    });
    return this.mapToBadge(record);
  }

  async findUserBadges(userId: number, creatorId: number): Promise<Array<{ badge: Badge } & UserBadge>> {
    const records = await this.prisma.userBadge.findMany({
      where: {
        userId: BigInt(userId),
        creatorId: BigInt(creatorId)
      },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' }
    });

    return records.map(record => ({
      ...this.mapToUserBadge(record),
      badge: this.mapToBadge(record.badge)
    }));
  }

  async findUserBadge(userId: number, badgeId: string): Promise<UserBadge | null> {
    const record = await this.prisma.userBadge.findFirst({
      where: {
        userId: BigInt(userId),
        badgeId
      }
    });
    return record ? this.mapToUserBadge(record) : null;
  }

  async createUserBadge(data: {
    userId: number;
    badgeId: string;
    creatorId: number;
    awardedBy: string;
    awardReason: string;
    progressPercentage: number;
    isDisplayed: boolean;
  }): Promise<UserBadge> {
    const record = await this.prisma.userBadge.create({
      data: {
        userId: BigInt(data.userId),
        badgeId: data.badgeId,
        creatorId: BigInt(data.creatorId),
        awardedBy: data.awardedBy,
        awardReason: data.awardReason,
        progressPercentage: data.progressPercentage,
        isDisplayed: data.isDisplayed
      }
    });
    return this.mapToUserBadge(record);
  }

  async findUserProgress(userId: number, creatorId: number): Promise<BadgeProgress[]> {
    const records = await this.prisma.badgeProgress.findMany({
      where: {
        userId: BigInt(userId),
        creatorId: BigInt(creatorId),
        progressPercentage: { lt: 100 }
      }
    });
    return records.map(this.mapToProgress);
  }

  async findUserBadgeProgress(userId: number, badgeId: string): Promise<BadgeProgress | null> {
    const record = await this.prisma.badgeProgress.findFirst({
      where: {
        userId: BigInt(userId),
        badgeId
      }
    });
    return record ? this.mapToProgress(record) : null;
  }

  async upsertProgress(data: {
    userId: number;
    badgeId: string;
    creatorId: number;
    progressPercentage: number;
    currentValue: number;
    targetValue: number;
  }): Promise<BadgeProgress> {
    const record = await this.prisma.badgeProgress.upsert({
      where: {
        uq_badge_progress: {
          userId: BigInt(data.userId),
          badgeId: data.badgeId,
          creatorId: BigInt(data.creatorId)
        }
      },
      create: {
        userId: BigInt(data.userId),
        badgeId: data.badgeId,
        creatorId: BigInt(data.creatorId),
        progressPercentage: data.progressPercentage,
        currentValue: data.currentValue,
        targetValue: data.targetValue
      },
      update: {
        progressPercentage: data.progressPercentage,
        currentValue: data.currentValue,
        targetValue: data.targetValue,
        lastUpdated: new Date()
      }
    });
    return this.mapToProgress(record);
  }

  async findBadgeCriteria(badgeId: string, criterionType?: string): Promise<BadgeCriteria[]> {
    const where: any = { badgeId };
    if (criterionType) where.criterionType = criterionType;

    const records = await this.prisma.badgeCriteria.findMany({ where });
    return records.map(this.mapToCriteria);
  }

  private mapToBadge(record: any): Badge {
    return {
      id: record.id,
      badgeCode: record.badgeCode,
      badgeCategory: record.badgeCategory,
      name: record.name,
      description: record.description,
      iconUrl: record.iconUrl,
      rarity: record.rarity,
      points: record.points,
      displayOrder: record.displayOrder,
      isActive: record.isActive,
      isCreatorCustomizable: record.isCreatorCustomizable,
      requiredBadgeId: record.requiredBadgeId,
      metadata: record.metadata || {},
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  private mapToUserBadge(record: any): UserBadge {
    return {
      id: record.id,
      userId: Number(record.userId),
      badgeId: record.badgeId,
      creatorId: Number(record.creatorId),
      awardedAt: record.awardedAt,
      awardedBy: record.awardedBy,
      awardReason: record.awardReason,
      progressPercentage: record.progressPercentage,
      isDisplayed: record.isDisplayed,
      displayPriority: record.displayPriority,
      metadata: record.metadata || {}
    };
  }

  private mapToProgress(record: any): BadgeProgress {
    return {
      id: record.id,
      userId: Number(record.userId),
      badgeId: record.badgeId,
      creatorId: Number(record.creatorId),
      progressPercentage: record.progressPercentage,
      currentValue: Number(record.currentValue),
      targetValue: Number(record.targetValue),
      lastUpdated: record.lastUpdated
    };
  }

  private mapToCriteria(record: any): BadgeCriteria {
    return {
      id: record.id,
      badgeId: record.badgeId,
      criterionType: record.criterionType,
      comparisonOperator: record.comparisonOperator,
      thresholdValue: Number(record.thresholdValue),
      timePeriodDays: record.timePeriodDays,
      streakType: record.streakType,
      isRequired: record.isRequired,
      metadata: record.metadata || {},
      createdAt: record.createdAt
    };
  }
}
