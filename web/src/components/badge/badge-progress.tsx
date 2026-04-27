'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils/format';
import type { BadgeProgress } from '@/types';

interface BadgeProgressProps {
  progress: BadgeProgress;
  showLabel?: boolean;
  className?: string;
}

export function BadgeProgress({ progress, showLabel = true, className }: BadgeProgressProps) {
  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">{progress.badge.name}</span>
          <span className="font-medium">{progress.percentage}%</span>
        </div>
      )}
      <Progress value={progress.percentage} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>{progress.currentValue} / {progress.targetValue}</span>
        {progress.estimatedCompletion && (
          <span>Est. {new Date(progress.estimatedCompletion).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}
