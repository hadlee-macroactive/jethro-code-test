import { FastifyRequest, FastifyReply } from 'fastify';
import { BadgeService } from '../../services/badge.service';

export class BadgeController {
  private badgeService: BadgeService;

  constructor() {
    this.badgeService = new BadgeService();
  }

  async getUserBadges(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request.params as { userId: string };
    const { include_progress, category } = request.query as any;
    const user = (request as any).user;

    if (user.id !== parseInt(userId) && user.role !== 'admin') {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' }
      });
    }

    const result = await this.badgeService.getUserBadges(
      parseInt(userId),
      user.creatorId,
      { includeProgress: include_progress === 'true', category }
    );

    return reply.send({ success: true, data: result });
  }

  async getBadgeCatalog(request: FastifyRequest, reply: FastifyReply) {
    const { category, creator_id } = request.query as any;
    const user = (request as any).user;

    const badges = await this.badgeService.getBadgeCatalog(
      creator_id ? parseInt(creator_id) : user.creatorId,
      category
    );

    return reply.send({ success: true, data: { badges } });
  }

  async getBadgeDetail(request: FastifyRequest, reply: FastifyReply) {
    const { badgeCode } = request.params as { badgeCode: string };
    const user = (request as any).user;

    const badge = await this.badgeService.getBadgeDetail(
      user.id,
      user.creatorId,
      badgeCode
    );

    if (!badge) {
      return reply.status(404).send({
        success: false,
        error: { code: 'BADGE_NOT_FOUND', message: 'Badge not found' }
      });
    }

    return reply.send({ success: true, data: badge });
  }

  async manualBadgeAward(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request.params as { userId: string };
    const { badge_code, reason, notify_user } = request.body as any;
    const user = (request as any).user;

    if (user.role !== 'creator' && user.role !== 'admin') {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only creators can award badges' }
      });
    }

    try {
      const userBadge = await this.badgeService.awardBadge(
        parseInt(userId),
        user.creatorId,
        badge_code,
        reason,
        { awardedBy: `creator:${user.id}`, notify: notify_user }
      );

      return reply.send({
        success: true,
        data: {
          badge_awarded: true,
          badge_code,
          user_id: parseInt(userId),
          awarded_at: userBadge.awardedAt
        }
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'BADGE_ERROR',
          message: error.message
        }
      });
    }
  }
}
