import { StreakType, StreakMilestone } from '../types/streak.types';

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, badgeCode: null },
  { days: 7, badgeCode: '7_day_consistency' },
  { days: 14, badgeCode: null },
  { days: 30, badgeCode: '30_day_machine' },
  { days: 60, badgeCode: '60_day_elite' },
  { days: 90, badgeCode: '90_day_elite' },
  { days: 180, badgeCode: '180_day_legend' },
  { days: 365, badgeCode: '365_day_mythic' }
];

export const STREAK_TYPE_LABELS: Record<string, string> = {
  [StreakType.WORKOUT]: 'Workout',
  [StreakType.NUTRITION]: 'Nutrition',
  [StreakType.HABIT]: 'Habit',
  [StreakType.COMMUNITY]: 'Community'
};

export const DEFAULT_STREAK_CONFIG = {
  WORKOUT: {
    enabled: true,
    minimumPerDay: 1,
    qualificationWindowHours: 24
  },
  NUTRITION: {
    enabled: true,
    minimumMealsPerDay: 2
  },
  HABIT: {
    enabled: true,
    minimumHabitsPerDay: 1
  },
  COMMUNITY: {
    enabled: true,
    minimumActionsPerDay: 1,
    actions: ['post', 'comment', 'like']
  },
  FREEZE: {
    freezesPerPeriod: 1,
    periodDays: 30
  }
};

export const STREAK_RESET_TIME_UTC = '00:00';
export const AT_RISK_HOURS = 18;
export const BROKEN_HOURS = 24;
