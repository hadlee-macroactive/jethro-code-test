import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creatorApi } from '@/lib/api/creator';
import { toast } from 'sonner';
import type { StreakSettings, BadgeSettings } from '@/types';

export function useCreatorConfig(creatorId: number | null) {
  return useQuery({
    queryKey: ['creator-config', creatorId],
    queryFn: () => creatorApi.getConfig(creatorId!),
    enabled: !!creatorId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreatorAnalytics(creatorId: number | null, params?: { period_start?: string; period_end?: string }) {
  return useQuery({
    queryKey: ['creator-analytics', creatorId, params],
    queryFn: () => creatorApi.getAnalytics(creatorId!, params),
    enabled: !!creatorId,
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpdateStreakConfig(creatorId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: StreakSettings) => creatorApi.updateStreakConfig(creatorId!, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-config', creatorId] });
      toast.success('Streak configuration updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update streak configuration');
    },
  });
}

export function useUpdateBadgeConfig(creatorId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: BadgeSettings) => creatorApi.updateBadgeConfig(creatorId!, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-config', creatorId] });
      toast.success('Badge configuration updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update badge configuration');
    },
  });
}

export function useAwardBadge() {
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: { badge_code: string; reason?: string; notify_user?: boolean } }) =>
      creatorApi.awardBadge(userId, data),
    onSuccess: () => {
      toast.success('Badge awarded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to award badge');
    },
  });
}
