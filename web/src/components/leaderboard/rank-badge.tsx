'use client';

import { Crown, Medal } from 'lucide-react';
import { cn } from '@/lib/utils/format';

interface RankBadgeProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

const iconSizes = { sm: 14, md: 20, lg: 28 };

export function RankBadge({ rank, size = 'md', className }: RankBadgeProps) {
  if (rank === 1) {
    return (
      <div className={cn('inline-flex items-center justify-center', className)}>
        <Crown size={iconSizes[size]} className="text-yellow-500" />
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className={cn('inline-flex items-center justify-center', className)}>
        <Medal size={iconSizes[size]} className="text-gray-400" />
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className={cn('inline-flex items-center justify-center', className)}>
        <Medal size={iconSizes[size]} className="text-amber-700" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gray-100 flex items-center justify-center font-bold',
        sizeConfig[size],
        className
      )}
    >
      {rank}
    </div>
  );
}
