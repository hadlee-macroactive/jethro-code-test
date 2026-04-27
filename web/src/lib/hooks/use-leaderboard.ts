import { useQuery } from '@tanstack/react-query';
import { leaderboardsApi } from '@/lib/api/leaderboards';

export function useLeaderboard(type: string, options?: { period_start?: string }) {
  return useQuery({
    queryKey: ['leaderboard', type, options],
    queryFn: () => leaderboardsApi.getLeaderboard(type, options),
    staleTime: 1000 * 60 * 5,
  });
}
