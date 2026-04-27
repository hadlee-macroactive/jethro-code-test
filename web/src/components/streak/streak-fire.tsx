'use client';

import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils/format';

interface StreakFireProps {
  size?: number;
  active?: boolean;
  className?: string;
}

export function StreakFire({ size = 32, active = true, className }: StreakFireProps) {
  return (
    <div className={cn('relative inline-flex', className)}>
      {/* Glow effect */}
      {active && (
        <div className="absolute inset-0 blur-md bg-orange-500/30 rounded-full" />
      )}

      <Flame
        size={size}
        className={cn(
          'relative z-10',
          active ? 'text-orange-500 animate-pulse-fire' : 'text-gray-400'
        )}
      />
    </div>
  );
}
