'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/format';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  scoreLabel: string;
  onUserClick?: (userId: number) => void;
}

export function LeaderboardRow({ entry, scoreLabel, onUserClick }: LeaderboardRowProps) {
  return (
    <tr
      onClick={() => onUserClick?.(entry.userId)}
      className={cn(
        'border-t hover:bg-gray-50 cursor-pointer transition-colors',
        entry.isCurrentUser && 'bg-primary/5'
      )}
    >
      <td className="px-4 py-3">
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
          entry.rank === 1 && 'bg-yellow-500 text-white',
          entry.rank === 2 && 'bg-gray-400 text-white',
          entry.rank === 3 && 'bg-amber-700 text-white',
          entry.rank > 3 && 'bg-gray-100'
        )}>
          {entry.rank}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            {entry.avatarUrl ? (
              <AvatarImage src={entry.avatarUrl} />
            ) : (
              <AvatarFallback className="text-xs">
                {entry.isAnonymous ? '?' : entry.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {entry.isAnonymous ? 'Anonymous' : entry.displayName}
            </span>
            {entry.isCurrentUser && (
              <Badge variant="outline" className="text-xs py-0">You</Badge>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right font-semibold text-sm">
        {entry.score.toLocaleString()} {scoreLabel}
      </td>
    </tr>
  );
}
