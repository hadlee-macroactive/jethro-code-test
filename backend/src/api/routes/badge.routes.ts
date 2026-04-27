import { FastifyInstance } from 'fastify';
import { BadgeController } from '../controllers/badge.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rbacMiddleware } from '../middleware/rbac.middleware';

export async function badgeRoutes(fastify: FastifyInstance) {
  const controller = new BadgeController();

  fastify.register(async (protectedRoutes) => {
    protectedRoutes.addHook('preHandler', authMiddleware);

    protectedRoutes.get('/users/:userId', {
      preHandler: [rbacMiddleware('read:own_badges')]
    }, controller.getUserBadges.bind(controller));

    protectedRoutes.get('/catalog', {
    }, controller.getBadgeCatalog.bind(controller));

    protectedRoutes.get('/:badgeCode', {
    }, controller.getBadgeDetail.bind(controller));

    protectedRoutes.post('/users/:userId/award', {
      preHandler: [rbacMiddleware('write:manual_badge')]
    }, controller.manualBadgeAward.bind(controller));
  });
}
