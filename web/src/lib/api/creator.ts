import api from './client';
import type {
  CreatorConfiguration,
  CreatorAnalytics,
  StreakSettings,
  BadgeSettings,
} from '@/types';

export const creatorApi = {
  getConfig: async (creatorId: number): Promise<CreatorConfiguration> => {
    const response: any = await api.get(`/api/creator/${creatorId}`);
    return response.data;
  },

  updateStreakConfig: async (creatorId: number, settings: StreakSettings) => {
    const response: any = await api.patch(`/api/creator/${creatorId}`, {
      streakSettings: settings,
    });
    return response.data;
  },

  updateBadgeConfig: async (creatorId: number, settings: BadgeSettings) => {
    const response: any = await api.patch(`/api/creator/${creatorId}`, {
      badgeSettings: settings,
    });
    return response.data;
  },

  getAnalytics: async (creatorId: number, params?: { period_start?: string; period_end?: string }) => {
    const searchParams: Record<string, string> = {};
    if (params?.period_start) searchParams.period_start = params.period_start;
    if (params?.period_end) searchParams.period_end = params.period_end;
    const response: any = await api.get(
      `/api/creator/${creatorId}/analytics`,
      Object.keys(searchParams).length > 0 ? searchParams : undefined
    );
    return response.data as CreatorAnalytics;
  },

  awardBadge: async (userId: number, data: { badge_code: string; reason?: string; notify_user?: boolean }) => {
    const response: any = await api.post(`/api/badges/award`, {
      user_id: userId,
      ...data,
    });
    return response.data;
  },
};
