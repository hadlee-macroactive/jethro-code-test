import { useQuery } from '@tanstack/react-query';
import { badgesApi } from '@/lib/api/badges';
import type { BadgeCategory } from '@/types';

export function useBadges(options?: { includeProgress?: boolean; category?: BadgeCategory }) {
  return useQuery({
    queryKey: ['badges', options],
    queryFn: () => badgesApi.getUserBadges(options),
    staleTime: 1000 * 60 * 5,
  });
}

export function useBadgeCatalog(category?: string) {
  return useQuery({
    queryKey: ['badges', 'catalog', category],
    queryFn: () => badgesApi.getCatalog(category),
  });
}
