import { FastifyInstance } from 'fastify';
import { CreatorController } from '../controllers/creator.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rbacMiddleware } from '../middleware/rbac.middleware';

export async function creatorRoutes(fastify: FastifyInstance) {
  const controller = new CreatorController();

  fastify.register(async (protectedRoutes) => {
    protectedRoutes.addHook('preHandler', authMiddleware);

    protectedRoutes.get('/:creatorId/config', {
      preHandler: [rbacMiddleware('write:creator_config')]
    }, controller.getConfig.bind(controller));

    protectedRoutes.patch('/:creatorId/config', {
      preHandler: [rbacMiddleware('write:creator_config')]
    }, controller.updateConfig.bind(controller));
  });
}
