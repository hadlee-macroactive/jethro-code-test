'use client';

import { useState } from 'react';
import { useStreaks, useStreakHistory } from '@/lib/hooks/use-streaks';
import { StreakCounter } from '@/components/streak/streak-counter';
import { StreakHistoryList } from '@/components/streak/streak-history';
import { StreakCalendar } from '@/components/streak/streak-calendar';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import type { Streak } from '@/types';

export default function StreaksPage() {
  const { data: streaks, isLoading } = useStreaks();
  const { data: historyData } = useStreakHistory();
  const [selectedStreak, setSelectedStreak] = useState<Streak | null>(null);

  if (isLoading) return <LoadingSkeleton />;

  const streakList = streaks || [];
  const displayStreak = selectedStreak || streakList[0] || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Streaks</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {streakList.map((streak) => (
          <div key={streak.id} onClick={() => setSelectedStreak(streak)} className="cursor-pointer">
            <StreakCounter streak={streak} size="lg" />
          </div>
        ))}
      </div>

      {/* Calendar view for selected streak */}
      {displayStreak && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {displayStreak.streakType} Calendar
          </h2>
          <StreakCalendar
            streak={displayStreak}
            events={[]}
          />
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">History</h2>
        <StreakHistoryList history={historyData || []} />
      </section>
    </div>
  );
}
