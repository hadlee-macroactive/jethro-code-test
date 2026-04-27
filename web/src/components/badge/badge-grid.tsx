'use client';

import { useMemo } from 'react';
import { BadgeCard } from './badge-card';
import type { Badge } from '@/types';

interface BadgeGridProps {
  badges: Badge[];
  max?: number;
  onBadgeClick?: (badge: Badge) => void;
}

const rarityOrder: Record<string, number> = { legendary: 0, epic: 1, rare: 2, common: 3 };

export function BadgeGrid({ badges, max, onBadgeClick }: BadgeGridProps) {
  const displayBadges = useMemo(() => {
    let filtered = [...badges];
    // Sort by earned first, then by rarity
    filtered.sort((a, b) => {
      if (a.earnedAt && !b.earnedAt) return -1;
      if (!a.earnedAt && b.earnedAt) return 1;
      return (rarityOrder[a.rarity] ?? 3) - (rarityOrder[b.rarity] ?? 3);
    });
    return max ? filtered.slice(0, max) : filtered;
  }, [badges, max]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {displayBadges.map((badge) => {
        const state = badge.earnedAt || badge.isEarned
          ? 'earned'
          : badge.progressPercentage && badge.progressPercentage > 0
            ? 'progress'
            : 'locked';

        return (
          <BadgeCard
            key={badge.id}
            badge={badge}
            state={state}
            onClick={() => onBadgeClick?.(badge)}
          />
        );
      })}

      {displayBadges.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          No badges found
        </div>
      )}
    </div>
  );
}
