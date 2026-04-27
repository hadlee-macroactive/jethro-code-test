# Component Specifications

This document contains detailed specifications for every UI component. Each component includes props, state, behavior, and code structure.

## Component List

| Component | File | Purpose |
|-----------|------|---------|
| StreakCounter | `streak/streak-counter.tsx` | Display current streak |
| StreakCalendar | `streak/streak-calendar.tsx` | Calendar view of streak |
| FreezeButton | `streak/freeze-button.tsx` | Activate streak freeze |
| AtRiskBanner | `streak/at-risk-banner.tsx` | Warning banner for at-risk streaks |
| BadgeCard | `badge/badge-card.tsx` | Single badge display |
| BadgeGrid | `badge/badge-grid.tsx` | Grid of badges |
| BadgeDetailModal | `badge/badge-detail-modal.tsx` | Badge detail popup |
| LeaderboardTable | `leaderboard/leaderboard-table.tsx` | Leaderboard display |
| CelebrationModal | `common/celebration-modal.tsx` | Milestone celebration |

## Detailed Component Specs

### 1. StreakCounter

**Purpose:** Display a user's current streak with visual feedback

**File:** `src/components/streak/streak-counter.tsx`

**Props:**
```typescript
interface StreakCounterProps {
  streak: {
    id: string;
    streakType: 'workout' | 'nutrition' | 'habit' | 'community';
    currentCount: number;
    longestCount: number;
    isActive: boolean;
    isFrozen?: boolean;
    nextMilestone?: number;
    milestoneProgress: number;
    freezeAvailable: boolean;
    lastActivityDate: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showMilestone?: boolean;
  onClick?: () => void;
}
```

**State:** None (presentational only)

**Visual Spec:**
```
┌─────────────────────────────┐
│                             │
│          🔥                  │  <- Animated icon (fire/snowflake/broken)
│                             │
│           14                 │  <- Current count
│       DAY STREAK             │  <- Label
│                             │
│     ████████░░░░ 70%         │  <- Progress bar (if showMilestone)
│    16 days to milestone      │  <- Progress text
└─────────────────────────────┘
```

**States:**
- **Active:** Fire icon animating, orange colors
- **Frozen:** Snowflake icon, blue colors, "Frozen" badge
- **Broken:** Gray icon, gray colors, "0" count
- **At Risk:** Pulsing orange border

**Behavior:**
- On click → Opens streak detail modal (if onClick provided)
- On freeze → Shows snowflake icon
- On milestone → Shows celebration

**Full Implementation:**
```tsx
'use client';

import { Flame, Snowflake, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils/format';

interface StreakCounterProps {
  streak: {
    id: string;
    streakType: 'workout' | 'nutrition' | 'habit' | 'community';
    currentCount: number;
    longestCount: number;
    isActive: boolean;
    isFrozen?: boolean;
    nextMilestone?: number;
    milestoneProgress: number;
    freezeAvailable: boolean;
    lastActivityDate: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showMilestone?: boolean;
  onClick?: () => void;
}

const sizeConfig = {
  sm: { container: 'w-32 h-32', icon: 24, count: 'text-2xl' },
  md: { container: 'w-40 h-40', icon: 32, count: 'text-3xl' },
  lg: { container: 'w-48 h-48', icon: 40, count: 'text-4xl' }
};

const streakTypeLabels = {
  workout: 'Workout',
  nutrition: 'Nutrition',
  habit: 'Habit',
  community: 'Community'
};

export function StreakCounter({
  streak,
  size = 'md',
  showLabel = true,
  showMilestone = true,
  onClick
}: StreakCounterProps) {
  const config = sizeConfig[size];
  const isFrozen = streak.isFrozen;
  const isBroken = !streak.isActive && !isFrozen;
  const isAtRisk = streak.isActive && !isFrozen && streak.hoursUntilRisk < 6;

  return (
    <Card
      onClick={onClick}
      className={cn(
        'relative overflow-hidden cursor-pointer transition-all hover:scale-105',
        config.container,
        'flex flex-col items-center justify-center p-4',
        isAtRisk && 'ring-2 ring-orange-400 animate-pulse'
      )}
    >
      {/* Background gradient */}
      {streak.isActive && !isFrozen && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
      )}

      {/* Icon */}
      <div className="relative z-10">
        {isFrozen ? (
          <Snowflake
            size={config.icon}
            className="text-blue-500 animate-pulse"
          />
        ) : isBroken ? (
          <AlertCircle
            size={config.icon}
            className="text-gray-400"
          />
        ) : (
          <Flame
            size={config.icon}
            className="text-orange-500 animate-pulse-fire"
          />
        )}
      </div>

      {/* Count */}
      <div className="relative z-10 mt-2 text-center">
        <div className={cn('font-bold', config.count)}>
          {streak.currentCount}
        </div>
        {showLabel && (
          <div className="text-xs text-muted-foreground uppercase">
            {streakTypeLabels[streak.streakType]}
          </div>
        )}
      </div>

      {/* Longest streak */}
      {showLabel && (
        <div className="relative z-10 text-xs text-muted-foreground mt-1">
          Best: {streak.longestCount}
        </div>
      )}

      {/* Progress to next milestone */}
      {showMilestone && streak.isActive && streak.nextMilestone && (
        <div className="w-full mt-3 px-2">
          <Progress
            value={streak.milestoneProgress}
            className="h-1.5"
          />
          <div className="text-xs text-muted-foreground mt-1 text-center">
            {streak.nextMilestone - streak.currentCount} to milestone
          </div>
        </div>
      )}

      {/* Frozen badge */}
      {isFrozen && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
          Frozen
        </div>
      )}

      {/* At risk badge */}
      {isAtRisk && !isFrozen && (
        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
          At Risk
        </div>
      )}
    </Card>
  );
}
```

---

### 2. StreakCalendar

**Purpose:** Calendar view showing active/inactive days

**File:** `src/components/streak/streak-calendar.tsx`

**Props:**
```typescript
interface StreakCalendarProps {
  streak: {
    id: string;
    streakType: string;
    streakStartDate: string;
    currentCount: number;
  };
  events: Array<{
    eventDate: string;
    qualified: boolean;
    frozen?: boolean;
  }>;
  month: Date;
  onMonthChange?: (month: Date) => void;
  onDayClick?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}
```

**Visual Spec:**
```
┌─────────────────────────────────────┐
│  April 2024     [←] [Today] [→]     │
│                                     │
│  S  M  T  W  T  F  S               │
│                                     │
│     1  2  3  4  5  6               │
│  🔥 🔥 🔥 🔥 🔥 🔥 🔥             │
│                                     │
│  7  8  9 10 11 12 13               │
│  🔥 🔥 🔥 🔥 🔥 🔥 ❄️             │
│                                     │
│  14 15 16 17 18 19 20              │
│  🔥 🔥 🔥 🔥 🔥 🔥 🔥             │
└─────────────────────────────────────┘

Legend:
🔥 Active day
❄️ Frozen day
⚪ Missed day
🔵 Future/Today
```

**Full Implementation:**
```tsx
'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, isAfter } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Flame, Snowflake, X } from 'lucide-react';
import { cn } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';

interface StreakCalendarProps {
  streak: {
    id: string;
    streakType: string;
    streakStartDate: string;
    currentCount: number;
  };
  events: Array<{
    eventDate: string;
    qualified: boolean;
    frozen?: boolean;
  }>;
  month: Date;
  onMonthChange?: (month: Date) => void;
  onDayClick?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function StreakCalendar({
  streak,
  events,
  month,
  onMonthChange,
  onDayClick,
  minDate,
  maxDate
}: StreakCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(month);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Build event lookup
  const eventLookup = useMemo(() => {
    const lookup = new Map<string, { qualified: boolean; frozen?: boolean }>();
    events.forEach(e => {
      lookup.set(format(new Date(e.eventDate), 'yyyy-MM-dd'), {
        qualified: e.qualified,
        frozen: e.frozen
      });
    });
    return lookup;
  }, [events]);

  // Get day status
  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const today = new Date();
    const isPast = isBefore(date, today) || isSameDay(date, today);
    const isFuture = isAfter(date, today);

    if (isFuture) return 'future';
    if (!isPast) return 'future';

    const event = eventLookup.get(dateStr);
    if (event?.frozen) return 'frozen';
    if (event?.qualified) return 'active';
    return 'missed';
  };

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    if (!minDate || newMonth >= minDate) {
      setCurrentMonth(newMonth);
      onMonthChange?.(newMonth);
    }
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    if (!maxDate || newMonth <= maxDate) {
      setCurrentMonth(newMonth);
      onMonthChange?.(newMonth);
    }
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
    onMonthChange?.(new Date());
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="ghost" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="text-muted-foreground font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const status = getDayStatus(day);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={format(day, 'yyyy-MM-dd')}
              onClick={() => onDayClick?.(day)}
              disabled={status === 'future'}
              className={cn(
                'aspect-square rounded flex flex-col items-center justify-center relative',
                'hover:bg-gray-50 transition-colors',
                'disabled:opacity-40 disabled:hover:bg-transparent',
                isToday && 'ring-2 ring-primary ring-inset'
              )}
            >
              <span className="text-sm">{format(day, 'd')}</span>

              {/* Status indicator */}
              {status === 'active' && (
                <Flame className="w-4 h-4 text-orange-500" />
              )}
              {status === 'frozen' && (
                <Snowflake className="w-4 h-4 text-blue-500" />
              )}
              {status === 'missed' && (
                <X className="w-4 h-4 text-gray-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <Flame className="w-3 h-3 text-orange-500" />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-1">
          <Snowflake className="w-3 h-3 text-blue-500" />
          <span>Frozen</span>
        </div>
        <div className="flex items-center gap-1">
          <X className="w-3 h-3 text-gray-300" />
          <span>Missed</span>
        </div>
      </div>
    </div>
  );
}
```

---

### 3. FreezeButton

**Purpose:** Button to activate streak freeze

**File:** `src/components/streak/freeze-button.tsx`

**Props:**
```typescript
interface FreezeButtonProps {
  streakId: string;
  streakType: string;
  available: boolean;
  remainingCount: number;
  resetDate?: string;
  onActivate: (reason?: string) => Promise<void>;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}
```

**States:**
- **Available:** Button enabled, shows remaining count
- **Active:** Button disabled, shows reset date
- **None Available:** Button disabled, grayed out

**Full Implementation:**
```tsx
'use client';

import { useState } from 'react';
import { Snowflake, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/format';
import { toast } from 'sonner';

interface FreezeButtonProps {
  streakId: string;
  streakType: string;
  available: boolean;
  remainingCount: number;
  resetDate?: string;
  onActivate: (reason?: string) => Promise<void>;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function FreezeButton({
  streakId,
  streakType,
  available,
  remainingCount,
  resetDate,
  onActivate,
  disabled = false,
  variant = 'secondary',
  size = 'md'
}: FreezeButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      await onActivate(reason || undefined);
      setOpen(false);
      setReason('');
      toast.success('Streak freeze activated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate freeze');
    } finally {
      setIsActivating(false);
    }
  };

  if (!available && remainingCount === 0) {
    // No freezes available - show reset info
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Info className="w-4 h-4" />
        <span>
          No freezes available
          {resetDate && ` until ${new Date(resetDate).toLocaleDateString()}`}
        </span>
      </div>
    );
  }

  if (!available) {
    // Freeze already active
    return (
      <Button disabled size={size} variant="outline">
        <Snowflake className="w-4 h-4 mr-2" />
        Frozen
        {resetDate && ` - Reset in ${Math.ceil((new Date(resetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant={variant} disabled={disabled}>
          <Snowflake className="w-4 h-4 mr-2" />
          Activate Freeze
          {remainingCount > 1 && ` (${remainingCount} remaining)`}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activate Streak Freeze</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will preserve your current streak for one day, even if you don't complete any activity.
            You have <strong>{remainingCount}</strong> freeze{remainingCount > 1 ? 's' : ''} remaining.
          </p>

          <div>
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              placeholder="e.g., Rest day, Travel, Sick day"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleActivate} disabled={isActivating}>
              {isActivating ? 'Activating...' : 'Activate Freeze'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 4. AtRiskBanner

**Purpose:** Warning banner when streak is at risk of breaking

**File:** `src/components/streak/at-risk-banner.tsx`

**Props:**
```typescript
interface AtRiskBannerProps {
  streaks: Array<{
    id: string;
    streakType: string;
    currentCount: number;
    hoursUntilBreak: number;
    freezeAvailable: boolean;
  }>;
  onActivateFreeze?: (streakId: string) => void;
  onDismiss?: () => void;
}
```

**Visual Spec:**
```
┌─────────────────────────────────────────────┐
│  ⚠️ Your streak is at risk!                 │
│                                             │
│  Your 14-day workout streak will break      │
│  in 6 hours. Complete a workout or          │
│  activate a freeze to keep it alive.        │
│                                             │
│  [Complete Workout]  [Activate Freeze]     │
└─────────────────────────────────────────────┘
```

**States:**
- **Warning (6+ hours):** Yellow background
- **Critical (2-6 hours):** Orange background
- **Urgent (< 2 hours):** Red background with pulsing

**Full Implementation:**
```tsx
'use client';

import { AlertCircle, Flame, Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/format';

interface AtRiskBannerProps {
  streaks: Array<{
    id: string;
    streakType: string;
    currentCount: number;
    hoursUntilBreak: number;
    freezeAvailable: boolean;
  }>;
  onActivateFreeze?: (streakId: string) => void;
  onDismiss?: () => void;
}

export function AtRiskBanner({ streaks, onActivateFreeze, onDismiss }: AtRiskBannerProps) {
  // Sort by most urgent
  const sorted = [...streaks].sort((a, b) => a.hoursUntilBreak - b.hoursUntilBreak);
  const mostUrgent = sorted[0];

  if (!mostUrgent) return null;

  const getSeverity = (hours: number) => {
    if (hours < 2) return 'urgent';
    if (hours < 6) return 'critical';
    return 'warning';
  };

  const severity = getSeverity(mostUrgent.hoursUntilBreak);

  const severityConfig = {
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      text: 'text-yellow-800 dark:text-yellow-200'
    },
    critical: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      icon: 'text-orange-600 dark:text-orange-400',
      text: 'text-orange-800 dark:text-orange-200'
    },
    urgent: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400 animate-pulse',
      text: 'text-red-800 dark:text-red-200'
    }
  };

  const config = severityConfig[severity];

  const formatTime = (hours: number) => {
    if (hours < 1) {
      const mins = Math.round(hours * 60);
      return `${mins} minute${mins !== 1 ? 's' : ''}`;
    }
    return `${Math.round(hours)} hour${hours !== 1 ? 's' : ''}`;
  };

  const streakTypeLabels = {
    workout: 'workout',
    nutrition: 'nutrition logging',
    habit: 'habit completion',
    community: 'community activity'
  };

  return (
    <div className={cn(
      'rounded-lg border-2 p-4',
      config.bg,
      config.border
    )}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn('shrink-0', config.icon)}>
          <AlertCircle className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className={cn('font-semibold', config.text)}>
            {severity === 'urgent' ? 'Urgent!' : 'Your streak is at risk!'}
          </h3>

          <p className={cn('mt-1', config.text)}>
            Your {mostUrgent.currentCount}-day {streakTypeLabels[mostUrgent.streakType]} streak
            will break in <strong>{formatTime(mostUrgent.hoursUntilBreak)}</strong>.
            {severity === 'urgent' && ' Act now to save your streak!'}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {mostUrgent.freezeAvailable && onActivateFreeze && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onActivateFreeze(mostUrgent.id)}
              >
                <Snowflake className="w-4 h-4 mr-2" />
                Use Freeze
              </Button>
            )}
            <Button size="sm" onClick={onDismiss}>
              Dismiss
            </Button>
          </div>
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
```

---

### 5. BadgeCard

**Purpose:** Display a single badge with rarity visual treatment

**File:** `src/components/badge/badge-card.tsx`

**Props:**
```typescript
interface BadgeCardProps {
  badge: {
    id: string;
    badgeCode: string;
    name: string;
    description: string;
    iconUrl: string | null;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    points: number;
    earnedAt?: string;
    progressPercentage?: number;
    currentValue?: number;
    targetValue?: number;
  };
  state?: 'locked' | 'progress' | 'earned';
  onClick?: () => void;
  showProgress?: boolean;
}
```

**Rarity Visual Treatments:**
```
Common:   Gray border, no special effects
Rare:     Blue gradient border, subtle shine
Epic:     Purple gradient border, glow effect
Legendary: Gold gradient border, animated particles
```

**Full Implementation:**
```tsx
'use client';

import { Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils/format';

interface BadgeCardProps {
  badge: {
    id: string;
    badgeCode: string;
    name: string;
    description: string;
    iconUrl: string | null;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    points: number;
    earnedAt?: string;
    progressPercentage?: number;
    currentValue?: number;
    targetValue?: number;
  };
  state?: 'locked' | 'progress' | 'earned';
  onClick?: () => void;
  showProgress?: boolean;
}

const rarityStyles = {
  common: {
    border: 'border-gray-300',
    bgGradient: 'from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900',
    iconClass: 'text-gray-500',
    badgeBg: 'bg-gray-500',
    shine: false
  },
  rare: {
    border: 'border-blue-400',
    bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    iconClass: 'text-blue-500',
    badgeBg: 'bg-blue-500',
    shine: true
  },
  epic: {
    border: 'border-purple-400',
    bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    iconClass: 'text-purple-500',
    badgeBg: 'bg-purple-500',
    shine: true,
    glow: true
  },
  legendary: {
    border: 'border-yellow-400',
    bgGradient: 'from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/20',
    iconClass: 'text-yellow-500',
    badgeBg: 'bg-yellow-500',
    shine: true,
    glow: true,
    particles: true
  }
};

export function BadgeCard({
  badge,
  state = 'earned',
  onClick,
  showProgress = true
}: BadgeCardProps) {
  const isLocked = state === 'locked';
  const hasProgress = state === 'progress' && badge.progressPercentage !== undefined;
  const styles = rarityStyles[badge.rarity];

  return (
    <Card
      onClick={onClick}
      className={cn(
        'relative overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-lg',
        'p-4 flex flex-col items-center text-center min-h-[200px]',
        styles.border,
        isLocked && 'opacity-50 grayscale',
        styles.glow && 'shadow-lg',
        styles.glow && !isLocked && 'shadow-orange-500/20'
      )}
    >
      {/* Gradient background */}
      {!isLocked && (
        <div className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-30',
          styles.bgGradient
        )} />
      )}

      {/* Shine effect for rare+ */}
      {styles.shine && !isLocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
      )}

      {/* Particles for legendary */}
      {styles.particles && !isLocked && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-confetti"
              style={{
                left: `${20 + i * 30}%`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Rarity badge */}
      {!isLocked && (
        <div className={cn(
          'absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full text-white',
          styles.badgeBg
        )}>
          {badge.rarity}
        </div>
      )}

      {/* Icon */}
      <div className="relative z-10 mb-3">
        {badge.iconUrl ? (
          <img
            src={badge.iconUrl}
            alt={badge.name}
            className={cn('w-16 h-16', isLocked && 'grayscale')}
          />
        ) : (
          <Award className={cn('w-16 h-16', styles.iconClass, isLocked && 'text-gray-400')} />
        )}
      </div>

      {/* Name */}
      <div className="relative z-10 font-semibold text-sm">
        {badge.name}
      </div>

      {/* Description */}
      <div className="relative z-10 text-xs text-muted-foreground mt-1 line-clamp-2">
        {badge.description}
      </div>

      {/* Points */}
      {!isLocked && (
        <div className="relative z-10 text-xs text-muted-foreground mt-1">
          {badge.points} points
        </div>
      )}

      {/* Progress bar */}
      {hasProgress && showProgress && (
        <div className="relative z-10 w-full mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{badge.progressPercentage}%</span>
            <span>{badge.currentValue}/{badge.targetValue}</span>
          </div>
          <Progress value={badge.progressPercentage} className="h-2" />
        </div>
      )}

      {/* Earned date */}
      {state === 'earned' && badge.earnedAt && (
        <div className="relative z-10 text-xs text-muted-foreground mt-2">
          Earned {new Date(badge.earnedAt).toLocaleDateString()}
        </div>
      )}

      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <div className="text-2xl">🔒</div>
            <div className="text-xs mt-1">Locked</div>
          </div>
        </div>
      )}
    </Card>
  );
}
```

---

### 6. BadgeGrid

**Purpose:** Grid layout for badge collection

**File:** `src/components/badge/badge-grid.tsx`

**Props:**
```typescript
interface BadgeGridProps {
  badges: Array<{
    id: string;
    badgeCode: string;
    name: string;
    description: string;
    iconUrl: string | null;
    rarity: string;
    points: number;
    earnedAt?: string;
    progressPercentage?: number;
  }>;
  state?: 'all' | 'earned' | 'locked' | 'progress';
  sortBy?: 'recent' | 'rarity' | 'category' | 'points';
  filterByCategory?: string;
  filterByRarity?: string;
  columns?: 2 | 3 | 4 | 5;
  max?: number;
  onBadgeClick?: (badge: any) => void;
}
```

**Full Implementation:**
```tsx
'use client';

import { useMemo } from 'react';
import { BadgeCard } from './badge-card';
import type { Badge } from '@/types';

interface BadgeGridProps {
  badges: Badge[];
  state?: 'all' | 'earned' | 'locked' | 'progress';
  sortBy?: 'recent' | 'rarity' | 'category' | 'points';
  filterByCategory?: string;
  filterByRarity?: string;
  columns?: 2 | 3 | 4 | 5;
  max?: number;
  onBadgeClick?: (badge: Badge) => void;
}

const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };

export function BadgeGrid({
  badges,
  state = 'all',
  sortBy = 'rarity',
  filterByCategory,
  filterByRarity,
  columns = 4,
  max,
  onBadgeClick
}: BadgeGridProps) {
  // Filter badges
  const filteredBadges = useMemo(() => {
    let filtered = [...badges];

    // Filter by state
    if (state === 'earned') {
      filtered = filtered.filter(b => b.earnedAt);
    } else if (state === 'locked') {
      filtered = filtered.filter(b => !b.earnedAt && !b.progressPercentage);
    } else if (state === 'progress') {
      filtered = filtered.filter(b => b.progressPercentage && b.progressPercentage < 100);
    }

    // Filter by category
    if (filterByCategory) {
      filtered = filtered.filter(b => b.badgeCategory === filterByCategory);
    }

    // Filter by rarity
    if (filterByRarity) {
      filtered = filtered.filter(b => b.rarity === filterByRarity);
    }

    return filtered;
  }, [badges, state, filterByCategory, filterByRarity]);

  // Sort badges
  const sortedBadges = useMemo(() => {
    const sorted = [...filteredBadges];

    switch (sortBy) {
      case 'recent':
        sorted.sort((a, b) => {
          if (!a.earnedAt) return 1;
          if (!b.earnedAt) return -1;
          return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
        });
        break;

      case 'rarity':
        sorted.sort((a, b) => {
          // First sort by rarity
          const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
          if (rarityDiff !== 0) return rarityDiff;
          // Then by points
          return b.points - a.points;
        });
        break;

      case 'category':
        sorted.sort((a, b) => a.badgeCategory.localeCompare(b.badgeCategory));
        break;

      case 'points':
        sorted.sort((a, b) => b.points - a.points);
        break;
    }

    return sorted;
  }, [filteredBadges, sortBy]);

  // Apply max limit
  const displayBadges = max ? sortedBadges.slice(0, max) : sortedBadges;

  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 2 && 'grid-cols-2',
        columns === 3 && 'grid-cols-3',
        columns === 4 && 'grid-cols-4',
        columns === 5 && 'grid-cols-5 md:grid-cols-5'
      )}
    >
      {displayBadges.map(badge => {
        let cardState: 'locked' | 'progress' | 'earned' = 'locked';
        if (badge.earnedAt) cardState = 'earned';
        else if (badge.progressPercentage && badge.progressPercentage > 0) cardState = 'progress';

        return (
          <BadgeCard
            key={badge.id}
            badge={badge}
            state={cardState}
            onClick={() => onBadgeClick?.(badge)}
          />
        );
      })}

      {displayBadges.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          No badges found
        </div>
      )}
    </div>
  );
}
```

---

### 7. LeaderboardTable

**Purpose:** Display leaderboard rankings

**File:** `src/components/leaderboard/leaderboard-table.tsx`

**Props:**
```typescript
interface LeaderboardTableProps {
  entries: Array<{
    rank: number;
    userId: number;
    displayName: string;
    avatarUrl?: string;
    score: number;
    badges?: string[];
    isCurrentUser?: boolean;
    isAnonymous?: boolean;
  }>;
  type: 'weekly_workout' | 'monthly_streak' | 'volume' | 'challenge';
  periodStart: string;
  periodEnd: string;
  currentUserRank?: number;
  onUserClick?: (userId: number) => void;
}
```

**Full Implementation:**
```tsx
'use client';

import { Trophy, Medal, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/format';

interface LeaderboardEntry {
  rank: number;
  userId: number;
  displayName: string;
  avatarUrl?: string;
  score: number;
  badges?: string[];
  isCurrentUser?: boolean;
  isAnonymous?: boolean;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  type: 'weekly_workout' | 'monthly_streak' | 'volume' | 'challenge';
  periodStart: string;
  periodEnd: string;
  currentUserRank?: number;
  onUserClick?: (userId: number) => void;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
  if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
  return null;
};

const getRankBadge = (rank: number) => {
  if (rank <= 3) {
    const colors = ['bg-yellow-500', 'bg-gray-400', 'bg-amber-700'];
    return (
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
        colors[rank - 1]
      )}>
        {rank}
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-semibold">
      {rank}
    </div>
  );
};

export function LeaderboardTable({
  entries,
  type,
  periodStart,
  periodEnd,
  currentUserRank,
  onUserClick
}: LeaderboardTableProps) {
  const scoreLabels = {
    weekly_workout: 'Workouts',
    monthly_streak: 'Day Streak',
    volume: ' lbs Lifted',
    challenge: 'Points'
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Leaderboard</h3>
          <div className="text-sm text-muted-foreground">
            {new Date(periodStart).toLocaleDateString()} - {new Date(periodEnd).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Rank</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Athlete</th>
            <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground">
              {scoreLabels[type]}
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.userId}
              onClick={() => onUserClick?.(entry.userId)}
              className={cn(
                'border-t hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors',
                entry.isCurrentUser && 'bg-primary/5'
              )}
            >
              {/* Rank */}
              <td className="px-4 py-3">
                {getRankIcon(entry.rank) || getRankBadge(entry.rank)}
              </td>

              {/* User */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    {entry.avatarUrl ? (
                      <AvatarImage src={entry.avatarUrl} />
                    ) : (
                      <AvatarFallback>
                        {entry.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {entry.displayName}
                      {entry.isCurrentUser && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    {/* Mini badges */}
                    {entry.badges && entry.badges.length > 0 && (
                      <div className="flex gap-1 mt-0.5">
                        {entry.badges.slice(0, 3).map(badge => (
                          <span key={badge} className="text-xs">🏆</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </td>

              {/* Score */}
              <td className="px-4 py-3 text-right font-semibold">
                {entry.score.toLocaleString()}
              </td>
            </tr>
          ))}

          {/* Current user row (if not in top entries) */}
          {currentUserRank && currentUserRank > entries.length && (
            <tr className="border-t-2 border-primary bg-primary/5">
              <td className="px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {currentUserRank}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">You</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-semibold">
                -
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No entries yet this period</p>
          <p className="text-sm mt-1">Be the first to make the leaderboard!</p>
        </div>
      )}
    </div>
  );
}
```

---

### 8. CelebrationModal

**Purpose:** Modal shown when milestone is achieved

**File:** `src/components/common/celebration-modal.tsx`

**Props:**
```typescript
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
```

**Full Implementation:**
```tsx
'use client';

import { useEffect, useState } from 'react';
import { X, Share2, Flame } from 'lucide-react';
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
      // Play sound (optional)
      const audio = new Audio('/sounds/celebration.mp3');
      audio.play().catch(() => {}); // Ignore autoplay errors
    }
  }, [open]);

  const streakTypeLabels = {
    workout: 'Workout',
    nutrition: 'Nutrition',
    habit: 'Habit',
    community: 'Community'
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center p-0 overflow-hidden">
        {confettiActive && <Confetti />}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full z-10"
        >
          <X className="w-5 h-5" />
        </button>

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
            Congratulations! You've completed{' '}
            <strong>{milestone} consecutive {streakTypeLabels[streakType].toLowerCase()}s</strong>!
            {' '}Your dedication is inspiring.
          </p>

          {/* Badge */}
          {badge && (
            <div className="mb-6">
              <div className="inline-flex flex-col items-center p-4 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
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
              You're in the top {Math.max(1, 100 - milestone)}% of users!
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
```

---

### 9. Confetti Component

**Purpose:** Confetti animation for celebrations

**File:** `src/components/common/confetti.tsx`

```tsx
'use client';

import { useEffect, useRef } from 'react';

interface ConfettiProps {
  count?: number;
  duration?: number;
}

export function Confetti({ count = 50, duration = 3000 }: ConfettiProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const colors = ['#FF6B35', '#F39C12', '#3498DB', '#2ECC71', '#9B59B6', '#E74C3C'];

    const particles = Array.from({ length: count }, (_, i) => {
      const particle = document.createElement('div');
      particle.className = 'absolute w-2 h-2 rounded-full';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = '50%';
      particle.style.top = '0';
      particle.style.transform = `rotate(${Math.random() * 360}deg)`;

      // Random destination
      const angle = (Math.random() * Math.PI * 2) / 2; // Semi-circle
      const velocity = 5 + Math.random() * 10;
      const tx = Math.cos(angle) * velocity * 50;
      const ty = Math.sin(angle) * velocity * 50 + Math.random() * 100;

      particle.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      container.appendChild(particle);

      // Animate
      requestAnimationFrame(() => {
        particle.style.transform = `translate(${tx}px, ${ty}px) rotate(${Math.random() * 720}deg)`;
        particle.style.opacity = '0';
      });

      // Cleanup
      setTimeout(() => {
        particle.remove();
      }, duration);

      return particle;
    });

    return () => {
      container.innerHTML = '';
    };
  }, [count, duration]);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden" />;
}
```

---

## Component Usage Examples

### Dashboard Page with All Components

```tsx
'use client';

import { useStreaks } from '@/lib/hooks/use-streaks';
import { useBadges } from '@/lib/hooks/use-badges';
import { StreakCounter } from '@/components/streak/streak-counter';
import { AtRiskBanner } from '@/components/streak/at-risk-banner';
import { BadgeGrid } from '@/components/badge/badge-grid';
import { CelebrationModal } from '@/components/common/celebration-modal';
import { useState } from 'react';

export default function DashboardPage() {
  const { streaks } = useStreaks();
  const { badges } = useBadges();
  const [celebrationOpen, setCelebrationOpen] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Dashboard</h1>

      {/* At Risk Banner */}
      {streaks?.some(s => s.isAtRisk) && (
        <AtRiskBanner
          streaks={streaks.filter(s => s.isAtRisk)}
          onActivateFreeze={(streakId) => {/* handle freeze */}}
        />
      )}

      {/* Streaks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {streaks?.map(streak => (
          <StreakCounter
            key={streak.id}
            streak={streak}
            size="md"
            showMilestone={true}
          />
        ))}
      </div>

      {/* Recent Badges */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Badges</h2>
        <BadgeGrid
          badges={badges?.slice(0, 8) || []}
          columns={4}
          onBadgeClick={(badge) => {/* show detail */}}
        />
      </section>

      {/* Celebration Modal */}
      <CelebrationModal
        open={celebrationOpen}
        onClose={() => setCelebrationOpen(false)}
        milestone={30}
        streakType="workout"
        badge={{
          name: '30-Day Machine',
          iconUrl: '/badges/30day.png',
          rarity: 'rare'
        }}
      />
    </div>
  );
}
```
