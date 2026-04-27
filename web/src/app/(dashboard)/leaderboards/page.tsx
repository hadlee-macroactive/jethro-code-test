'use client';

import { useState } from 'react';
import { useLeaderboard } from '@/lib/hooks/use-leaderboard';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { LeaderboardType } from '@/types';
import { cn } from '@/lib/utils/format';

const leaderboardTypes = [
  { label: 'Weekly Workout', value: LeaderboardType.WEEKLY_WORKOUT },
  { label: 'Monthly Streak', value: LeaderboardType.MONTHLY_STREAK },
  { label: 'Volume', value: LeaderboardType.VOLUME },
  { label: 'Challenge', value: LeaderboardType.CHALLENGE },
];

export default function LeaderboardsPage() {
  const [type, setType] = useState(LeaderboardType.WEEKLY_WORKOUT);
  const { data, isLoading } = useLeaderboard(type);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Leaderboard</h1>

      <div className="flex gap-2">
        {leaderboardTypes.map((lt) => (
          <button
            key={lt.value}
            onClick={() => setType(lt.value)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              type === lt.value
                ? 'bg-primary text-white'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {lt.label}
          </button>
        ))}
      </div>

      {data ? (
        <LeaderboardTable
          entries={data.entries}
          type={data.type}
          periodStart={data.periodStart}
          periodEnd={data.periodEnd}
          currentUserRank={data.currentUserRank}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No leaderboard data available
        </div>
      )}
    </div>
  );
}
