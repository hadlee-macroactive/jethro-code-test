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

export interface Badge {
  id: string;
  badgeCode: string;
  badgeCategory: BadgeCategory;
  name: string;
  description: string;
  iconUrl: string | null;
  rarity: BadgeRarity;
  points: number;
  displayOrder: number;
  earnedAt?: string;
  progressPercentage?: number;
  currentValue?: number;
  targetValue?: number;
  isLocked?: boolean;
  isEarned?: boolean;
}

export interface BadgeProgress {
  badge: Badge;
  percentage: number;
  currentValue: number;
  targetValue: number;
  estimatedCompletion?: string;
}
