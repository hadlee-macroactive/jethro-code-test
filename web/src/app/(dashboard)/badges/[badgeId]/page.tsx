'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Award, Calendar, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge as BadgeTag } from '@/components/ui/badge';
import { cn } from '@/lib/utils/format';
import { useBadges } from '@/lib/hooks/use-badges';
import { BadgeRarity, BadgeCategory } from '@/types';
import { BADGE_RARITY_LABELS, BADGE_CATEGORY_LABELS } from '@/lib/constants/badges';
import type { Badge } from '@/types';

const rarityColors: Record<BadgeRarity, string> = {
  [BadgeRarity.COMMON]: 'bg-gray-500',
  [BadgeRarity.RARE]: 'bg-blue-500',
  [BadgeRarity.EPIC]: 'bg-purple-500',
  [BadgeRarity.LEGENDARY]: 'bg-yellow-500',
};

export default function BadgeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const badgeId = params.badgeId as string;

  const { data: badgeData, isLoading } = useBadges({ includeProgress: true });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const allBadges: Badge[] = [
    ...(badgeData?.earned || []),
    ...(badgeData?.inProgress || [])
  ];
  const badge = allBadges.find((b: Badge) => b.id === badgeId);

  if (!badge) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Award className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Badge not found</h2>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const isEarned = !!badge.earnedAt;
  const hasProgress = badge.progressPercentage !== undefined && badge.progressPercentage > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Badges
      </Button>

      {/* Badge Header */}
      <Card className="p-8 flex flex-col items-center text-center">
        <div className={cn(
          'w-32 h-32 rounded-full flex items-center justify-center mb-6',
          isEarned ? 'bg-gradient-to-br from-primary/10 to-primary/5' : 'bg-gray-100'
        )}>
          {badge.iconUrl ? (
            <img src={badge.iconUrl} alt={badge.name} className="w-24 h-24" />
          ) : (
            <Award className={cn('w-24 h-24', isEarned ? 'text-primary' : 'text-gray-400')} />
          )}
        </div>

        <h1 className="text-2xl font-bold mb-2">{badge.name}</h1>
        <p className="text-muted-foreground mb-4">{badge.description}</p>

        <div className="flex gap-2 mb-4">
          <BadgeTag className={rarityColors[badge.rarity] || 'bg-gray-500'}>
            {BADGE_RARITY_LABELS[badge.rarity] || badge.rarity}
          </BadgeTag>
          <BadgeTag variant="outline">
            {BADGE_CATEGORY_LABELS[badge.badgeCategory] || badge.badgeCategory}
          </BadgeTag>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          <Trophy className="w-4 h-4" />
          <span className="text-sm">{badge.points} points</span>
        </div>
      </Card>

      {/* Progress */}
      {hasProgress && !isEarned && (
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Progress</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-medium">{badge.progressPercentage}%</span>
            </div>
            <Progress value={badge.progressPercentage} className="h-3" />
            {badge.currentValue !== undefined && badge.targetValue !== undefined && (
              <div className="text-sm text-muted-foreground">
                {badge.currentValue} / {badge.targetValue} completed
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Earned Info */}
      {isEarned && (
        <Card className="p-6">
          <div className="flex items-center gap-3 text-green-700">
            <Calendar className="w-5 h-5" />
            <div>
              <p className="font-medium">Earned</p>
              <p className="text-sm text-muted-foreground">
                {new Date(badge.earnedAt!).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
