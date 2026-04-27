import { z } from 'zod';

export const getCreatorConfigSchema = z.object({
  params: z.object({
    creatorId: z.string().transform(Number).pipe(z.number().int().positive())
  })
});

export const updateCreatorConfigSchema = z.object({
  params: z.object({
    creatorId: z.string().transform(Number).pipe(z.number().int().positive())
  }),
  body: z.object({
    streakSettings: z.record(z.unknown()).optional(),
    badgeSettings: z.record(z.unknown()).optional(),
    leaderboardSettings: z.record(z.unknown()).optional(),
    notificationSettings: z.record(z.unknown()).optional(),
    featureFlags: z.record(z.unknown()).optional()
  })
});

export const creatorSchemas = {
  getCreatorConfig: getCreatorConfigSchema,
  updateCreatorConfig: updateCreatorConfigSchema
};
