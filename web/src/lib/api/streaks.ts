import api from './client';
import type { Streak, StreakHistory } from '@/types';

export const streaksApi = {
  getAll: async (): Promise<Streak[]> => {
    const response: any = await api.get('/api/streaks');
    return response.data?.streaks || [];
  },

  getById: async (id: string): Promise<Streak> => {
    const response: any = await api.get(`/api/streaks`, { streak_id: id });
    return response.data;
  },

  getHistory: async (): Promise<StreakHistory[]> => {
    const response: any = await api.get('/api/streaks/history');
    return response.data?.history || [];
  },

  activateFreeze: async (streakType: string, reason?: string) => {
    const response: any = await api.post('/api/streaks/freeze', {
      streak_type: streakType,
      reason
    });
    return response.data;
  }
};
