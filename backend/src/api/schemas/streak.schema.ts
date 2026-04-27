import { z } from 'zod';

export const getUserStreaksSchema = z.object({
  params: z.object({
    userId: z.string().transform(Number).pipe(z.number().int().positive())
  }),
  query: z.object({
    include_history: z.string().transform(v => v === 'true').optional(),
    include_badges: z.string().transform(v => v === 'true').optional()
  }).optional()
});

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

export const activateFreezeSchema = z.object({
  params: z.object({
    userId: z.string().transform(Number).pipe(z.number().int().positive())
  }),
  body: z.object({
    streak_type: z.enum(['workout', 'nutrition', 'habit', 'community']),
    reason: z.string().max(255).optional()
  })
});

export const getLeaderboardSchema = z.object({
  params: z.object({
    leaderboardType: z.enum(['weekly_workout', 'monthly_streak', 'volume', 'challenge'])
  }),
  query: z.object({
    period_start: z.string().datetime().optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional()
  }).optional()
});

export const streakSchemas = {
  getUserStreaks: getUserStreaksSchema,
  getStreakHistory: getStreakHistorySchema,
  activateFreeze: activateFreezeSchema,
  getLeaderboard: getLeaderboardSchema
};
