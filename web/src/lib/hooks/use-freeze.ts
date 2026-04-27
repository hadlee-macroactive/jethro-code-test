import { useMutation, useQueryClient } from '@tanstack/react-query';
import { streaksApi } from '@/lib/api/streaks';
import { toast } from 'sonner';

export function useFreeze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ streakType, reason }: { streakType: string; reason?: string }) =>
      streaksApi.activateFreeze(streakType, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streaks'] });
      toast.success('Streak freeze activated!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to activate freeze');
    }
  });
}
