import prisma from '../db/client';
import { CacheService } from './cache.service';
import { logger } from '../config/logger';

export class LeaderboardService {
  private cacheService: CacheService;

  constructor() {
    this.cacheService = new CacheService();
  }

  async getLeaderboard(
    creatorId: number,
    leaderboardType: string,
    periodStart?: string,
    _limit = 100
  ) {
    const cacheKey = `leaderboard:${creatorId}:${leaderboardType}:${periodStart || 'current'}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const where: any = { creatorId: BigInt(creatorId), leaderboardType };
    if (periodStart) {
      where.periodStart = { gte: new Date(periodStart) };
    }

    const leaderboard = await prisma.leaderboard.findFirst({
      where,
      orderBy: { periodStart: 'desc' }
    });

    if (!leaderboard) {
      return { leaderboardType, periodStart: null, periodEnd: null, entries: [], currentUser: null };
    }

    const result = {
      leaderboardType,
      periodStart: leaderboard.periodStart,
      periodEnd: leaderboard.periodEnd,
      entries: (leaderboard.entries as any[]) || [],
      lastRefreshed: leaderboard.lastRefreshed
    };

    await this.cacheService.set(cacheKey, result, 300);
    return result;
  }

  async refreshLeaderboard(creatorId: number, leaderboardType: string): Promise<void> {
    logger.info(`Refreshing leaderboard for creator ${creatorId}, type ${leaderboardType}`);
    // Implementation would aggregate data and upsert leaderboard
  }
}
