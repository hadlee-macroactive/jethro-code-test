export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365] as const;

export const AT_RISK_HOURS = 18;
export const BROKEN_HOURS = 24;

export const STREAK_TYPE_LABELS: Record<string, string> = {
  workout: 'Workout',
  nutrition: 'Nutrition',
  habit: 'Habit',
  community: 'Community',
};

export const DEFAULT_STREAK_CONFIG = {
  qualificationWindowHours: 24,
  freezeLimit: 1,
  freezeCooldownDays: 30,
  maxConsecutiveFreezes: 2,
} as const;

export const STREAK_EVENT_TYPES = {
  WORKOUT: 'workout.completed',
  NUTRITION: 'nutrition.logged',
  HABIT: 'habit.completed',
  COMMUNITY: 'community.interaction',
} as const;
