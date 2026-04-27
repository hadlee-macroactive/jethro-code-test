'use client';

import { Award } from 'lucide-react';
import { cn } from '@/lib/utils/format';

interface BadgePlaceholderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: 'w-16 h-16',
  md: 'w-20 h-20',
  lg: 'w-24 h-24',
};

const iconSizeConfig = {
  sm: 24,
  md: 32,
  lg: 40,
};

export function BadgePlaceholder({ size = 'md', className }: BadgePlaceholderProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-gray-100 flex items-center justify-center',
        sizeConfig[size],
        className
      )}
    >
      <Award
        size={iconSizeConfig[size]}
        className="text-gray-300"
      />
    </div>
  );
}
