import { StreakService } from './streak.service';
import { StreakType } from '../types/streak.types';
import { IngestedEvent, EventProcessingResult } from '../types/event.types';
import { logger } from '../config/logger';

export class EventService {
  private streakService: StreakService;
  constructor() {
    this.streakService = new StreakService();
  }

  async processEvent(event: IngestedEvent): Promise<EventProcessingResult> {
    try {
      let streakType: StreakType | null = null;

      switch (event.eventType) {
        case 'workout.completed':
          streakType = StreakType.WORKOUT;
          break;
        case 'nutrition.logged':
          streakType = StreakType.NUTRITION;
          break;
        case 'habit.completed':
          streakType = StreakType.HABIT;
          break;
        case 'community.post':
        case 'community.comment':
        case 'community.like':
          streakType = StreakType.COMMUNITY;
          break;
        default:
          logger.info(`Unhandled event type: ${event.eventType}`);
          return { success: true, streakUpdated: false };
      }

      if (!streakType) {
        return { success: true, streakUpdated: false };
      }

      const result = await this.streakService.processStreakEvent(
        event.userId,
        event.creatorId,
        streakType,
        event.occurredAt,
        event.source,
        event.eventId
      );

      return {
        success: true,
        streakUpdated: true,
        milestoneAchieved: result.milestoneAchieved ?? undefined,
        badgeAwarded: undefined
      };
    } catch (error) {
      logger.error('Event processing failed', error);
      return {
        success: false,
        streakUpdated: false,
        errors: [(error as Error).message]
      };
    }
  }
}
