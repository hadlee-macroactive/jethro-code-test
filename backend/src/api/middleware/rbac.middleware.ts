import { FastifyRequest, FastifyReply } from 'fastify';

const rolePermissions: Record<string, string[]> = {
  user: ['read:own_streaks', 'write:own_streaks', 'read:own_badges'],
  creator: [
    'read:own_streaks', 'write:own_streaks', 'read:own_badges',
    'read:all_user_streaks', 'write:creator_config', 'write:manual_badge'
  ],
  admin: ['*']
};

export function rbacMiddleware(requiredPermission: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;

    if (!user) {
      return reply.status(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const permissions = rolePermissions[user.role] || [];

    if (!permissions.includes('*') && !permissions.includes(requiredPermission)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
      });
    }
  };
}
