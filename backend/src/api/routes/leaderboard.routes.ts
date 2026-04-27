import { FastifyInstance } from 'fastify';
import { LeaderboardController } from '../controllers/leaderboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export async function leaderboardRoutes(fastify: FastifyInstance) {
  const controller = new LeaderboardController();

  fastify.register(async (protectedRoutes) => {
    protectedRoutes.addHook('preHandler', authMiddleware);

    protectedRoutes.get('/:leaderboardType', controller.getLeaderboard.bind(controller));

    protectedRoutes.post('/:leaderboardType/refresh', controller.refreshLeaderboard.bind(controller));
  });
}
