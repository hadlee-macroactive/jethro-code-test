import { StreakType } from './streak.types';

export enum BadgeRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum BadgeCategory {
  CONSISTENCY = 'consistency',
  MILESTONE = 'milestone',
  CHALLENGE = 'challenge',
  CERTIFICATION = 'certification',
  COMMUNITY = 'community'
}

export enum BadgeCriterionType {
  STREAK_DAYS = 'streak_days',
  TOTAL_WORKOUTS = 'total_workouts',
  TOTAL_VOLUME = 'total_volume',
  CHALLENGE_COMPLETION = 'challenge_completion',
  PROGRAM_COMPLETION = 'program_completion',
  COMMUNITY_POSTS = 'community_posts',
  COMMUNITY_COMMENTS = 'community_comments',
  CUSTOM = 'custom'
}

export enum ComparisonOperator {
  EQUALS = '=',
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<='
}

export interface Badge {
  id: string;
  badgeCode: string;
  badgeCategory: BadgeCategory;
  name: string;
  description: string | null;
  iconUrl: string | null;
  rarity: BadgeRarity;
  points: number;
  displayOrder: number;
  isActive: boolean;
  isCreatorCustomizable: boolean;
  requiredBadgeId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BadgeCriteria {
  id: string;
  badgeId: string;
  criterionType: BadgeCriterionType;
  comparisonOperator: ComparisonOperator;
  thresholdValue: number;
  timePeriodDays: number | null;
  streakType: StreakType | null;
  isRequired: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface UserBadge {
  id: string;
  userId: number;
  badgeId: string;
  creatorId: number;
  awardedAt: Date;
  awardedBy: string;
  awardReason: string | null;
  progressPercentage: number;
  isDisplayed: boolean;
  displayPriority: number;
  metadata: Record<string, unknown>;
}

export interface BadgeProgress {
  id: string;
  userId: number;
  badgeId: string;
  creatorId: number;
  progressPercentage: number;
  currentValue: number;
  targetValue: number;
  lastUpdated: Date;
}

export interface BadgeWithProgress extends Badge {
  earnedAt?: Date;
  progressPercentage?: number;
  currentValue?: number;
  targetValue?: number;
  isLocked?: boolean;
  isEarned?: boolean;
}

export interface CreateBadgeInput {
  badgeCode: string;
  badgeCategory: BadgeCategory;
  name: string;
  description?: string;
  iconUrl?: string;
  rarity: BadgeRarity;
  points?: number;
  displayOrder?: number;
  metadata?: Record<string, unknown>;
  criteria?: Omit<BadgeCriteria, 'id' | 'badgeId' | 'createdAt'>[];
}

export interface ManualBadgeAwardInput {
  userId: number;
  badgeCode: string;
  reason: string;
  notifyUser?: boolean;
}
