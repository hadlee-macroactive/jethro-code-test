import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes';
import { streakRoutes } from './streak.routes';
import { badgeRoutes } from './badge.routes';
import { leaderboardRoutes } from './leaderboard.routes';
import { creatorRoutes } from './creator.routes';

export async function registerRoutes(fastify: FastifyInstance) {
  const apiVersion = process.env.API_VERSION || 'v1';

  fastify.register(async (api) => {
    // Auth routes (no auth middleware)
    api.register(authRoutes, { prefix: `/${apiVersion}/auth` });

    // Protected routes
    api.register(streakRoutes, { prefix: `/${apiVersion}/streaks` });
    api.register(badgeRoutes, { prefix: `/${apiVersion}/badges` });
    api.register(leaderboardRoutes, { prefix: `/${apiVersion}/leaderboards` });
    api.register(creatorRoutes, { prefix: `/${apiVersion}/creators` });

    // Health check
    api.get(`/${apiVersion}/health`, async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });
  });
}
