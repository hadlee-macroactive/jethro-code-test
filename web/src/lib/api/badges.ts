import api from './client';
import type { Badge } from '@/types';

export const badgesApi = {
  getUserBadges: async (options?: { includeProgress?: boolean; category?: string }) => {
    const params: Record<string, string> = {};
    if (options?.includeProgress) params.include_progress = 'true';
    if (options?.category) params.category = options.category;
    const response: any = await api.get('/api/badges', Object.keys(params).length > 0 ? params : undefined);
    return response.data;
  },

  getCatalog: async (category?: string) => {
    const params: Record<string, string> = { mode: 'catalog' };
    if (category) params.category = category;
    const response: any = await api.get('/api/badges', params);
    return response.data?.badges || [];
  },

  getByCode: async (badgeCode: string): Promise<Badge> => {
    const response: any = await api.get(`/api/badges/${badgeCode}`);
    return response.data;
  }
};
