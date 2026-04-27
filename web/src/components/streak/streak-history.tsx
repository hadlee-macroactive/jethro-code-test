'use client';

import { format } from 'date-fns';
import { Flame, Snowflake, Trophy, TrendingDown, Plus } from 'lucide-react';
import type { StreakHistory } from '@/types';

interface StreakHistoryListProps {
  history: StreakHistory[];
}

const eventIcons = {
  started: Plus,
  incremented: Flame,
  broken: TrendingDown,
  frozen: Snowflake,
  milestone: Trophy
};

const eventColors = {
  started: 'text-green-500',
  incremented: 'text-orange-500',
  broken: 'text-red-500',
  frozen: 'text-blue-500',
  milestone: 'text-yellow-500'
};

export function StreakHistoryList({ history }: StreakHistoryListProps) {
  return (
    <div className="space-y-3">
      {history.map((item) => {
        const Icon = eventIcons[item.eventType];
        const color = eventColors[item.eventType];

        return (
          <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <Icon size={20} className={color} />
            <div className="flex-1">
              <div className="text-sm font-medium capitalize">
                {item.eventType === 'milestone'
                  ? `${item.milestoneAchieved}-Day Milestone!`
                  : `Streak ${item.eventType}`}
              </div>
              {item.reason && (
                <div className="text-xs text-muted-foreground">{item.reason}</div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(item.createdAt), 'MMM d, h:mm a')}
            </div>
          </div>
        );
      })}
    </div>
  );
}
