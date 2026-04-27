import { FastifyInstance } from 'fastify';
import { StreakController } from '../controllers/streak.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rbacMiddleware } from '../middleware/rbac.middleware';

export async function streakRoutes(fastify: FastifyInstance) {
  const controller = new StreakController();

  fastify.register(async (protectedRoutes) => {
    protectedRoutes.addHook('preHandler', authMiddleware);

    protectedRoutes.get('/users/:userId', {
      preHandler: [rbacMiddleware('read:own_streaks')]
    }, controller.getUserStreaks.bind(controller));

    protectedRoutes.get('/users/:userId/history', {
      preHandler: [rbacMiddleware('read:own_streaks')]
    }, controller.getStreakHistory.bind(controller));

    protectedRoutes.post('/users/:userId/freeze', {
      preHandler: [rbacMiddleware('write:own_streaks')]
    }, controller.activateFreeze.bind(controller));

    protectedRoutes.get('/leaderboards/:leaderboardType', {
    }, controller.getLeaderboard.bind(controller));
  });
}
