import { z } from 'zod';

export const getUserBadgesSchema = z.object({
  params: z.object({
    userId: z.string().transform(Number).pipe(z.number().int().positive())
  }),
  query: z.object({
    include_progress: z.string().transform(v => v === 'true').optional(),
    category: z.enum(['consistency', 'milestone', 'challenge', 'certification', 'community']).optional()
  }).optional()
});

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

export const getBadgeCatalogSchema = z.object({
  query: z.object({
    category: z.enum(['consistency', 'milestone', 'challenge', 'certification', 'community']).optional(),
    creator_id: z.string().transform(Number).pipe(z.number().int().positive()).optional()
  }).optional()
});

export const badgeSchemas = {
  getUserBadges: getUserBadgesSchema,
  manualBadgeAward: manualBadgeAwardSchema,
  getBadgeCatalog: getBadgeCatalogSchema
};
