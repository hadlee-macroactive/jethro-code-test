# Data Models

Complete TypeScript interfaces for all data structures used in the system.

## Backend Types

### src/types/streak.types.ts

```typescript
/**
 * Streak Types
 */
export enum StreakType {
  WORKOUT = 'workout',
  NUTRITION = 'nutrition',
  HABIT = 'habit',
  COMMUNITY = 'community'
}

/**
 * Streak Status
 */
export enum StreakStatus {
  ACTIVE = 'active',
  FROZEN = 'frozen',
  BROKEN = 'broken',
  AT_RISK = 'at_risk'
}

/**
 * Main Streak Model
 */
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
  isAtRisk?: boolean; // Computed property
  nextMilestone: number | null;
  milestoneProgress: number;
  freezeAvailable: boolean;
  freezeUsedCount: number;
  freezeLastUsed: Date | null;
  hoursUntilBreak?: number; // Computed property
  hoursUntilRisk?: number; // Computed property
  metadata: StreakMetadata;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Streak Metadata (stored in JSONB)
 */
export interface StreakMetadata {
  timezone?: string;
  qualifiedDays?: number[];
  freezeHistory?: FreezeHistoryEntry[];
  notes?: string;
}

/**
 * Freeze History Entry
 */
export interface FreezeHistoryEntry {
  resetDate: Date;
  previousUsedCount: number;
}

/**
 * Streak Event (daily activity)
 */
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

/**
 * Streak History
 */
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
  snapshot: StreakSnapshot;
  createdAt: Date;
}

/**
 * Streak Event Types
 */
export enum StreakEventType {
  STARTED = 'started',
  INCREMENTED = 'incremented',
  BROKEN = 'broken',
  FROZEN = 'frozen',
  MILESTONE = 'milestone'
}

/**
 * Snapshot stored in history
 */
export interface StreakSnapshot {
  streak?: Partial<Streak>;
  previousStreak?: Partial<Streak>;
  newStreak?: Partial<Streak>;
}

/**
 * Streak Freeze Record
 */
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

/**
 * Create Streak Input
 */
export interface CreateStreakInput {
  userId: number;
  creatorId: number;
  streakType: StreakType;
  lastActivityDate: Date;
  metadata?: Partial<StreakMetadata>;
}

/**
 * Update Streak Input
 */
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
  metadata?: Partial<StreakMetadata>;
}

/**
 * Streak Milestone Definition
 */
export interface StreakMilestone {
  days: number;
  badgeCode: string | null;
}

/**
 * Streak Summary (for API responses)
 */
export interface StreakSummary {
  totalActiveStreaks: number;
  longestStreak: number;
  totalMilestones: number;
  badges: number;
}
```

### src/types/badge.types.ts

```typescript
/**
 * Badge Rarity Levels
 */
export enum BadgeRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

/**
 * Badge Categories
 */
export enum BadgeCategory {
  CONSISTENCY = 'consistency',
  MILESTONE = 'milestone',
  CHALLENGE = 'challenge',
  CERTIFICATION = 'certification',
  COMMUNITY = 'community'
}

/**
 * Badge Model
 */
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
  metadata: BadgeMetadata;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Badge Metadata (stored in JSONB)
 */
export interface BadgeMetadata {
  animations?: BadgeAnimation[];
  colors?: BadgeColors;
  shareable?: boolean;
  celebration?: boolean;
}

/**
 * Badge Animation Config
 */
export interface BadgeAnimation {
  type: 'shine' | 'pulse' | 'particles' | 'glow';
  duration?: number;
  delay?: number;
}

/**
 * Badge Color Config
 */
export interface BadgeColors {
  primary: string;
  gradient?: string;
  glow?: string;
}

/**
 * Badge Criteria (for earning)
 */
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

/**
 * Badge Criterion Types
 */
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

/**
 * Comparison Operators
 */
export enum ComparisonOperator {
  EQUALS = '=',
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<='
}

/**
 * User Badge (awarded badge)
 */
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

/**
 * Badge Progress (in-progress badges)
 */
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

/**
 * Badge with Progress (for API responses)
 */
export interface BadgeWithProgress extends Badge {
  earnedAt?: Date;
  progressPercentage?: number;
  currentValue?: number;
  targetValue?: number;
  isLocked?: boolean;
  isEarned?: boolean;
}

/**
 * Create Badge Input (Creator)
 */
export interface CreateBadgeInput {
  badgeCode: string;
  badgeCategory: BadgeCategory;
  name: string;
  description?: string;
  iconUrl?: string;
  rarity: BadgeRarity;
  points?: number;
  displayOrder?: number;
  metadata?: Partial<BadgeMetadata>;
  criteria?: Omit<BadgeCriteria, 'id' | 'badgeId' | 'createdAt'>[];
}

/**
 * Manual Badge Award Input
 */
export interface ManualBadgeAwardInput {
  userId: number;
  badgeCode: string;
  reason: string;
  notifyUser?: boolean;
}
```

### src/types/leaderboard.types.ts

```typescript
/**
 * Leaderboard Types
 */
export enum LeaderboardType {
  WEEKLY_WORKOUT = 'weekly_workout',
  MONTHLY_STREAK = 'monthly_streak',
  VOLUME = 'volume',
  CHALLENGE = 'challenge'
}

/**
 * Leaderboard Model
 */
export interface Leaderboard {
  id: string;
  creatorId: number;
  leaderboardType: LeaderboardType;
  periodStart: Date;
  periodEnd: Date;
  entries: LeaderboardEntry[];
  lastRefreshed: Date;
}

/**
 * Leaderboard Entry
 */
export interface LeaderboardEntry {
  rank: number;
  userId: number;
  displayName: string;
  avatarUrl?: string;
  score: number;
  badges?: string[];
  isCurrentUser?: boolean;
  isAnonymous?: boolean;
}

/**
 * Leaderboard Entry (stored)
 */
export interface LeaderboardStoredEntry {
  userId: number;
  score: number;
  displayName: string;
  avatarUrl?: string;
  isAnonymous: boolean;
  badgeIds: string[];
}

/**
 * Leaderboard Summary
 */
export interface LeaderboardSummary {
  leaderboardType: LeaderboardType;
  periodStart: Date;
  periodEnd: Date;
  totalEntries: number;
  currentUser?: {
    rank: number;
    score: number;
    percentile: number;
  };
}

/**
 * Create Leaderboard Input
 */
export interface CreateLeaderboardInput {
  creatorId: number;
  leaderboardType: LeaderboardType;
  periodStart: Date;
  periodEnd: Date;
  entries: LeaderboardStoredEntry[];
}
```

### src/types/creator.types.ts

```typescript
/**
 * Creator Configuration Model
 */
export interface CreatorConfiguration {
  id: string;
  creatorId: number;
  streakSettings: StreakSettings;
  badgeSettings: BadgeSettings;
  leaderboardSettings: LeaderboardSettings;
  notificationSettings: NotificationSettings;
  featureFlags: FeatureFlags;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Streak Settings (Creator Config)
 */
export interface StreakSettings {
  enabledStreakTypes: StreakType[];
  workout: WorkoutStreakConfig;
  nutrition: NutritionStreakConfig;
  habit: HabitStreakConfig;
  community: CommunityStreakConfig;
  freezeSettings: FreezeSettings;
  milestones: MilestoneSettings;
}

/**
 * Workout Streak Config
 */
export interface WorkoutStreakConfig {
  enabled: boolean;
  minimumPerDay: number;
  qualificationWindowHours: number;
}

/**
 * Nutrition Streak Config
 */
export interface NutritionStreakConfig {
  enabled: boolean;
  minimumMealsPerDay: number;
}

/**
 * Habit Streak Config
 */
export interface HabitStreakConfig {
  enabled: boolean;
  minimumHabitsPerDay: number;
}

/**
 * Community Streak Config
 */
export interface CommunityStreakConfig {
  enabled: boolean;
  minimumActionsPerDay: number;
  actions: CommunityAction[];
}

/**
 * Community Actions
 */
export enum CommunityAction {
  POST = 'post',
  COMMENT = 'comment',
  LIKE = 'like'
}

/**
 * Freeze Settings
 */
export interface FreezeSettings {
  freezesPerPeriod: number;
  periodDays: number;
  autoFreezeEnabled: boolean;
}

/**
 * Milestone Settings
 */
export interface MilestoneSettings {
  enabled: number[];
  celebrationsEnabled: boolean;
}

/**
 * Badge Settings
 */
export interface BadgeSettings {
  enabledCategories: BadgeCategory[];
  customBadges: CustomBadgeConfig[];
  displaySettings: BadgeDisplaySettings;
  autoAwardEnabled: boolean;
}

/**
 * Custom Badge Config (Creator-defined)
 */
export interface CustomBadgeConfig {
  name: string;
  description: string;
  iconUrl: string;
  criteria: Omit<BadgeCriteria, 'id' | 'badgeId' | 'createdAt'>;
}

/**
 * Badge Display Settings
 */
export interface BadgeDisplaySettings {
  showOnProfile: boolean;
  showInCommunity: boolean;
  showRareFirst: boolean;
}

/**
 * Leaderboard Settings
 */
export interface LeaderboardSettings {
  enabled: boolean;
  defaultType: LeaderboardType;
  privacyDefault: LeaderboardPrivacy;
  nicknameRequired: boolean;
}

/**
 * Leaderboard Privacy
 */
export enum LeaderboardPrivacy {
  PUBLIC = 'public',
  ANONYMOUS = 'anonymous',
  OPT_OUT = 'opt_out'
}

/**
 * Notification Settings
 */
export interface NotificationSettings {
  streakAtRisk: AtRiskNotificationConfig;
  streakMilestone: MilestoneNotificationConfig;
  badgeEarned: BadgeNotificationConfig;
  streakBroken: BrokenNotificationConfig;
}

/**
 * At Risk Notification Config
 */
export interface AtRiskNotificationConfig {
  enabled: boolean;
  hoursBeforeExpiry: number;
  timezoneAware: boolean;
}

/**
 * Milestone Notification Config
 */
export interface MilestoneNotificationConfig {
  enabled: boolean;
  milestones: number[];
  includeAnimation: boolean;
}

/**
 * Badge Notification Config
 */
export interface BadgeNotificationConfig {
  enabled: boolean;
  includeAnimation: boolean;
}

/**
 * Broken Notification Config
 */
export interface BrokenNotificationConfig {
  enabled: boolean;
  encouragementEnabled: boolean;
}

/**
 * Feature Flags
 */
export interface FeatureFlags {
  streaksEnabled: boolean;
  badgesEnabled: boolean;
  leaderboardsEnabled: boolean;
  freezeEnabled: boolean;
  analyticsEnabled: boolean;
}
```

### src/types/event.types.ts

```typescript
/**
 * Ingested Event (from external systems)
 */
export interface IngestedEvent {
  eventId: string;
  eventType: string;
  eventVersion: string;
  occurredAt: Date;
  userId: number;
  creatorId: number;
  source: string;
  sourceMetadata: Record<string, unknown>;
  data: EventData;
  context?: EventContext;
}

/**
 * Event Data (varies by event type)
 */
export interface EventData {
  [key: string]: unknown;
}

/**
 * Workout Completed Event Data
 */
export interface WorkoutCompletedEventData extends EventData {
  workoutId: string;
  workoutType: string;
  durationMinutes: number;
  caloriesBurned: number;
  exercisesCompleted: number;
  totalWeightKg: number;
  completedAt: Date;
}

/**
 * Nutrition Logged Event Data
 */
export interface NutritionLoggedEventData extends EventData {
  mealId: string;
  mealType: string;
  calories: number;
  macros: {
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  loggedAt: Date;
}

/**
 * Habit Completed Event Data
 */
export interface HabitCompletedEventData extends EventData {
  habitId: string;
  habitName: string;
  habitCategory: string;
  completedAt: Date;
  streakCount: number;
}

/**
 * Community Event Data
 */
export interface CommunityEventData extends EventData {
  postId?: string;
  commentId?: string;
  postType: string;
  contentLength: number;
  hasMedia: boolean;
  createdAt: Date;
}

/**
 * Event Context
 */
export interface EventContext {
  programId?: string;
  phase?: string;
  challengeId?: string;
  communityId?: string;
}

/**
 * Event Processing Result
 */
export interface EventProcessingResult {
  success: boolean;
  streakUpdated: boolean;
  badgeAwarded?: string;
  milestoneAchieved?: number;
  errors?: string[];
}
```

### src/types/api.types.ts

```typescript
/**
 * API Response Wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiResponseMeta;
}

/**
 * API Error
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * API Response Meta
 */
export interface ApiResponseMeta {
  timestamp: string;
  requestId: string;
  version: string;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Streak API Responses
 */
export interface GetStreaksResponse {
  streaks: Streak[];
  summary: StreakSummary;
}

export interface GetStreakHistoryResponse {
  history: StreakHistory[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * Badge API Responses
 */
export interface GetBadgesResponse {
  earned: BadgeWithProgress[];
  inProgress: BadgeWithProgress[];
  summary: {
    totalBadges: number;
    totalPoints: number;
    rarestBadge: BadgeRarity;
  };
}

export interface GetBadgeCatalogResponse {
  badges: Badge[];
}

/**
 * Leaderboard API Response
 */
export interface GetLeaderboardResponse {
  leaderboardType: LeaderboardType;
  periodStart: string;
  periodEnd: string;
  entries: LeaderboardEntry[];
  currentUser?: {
    rank: number;
    score: number;
    percentile: number;
  };
}

/**
 * Creator Analytics Response
 */
export interface CreatorAnalyticsResponse {
  streakMetrics: {
    totalActiveStreaks: number;
    averageStreakLength: number;
    streakDistribution: Record<string, number>;
  };
  badgeMetrics: {
    totalBadgesEarned: number;
    mostCommonBadge: string;
    completionRateByBadge: Record<string, number>;
  };
  retentionImpact: {
    day7Retention: number;
    day30Retention: number;
    churnReduction: number;
  };
}

/**
 * Error Codes
 */
export enum ErrorCode {
  // General
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',

  // Streak errors
  STREAK_NOT_FOUND = 'STREAK_NOT_FOUND',
  STREAK_EXPIRED = 'STREAK_EXPIRED',
  FREEZE_UNAVAILABLE = 'FREEZE_UNAVAILABLE',
  INVALID_STREAK_TYPE = 'INVALID_STREAK_TYPE',

  // Badge errors
  BADGE_NOT_FOUND = 'BADGE_NOT_FOUND',
  ALREADY_EARNED = 'ALREADY_EARNED',
  INVALID_CRITERIA = 'INVALID_CRITERIA',

  // User errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_USER_ID = 'INVALID_USER_ID',

  // Creator errors
  CREATOR_NOT_FOUND = 'CREATOR_NOT_FOUND',
  INVALID_CONFIG = 'INVALID_CONFIG'
}
```

## Frontend Types

### web/src/types/streak.ts

```typescript
/**
 * Frontend Streak Types (simplified for UI)
 */
export interface Streak {
  id: string;
  streakType: StreakType;
  currentCount: number;
  longestCount: number;
  lastActivityDate: string; // ISO string
  isActive: boolean;
  isAtRisk: boolean;
  isFrozen: boolean;
  nextMilestone: number | null;
  milestoneProgress: number;
  freezeAvailable: boolean;
  freezeUsedCount: number;
  freezeResetDate: string | null;
}

export enum StreakType {
  WORKOUT = 'workout',
  NUTRITION = 'nutrition',
  HABIT = 'habit',
  COMMUNITY = 'community'
}

export interface StreakHistory {
  id: string;
  eventType: 'started' | 'incremented' | 'broken' | 'frozen' | 'milestone';
  previousCount: number | null;
  newCount: number;
  milestoneAchieved: number | null;
  reason: string | null;
  createdAt: string;
}
```

### web/src/types/badge.ts

```typescript
/**
 * Frontend Badge Types
 */
export interface Badge {
  id: string;
  badgeCode: string;
  badgeCategory: BadgeCategory;
  name: string;
  description: string;
  iconUrl: string | null;
  rarity: BadgeRarity;
  points: number;
  earnedAt?: string;
  progressPercentage?: number;
  currentValue?: number;
  targetValue?: number;
  isLocked?: boolean;
}

export enum BadgeCategory {
  CONSISTENCY = 'consistency',
  MILESTONE = 'milestone',
  CHALLENGE = 'challenge',
  CERTIFICATION = 'certification',
  COMMUNITY = 'community'
}

export enum BadgeRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface BadgeProgress {
  badge: Badge;
  percentage: number;
  currentValue: number;
  targetValue: number;
  estimatedCompletion?: string;
}
```

### web/src/types/leaderboard.ts

```typescript
/**
 * Frontend Leaderboard Types
 */
export interface LeaderboardEntry {
  rank: number;
  userId: number;
  displayName: string;
  avatarUrl?: string;
  score: number;
  badges: string[];
  isCurrentUser: boolean;
  isAnonymous: boolean;
}

export interface Leaderboard {
  type: LeaderboardType;
  periodStart: string;
  periodEnd: string;
  entries: LeaderboardEntry[];
  currentUserRank?: number;
  currentUserScore?: number;
}

export enum LeaderboardType {
  WEEKLY_WORKOUT = 'weekly_workout',
  MONTHLY_STREAK = 'monthly_streak',
  VOLUME = 'volume',
  CHALLENGE = 'challenge'
}
```

## Shared Types

### src/types/common.ts

```typescript
/**
 * Date Range
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Pagination Params
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
  cursor?: string;
}

/**
 * Sort Order
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Sort Param
 */
export interface SortParam {
  field: string;
  order: SortOrder;
}

/**
 * API Request Context (attached to all requests)
 */
export interface RequestContext {
  userId: number;
  creatorId: number;
  role: UserRole;
  permissions: string[];
}

/**
 * User Roles
 */
export enum UserRole {
  USER = 'user',
  CREATOR = 'creator',
  ADMIN = 'admin'
}

/**
 * Timezone
 */
export type Timezone = string;

/**
 * ISO Date String
 */
export type ISODateString = string;
```

## Type Guards

### src/types/guards.ts

```typescript
import { StreakType } from './streak.types';
import { BadgeRarity, BadgeCategory } from './badge.types';

/**
 * Check if value is a valid StreakType
 */
export function isStreakType(value: string): value is StreakType {
  return Object.values(StreakType).includes(value as StreakType);
}

/**
 * Check if value is a valid BadgeRarity
 */
export function isBadgeRarity(value: string): value is BadgeRarity {
  return Object.values(BadgeRarity).includes(value as BadgeRarity);
}

/**
 * Check if value is a valid BadgeCategory
 */
export function isBadgeCategory(value: string): value is BadgeCategory {
  return Object.values(BadgeCategory).includes(value as BadgeCategory);
}

/**
 * Check if response is an API error
 */
export function isApiError(response: unknown): response is { error: { code: string; message: string } } {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof response.error === 'object' &&
    'code' in response.error &&
    'message' in response.error
  );
}
```

## Zod Schemas (Validation)

### src/api/schemas/streak.schema.ts

```typescript
import { z } from 'zod';

/**
 * Get User Streaks Schema
 */
export const getUserStreaksSchema = z.object({
  params: z.object({
    userId: z.string().transform(Number).pipe(z.number().int().positive())
  }),
  query: z.object({
    include_history: z.string().transform(v => v === 'true').optional(),
    include_badges: z.string().transform(v => v === 'true').optional()
  }).optional()
});

/**
 * Get Streak History Schema
 */
export const getStreakHistorySchema = z.object({
  params: z.object({
    userId: z.string().transform(Number).pipe(z.number().int().positive())
  }),
  query: z.object({
    streak_type: z.enum(['workout', 'nutrition', 'habit', 'community']).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
    offset: z.string().transform(Number).pipe(z.number().int().min(0)).optional()
  }).optional()
});

/**
 * Activate Freeze Schema
 */
export const activateFreezeSchema = z.object({
  params: z.object({
    userId: z.string().transform(Number).pipe(z.number().int().positive())
  }),
  body: z.object({
    streak_type: z.enum(['workout', 'nutrition', 'habit', 'community']),
    reason: z.string().max(255).optional()
  })
});

/**
 * Get Leaderboard Schema
 */
export const getLeaderboardSchema = z.object({
  params: z.object({
    leaderboardType: z.enum(['weekly_workout', 'monthly_streak', 'volume', 'challenge'])
  }),
  query: z.object({
    period_start: z.string().datetime().optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional()
  }).optional()
});
```

### src/api/schemas/badge.schema.ts

```typescript
import { z } from 'zod';

/**
 * Get User Badges Schema
 */
export const getUserBadgesSchema = z.object({
  params: z.object({
    userId: z.string().transform(Number).pipe(z.number().int().positive())
  }),
  query: z.object({
    include_progress: z.string().transform(v => v === 'true').optional(),
    category: z.enum(['consistency', 'milestone', 'challenge', 'certification', 'community']).optional()
  }).optional()
});

/**
 * Manual Badge Award Schema
 */
export const manualBadgeAwardSchema = z.object({
  params: z.object({
    userId: z.string().transform(Number).pipe(z.number().int().positive())
  }),
  body: z.object({
    badge_code: z.string().min(1).max(100),
    reason: z.string().min(1).max(500),
    notify_user: z.boolean().optional().default(true)
  })
});

/**
 * Get Badge Catalog Schema
 */
export const getBadgeCatalogSchema = z.object({
  query: z.object({
    category: z.enum(['consistency', 'milestone', 'challenge', 'certification', 'community']).optional(),
    creator_id: z.string().transform(Number).pipe(z.number().int().positive()).optional()
  }).optional()
});
```
