'use client';

import { useState } from 'react';
import { useStreaks } from '@/lib/hooks/use-streaks';
import { useBadges } from '@/lib/hooks/use-badges';
import { StreakCounter } from '@/components/streak/streak-counter';
import { BadgeGrid } from '@/components/badge/badge-grid';
import { BadgeDetailModal } from '@/components/badge/badge-detail-modal';
import { AtRiskBanner } from '@/components/streak/at-risk-banner';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { useUserStore } from '@/lib/store/user.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { Badge } from '@/types';

export default function DashboardPage() {
  const { data: streaks, isLoading, error } = useStreaks();
  const { data: badgeData } = useBadges({ includeProgress: true });
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const { hydrated, userId } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !userId) {
      router.push('/login');
    }
  }, [hydrated, userId, router]);

  if (!hydrated || isLoading) return <LoadingSkeleton />;

  if (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const isAuthError =
      errMsg === 'Unauthorized' ||
      errMsg === 'Failed to fetch' ||
      (error as any)?.status === 401;

    if (isAuthError) {
      router.push('/login');
      return <LoadingSkeleton />;
    }

    return <div className="text-red-500">Error loading dashboard</div>;
  }

  const atRiskStreaks = (streaks || []).filter(s => s.isAtRisk);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Dashboard</h1>

      {atRiskStreaks.length > 0 && (
        <AtRiskBanner streaks={atRiskStreaks} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(streaks || []).map((streak) => (
          <StreakCounter key={streak.id} streak={streak} />
        ))}
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Badges</h2>
        <BadgeGrid
          badges={(badgeData?.earned || []).slice(0, 6)}
          max={6}
          onBadgeClick={(badge) => setSelectedBadge(badge)}
        />
      </section>

      <BadgeDetailModal
        badge={selectedBadge}
        open={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </div>
  );
}
