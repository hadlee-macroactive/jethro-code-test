import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { streaksApi } from '@/lib/api/streaks';

export function useStreaks() {
  return useQuery({
    queryKey: ['streaks'],
    queryFn: () => streaksApi.getAll(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useStreakHistory() {
  return useQuery({
    queryKey: ['streaks', 'history'],
    queryFn: () => streaksApi.getHistory(),
  });
}

export function useActivateFreeze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ streakType, reason }: { streakType: string; reason?: string }) =>
      streaksApi.activateFreeze(streakType, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streaks'] });
    }
  });
}
