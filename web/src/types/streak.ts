export enum StreakType {
  WORKOUT = 'workout',
  NUTRITION = 'nutrition',
  HABIT = 'habit',
  COMMUNITY = 'community'
}

export interface Streak {
  id: string;
  streakType: StreakType;
  currentCount: number;
  longestCount: number;
  lastActivityDate: string;
  streakStartDate: string;
  isActive: boolean;
  isAtRisk: boolean;
  isFrozen: boolean;
  nextMilestone: number | null;
  milestoneProgress: number;
  freezeAvailable: boolean;
  freezeUsedCount: number;
  freezeResetDate: string | null;
  hoursUntilBreak?: number;
  hoursUntilRisk?: number;
}

export interface StreakHistory {
  id: string;
  streakId: string;
  streakType: StreakType;
  eventType: 'started' | 'incremented' | 'broken' | 'frozen' | 'milestone';
  previousCount: number | null;
  newCount: number;
  milestoneAchieved: number | null;
  reason: string | null;
  createdAt: string;
}

export interface StreakEvent {
  eventDate: string;
  qualified: boolean;
  frozen?: boolean;
}
