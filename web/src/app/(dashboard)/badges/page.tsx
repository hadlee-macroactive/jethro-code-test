'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBadges } from '@/lib/hooks/use-badges';
import { BadgeGrid } from '@/components/badge/badge-grid';
import { BadgeDetailModal } from '@/components/badge/badge-detail-modal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BadgeCategory } from '@/types';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import type { Badge } from '@/types';

const categories = [
  { label: 'All', value: '' },
  { label: 'Consistency', value: BadgeCategory.CONSISTENCY },
  { label: 'Milestone', value: BadgeCategory.MILESTONE },
  { label: 'Challenge', value: BadgeCategory.CHALLENGE },
  { label: 'Community', value: BadgeCategory.COMMUNITY },
];

export default function BadgesPage() {
  const [category, setCategory] = useState<string>('');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const router = useRouter();

  const selectedCategory = category ? (category as BadgeCategory) : undefined;
  const { data: badgeData, isLoading } = useBadges({ includeProgress: true, category: selectedCategory });

  if (isLoading) return <LoadingSkeleton />;

  const earnedBadges = badgeData?.earned || [];
  const inProgressBadges = badgeData?.inProgress || [];
  const allBadges = [...earnedBadges, ...inProgressBadges];

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Badges</h1>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="earned">Earned</TabsTrigger>
            <TabsTrigger value="progress">In Progress</TabsTrigger>
          </TabsList>

          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat.label}
                variant={category === cat.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategory(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        <TabsContent value="all">
          <BadgeGrid
            badges={allBadges}
            onBadgeClick={handleBadgeClick}
          />
        </TabsContent>

        <TabsContent value="earned">
          <section>
            <h2 className="text-xl font-semibold mb-4">Earned Badges</h2>
            <BadgeGrid badges={earnedBadges} onBadgeClick={handleBadgeClick} />
          </section>
        </TabsContent>

        <TabsContent value="progress">
          <section>
            <h2 className="text-xl font-semibold mb-4">In Progress</h2>
            <BadgeGrid badges={inProgressBadges} onBadgeClick={handleBadgeClick} />
          </section>
        </TabsContent>
      </Tabs>

      {/* Badge Detail Modal */}
      <BadgeDetailModal
        badge={selectedBadge}
        open={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </div>
  );
}
