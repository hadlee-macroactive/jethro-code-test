'use client';

import { useEffect, useState } from 'react';
import { Share2, Flame } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Confetti } from './confetti';

interface CelebrationModalProps {
  open: boolean;
  onClose: () => void;
  milestone: number;
  streakType: string;
  badge?: {
    name: string;
    iconUrl: string;
    rarity: string;
  };
  onShare?: () => void;
}

const streakTypeLabels: Record<string, string> = {
  workout: 'Workout',
  nutrition: 'Nutrition',
  habit: 'Habit',
  community: 'Community',
};

export function CelebrationModal({
  open,
  onClose,
  milestone,
  streakType,
  badge,
  onShare
}: CelebrationModalProps) {
  const [confettiActive, setConfettiActive] = useState(false);

  useEffect(() => {
    if (open) {
      setConfettiActive(true);
    } else {
      setConfettiActive(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center p-0 overflow-hidden">
        {confettiActive && <Confetti />}

        {/* Content */}
        <div className="p-8">
          {/* Milestone number */}
          <div className="mb-4">
            <div className="text-6xl mb-2">🎉</div>
            <h2 className="text-4xl font-bold text-primary">
              {milestone} Days!
            </h2>
          </div>

          {/* Message */}
          <p className="text-muted-foreground mb-6">
            Congratulations! You&apos;ve completed{' '}
            <strong>{milestone} consecutive {streakTypeLabels[streakType]?.toLowerCase() || streakType}s</strong>!
            Your dedication is inspiring.
          </p>

          {/* Badge */}
          {badge && (
            <div className="mb-6">
              <div className="inline-flex flex-col items-center p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg">
                {badge.iconUrl ? (
                  <img src={badge.iconUrl} alt={badge.name} className="w-20 h-20" />
                ) : (
                  <Flame className="w-20 h-20 text-orange-500" />
                )}
                <div className="mt-2 font-semibold">{badge.name}</div>
              </div>
            </div>
          )}

          {/* Progress indicator */}
          <div className="mb-6">
            <div className="text-sm text-muted-foreground mb-2">
              You&apos;re in the top {Math.max(1, 100 - milestone)}% of users!
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                style={{ width: `${Math.min(100, milestone)}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            {onShare && (
              <Button variant="outline" onClick={onShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}
            <Button onClick={onClose}>
              Keep Going!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
