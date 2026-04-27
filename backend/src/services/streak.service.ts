import prisma from '../db/client';
import { StreakRepository } from '../db/repositories/streak.repository';
import { EventRepository } from '../db/repositories/event.repository';
import { BadgeService } from './badge.service';
import { NotificationService } from './notification.service';
import { CacheService } from './cache.service';
import {
  StreakType,
  Streak,
  CreateStreakInput
} from '../types/streak.types';
import {
  isWithinQualificationWindow,
  getNextMilestone
} from '../utils/streak.utils';
import { STREAK_MILESTONES, AT_RISK_HOURS, BROKEN_HOURS } from '../constants/streak.constants';
import { logger } from '../config/logger';

interface StreakEventResult {
  streak: Streak;
  milestoneAchieved: number | null;
  isFirstActivity: boolean;
  isNewStreak: boolean;
  previousCount?: number;
  newCount: number;
}

export class StreakService {
  private streakRepo: StreakRepository;
  private eventRepo: EventRepository;
  private badgeService: BadgeService;
  private notificationService: NotificationService;
  private cacheService: CacheService;

  constructor() {
    this.streakRepo = new StreakRepository(prisma);
    this.eventRepo = new EventRepository(prisma);
    this.badgeService = new BadgeService();
    this.notificationService = new NotificationService();
    this.cacheService = new CacheService();
  }

  async getUserStreaks(userId: number, creatorId: number): Promise<Streak[]> {
    const cacheKey = `streaks:${userId}:${creatorId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached as Streak[];

    const streaks = await this.streakRepo.findByUserAndCreator(userId, creatorId);
    const enriched = streaks.map(streak => this.enrichStreak(streak));

    await this.cacheService.set(cacheKey, enriched, 300);
    return enriched;
  }

  async getStreakByType(
    userId: number,
    creatorId: number,
    streakType: StreakType
  ): Promise<Streak | null> {
    const streak = await this.streakRepo.findByUserAndType(userId, creatorId, streakType);
    if (!streak) return null;
    return this.enrichStreak(streak);
  }

  async getStreakHistory(
    userId: number,
    creatorId: number,
    streakType?: StreakType,
    limit = 20,
    offset = 0
  ) {
    return this.streakRepo.getHistory(userId, creatorId, streakType, limit, offset);
  }

  async processStreakEvent(
    userId: number,
    creatorId: number,
    streakType: StreakType,
    eventDate: Date,
    eventSource: string,
    sourceEventId: string
  ): Promise<StreakEventResult> {
    const existingEvent = await this.eventRepo.findBySourceId(
      userId, creatorId, streakType, eventDate, sourceEventId
    );

    if (existingEvent) {
      const streak = await this.getStreakByType(userId, creatorId, streakType);
      if (!streak) throw new Error('Streak not found for existing event');
      return { streak, milestoneAchieved: null, isFirstActivity: false, isNewStreak: false, newCount: streak.currentCount };
    }

    let streak = await this.getStreakByType(userId, creatorId, streakType);
    const isNewStreak = !streak;
    const previousCount = streak?.currentCount || 0;

    if (isNewStreak) {
      streak = await this.createStreak({ userId, creatorId, streakType, lastActivityDate: eventDate });
    } else {
      streak = await this.updateStreak(streak!, eventDate);
    }

    await this.eventRepo.create({
      userId, creatorId, streakType, eventDate,
      activityCount: 1, qualified: true, eventSource, sourceEventId, metadata: {}
    });

    await this.cacheService.del(`streaks:${userId}:${creatorId}`);

    const milestoneAchieved = await this.checkAndAwardMilestone(streak, previousCount);
    await this.badgeService.updateProgressForStreak(userId, creatorId, streak);

    return {
      streak: (await this.getStreakByType(userId, creatorId, streakType))!,
      milestoneAchieved,
      isFirstActivity: isNewStreak,
      isNewStreak,
      previousCount,
      newCount: streak.currentCount
    };
  }

  async activateFreeze(
    userId: number,
    creatorId: number,
    streakType: StreakType,
    reason?: string
  ): Promise<Streak> {
    const streak = await this.getStreakByType(userId, creatorId, streakType);
    if (!streak) throw new Error('Streak not found');
    if (!streak.freezeAvailable) throw new Error('No freeze available');
    if (!streak.isActive) throw new Error('Cannot freeze inactive streak');

    await this.streakRepo.createFreeze({
      userId, creatorId, streakType,
      freezeDate: new Date(),
      streakCountAtFreeze: streak.currentCount,
      reason: reason || 'User requested'
    });

    const updated = await this.streakRepo.update(streak.id, {
      freezeAvailable: false,
      freezeUsedCount: streak.freezeUsedCount + 1,
      freezeLastUsed: new Date()
    });

    await this.cacheService.del(`streaks:${userId}:${creatorId}`);
    logger.info(`Freeze activated for streak ${streak.id}`);
    return this.enrichStreak(updated);
  }

  async breakStreak(streakId: string): Promise<void> {
    const streak = await this.streakRepo.findById(streakId);
    if (!streak) return;

    await this.streakRepo.createHistory({
      streakId, userId: streak.userId, creatorId: streak.creatorId,
      streakType: streak.streakType, eventType: 'broken',
      previousCount: streak.currentCount, newCount: 0,
      milestoneAchieved: null,
      reason: 'No qualifying activity within 24 hours',
      snapshot: { streak }
    });

    await this.streakRepo.update(streakId, { isActive: false });
    await this.cacheService.del(`streaks:${streak.userId}:${streak.creatorId}`);
    await this.notificationService.sendStreakBroken(streak);
    logger.info(`Streak broken: ${streakId}`);
  }

  async getStreaksNeedingCheck(beforeDate: Date): Promise<Streak[]> {
    return this.streakRepo.findStreaksNeedingReset(beforeDate);
  }

  async getAtRiskStreaks(hoursThreshold: number = AT_RISK_HOURS): Promise<Streak[]> {
    const allStreaks = await this.streakRepo.findActive();
    return allStreaks.filter(streak => {
      const hoursSince = (Date.now() - streak.lastActivityDate.getTime()) / (1000 * 60 * 60);
      return hoursSince >= hoursThreshold && hoursSince < BROKEN_HOURS;
    });
  }

  async hasFreezeForDate(
    userId: number,
    creatorId: number,
    streakType: string,
    date: Date
  ): Promise<boolean> {
    const freezes = await this.streakRepo.findFreezesForDate(userId, creatorId, streakType, date);
    return freezes.length > 0;
  }

  async getTopStreaks(creatorId: number, streakType: StreakType, limit = 100): Promise<Streak[]> {
    const streaks = await this.streakRepo.findByCreatorAndType(creatorId, streakType);
    return streaks.sort((a, b) => b.currentCount - a.currentCount).slice(0, limit);
  }

  private async createStreak(input: CreateStreakInput): Promise<Streak> {
    const streak = await this.streakRepo.create({
      userId: input.userId,
      creatorId: input.creatorId,
      streakType: input.streakType,
      lastActivityDate: input.lastActivityDate,
      metadata: input.metadata
    });

    await this.streakRepo.createHistory({
      streakId: streak.id, userId: input.userId, creatorId: input.creatorId,
      streakType: input.streakType, eventType: 'started',
      previousCount: 0, newCount: 1, milestoneAchieved: null,
      reason: 'First qualifying activity', snapshot: { streak }
    });

    await this.notificationService.sendStreakStarted(streak);
    logger.info(`Streak created: ${streak.id} for user ${input.userId}`);
    return streak;
  }

  private async updateStreak(streak: Streak, activityDate: Date): Promise<Streak> {
    const isWithinWindow = isWithinQualificationWindow(streak.lastActivityDate, activityDate);

    if (!isWithinWindow) {
      await this.breakStreak(streak.id);
      return this.createStreak({
        userId: streak.userId,
        creatorId: streak.creatorId,
        streakType: streak.streakType as StreakType,
        lastActivityDate: activityDate
      });
    }

    const newCount = streak.currentCount + 1;
    const isLongest = newCount > streak.longestCount;

    const updated = await this.streakRepo.update(streak.id, {
      currentCount: newCount,
      longestCount: isLongest ? newCount : streak.longestCount,
      lastActivityDate: activityDate,
      milestoneProgress: this.calculateProgress(newCount, streak.nextMilestone!)
    });

    await this.streakRepo.createHistory({
      streakId: streak.id, userId: streak.userId, creatorId: streak.creatorId,
      streakType: streak.streakType, eventType: 'incremented',
      previousCount: streak.currentCount, newCount,
      milestoneAchieved: null,
      reason: 'Qualifying activity within window',
      snapshot: { previousStreak: streak, newStreak: updated }
    });

    return updated;
  }

  private async checkAndAwardMilestone(streak: Streak, previousCount: number): Promise<number | null> {
    const milestone = STREAK_MILESTONES.find(m => m.days === streak.currentCount);
    if (!milestone) return null;

    await this.streakRepo.update(streak.id, { nextMilestone: getNextMilestone(streak.currentCount) });

    await this.streakRepo.createHistory({
      streakId: streak.id, userId: streak.userId, creatorId: streak.creatorId,
      streakType: streak.streakType, eventType: 'milestone',
      previousCount, newCount: streak.currentCount,
      milestoneAchieved: milestone.days,
      reason: `Milestone: ${milestone.days} day streak`,
      snapshot: { streak }
    });

    if (milestone.badgeCode) {
      await this.badgeService.awardBadge(
        streak.userId, streak.creatorId, milestone.badgeCode,
        `Achieved ${milestone.days} day ${streak.streakType} streak`
      );
    }

    await this.notificationService.sendMilestoneAchieved(streak, milestone.days);
    logger.info(`Milestone achieved: ${milestone.days} days for user ${streak.userId}`);
    return milestone.days;
  }

  private enrichStreak(streak: Streak): Streak {
    const hoursSince = (Date.now() - streak.lastActivityDate.getTime()) / (1000 * 60 * 60);
    return {
      ...streak,
      isAtRisk: streak.isActive && hoursSince >= AT_RISK_HOURS && hoursSince < BROKEN_HOURS,
      hoursUntilBreak: Math.max(0, BROKEN_HOURS - hoursSince),
      hoursUntilRisk: Math.max(0, AT_RISK_HOURS - hoursSince)
    };
  }

  private calculateProgress(current: number, milestone: number): number {
    if (current >= milestone) return 100;
    return Math.floor((current / milestone) * 100);
  }
}
