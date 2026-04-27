import { z } from 'zod';

export const freezeReasonSchema = z.object({
  reason: z.string().max(200).optional(),
});

export const leaderboardTypeSchema = z.enum([
  'weekly_workout',
  'monthly_streak',
  'volume',
  'challenge',
]);

export function isValidStreakType(type: string): boolean {
  return ['workout', 'nutrition', 'habit', 'community'].includes(type);
}

export function isValidBadgeRarity(rarity: string): boolean {
  return ['common', 'rare', 'epic', 'legendary'].includes(rarity);
}
