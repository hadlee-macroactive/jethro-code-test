# Service Layer

Complete service class implementations with all methods specified.

## Architecture

```
API Controller → Service → Repository → Database
                ↓
           (Business Logic)
                ↓
           (Side Effects)
        - Notifications
        - Events
        - Cache Updates
```

## StreakService

**File:** `src/services/streak.service.ts`

```typescript
import prisma from '@db/client';
import { StreakRepository } from '@db/repositories/streak.repository';
import { EventRepository } from '@db/repositories/event.repository';
import { BadgeService } from './badge.service';
import { NotificationService } from './notification.service';
import { CacheService } from './cache.service';
import {
  StreakType,
  Streak,
  CreateStreakInput,
  UpdateStreakInput
} from '@types/streak.types';
import {
  calculateStreakCount,
  isWithinQualificationWindow,
  getNextMilestone,
  getUserLocalDate,
  isStreakAtRisk,
  shouldBreakStreak
} from '@utils/streak.utils';
import { STREAK_MILESTONES, AT_RISK_HOURS, BROKEN_HOURS } from '@constants/streak.constants';
import { logger } from '@config/logger';

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

  // ============================================
  // QUERY METHODS
  // ============================================

  /**
   * Get all streaks for a user
   */
  async getUserStreaks(userId: number, creatorId: number): Promise<Streak[]> {
    const cacheKey = `streaks:${userId}:${creatorId}`;

    // Try cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as Streak[];
    }

    const streaks = await this.streakRepo.findByUserAndCreator(userId, creatorId);

    // Enrich with computed properties
    const enriched = await Promise.all(
      streaks.map(streak => this.enrichStreak(streak))
    );

    // Cache for 5 minutes
    await this.cacheService.set(cacheKey, enriched, 300);

    return enriched;
  }

  /**
   * Get a specific streak by type
   */
  async getStreakByType(
    userId: number,
    creatorId: number,
    streakType: StreakType
  ): Promise<Streak | null> {
    const streak = await this.streakRepo.findByUserAndType(userId, creatorId, streakType);

    if (!streak) return null;

    return this.enrichStreak(streak);
  }

  /**
   * Get streak history
   */
  async getStreakHistory(
    userId: number,
    creatorId: number,
    streakType?: StreakType,
    limit = 20,
    offset = 0
  ) {
    return this.streakRepo.getHistory(userId, creatorId, streakType, limit, offset);
  }

  // ============================================
  // COMMAND METHODS
  // ============================================

  /**
   * Process a streak event (called when user completes activity)
   */
  async processStreakEvent(
    userId: number,
    creatorId: number,
    streakType: StreakType,
    eventDate: Date,
    eventSource: string,
    sourceEventId: string
  ): Promise<StreakEventResult> {
    // Check for duplicate event (idempotency)
    const existingEvent = await this.eventRepo.findBySourceId(
      userId,
      creatorId,
      streakType,
      eventDate,
      sourceEventId
    );

    if (existingEvent) {
      const streak = await this.getStreakByType(userId, creatorId, streakType);
      if (!streak) {
        throw new Error('Streak not found for existing event');
      }
      return {
        streak,
        milestoneAchieved: null,
        isFirstActivity: false,
        isNewStreak: false
      };
    }

    // Get or create streak
    let streak = await this.getStreakByType(userId, creatorId, streakType);
    const isNewStreak = !streak;
    const previousCount = streak?.currentCount || 0;

    if (isNewStreak) {
      streak = await this.createStreak({
        userId,
        creatorId,
        streakType,
        lastActivityDate: eventDate
      });
    } else {
      streak = await this.updateStreak(streak, eventDate);
    }

    // Record the event
    await this.eventRepo.create({
      userId,
      creatorId,
      streakType,
      eventDate,
      activityCount: 1,
      qualified: true,
      eventSource,
      sourceEventId,
      metadata: {}
    });

    // Invalidate cache
    await this.cacheService.del(`streaks:${userId}:${creatorId}`);

    // Check for milestone
    const milestoneAchieved = await this.checkAndAwardMilestone(streak, previousCount);

    // Update badge progress
    await this.badgeService.updateProgressForStreak(userId, creatorId, streak);

    return {
      streak: await this.getStreakByType(userId, creatorId, streakType)!,
      milestoneAchieved,
      isFirstActivity: isNewStreak,
      isNewStreak,
      previousCount,
      newCount: streak.currentCount
    };
  }

  /**
   * Activate streak freeze
   */
  async activateFreeze(
    userId: number,
    creatorId: number,
    streakType: StreakType,
    reason?: string
  ): Promise<Streak> {
    const streak = await this.getStreakByType(userId, creatorId, streakType);

    if (!streak) {
      throw new Error('Streak not found');
    }

    if (!streak.freezeAvailable) {
      throw new Error('No freeze available');
    }

    if (!streak.isActive) {
      throw new Error('Cannot freeze inactive streak');
    }

    // Create freeze record
    await this.streakRepo.createFreeze({
      userId,
      creatorId,
      streakType,
      freezeDate: new Date(),
      streakCountAtFreeze: streak.currentCount,
      reason: reason || 'User requested'
    });

    // Update streak
    const updated = await this.streakRepo.update(streak.id, {
      freezeAvailable: false,
      freezeUsedCount: streak.freezeUsedCount + 1,
      freezeLastUsed: new Date()
    });

    // Invalidate cache
    await this.cacheService.del(`streaks:${userId}:${creatorId}`);

    logger.info(`Freeze activated for streak ${streak.id}`);

    return this.enrichStreak(updated);
  }

  /**
   * Break streak (called by daily job)
   */
  async breakStreak(streakId: string): Promise<void> {
    const streak = await this.streakRepo.findById(streakId);
    if (!streak) return;

    // Create history record
    await this.streakRepo.createHistory({
      streakId,
      userId: streak.userId,
      creatorId: streak.creatorId,
      streakType: streak.streakType,
      eventType: 'broken',
      previousCount: streak.currentCount,
      newCount: 0,
      milestoneAchieved: null,
      reason: 'No qualifying activity within 24 hours',
      snapshot: { streak }
    });

    // Update streak
    await this.streakRepo.update(streakId, { isActive: false });

    // Invalidate cache
    await this.cacheService.del(`streaks:${streak.userId}:${streak.creatorId}`);

    // Send broken notification
    await this.notificationService.sendStreakBroken(streak);

    logger.info(`Streak broken: ${streakId}`);
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  /**
   * Create a new streak
   */
  private async createStreak(input: CreateStreakInput): Promise<Streak> {
    const milestone = STREAK_MILESTONES[0];

    const streak = await this.streakRepo.create({
      userId: input.userId,
      creatorId: input.creatorId,
      streakType: input.streakType,
      currentCount: 1,
      longestCount: 1,
      lastActivityDate: input.lastActivityDate,
      streakStartDate: input.lastActivityDate,
      isActive: true,
      nextMilestone: milestone.days,
      milestoneProgress: 0,
      freezeAvailable: true,
      freezeUsedCount: 0,
      freezeLastUsed: null,
      metadata: input.metadata || {}
    });

    // Create history
    await this.streakRepo.createHistory({
      streakId: streak.id,
      userId: input.userId,
      creatorId: input.creatorId,
      streakType: input.streakType,
      eventType: 'started',
      previousCount: 0,
      newCount: 1,
      milestoneAchieved: null,
      reason: 'First qualifying activity',
      snapshot: { streak }
    });

    // Send started notification (for first streak)
    await this.notificationService.sendStreakStarted(streak);

    logger.info(`Streak created: ${streak.id} for user ${input.userId}`);

    return streak;
  }

  /**
   * Update an existing streak
   */
  private async updateStreak(
    streak: Streak,
    activityDate: Date
  ): Promise<Streak> {
    const isWithinWindow = isWithinQualificationWindow(
      streak.lastActivityDate,
      activityDate
    );

    if (!isWithinWindow) {
      // Streak broken, create new one
      await this.breakStreak(streak.id);
      return this.createStreak({
        userId: streak.userId,
        creatorId: streak.creatorId,
        streakType: streak.streakType,
        lastActivityDate: activityDate
      });
    }

    // Increment streak
    const newCount = streak.currentCount + 1;
    const isLongest = newCount > streak.longestCount;

    const updated = await this.streakRepo.update(streak.id, {
      currentCount: newCount,
      longestCount: isLongest ? newCount : streak.longestCount,
      lastActivityDate: activityDate,
      milestoneProgress: this.calculateProgress(newCount, streak.nextMilestone!)
    });

    // Create history
    await this.streakRepo.createHistory({
      streakId: streak.id,
      userId: streak.userId,
      creatorId: streak.creatorId,
      streakType: streak.streakType,
      eventType: 'incremented',
      previousCount: streak.currentCount,
      newCount,
      milestoneAchieved: null,
      reason: 'Qualifying activity within window',
      snapshot: { previousStreak: streak, newStreak: updated }
    });

    return updated;
  }

  /**
   * Check and award milestone if achieved
   */
  private async checkAndAwardMilestone(
    streak: Streak,
    previousCount: number
  ): Promise<number | null> {
    const milestone = STREAK_MILESTONES.find(
      m => m.days === streak.currentCount
    );

    if (!milestone) return null;

    // Update streak next milestone
    await this.streakRepo.update(streak.id, {
      nextMilestone: getNextMilestone(streak.currentCount)
    });

    // Create history
    await this.streakRepo.createHistory({
      streakId: streak.id,
      userId: streak.userId,
      creatorId: streak.creatorId,
      streakType: streak.streakType,
      eventType: 'milestone',
      previousCount,
      newCount: streak.currentCount,
      milestoneAchieved: milestone.days,
      reason: `Milestone: ${milestone.days} day streak`,
      snapshot: { streak }
    });

    // Award badge if configured
    if (milestone.badgeCode) {
      await this.badgeService.awardBadge(
        streak.userId,
        streak.creatorId,
        milestone.badgeCode,
        `Achieved ${milestone.days} day ${streak.streakType} streak`
      );
    }

    // Send milestone notification
    await this.notificationService.sendMilestoneAchieved(
      streak,
      milestone.days
    );

    logger.info(`Milestone achieved: ${milestone.days} days for user ${streak.userId}`);

    return milestone.days;
  }

  /**
   * Enrich streak with computed properties
   */
  private async enrichStreak(streak: Streak): Promise<Streak> {
    const hoursSince = (Date.now() - streak.lastActivityDate.getTime()) / (1000 * 60 * 60);

    return {
      ...streak,
      isAtRisk: streak.isActive && hoursSince >= AT_RISK_HOURS && hoursSince < BROKEN_HOURS,
      hoursUntilBreak: Math.max(0, BROKEN_HOURS - hoursSince),
      hoursUntilRisk: Math.max(0, AT_RISK_HOURS - hoursSince)
    };
  }

  /**
   * Calculate progress percentage to next milestone
   */
  private calculateProgress(current: number, milestone: number): number {
    if (current >= milestone) return 100;
    return Math.floor((current / milestone) * 100);
  }

  // ============================================
  // BATCH OPERATIONS (for jobs)
  // ============================================

  /**
   * Get all streaks that need processing
   */
  async getStreaksNeedingCheck(beforeDate: Date): Promise<Streak[]> {
    return this.streakRepo.findStreaksNeedingReset(beforeDate);
  }

  /**
   * Get users at risk of losing streak
   */
  async getAtRiskStreaks(hoursThreshold: number = AT_RISK_HOURS): Promise<Streak[]> {
    const allStreaks = await this.streakRepo.findActive();

    return allStreaks.filter(streak => {
      const hoursSince = (Date.now() - streak.lastActivityDate.getTime()) / (1000 * 60 * 60);
      return hoursSince >= hoursThreshold && hoursSince < BROKEN_HOURS;
    });
  }

  /**
   * Get top streaks for leaderboard
   */
  async getTopStreaks(
    creatorId: number,
    streakType: StreakType,
    limit = 100
  ): Promise<Streak[]> {
    const streaks = await this.streakRepo.findByCreatorAndType(creatorId, streakType);

    return streaks
      .sort((a, b) => b.currentCount - a.currentCount)
      .slice(0, limit);
  }
}

/**
 * Streak Event Result
 */
interface StreakEventResult {
  streak: Streak;
  milestoneAchieved: number | null;
  isFirstActivity: boolean;
  isNewStreak: boolean;
  previousCount?: number;
  newCount: number;
}
```

## BadgeService

**File:** `src/services/badge.service.ts`

```typescript
import prisma from '@db/client';
import { BadgeRepository } from '@db/repositories/badge.repository';
import { StreakRepository } from '@db/repositories/streak.repository';
import { EventRepository } from '@db/repositories/event.repository';
import { NotificationService } from './notification.service';
import {
  Badge,
  BadgeProgress,
  UserBadge,
  BadgeWithProgress,
  BadgeCriteria,
  BadgeRarity,
  BadgeCategory,
  CreateBadgeInput,
  ManualBadgeAwardInput
} from '@types/badge.types';
import { StreakType } from '@types/streak.types';
import { logger } from '@config/logger';
import { CacheService } from './cache.service';

export class BadgeService {
  private badgeRepo: BadgeRepository;
  private streakRepo: StreakRepository;
  private eventRepo: EventRepository;
  private notificationService: NotificationService;
  private cacheService: CacheService;

  constructor() {
    this.badgeRepo = new BadgeRepository(prisma);
    this.streakRepo = new StreakRepository(prisma);
    this.eventRepo = new EventRepository(prisma);
    this.notificationService = new NotificationService();
    this.cacheService = new CacheService();
  }

  // ============================================
  // QUERY METHODS
  // ============================================

  /**
   * Get all badges for a user
   */
  async getUserBadges(
    userId: number,
    creatorId: number,
    options: {
      includeProgress?: boolean;
      category?: BadgeCategory;
    } = {}
  ): Promise<{ earned: BadgeWithProgress[]; inProgress: BadgeWithProgress[] }> {
    const { includeProgress = false, category } = options;

    // Get earned badges
    let earned = await this.badgeRepo.findUserBadges(userId, creatorId);
    if (category) {
      earned = earned.filter(b => b.badge.badgeCategory === category);
    }

    // Get in-progress badges if requested
    let inProgress: BadgeWithProgress[] = [];
    if (includeProgress) {
      const progress = await this.badgeRepo.findUserProgress(userId, creatorId);
      inProgress = await Promise.all(
        progress.map(async p => {
          const badge = await this.badgeRepo.findById(p.badgeId);
          return {
            ...badge!,
            progressPercentage: p.progressPercentage,
            currentValue: Number(p.currentValue),
            targetValue: Number(p.targetValue),
            isEarned: false,
            isLocked: false
          };
        })
      );
    }

    // Enrich earned badges
    const enrichedEarned = earned.map(eb => ({
      ...eb.badge,
      earnedAt: eb.awardedAt,
      isEarned: true,
      isLocked: false,
      progressPercentage: 100
    }));

    return { earned: enrichedEarned, inProgress };
  }

  /**
   * Get badge catalog
   */
  async getBadgeCatalog(
    creatorId: number,
    category?: BadgeCategory
  ): Promise<Badge[]> {
    const cacheKey = `badge_catalog:${creatorId}:${category || 'all'}`;

    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as Badge[];
    }

    let badges = await this.badgeRepo.findActive();

    if (category) {
      badges = badges.filter(b => b.badgeCategory === category);
    }

    await this.cacheService.set(cacheKey, badges, 3600); // Cache for 1 hour

    return badges;
  }

  /**
   * Get badge detail with progress
   */
  async getBadgeDetail(
    userId: number,
    creatorId: number,
    badgeCode: string
  ): Promise<BadgeWithProgress | null> {
    const badge = await this.badgeRepo.findByCode(badgeCode);
    if (!badge) return null;

    // Check if earned
    const userBadge = await this.badgeRepo.findUserBadge(userId, badge.id);

    // Check progress
    const progress = await this.badgeRepo.findUserBadgeProgress(userId, badge.id);

    return {
      ...badge,
      earnedAt: userBadge?.awardedAt,
      progressPercentage: progress?.progressPercentage || 0,
      currentValue: progress ? Number(progress.currentValue) : 0,
      targetValue: progress ? Number(progress.targetValue) : 0,
      isEarned: !!userBadge,
      isLocked: !userBadge && !progress
    };
  }

  // ============================================
  // COMMAND METHODS
  // ============================================

  /**
   * Award badge to user (manual or automatic)
   */
  async awardBadge(
    userId: number,
    creatorId: number,
    badgeCode: string,
    reason: string,
    options: {
      awardedBy?: string;
      notify?: boolean;
    } = {}
  ): Promise<UserBadge> {
    // Get badge
    const badge = await this.badgeRepo.findByCode(badgeCode);
    if (!badge) {
      throw new Error(`Badge not found: ${badgeCode}`);
    }

    // Check if already earned
    const existing = await this.badgeRepo.findUserBadge(userId, badge.id);
    if (existing) {
      logger.info(`Badge already earned: ${badgeCode} by user ${userId}`);
      return existing;
    }

    // Award badge
    const userBadge = await this.badgeRepo.createUserBadge({
      userId,
      badgeId: badge.id,
      creatorId,
      awardedBy: options.awardedBy || 'system',
      awardReason: reason,
      progressPercentage: 100,
      isDisplayed: true
    });

    // Create/update progress as complete
    await this.badgeRepo.upsertProgress({
      userId,
      badgeId: badge.id,
      creatorId,
      progressPercentage: 100,
      currentValue: 0, // Will be set by criteria evaluation
      targetValue: 0
    });

    // Invalidate cache
    await this.cacheService.del(`badges:${userId}:${creatorId}`);

    // Send notification
    if (options.notify !== false) {
      await this.notificationService.sendBadgeEarned(userId, badge);
    }

    logger.info(`Badge awarded: ${badgeCode} to user ${userId}`);

    return userBadge;
  }

  /**
   * Update badge progress based on streak
   */
  async updateProgressForStreak(
    userId: number,
    creatorId: number,
    streak: {
      streakType: StreakType;
      currentCount: number;
    }
  ): Promise<void> {
    // Get all badges that depend on this streak type
    const badges = await this.badgeRepo.findByCriteriaType('streak_days');

    for (const badge of badges) {
      // Get criteria for this badge
      const criteria = await this.badgeRepo.findBadgeCriteria(badge.id, 'streak_days');

      if (!criteria || criteria.length === 0) continue;

      // Check if criteria met
      const met = criteria.every(c => {
        const threshold = Number(c.thresholdValue);
        return streak.currentCount >= threshold;
      });

      if (met) {
        // Award badge if not already earned
        await this.awardBadge(
          userId,
          creatorId,
          badge.badgeCode,
          `Streak milestone: ${streak.currentCount} days`
        );
      } else {
        // Update progress
        const maxThreshold = Math.max(...criteria.map(c => Number(c.thresholdValue)));
        const progress = Math.min(100, Math.floor((streak.currentCount / maxThreshold) * 100));

        await this.badgeRepo.upsertProgress({
          userId,
          badgeId: badge.id,
          creatorId,
          progressPercentage: progress,
          currentValue: streak.currentCount,
          targetValue: maxThreshold
        });
      }
    }
  }

  /**
   * Create custom badge (Creator)
   */
  async createCustomBadge(
    creatorId: number,
    input: CreateBadgeInput
  ): Promise<Badge> {
    // Validate badge code doesn't exist
    const existing = await this.badgeRepo.findByCode(input.badgeCode);
    if (existing) {
      throw new Error('Badge code already exists');
    }

    const badge = await this.badgeRepo.create({
      ...input,
      isActive: true,
      isCreatorCustomizable: true
    });

    // Invalidate badge catalog cache
    await this.cacheService.del(`badge_catalog:${creatorId}:*`);

    logger.info(`Custom badge created: ${input.badgeCode} for creator ${creatorId}`);

    return badge;
  }

  // ============================================
  // BATCH OPERATIONS
  // ============================================

  /**
   * Process all badges for a user (called after activity)
   */
  async processUserBadges(
    userId: number,
    creatorId: number,
    context: {
      currentStreaks: Array<{ streakType: StreakType; currentCount: number }>;
      totalWorkouts: number;
      totalVolume: number;
    }
  ): Promise<void> {
    // Get all active badges
    const badges = await this.badgeRepo.findActive();

    for (const badge of badges) {
      // Skip if already earned
      const earned = await this.badgeRepo.findUserBadge(userId, badge.id);
      if (earned) continue;

      // Get criteria
      const criteria = await this.badgeRepo.findBadgeCriteria(badge.id);

      if (!criteria || criteria.length === 0) continue;

      // Evaluate each criterion
      let allMet = true;
      let progress = 0;

      for (const criterion of criteria) {
        const met = this.evaluateCriterion(criterion, context);
        if (!met) {
          allMet = false;
        }
        progress += this.calculateCriterionProgress(criterion, context);
      }

      // Update progress or award
      if (allMet) {
        await this.awardBadge(
          userId,
          creatorId,
          badge.badgeCode,
          'Badge criteria met'
        );
      } else {
        const avgProgress = Math.floor(progress / criteria.length);
        await this.badgeRepo.upsertProgress({
          userId,
          badgeId: badge.id,
          creatorId,
          progressPercentage: avgProgress,
          currentValue: 0,
          targetValue: 0
        });
      }
    }
  }

  /**
   * Evaluate a single badge criterion
   */
  private evaluateCriterion(
    criterion: BadgeCriteria,
    context: {
      currentStreaks: Array<{ streakType: StreakType; currentCount: number }>;
      totalWorkouts: number;
      totalVolume: number;
    }
  ): boolean {
    const threshold = Number(criterion.thresholdValue);
    const operator = criterion.comparisonOperator;

    let value = 0;

    switch (criterion.criterionType) {
      case 'streak_days':
        const streak = context.currentStreaks.find(s => s.streakType === criterion.streakType);
        value = streak?.currentCount || 0;
        break;

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
      case '=':
        return value === threshold;
      case '>':
        return value > threshold;
      case '>=':
        return value >= threshold;
      case '<':
        return value < threshold;
      case '<=':
        return value <= threshold;
      default:
        return false;
    }
  }

  /**
   * Calculate progress for a criterion (0-100)
   */
  private calculateCriterionProgress(
    criterion: BadgeCriteria,
    context: {
      currentStreaks: Array<{ streakType: StreakType; currentCount: number }>;
      totalWorkouts: number;
      totalVolume: number;
    }
  ): number {
    const threshold = Number(criterion.thresholdValue);

    let value = 0;
    switch (criterion.criterionType) {
      case 'streak_days':
        const streak = context.currentStreaks.find(s => s.streakType === criterion.streakType);
        value = streak?.currentCount || 0;
        break;

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
```

## NotificationService

**File:** `src/services/notification.service.ts`

```typescript
import prisma from '@db/client';
import { CacheService } from './cache.service';
import { Streak } from '@types/streak.types';
import { Badge } from '@types/badge.types';
import { logger } from '@config/logger';

interface PushPayload {
  userId: number;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
}

export class NotificationService {
  private cacheService: CacheService;
  private pushServiceUrl: string;
  private pushServiceKey: string;

  constructor() {
    this.cacheService = new CacheService();
    this.pushServiceUrl = process.env.PUSH_SERVICE_URL || '';
    this.pushServiceKey = process.env.PUSH_SERVICE_API_KEY || '';
  }

  // ============================================
  // STREAK NOTIFICATIONS
  // ============================================

  /**
   * Send notification when streak is started
   */
  async sendStreakStarted(streak: Streak): Promise<void> {
    await this.sendPush({
      userId: streak.userId,
      title: '🔥 Streak Started!',
      body: `You've started your first ${streak.streakType} streak. Keep it going!`,
      data: {
        type: 'streak_started',
        streakId: streak.id,
        streakType: streak.streakType
      }
    });
  }

  /**
   * Send notification when streak is at risk
   */
  async sendStreakAtRisk(streak: Streak, hoursRemaining: number): Promise<void> {
    const hasFreeze = streak.freezeAvailable;

    await this.sendPush({
      userId: streak.userId,
      title: '⚠️ Your streak is at risk!',
      body: `Complete a ${streak.streakType} activity in the next ${Math.round(hoursRemaining)} hours to keep your ${streak.currentCount}-day streak alive!${hasFreeze ? ' Or use a freeze.' : ''}`,
      data: {
        type: 'streak_at_risk',
        streakId: streak.id,
        hoursRemaining,
        freezeAvailable: hasFreeze
      },
      actionUrl: `macroactive://streaks/${streak.id}`
    });
  }

  /**
   * Send notification when milestone is achieved
   */
  async sendMilestoneAchieved(streak: Streak, milestoneDays: number): Promise<void> {
    await this.sendPush({
      userId: streak.userId,
      title: `🎉 ${milestoneDays}-Day Milestone!`,
      body: `Amazing work! You've completed ${milestoneDays} consecutive days of ${streak.streakType}!`,
      data: {
        type: 'milestone_achieved',
        streakId: streak.id,
        milestoneDays
      },
      actionUrl: `macroactive://celebration?milestone=${milestoneDays}`
    });
  }

  /**
   * Send notification when streak is broken
   */
  async sendStreakBroken(streak: Streak): Promise<void> {
    await this.sendPush({
      userId: streak.userId,
      title: '💔 Streak Broken',
      body: `Your ${streak.currentCount}-day ${streak.streakType} streak has ended. But don't worry—start fresh today!`,
      data: {
        type: 'streak_broken',
        streakId: streak.id,
        finalCount: streak.currentCount
      },
      actionUrl: `macroactive://streaks/${streak.id}`
    });
  }

  /**
   * Send notification when freeze is activated
   */
  async sendFreezeActivated(streak: Streak): Promise<void> {
    await this.sendPush({
      userId: streak.userId,
      title: '❄️ Streak Frozen',
      body: `Your streak has been frozen. Take a rest day and come back stronger tomorrow!`,
      data: {
        type: 'freeze_activated',
        streakId: streak.id
      }
    });
  }

  // ============================================
  // BADGE NOTIFICATIONS
  // ============================================

  /**
   * Send notification when badge is earned
   */
  async sendBadgeEarned(userId: number, badge: Badge): Promise<void> {
    await this.sendPush({
      userId,
      title: `🏆 New Badge: ${badge.name}`,
      body: `Congratulations! You've earned the ${badge.name} badge!`,
      data: {
        type: 'badge_earned',
        badgeId: badge.id,
        badgeCode: badge.badgeCode,
        rarity: badge.rarity
      },
      actionUrl: `macroactive://badges/${badge.id}`
    });
  }

  /**
   * Send notification for badge progress
   */
  async sendBadgeProgress(
    userId: number,
    badge: Badge,
    progress: number
  ): Promise<void> {
    // Only notify for significant progress
    if (progress < 50) return;

    await this.sendPush({
      userId,
      title: `🏆 Badge Progress`,
      body: `You're ${progress}% of the way to earning ${badge.name}!`,
      data: {
        type: 'badge_progress',
        badgeId: badge.id,
        progress
      }
    });
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Send push notification via external service
   */
  private async sendPush(payload: PushPayload): Promise<void> {
    try {
      const response = await fetch(`${this.pushServiceUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.pushServiceKey}`
        },
        body: JSON.stringify({
          user_id: payload.userId,
          notification: {
            title: payload.title,
            body: payload.body,
            data: payload.data,
            click_action: payload.actionUrl
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Push service error: ${response.statusText}`);
      }

      logger.info(`Push sent to user ${payload.userId}: ${payload.title}`);

    } catch (error) {
      logger.error('Failed to send push notification', error);
      // Queue for retry
      await this.queueForRetry(payload);
    }
  }

  /**
   * Queue failed notification for retry
   */
  private async queueForRetry(payload: PushPayload): Promise<void> {
    // Add to Redis list for retry queue
    // Implementation depends on queue setup
    logger.warn(`Notification queued for retry: ${payload.title}`);
  }

  /**
   * Check user notification preferences
   */
  private async checkNotificationPreferences(
    userId: number,
    type: string
  ): Promise<boolean> {
    const cacheKey = `notification_prefs:${userId}`;

    let prefs = await this.cacheService.get(cacheKey);
    if (!prefs) {
      // Fetch from DB or use defaults
      prefs = {
        streaks_enabled: true,
        badges_enabled: true,
        milestone_enabled: true
      };
    }

    switch (type) {
      case 'streak_started':
      case 'streak_at_risk':
      case 'streak_broken':
        return prefs.streaks_enabled ?? true;

      case 'badge_earned':
      case 'badge_progress':
        return prefs.badges_enabled ?? true;

      case 'milestone_achieved':
        return prefs.milestone_enabled ?? true;

      default:
        return true;
    }
  }

  /**
   * Batch send to multiple users
   */
  async sendBatch(payloads: PushPayload[]): Promise<void> {
    // Process in batches of 100
    const batchSize = 100;
    for (let i = 0; i < payloads.length; i += batchSize) {
      const batch = payloads.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(p => this.sendPush(p))
      );
    }
  }
}
```

## CacheService

**File:** `src/services/cache.service.ts`

```typescript
import Redis from 'ioredis';
import { getRedisClient } from '@config/redis';
import { logger } from '@config/logger';

export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = getRedisClient();
  }

  /**
   * Get value from cache
   */
  async get(key: string): Promise<unknown> {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;
      return JSON.parse(value);
    } catch (error) {
      logger.error(`Cache get error for key: ${key}`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      const str = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, str);
      } else {
        await this.redis.set(key, str);
      }
    } catch (error) {
      logger.error(`Cache set error for key: ${key}`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.error(`Cache del error for key: ${key}`, error);
    }
  }

  /**
   * Delete multiple keys (supports wildcards)
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      logger.error(`Cache delPattern error for: ${pattern}`, error);
    }
  }

  /**
   * Invalidate cache for user
   */
  async invalidateUser(userId: number): Promise<void> {
    await this.delPattern(`streaks:${userId}:*`);
    await this.delPattern(`badges:${userId}:*`);
    await this.delPattern(`leaderboard:${userId}:*`);
  }

  /**
   * Invalidate cache for creator
   */
  async invalidateCreator(creatorId: number): Promise<void> {
    await this.delPattern(`badge_catalog:${creatorId}:*`);
    await this.delPattern(`leaderboard:creator:${creatorId}:*`);
  }
}
```
