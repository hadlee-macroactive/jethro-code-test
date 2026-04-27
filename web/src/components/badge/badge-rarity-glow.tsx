'use client';

import { cn } from '@/lib/utils/format';
import type { BadgeRarity } from '@/types';

interface BadgeRarityGlowProps {
  rarity: BadgeRarity;
  active?: boolean;
  className?: string;
}

const rarityGlowColors = {
  common: '',
  rare: 'shadow-blue-500/30',
  epic: 'shadow-purple-500/30',
  legendary: 'shadow-yellow-500/30',
};

export function BadgeRarityGlow({ rarity, active = true, className }: BadgeRarityGlowProps) {
  if (rarity === 'common' || !active) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 rounded-lg pointer-events-none',
        rarity === 'rare' && 'glow-ice',
        rarity === 'epic' && 'shadow-lg shadow-purple-500/20',
        rarity === 'legendary' && 'glow-legendary',
        className
      )}
    />
  );
}
