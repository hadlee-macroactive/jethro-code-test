import { Streak } from '../types/streak.types';
import { Badge } from '../types/badge.types';
import { logger } from '../config/logger';

interface PushPayload {
  userId: number;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
}

export class NotificationService {
  private pushServiceUrl: string;
  private pushServiceKey: string;

  constructor() {
    this.pushServiceUrl = process.env.PUSH_SERVICE_URL || '';
    this.pushServiceKey = process.env.PUSH_SERVICE_API_KEY || '';
  }

  async sendStreakStarted(streak: Streak): Promise<void> {
    await this.sendPush({
      userId: streak.userId,
      title: 'Streak Started!',
      body: `You've started your first ${streak.streakType} streak. Keep it going!`,
      data: { type: 'streak_started', streakId: streak.id, streakType: streak.streakType }
    });
  }

  async sendStreakAtRisk(streak: Streak, hoursRemaining: number): Promise<void> {
    const hasFreeze = streak.freezeAvailable;
    await this.sendPush({
      userId: streak.userId,
      title: 'Your streak is at risk!',
      body: `Complete a ${streak.streakType} activity in the next ${Math.round(hoursRemaining)} hours to keep your ${streak.currentCount}-day streak alive!${hasFreeze ? ' Or use a freeze.' : ''}`,
      data: { type: 'streak_at_risk', streakId: streak.id, hoursRemaining, freezeAvailable: hasFreeze },
      actionUrl: `macroactive://streaks/${streak.id}`
    });
  }

  async sendMilestoneAchieved(streak: Streak, milestoneDays: number): Promise<void> {
    await this.sendPush({
      userId: streak.userId,
      title: `${milestoneDays}-Day Milestone!`,
      body: `Amazing work! You've completed ${milestoneDays} consecutive days of ${streak.streakType}!`,
      data: { type: 'milestone_achieved', streakId: streak.id, milestoneDays },
      actionUrl: `macroactive://celebration?milestone=${milestoneDays}`
    });
  }

  async sendStreakBroken(streak: Streak): Promise<void> {
    await this.sendPush({
      userId: streak.userId,
      title: 'Streak Broken',
      body: `Your ${streak.currentCount}-day ${streak.streakType} streak has ended. But don't worry - start fresh today!`,
      data: { type: 'streak_broken', streakId: streak.id, finalCount: streak.currentCount },
      actionUrl: `macroactive://streaks/${streak.id}`
    });
  }

  async sendFreezeActivated(streak: Streak): Promise<void> {
    await this.sendPush({
      userId: streak.userId,
      title: 'Streak Frozen',
      body: `Your streak has been frozen. Take a rest day and come back stronger tomorrow!`,
      data: { type: 'freeze_activated', streakId: streak.id }
    });
  }

  async sendBadgeEarned(userId: number, badge: Badge): Promise<void> {
    await this.sendPush({
      userId,
      title: `New Badge: ${badge.name}`,
      body: `Congratulations! You've earned the ${badge.name} badge!`,
      data: { type: 'badge_earned', badgeId: badge.id, badgeCode: badge.badgeCode, rarity: badge.rarity },
      actionUrl: `macroactive://badges/${badge.id}`
    });
  }

  async sendBadgeProgress(userId: number, badge: Badge, progress: number): Promise<void> {
    if (progress < 50) return;
    await this.sendPush({
      userId,
      title: 'Badge Progress',
      body: `You're ${progress}% of the way to earning ${badge.name}!`,
      data: { type: 'badge_progress', badgeId: badge.id, progress }
    });
  }

  async sendBatch(payloads: PushPayload[]): Promise<void> {
    const batchSize = 100;
    for (let i = 0; i < payloads.length; i += batchSize) {
      const batch = payloads.slice(i, i + batchSize);
      await Promise.allSettled(batch.map(p => this.sendPush(p)));
    }
  }

  private async sendPush(payload: PushPayload): Promise<void> {
    try {
      if (!this.pushServiceUrl) {
        logger.info(`Push (mock): user ${payload.userId} - ${payload.title}`);
        return;
      }

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
    }
  }
}
