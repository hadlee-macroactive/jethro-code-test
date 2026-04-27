import { FastifyRequest, FastifyReply } from 'fastify';
import { LeaderboardService } from '../../services/leaderboard.service';

export class LeaderboardController {
  private leaderboardService: LeaderboardService;

  constructor() {
    this.leaderboardService = new LeaderboardService();
  }

  async getLeaderboard(request: FastifyRequest, reply: FastifyReply) {
    const { leaderboardType } = request.params as { leaderboardType: string };
    const { period_start, limit } = request.query as any;
    const user = (request as any).user;

    const result = await this.leaderboardService.getLeaderboard(
      user.creatorId,
      leaderboardType,
      period_start,
      parseInt(limit) || 100
    );

    return reply.send({ success: true, data: result });
  }

  async refreshLeaderboard(request: FastifyRequest, reply: FastifyReply) {
    const { leaderboardType } = request.params as { leaderboardType: string };
    const user = (request as any).user;

    await this.leaderboardService.refreshLeaderboard(user.creatorId, leaderboardType);

    return reply.send({ success: true, data: { refreshed: true } });
  }
}
