'use client';

import { Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils/format';

interface StreakIceProps {
  size?: number;
  active?: boolean;
  className?: string;
}

export function StreakIce({ size = 32, active = true, className }: StreakIceProps) {
  return (
    <div className={cn('relative inline-flex', className)}>
      {/* Ice glow effect */}
      {active && (
        <div className="absolute inset-0 blur-md bg-blue-500/30 rounded-full" />
      )}

      <Snowflake
        size={size}
        className={cn(
          'relative z-10',
          active ? 'text-blue-500 animate-pulse' : 'text-gray-400'
        )}
      />
    </div>
  );
}
