'use client';

import { Trophy, Crown, Medal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/format';
import type { LeaderboardEntry, LeaderboardType } from '@/types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  type: LeaderboardType;
  periodStart: string;
  periodEnd: string;
  currentUserRank?: number;
  onUserClick?: (userId: number) => void;
}

const scoreLabels: Record<string, string> = {
  weekly_workout: 'Workouts',
  monthly_streak: 'Day Streak',
  volume: 'lbs Lifted',
  challenge: 'Points',
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
  if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
  return null;
};

const getRankBadge = (rank: number) => {
  if (rank <= 3) {
    const colors = ['bg-yellow-500', 'bg-gray-400', 'bg-amber-700'];
    return (
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
        colors[rank - 1]
      )}>
        {rank}
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold">
      {rank}
    </div>
  );
};

export function LeaderboardTable({
  entries,
  type,
  periodStart,
  periodEnd,
  currentUserRank,
  onUserClick
}: LeaderboardTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Leaderboard</h3>
          <div className="text-sm text-muted-foreground">
            {new Date(periodStart).toLocaleDateString()} - {new Date(periodEnd).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Rank</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Athlete</th>
            <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground">
              {scoreLabels[type] || 'Score'}
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.userId}
              onClick={() => onUserClick?.(entry.userId)}
              className={cn(
                'border-t hover:bg-gray-50 cursor-pointer transition-colors',
                entry.isCurrentUser && 'bg-primary/5'
              )}
            >
              <td className="px-4 py-3">
                {getRankIcon(entry.rank) || getRankBadge(entry.rank)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    {entry.avatarUrl ? (
                      <AvatarImage src={entry.avatarUrl} />
                    ) : (
                      <AvatarFallback>
                        {(entry.displayName ?? '?').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {entry.isAnonymous ? 'Anonymous' : entry.displayName}
                      {entry.isCurrentUser && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    {entry.badges && entry.badges.length > 0 && (
                      <div className="flex gap-1 mt-0.5">
                        {entry.badges.slice(0, 3).map((b, i) => (
                          <span key={i} className="text-xs">
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-semibold">
                {entry.score.toLocaleString()}
              </td>
            </tr>
          ))}

          {/* Current user row (if not in top entries) */}
          {currentUserRank && currentUserRank > entries.length && (
            <tr className="border-t-2 border-primary bg-primary/5">
              <td className="px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {currentUserRank}
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
              <td className="px-4 py-3 text-right font-semibold">-</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No entries yet this period</p>
          <p className="text-sm mt-1">Be the first to make the leaderboard!</p>
        </div>
      )}
    </div>
  );
}
