'use client';

import { Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/format';
import type { Badge } from '@/types';

interface BadgeCardProps {
  badge: Badge;
  state?: 'locked' | 'progress' | 'earned';
  onClick?: () => void;
}

const rarityGradients = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500'
};

export function BadgeCard({ badge, state = 'earned', onClick }: BadgeCardProps) {
  const isLocked = state === 'locked';
  const hasProgress = state === 'progress' && badge.progressPercentage !== undefined;

  return (
    <Card
      onClick={onClick}
      className={cn(
        'relative overflow-hidden cursor-pointer transition-all hover:scale-105',
        'p-4 flex flex-col items-center text-center',
        isLocked && 'opacity-50 grayscale'
      )}
    >
      {!isLocked && (
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-10', rarityGradients[badge.rarity])} />
      )}

      <div className="relative z-10 mb-3">
        {badge.iconUrl ? (
          <img src={badge.iconUrl} alt={badge.name} className="w-16 h-16" />
        ) : (
          <Award className={cn('w-16 h-16', isLocked ? 'text-gray-400' : 'text-orange-500')} />
        )}
      </div>

      <div className="relative z-10 font-semibold text-sm">{badge.name}</div>

      <div className="relative z-10 text-xs text-muted-foreground mt-1">
        {badge.description}
      </div>

      {hasProgress && (
        <div className="relative z-10 w-full mt-3">
          <div className="text-xs text-muted-foreground mb-1">
            {badge.progressPercentage}%
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${badge.progressPercentage}%` }}
            />
          </div>
          {badge.currentValue !== undefined && badge.targetValue !== undefined && (
            <div className="text-xs text-muted-foreground mt-1">
              {badge.currentValue}/{badge.targetValue}
            </div>
          )}
        </div>
      )}

      {!isLocked && (
        <div className={cn(
          'absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full text-white',
          badge.rarity === 'common' && 'bg-gray-500',
          badge.rarity === 'rare' && 'bg-blue-500',
          badge.rarity === 'epic' && 'bg-purple-500',
          badge.rarity === 'legendary' && 'bg-yellow-500'
        )}>
          {badge.rarity}
        </div>
      )}

      {state === 'earned' && badge.earnedAt && (
        <div className="relative z-10 text-xs text-muted-foreground mt-2">
          Earned {new Date(badge.earnedAt).toLocaleDateString()}
        </div>
      )}
    </Card>
  );
}
