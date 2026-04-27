'use client';

import { Award, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils/format';
import type { Badge } from '@/types';

interface BadgeDetailModalProps {
  badge: Badge | null;
  open: boolean;
  onClose: () => void;
}

const rarityColors = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500',
};

const rarityLabels = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export function BadgeDetailModal({ badge, open, onClose }: BadgeDetailModalProps) {
  if (!badge) return null;

  const isEarned = !!badge.earnedAt;
  const isLocked = badge.isLocked || (!isEarned && !badge.progressPercentage);
  const hasProgress = badge.progressPercentage !== undefined && badge.progressPercentage > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Badge Details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center py-4">
          {/* Badge Icon */}
          <div className={cn(
            'w-24 h-24 rounded-full flex items-center justify-center mb-4',
            isLocked ? 'bg-gray-100' : 'bg-gradient-to-br from-primary/10 to-primary/5'
          )}>
            {badge.iconUrl ? (
              <img src={badge.iconUrl} alt={badge.name} className="w-16 h-16" />
            ) : (
              <Award className={cn('w-16 h-16', isLocked ? 'text-gray-400' : 'text-primary')} />
            )}
          </div>

          {/* Name */}
          <h3 className="text-xl font-bold">{badge.name}</h3>

          {/* Rarity */}
          <UIBadge className={cn('mt-2', rarityColors[badge.rarity])}>
            {rarityLabels[badge.rarity]}
          </UIBadge>

          {/* Description */}
          <p className="text-muted-foreground mt-3">{badge.description}</p>

          {/* Points */}
          <div className="text-sm text-muted-foreground mt-2">
            {badge.points} points
          </div>

          {/* Progress */}
          {hasProgress && !isEarned && (
            <div className="w-full mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{badge.progressPercentage}%</span>
              </div>
              <Progress value={badge.progressPercentage} className="h-3" />
              {badge.currentValue !== undefined && badge.targetValue !== undefined && (
                <div className="text-xs text-muted-foreground mt-1">
                  {badge.currentValue} / {badge.targetValue}
                </div>
              )}
            </div>
          )}

          {/* Earned date */}
          {isEarned && (
            <div className="mt-4 px-4 py-2 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 font-medium">
                Earned on {new Date(badge.earnedAt!).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Locked message */}
          {isLocked && (
            <div className="mt-4 px-4 py-2 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">
                Keep completing activities to unlock this badge!
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
