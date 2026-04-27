import { FastifyRequest, FastifyReply } from 'fastify';
import { StreakService } from '../../services/streak.service';
import { StreakType } from '../../types/streak.types';

export class StreakController {
  private streakService: StreakService;

  constructor() {
    this.streakService = new StreakService();
  }

  async getUserStreaks(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request.params as { userId: string };
    const { include_history } = request.query as { include_history?: string };
    const user = (request as any).user;

    if (user.id !== parseInt(userId) && user.role !== 'admin') {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' }
      });
    }

    const streaks = await this.streakService.getUserStreaks(parseInt(userId), user.creatorId);

    const response: any = {
      success: true,
      data: { streaks }
    };

    if (include_history === 'true') {
      const history = await this.streakService.getStreakHistory(parseInt(userId), user.creatorId);
      response.data.history = history.history;
    }

    return reply.send(response);
  }

  async getStreakHistory(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request.params as { userId: string };
    const { streak_type, limit, offset } = request.query as any;
    const user = (request as any).user;

    const history = await this.streakService.getStreakHistory(
      parseInt(userId),
      user.creatorId,
      streak_type,
      parseInt(limit) || 20,
      parseInt(offset) || 0
    );

    return reply.send({ success: true, data: history });
  }

  async activateFreeze(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request.params as { userId: string };
    const { streak_type, reason } = request.body as any;
    const user = (request as any).user;

    try {
      const streak = await this.streakService.activateFreeze(
        parseInt(userId),
        user.creatorId,
        streak_type as StreakType,
        reason
      );

      return reply.send({
        success: true,
        data: {
          freeze_activated: true,
          freeze_date: new Date(),
          streak_count_preserved: streak.currentCount,
          next_freeze_available: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: error.message === 'No freeze available' ? 'FREEZE_UNAVAILABLE' : 'STREAK_ERROR',
          message: error.message
        }
      });
    }
  }

  async getLeaderboard(request: FastifyRequest, reply: FastifyReply) {
    const { leaderboardType } = request.params as { leaderboardType: string };

    return reply.send({
      success: true,
      data: {
        leaderboard_type: leaderboardType,
        entries: [],
        current_user: null
      }
    });
  }
}
