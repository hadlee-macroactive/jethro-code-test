import prisma from '../db/client';
import { CacheService } from './cache.service';
import { logger } from '../config/logger';

export class CreatorConfigService {
  private cacheService: CacheService;

  constructor() {
    this.cacheService = new CacheService();
  }

  async getConfig(creatorId: number) {
    const cacheKey = `creator_config:${creatorId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const config = await prisma.creatorConfiguration.findUnique({
      where: { creatorId: BigInt(creatorId) }
    });

    if (!config) {
      // Return defaults
      return {
        creatorId,
        streakSettings: {},
        badgeSettings: {},
        leaderboardSettings: {},
        notificationSettings: {},
        featureFlags: {
          streaksEnabled: true,
          badgesEnabled: true,
          leaderboardsEnabled: true,
          freezeEnabled: true,
          analyticsEnabled: true
        }
      };
    }

    const result = {
      id: config.id,
      creatorId: Number(config.creatorId),
      streakSettings: config.streakSettings,
      badgeSettings: config.badgeSettings,
      leaderboardSettings: config.leaderboardSettings,
      notificationSettings: config.notificationSettings,
      featureFlags: config.featureFlags,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    };

    await this.cacheService.set(cacheKey, result, 600);
    return result;
  }

  async updateConfig(creatorId: number, data: {
    streakSettings?: Record<string, unknown>;
    badgeSettings?: Record<string, unknown>;
    leaderboardSettings?: Record<string, unknown>;
    notificationSettings?: Record<string, unknown>;
    featureFlags?: Record<string, unknown>;
  }) {
    const config = await prisma.creatorConfiguration.upsert({
      where: { creatorId: BigInt(creatorId) },
      create: {
        creatorId: BigInt(creatorId),
        streakSettings: (data.streakSettings || {}) as any,
        badgeSettings: (data.badgeSettings || {}) as any,
        leaderboardSettings: (data.leaderboardSettings || {}) as any,
        notificationSettings: (data.notificationSettings || {}) as any,
        featureFlags: (data.featureFlags || {}) as any
      },
      update: {
        ...(data.streakSettings && { streakSettings: data.streakSettings as any }),
        ...(data.badgeSettings && { badgeSettings: data.badgeSettings as any }),
        ...(data.leaderboardSettings && { leaderboardSettings: data.leaderboardSettings as any }),
        ...(data.notificationSettings && { notificationSettings: data.notificationSettings as any }),
        ...(data.featureFlags && { featureFlags: data.featureFlags as any })
      }
    });

    await this.cacheService.del(`creator_config:${creatorId}`);
    logger.info(`Config updated for creator ${creatorId}`);
    return config;
  }
}
