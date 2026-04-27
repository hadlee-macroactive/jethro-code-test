'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Streak } from '@/types';

interface AtRiskBannerProps {
  streaks: Streak[];
  onActivateFreeze?: (streakType: string) => void;
}

export function AtRiskBanner({ streaks, onActivateFreeze }: AtRiskBannerProps) {
  if (streaks.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-800">
            Your streak{streaks.length > 1 ? 's are' : ' is'} at risk!
          </h3>
          <div className="mt-2 space-y-2">
            {streaks.map((streak) => (
              <div key={streak.id} className="flex items-center justify-between">
                <span className="text-sm text-amber-700">
                  {streak.streakType} streak: {streak.currentCount} days
                  {streak.hoursUntilBreak && (
                    <span className="text-amber-600 ml-1">
                      ({Math.round(streak.hoursUntilBreak)}h remaining)
                    </span>
                  )}
                </span>
                {streak.freezeAvailable && onActivateFreeze && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onActivateFreeze(streak.streakType)}
                  >
                    Use Freeze
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
