'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils/format';

interface CurrentUserRowProps {
  rank: number;
  score: number;
  scoreLabel: string;
  className?: string;
}

export function CurrentUserRow({ rank, score, scoreLabel, className }: CurrentUserRowProps) {
  return (
    <tr className={cn('border-t-2 border-primary bg-primary/5', className)}>
      <td className="px-4 py-3">
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
          {rank}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
          <span className="font-medium">You</span>
        </div>
      </td>
      <td className="px-4 py-3 text-right font-semibold">
        {score > 0 ? `${score.toLocaleString()} ${scoreLabel}` : '-'}
      </td>
    </tr>
  );
}
