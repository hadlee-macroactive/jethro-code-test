export interface StreakTypeConfig {
  enabled: boolean;
  minimum_per_day?: number;
  minimum_meals_per_day?: number;
  minimum_per_week?: number;
  minimum_interactions_per_week?: number;
}

export interface FreezeSettings {
  freezes_per_period: number;
  period_days: number;
  auto_freeze_enabled?: boolean;
}

export interface MilestoneSettings {
  enabled: number[];
  celebrations_enabled?: boolean;
}

export interface StreakSettings {
  enabled_streak_types: string[];
  workout?: StreakTypeConfig;
  nutrition?: StreakTypeConfig;
  habit?: StreakTypeConfig;
  community?: StreakTypeConfig;
  freeze_settings?: FreezeSettings;
  milestones?: MilestoneSettings;
}

export interface CustomBadgeConfig {
  name: string;
  description: string;
  icon_url?: string;
  criteria: {
    type: string;
    [key: string]: unknown;
  };
}

export interface BadgeSettings {
  enabled_categories: string[];
  custom_badges?: CustomBadgeConfig[];
  auto_award_enabled: boolean;
}

export interface FeatureFlags {
  streaks_enabled?: boolean;
  badges_enabled?: boolean;
  leaderboards_enabled?: boolean;
  freeze_enabled?: boolean;
  analytics_enabled?: boolean;
  beta_features?: boolean;
}

export interface CreatorConfiguration {
  creatorId: number;
  streakSettings: StreakSettings;
  badgeSettings: BadgeSettings;
  featureFlags: FeatureFlags;
}

export interface CreatorStreakMetrics {
  total_active_streaks: number;
  average_streak_length: number;
  streak_distribution: Record<string, number>;
}

export interface CreatorBadgeMetrics {
  total_badges_earned: number;
  most_common_badge: string;
  completion_rate_by_badge: Record<string, number>;
}

export interface CreatorRetentionImpact {
  day_7_retention: number;
  day_30_retention: number;
  churn_reduction: number;
}

export interface CreatorAnalytics {
  streak_metrics: CreatorStreakMetrics;
  badge_metrics: CreatorBadgeMetrics;
  retention_impact: CreatorRetentionImpact;
}
