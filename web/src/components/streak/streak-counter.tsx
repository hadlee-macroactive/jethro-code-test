'use client';

import { Flame, Snowflake, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils/format';
import type { Streak } from '@/types';

interface StreakCounterProps {
  streak: Streak;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakCounter({ streak, size = 'md' }: StreakCounterProps) {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-40 h-40',
    lg: 'w-48 h-48'
  };

  const iconSize = { sm: 24, md: 32, lg: 40 };

  const isFrozen = !streak.isActive && streak.freezeUsedCount > 0;
  const isBroken = !streak.isActive && streak.freezeUsedCount === 0;

  return (
    <Card className={cn(
      'relative overflow-hidden',
      sizeClasses[size],
      'flex flex-col items-center justify-center p-4'
    )}>
      {streak.isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
      )}

      <div className="relative z-10">
        {isFrozen ? (
          <Snowflake size={iconSize[size]} className="text-blue-500" />
        ) : isBroken ? (
          <TrendingUp size={iconSize[size]} className="text-gray-400" />
        ) : (
          <Flame size={iconSize[size]} className="text-orange-500 animate-pulse-fire" />
        )}
      </div>

      <div className="relative z-10 mt-2 text-center">
        <div className="text-3xl font-bold">{streak.currentCount}</div>
        <div className="text-xs text-muted-foreground uppercase">{streak.streakType}</div>
      </div>

      {streak.isActive && streak.nextMilestone && (
        <div className="w-full mt-3">
          <Progress value={streak.milestoneProgress} className="h-1" />
          <div className="text-xs text-muted-foreground mt-1">
            {streak.nextMilestone - streak.currentCount} to milestone
          </div>
        </div>
      )}

      {isFrozen && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
          Frozen
        </div>
      )}
    </Card>
  );
}
