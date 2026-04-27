import api from './client';
import type { Leaderboard } from '@/types';

export const leaderboardsApi = {
  getLeaderboard: async (type: string, params?: { period_start?: string; limit?: number }) => {
    const searchParams: Record<string, string> = {};
    if (params?.period_start) searchParams.period_start = params.period_start;
    if (params?.limit) searchParams.limit = String(params.limit);
    const response: any = await api.get(`/api/leaderboards/${type}`, Object.keys(searchParams).length > 0 ? searchParams : undefined);
    return response.data as Leaderboard;
  }
};
