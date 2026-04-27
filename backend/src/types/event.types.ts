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

export interface EventData {
  [key: string]: unknown;
}

export interface WorkoutCompletedEventData extends EventData {
  workoutId: string;
  workoutType: string;
  durationMinutes: number;
  caloriesBurned: number;
  exercisesCompleted: number;
  totalWeightKg: number;
  completedAt: Date;
}

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

export interface HabitCompletedEventData extends EventData {
  habitId: string;
  habitName: string;
  habitCategory: string;
  completedAt: Date;
  streakCount: number;
}

export interface CommunityEventData extends EventData {
  postId?: string;
  commentId?: string;
  postType: string;
  contentLength: number;
  hasMedia: boolean;
  createdAt: Date;
}

export interface EventContext {
  programId?: string;
  phase?: string;
  challengeId?: string;
  communityId?: string;
}

export interface EventProcessingResult {
  success: boolean;
  streakUpdated: boolean;
  badgeAwarded?: string;
  milestoneAchieved?: number;
  errors?: string[];
}
