export enum StreakType {
  WORKOUT = 'workout',
  NUTRITION = 'nutrition',
  HABIT = 'habit',
  COMMUNITY = 'community'
}

export enum StreakStatus {
  ACTIVE = 'active',
  FROZEN = 'frozen',
  BROKEN = 'broken',
  AT_RISK = 'at_risk'
}

export enum StreakEventType {
  STARTED = 'started',
  INCREMENTED = 'incremented',
  BROKEN = 'broken',
  FROZEN = 'frozen',
  MILESTONE = 'milestone'
}

export interface Streak {
  id: string;
  userId: number;
  creatorId: number;
  streakType: StreakType;
  currentCount: number;
  longestCount: number;
  lastActivityDate: Date;
  streakStartDate: Date;
  isActive: boolean;
  isAtRisk?: boolean;
  nextMilestone: number | null;
  milestoneProgress: number;
  freezeAvailable: boolean;
  freezeUsedCount: number;
  freezeLastUsed: Date | null;
  hoursUntilBreak?: number;
  hoursUntilRisk?: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreakEvent {
  id: string;
  userId: number;
  creatorId: number;
  streakType: StreakType;
  eventDate: Date;
  activityCount: number;
  qualified: boolean;
  eventSource: string;
  sourceEventId: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface StreakHistory {
  id: string;
  streakId: string;
  userId: number;
  creatorId: number;
  streakType: StreakType;
  eventType: StreakEventType;
  previousCount: number | null;
  newCount: number;
  milestoneAchieved: number | null;
  reason: string | null;
  snapshot: Record<string, unknown>;
  createdAt: Date;
}

export interface StreakFreeze {
  id: string;
  userId: number;
  creatorId: number;
  streakType: StreakType;
  freezeDate: Date;
  streakCountAtFreeze: number;
  reason: string | null;
  createdAt: Date;
}

export interface CreateStreakInput {
  userId: number;
  creatorId: number;
  streakType: StreakType;
  lastActivityDate: Date;
  metadata?: Record<string, unknown>;
}

export interface UpdateStreakInput {
  currentCount?: number;
  longestCount?: number;
  lastActivityDate?: Date;
  isActive?: boolean;
  nextMilestone?: number;
  milestoneProgress?: number;
  freezeAvailable?: boolean;
  freezeUsedCount?: number;
  freezeLastUsed?: Date;
  metadata?: Record<string, unknown>;
}

export interface StreakMilestone {
  days: number;
  badgeCode: string | null;
}

export interface StreakSummary {
  totalActiveStreaks: number;
  longestStreak: number;
  totalMilestones: number;
  badges: number;
}
