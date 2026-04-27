'use client';

import { useStreaks } from '@/lib/hooks/use-streaks';
import { useBadges } from '@/lib/hooks/use-badges';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';

export default function ProfilePage() {
  const { data: streaks } = useStreaks();
  const { data: badgeData } = useBadges();

  const totalBadges = badgeData?.earned?.length || 0;
  const totalPoints = badgeData?.earned?.reduce((sum: number, b: any) => sum + (b.points || 0), 0) || 0;
  const longestStreak = Math.max(...(streaks || []).map(s => s.longestCount), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-4xl font-bold text-primary">{totalBadges}</div>
          <div className="text-sm text-muted-foreground mt-1">Badges Earned</div>
        </div>
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-4xl font-bold text-primary">{totalPoints}</div>
          <div className="text-sm text-muted-foreground mt-1">Total Points</div>
        </div>
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="text-4xl font-bold text-primary">{longestStreak}</div>
          <div className="text-sm text-muted-foreground mt-1">Longest Streak</div>
        </div>
      </div>
    </div>
  );
}
