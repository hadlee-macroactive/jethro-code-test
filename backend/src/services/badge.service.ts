import prisma from '../db/client';
import { BadgeRepository } from '../db/repositories/badge.repository';
import { NotificationService } from './notification.service';
import { CacheService } from './cache.service';
import {
  Badge,
  UserBadge,
  BadgeWithProgress,
  BadgeCriteria,
  CreateBadgeInput
} from '../types/badge.types';
import { StreakType } from '../types/streak.types';
import { logger } from '../config/logger';

export class BadgeService {
  private badgeRepo: BadgeRepository;
  private notificationService: NotificationService;
  private cacheService: CacheService;

  constructor() {
    this.badgeRepo = new BadgeRepository(prisma);
    this.notificationService = new NotificationService();
    this.cacheService = new CacheService();
  }

  async getUserBadges(
    userId: number,
    creatorId: number,
    options: { includeProgress?: boolean; category?: string } = {}
  ): Promise<{ earned: BadgeWithProgress[]; inProgress: BadgeWithProgress[] }> {
    const { includeProgress = false, category } = options;

    let earned = await this.badgeRepo.findUserBadges(userId, creatorId);
    if (category) {
      earned = earned.filter(b => b.badge.badgeCategory === category);
    }

    let inProgress: BadgeWithProgress[] = [];
    if (includeProgress) {
      const progress = await this.badgeRepo.findUserProgress(userId, creatorId);
      inProgress = await Promise.all(
        progress.map(async p => {
          const badge = await this.badgeRepo.findById(p.badgeId);
          return {
            ...badge!,
            progressPercentage: p.progressPercentage,
            currentValue: p.currentValue,
            targetValue: p.targetValue,
            isEarned: false,
            isLocked: false
          };
        })
      );
    }

    const enrichedEarned = earned.map(eb => ({
      ...eb.badge,
      earnedAt: eb.awardedAt,
      isEarned: true,
      isLocked: false,
      progressPercentage: 100
    }));

    return { earned: enrichedEarned, inProgress };
  }

  async getBadgeCatalog(creatorId: number, category?: string): Promise<Badge[]> {
    const cacheKey = `badge_catalog:${creatorId}:${category || 'all'}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached as Badge[];

    let badges = await this.badgeRepo.findActive();
    if (category) {
      badges = badges.filter(b => b.badgeCategory === category);
    }

    await this.cacheService.set(cacheKey, badges, 3600);
    return badges;
  }

  async getBadgeDetail(
    userId: number,
    _creatorId: number,
    badgeCode: string
  ): Promise<BadgeWithProgress | null> {
    const badge = await this.badgeRepo.findByCode(badgeCode);
    if (!badge) return null;

    const userBadge = await this.badgeRepo.findUserBadge(userId, badge.id);
    const progress = await this.badgeRepo.findUserBadgeProgress(userId, badge.id);

    return {
      ...badge,
      earnedAt: userBadge?.awardedAt,
      progressPercentage: progress?.progressPercentage || 0,
      currentValue: progress ? progress.currentValue : 0,
      targetValue: progress ? progress.targetValue : 0,
      isEarned: !!userBadge,
      isLocked: !userBadge && !progress
    };
  }

  async awardBadge(
    userId: number,
    creatorId: number,
    badgeCode: string,
    reason: string,
    options: { awardedBy?: string; notify?: boolean } = {}
  ): Promise<UserBadge> {
    const badge = await this.badgeRepo.findByCode(badgeCode);
    if (!badge) throw new Error(`Badge not found: ${badgeCode}`);

    const existing = await this.badgeRepo.findUserBadge(userId, badge.id);
    if (existing) {
      logger.info(`Badge already earned: ${badgeCode} by user ${userId}`);
      return existing;
    }

    const userBadge = await this.badgeRepo.createUserBadge({
      userId, badgeId: badge.id, creatorId,
      awardedBy: options.awardedBy || 'system',
      awardReason: reason,
      progressPercentage: 100,
      isDisplayed: true
    });

    await this.badgeRepo.upsertProgress({
      userId, badgeId: badge.id, creatorId,
      progressPercentage: 100, currentValue: 0, targetValue: 0
    });

    await this.cacheService.del(`badges:${userId}:${creatorId}`);

    if (options.notify !== false) {
      await this.notificationService.sendBadgeEarned(userId, badge);
    }

    logger.info(`Badge awarded: ${badgeCode} to user ${userId}`);
    return userBadge;
  }

  async updateProgressForStreak(
    userId: number,
    creatorId: number,
    streak: { streakType: StreakType | string; currentCount: number }
  ): Promise<void> {
    const badges = await this.badgeRepo.findByCriteriaType('streak_days');

    for (const badge of badges) {
      const criteria = await this.badgeRepo.findBadgeCriteria(badge.id, 'streak_days');
      if (!criteria || criteria.length === 0) continue;

      const met = criteria.every(c => {
        const threshold = Number(c.thresholdValue);
        return streak.currentCount >= threshold;
      });

      if (met) {
        await this.awardBadge(userId, creatorId, badge.badgeCode, `Streak milestone: ${streak.currentCount} days`);
      } else {
        const maxThreshold = Math.max(...criteria.map(c => Number(c.thresholdValue)));
        const progress = Math.min(100, Math.floor((streak.currentCount / maxThreshold) * 100));
        await this.badgeRepo.upsertProgress({
          userId, badgeId: badge.id, creatorId,
          progressPercentage: progress,
          currentValue: streak.currentCount,
          targetValue: maxThreshold
        });
      }
    }
  }

  async createCustomBadge(creatorId: number, input: CreateBadgeInput): Promise<Badge> {
    const existing = await this.badgeRepo.findByCode(input.badgeCode);
    if (existing) throw new Error('Badge code already exists');

    const badge = await this.badgeRepo.create(input);
    await this.cacheService.del(`badge_catalog:${creatorId}:*`);
    logger.info(`Custom badge created: ${input.badgeCode} for creator ${creatorId}`);
    return badge;
  }

  async processUserBadges(
    userId: number,
    creatorId: number,
    context: {
      currentStreaks: Array<{ streakType: string; currentCount: number }>;
      totalWorkouts: number;
      totalVolume: number;
    }
  ): Promise<void> {
    const badges = await this.badgeRepo.findActive();

    for (const badge of badges) {
      const earned = await this.badgeRepo.findUserBadge(userId, badge.id);
      if (earned) continue;

      const criteria = await this.badgeRepo.findBadgeCriteria(badge.id);
      if (!criteria || criteria.length === 0) continue;

      let allMet = true;
      let progress = 0;

      for (const criterion of criteria) {
        const met = this.evaluateCriterion(criterion, context);
        if (!met) allMet = false;
        progress += this.calculateCriterionProgress(criterion, context);
      }

      if (allMet) {
        await this.awardBadge(userId, creatorId, badge.badgeCode, 'Badge criteria met');
      } else {
        const avgProgress = Math.floor(progress / criteria.length);
        await this.badgeRepo.upsertProgress({
          userId, badgeId: badge.id, creatorId,
          progressPercentage: avgProgress, currentValue: 0, targetValue: 0
        });
      }
    }
  }

  private evaluateCriterion(
    criterion: BadgeCriteria,
    context: {
      currentStreaks: Array<{ streakType: string; currentCount: number }>;
      totalWorkouts: number;
      totalVolume: number;
    }
  ): boolean {
    const threshold = Number(criterion.thresholdValue);
    const operator = criterion.comparisonOperator;
    let value = 0;

    switch (criterion.criterionType) {
      case 'streak_days': {
        const streak = context.currentStreaks.find(s => s.streakType === criterion.streakType);
        value = streak?.currentCount || 0;
        break;
      }
      case 'total_workouts':
        value = context.totalWorkouts;
        break;
      case 'total_volume':
        value = context.totalVolume;
        break;
      default:
        return false;
    }

    switch (operator) {
      case '=': return value === threshold;
      case '>': return value > threshold;
      case '>=': return value >= threshold;
      case '<': return value < threshold;
      case '<=': return value <= threshold;
      default: return false;
    }
  }

  private calculateCriterionProgress(
    criterion: BadgeCriteria,
    context: {
      currentStreaks: Array<{ streakType: string; currentCount: number }>;
      totalWorkouts: number;
      totalVolume: number;
    }
  ): number {
    const threshold = Number(criterion.thresholdValue);
    let value = 0;

    switch (criterion.criterionType) {
      case 'streak_days': {
        const streak = context.currentStreaks.find(s => s.streakType === criterion.streakType);
        value = streak?.currentCount || 0;
        break;
      }
      case 'total_workouts':
        value = context.totalWorkouts;
        break;
      case 'total_volume':
        value = context.totalVolume;
        break;
    }

    return Math.min(100, Math.floor((value / threshold) * 100));
  }
}
