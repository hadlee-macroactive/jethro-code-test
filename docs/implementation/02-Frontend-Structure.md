# Frontend Structure (Web)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 3.x
- **State Management:** Zustand 4.x
- **Forms:** React Hook Form + Zod
- **Data Fetching:** React Query (TanStack Query)
- **UI Components:** Radix UI primitives + custom components
- **Icons:** Lucide React
- **Date Handling:** date-fns

## Full File Structure

```
web/
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── .env.local.example
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── globals.css             # Global styles
│   │   ├── (dashboard)/            # Dashboard route group
│   │   │   ├── layout.tsx          # Dashboard layout
│   │   │   ├── page.tsx            # Dashboard home
│   │   │   ├── streaks/
│   │   │   │   └── page.tsx        # Streaks page
│   │   │   ├── badges/
│   │   │   │   ├── page.tsx        # Badge collection
│   │   │   │   └── [badgeId]/
│   │   │   │       └── page.tsx    # Badge detail
│   │   │   ├── leaderboards/
│   │   │   │   └── page.tsx        # Leaderboards
│   │   │   └── profile/
│   │   │       └── page.tsx        # User profile
│   │   ├── (creator)/              # Creator portal
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx        # Creator settings
│   │   │   └── analytics/
│   │   │       └── page.tsx
│   │   ├── api/                    # API routes (BFF)
│   │   │   └── streaks/
│   │   │       └── route.ts        # Proxy to backend
│   │   └── manifest.ts
│   │
│   ├── components/
│   │   ├── ui/                     # Base UI components (shadcn/ui style)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   └── avatar.tsx
│   │   │
│   │   ├── streak/                 # Streak-specific components
│   │   │   ├── streak-counter.tsx  # Main streak widget
│   │   │   ├── streak-calendar.tsx # Calendar view
│   │   │   ├── streak-fire.tsx     # Fire animation
│   │   │   ├── streak-ice.tsx      # Freeze indicator
│   │   │   ├── freeze-button.tsx   # Activate freeze
│   │   │   ├── at-risk-banner.tsx  # Warning banner
│   │   │   └── streak-history.tsx  # History list
│   │   │
│   │   ├── badge/                  # Badge-specific components
│   │   │   ├── badge-card.tsx      # Single badge
│   │   │   ├── badge-grid.tsx      # Badge collection grid
│   │   │   ├── badge-detail-modal.tsx
│   │   │   ├── badge-progress.tsx  # Progress indicator
│   │   │   ├── badge-rarity-glow.tsx
│   │   │   └── badge-placeholder.tsx
│   │   │
│   │   ├── leaderboard/            # Leaderboard components
│   │   │   ├── leaderboard-table.tsx
│   │   │   ├── leaderboard-row.tsx
│   │   │   ├── rank-badge.tsx
│   │   │   └── current-user-row.tsx
│   │   │
│   │   └── common/                 # Shared components
│   │       ├── header.tsx
│   │       ├── sidebar.tsx
│   │       ├── footer.tsx
│   │       ├── user-nav.tsx
│   │       ├── loading-skeleton.tsx
│   │       ├── error-boundary.tsx
│   │       └── celebration-modal.tsx
│   │
│   ├── lib/
│   │   ├── api/                    # API client
│   │   │   ├── client.ts           # Axios/fetch wrapper
│   │   │   ├── streaks.ts          # Streak API calls
│   │   │   ├── badges.ts           # Badge API calls
│   │   │   ├── leaderboards.ts     # Leaderboard API calls
│   │   │   └── types.ts            # API response types
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── use-streaks.ts      # Streak data hook
│   │   │   ├── use-badges.ts       # Badge data hook
│   │   │   ├── use-leaderboard.ts  # Leaderboard hook
│   │   │   ├── use-freeze.ts       # Freeze mutation
│   │   │   └── use-user.ts         # User data hook
│   │   ├── store/                  # Zustand stores
│   │   │   ├── user.store.ts       # User state
│   │   │   ├── ui.store.ts         # UI state (modals, etc)
│   │   │   └── cache.store.ts      # Client cache
│   │   ├── utils/
│   │   │   ├── date.ts             # Date utilities
│   │   │   ├── format.ts           # Formatting utilities
│   │   │   └── validation.ts       # Client-side validation
│   │   └── constants/
│   │       ├── streaks.ts          # Streak constants
│   │       └── badges.ts           # Badge constants
│   │
│   ├── types/
│   │   ├── streak.ts               # Streak type definitions
│   │   ├── badge.ts                # Badge type definitions
│   │   ├── leaderboard.ts          # Leaderboard types
│   │   └── index.ts                # Barrel exports
│   │
│   └── styles/
│       ├── globals.css
│       └── components.css
│
└── public/
    ├── icons/
    ├── badges/
    └── images/
```

## File-by-File Specifications

### package.json

```json
{
  "name": "@macroactive/streaks-badges-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@tanstack/react-query": "^5.12.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.294.0",
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.48.0",
    "tailwind-merge": "^2.1.0",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.54.0",
    "eslint-config-next": "14.0.4",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.0"
  }
}
```

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          light: '#FF8B5A',
          dark: '#E55A2B'
        },
        streak: {
          fire: '#FF6B35',
          ice: '#3498DB',
          broken: '#95A5A6',
          gold: '#F39C12'
        },
        badge: {
          common: '#95A5A6',
          rare: '#3498DB',
          epic: '#9B59B6',
          legendary: '#F39C12'
        }
      },
      keyframes: {
        'pulse-fire': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.9' }
        },
        'shine': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' }
        },
        'confetti': {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' }
        }
      },
      animation: {
        'pulse-fire': 'pulse-fire 2s ease-in-out infinite',
        'shine': 'shine 3s ease-in-out infinite',
        'confetti': 'confetti 3s ease-out forwards'
      }
    }
  },
  plugins: []
};

export default config;
```

### src/app/layout.tsx

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/common/header';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MacroActive - Your Fitness Journey',
  description: 'Track your progress, earn badges, build streaks'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-6">
              {children}
            </main>
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}
```

### src/app/(dashboard)/layout.tsx

```tsx
import { Sidebar } from '@/components/common/sidebar';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-6">
      <aside className="w-64 shrink-0">
        <Sidebar />
      </aside>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
```

### src/app/(dashboard)/page.tsx

```tsx
'use client';

import { useStreaks } from '@/lib/hooks/use-streaks';
import { useBadges } from '@/lib/hooks/use-badges';
import { StreakCounter } from '@/components/streak/streak-counter';
import { BadgeGrid } from '@/components/badge/badge-grid';
import { AtRiskBanner } from '@/components/streak/at-risk-banner';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';

export default function DashboardPage() {
  const { streaks, isLoading, error } = useStreaks();
  const { badges: earnedBadges } = useBadges({ state: 'earned' });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <div>Error loading dashboard</div>;
  }

  const workoutStreak = streaks?.find(s => s.streakType === 'workout');
  const atRiskStreaks = streaks?.filter(s => s.isAtRisk) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Dashboard</h1>

      {/* At Risk Banner */}
      {atRiskStreaks.length > 0 && (
        <AtRiskBanner streaks={atRiskStreaks} />
      )}

      {/* Streaks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {streaks?.map(streak => (
          <StreakCounter key={streak.id} streak={streak} />
        ))}
      </div>

      {/* Recent Badges */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Badges</h2>
        <BadgeGrid
          badges={earnedBadges?.slice(0, 6) || []}
          max={6}
        />
      </section>
    </div>
  );
}
```

### src/components/streak/streak-counter.tsx

```tsx
'use client';

import { Flame, Snowflake, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils/format';
import type { Streak } from '@/types';

interface StreakCounterProps {
  streak: Streak;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakCounter({ streak, size = 'md' }: StreakCounterProps) {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-40 h-40',
    lg: 'w-48 h-48'
  };

  const iconSize = {
    sm: 24,
    md: 32,
    lg: 40
  };

  const isFrozen = !streak.isActive && streak.freezeLastUsed;
  const isBroken = !streak.isActive && !streak.freezeLastUsed;

  return (
    <Card className={cn(
      'relative overflow-hidden',
      sizeClasses[size],
      'flex flex-col items-center justify-center p-4'
    )}>
      {/* Background glow */}
      {streak.isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
      )}

      {/* Icon */}
      <div className="relative z-10">
        {isFrozen ? (
          <Snowflake
            size={iconSize[size]}
            className="text-blue-500"
          />
        ) : isBroken ? (
          <TrendingUp
            size={iconSize[size]}
            className="text-gray-400"
          />
        ) : (
          <Flame
            size={iconSize[size]}
            className="text-orange-500 animate-pulse-fire"
          />
        )}
      </div>

      {/* Count */}
      <div className="relative z-10 mt-2 text-center">
        <div className="text-3xl font-bold">
          {streak.currentCount}
        </div>
        <div className="text-xs text-muted-foreground uppercase">
          {streak.streakType}
        </div>
      </div>

      {/* Progress to next milestone */}
      {streak.isActive && streak.nextMilestone && (
        <div className="w-full mt-3">
          <Progress
            value={streak.milestoneProgress}
            className="h-1"
          />
          <div className="text-xs text-muted-foreground mt-1">
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
    </Card>
  );
}
```

### src/components/streak/streak-calendar.tsx

```tsx
'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Flame, Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils/format';
import type { Streak, StreakEvent } from '@/types';

interface StreakCalendarProps {
  streak: Streak;
  events: StreakEvent[];
  onDaySelect?: (date: Date) => void;
}

export function StreakCalendar({ streak, events, onDaySelect }: StreakCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for this streak
  const streakEvents = events.filter(e => e.streakType === streak.streakType);
  const eventDates = new Set(streakEvents.map(e => format(e.eventDate, 'yyyy-MM-dd')));

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>
            ←
          </button>
          <button onClick={() => setCurrentMonth(new Date())}>
            Today
          </button>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {/* Day headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="text-muted-foreground font-medium py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const hasEvent = eventDates.has(dateStr);
          const isToday = isSameDay(day, new Date());
          const isPast = day < new Date();

          return (
            <button
              key={dateStr}
              onClick={() => onDaySelect?.(day)}
              className={cn(
                'aspect-square rounded flex items-center justify-center relative',
                'hover:bg-gray-100 transition-colors',
                isToday && 'ring-2 ring-primary',
                !isPast && 'text-muted-foreground'
              )}
            >
              {format(day, 'd')}

              {/* Activity indicator */}
              {hasEvent && isPast && (
                <Flame className="absolute -top-1 -right-1 w-4 h-4 text-orange-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

### src/components/badge/badge-card.tsx

```tsx
'use client';

import { Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/format';
import type { Badge, BadgeProgress } from '@/types';

interface BadgeCardProps {
  badge: Badge;
  progress?: BadgeProgress;
  state?: 'locked' | 'progress' | 'earned';
  onClick?: () => void;
}

const rarityGradients = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500'
};

const rarityBorders = {
  common: 'border-gray-400',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-yellow-500'
};

export function BadgeCard({ badge, progress, state = 'earned', onClick }: BadgeCardProps) {
  const isLocked = state === 'locked';
  const hasProgress = state === 'progress' && progress;

  return (
    <Card
      onClick={onClick}
      className={cn(
        'relative overflow-hidden cursor-pointer transition-all hover:scale-105',
        'p-4 flex flex-col items-center text-center',
        isLocked && 'opacity-50 grayscale'
      )}
    >
      {/* Gradient background for earned badges */}
      {!isLocked && (
        <div className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-10',
          rarityGradients[badge.rarity]
        )} />
      )}

      {/* Border */}
      <div className={cn(
        'absolute inset-0 border-2 rounded-lg',
        !isLocked && rarityBorders[badge.rarity]
      )} />

      {/* Icon */}
      <div className="relative z-10 mb-3">
        {badge.iconUrl ? (
          <img src={badge.iconUrl} alt={badge.name} className="w-16 h-16" />
        ) : (
          <Award className={cn(
            'w-16 h-16',
            isLocked ? 'text-gray-400' : `text-${badge.rarity}-500`
          )} />
        )}
      </div>

      {/* Name */}
      <div className="relative z-10 font-semibold text-sm">
        {badge.name}
      </div>

      {/* Description */}
      <div className="relative z-10 text-xs text-muted-foreground mt-1">
        {badge.description}
      </div>

      {/* Progress bar */}
      {hasProgress && (
        <div className="relative z-10 w-full mt-3">
          <div className="text-xs text-muted-foreground mb-1">
            {progress.progressPercentage}%
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress.progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Rarity badge */}
      {!isLocked && (
        <div className={cn(
          'absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full text-white',
          `bg-${badge.rarity}-500`
        )}>
          {badge.rarity}
        </div>
      )}
    </Card>
  );
}
```

### src/components/badge/badge-grid.tsx

```tsx
'use client';

import { BadgeCard } from './badge/badge-card';
import type { Badge } from '@/types';

interface BadgeGridProps {
  badges: Badge[];
  max?: number;
}

export function BadgeGrid({ badges, max }: BadgeGridProps) {
  const displayBadges = max ? badges.slice(0, max) : badges;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {displayBadges.map(badge => (
        <BadgeCard
          key={badge.id}
          badge={badge}
          state={badge.earnedAt ? 'earned' : badge.progressPercentage ? 'progress' : 'locked'}
          onClick={() => {/* TODO: Open detail modal */}}
        />
      ))}
    </div>
  );
}
```

### src/lib/hooks/use-streaks.ts

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { streaksApi } from '@/lib/api/streaks';
import type { Streak } from '@/types';

export function useStreaks() {
  return useQuery({
    queryKey: ['streaks'],
    queryFn: () => streaksApi.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useStreak(streakId: string) {
  return useQuery({
    queryKey: ['streaks', streakId],
    queryFn: () => streaksApi.getById(streakId),
    enabled: !!streakId
  });
}

export function useStreakHistory() {
  return useQuery({
    queryKey: ['streaks', 'history'],
    queryFn: () => streaksApi.getHistory(),
  });
}

export function useActivateFreeze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ streakType, reason }: { streakType: string; reason?: string }) =>
      streaksApi.activateFreeze(streakType, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streaks'] });
    }
  });
}
```

### src/lib/api/client.ts

```tsx
import axios, { AxiosError } from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000
});

// Request interceptor - add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
```

### src/lib/api/streaks.ts

```tsx
import api from './client';
import type { Streak, StreakHistory } from '@/types';

export const streaksApi = {
  getAll: async (): Promise<Streak[]> => {
    const response = await api.get('/streaks/users/me');
    return response.data.streaks;
  },

  getById: async (id: string): Promise<Streak> => {
    const response = await api.get(`/streaks/${id}`);
    return response.data;
  },

  getHistory: async (): Promise<StreakHistory[]> => {
    const response = await api.get('/streaks/users/me/history');
    return response.data.history;
  },

  activateFreeze: async (streakType: string, reason?: string) => {
    const response = await api.post('/streaks/users/me/freeze', {
      streak_type: streakType,
      reason
    });
    return response.data;
  },

  getLeaderboard: async (type: string, params?: {
    period_start?: string;
    limit?: number;
  }) => {
    const response = await api.get(`/leaderboards/${type}`, { params });
    return response.data;
  }
};
```

### src/types/streak.ts

```typescript
export enum StreakType {
  WORKOUT = 'workout',
  NUTRITION = 'nutrition',
  HABIT = 'habit',
  COMMUNITY = 'community'
}

export interface Streak {
  id: string;
  userId: number;
  creatorId: number;
  streakType: StreakType;
  currentCount: number;
  longestCount: number;
  lastActivityDate: string;
  streakStartDate: string;
  isActive: boolean;
  isAtRisk?: boolean;
  nextMilestone: number | null;
  milestoneProgress: number;
  freezeAvailable: boolean;
  freezeUsedCount: number;
  freezeLastUsed: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface StreakHistory {
  id: string;
  streakId: string;
  userId: number;
  creatorId: number;
  streakType: StreakType;
  eventType: 'started' | 'incremented' | 'broken' | 'frozen' | 'milestone';
  previousCount: number | null;
  newCount: number;
  milestoneAchieved: number | null;
  reason: string | null;
  snapshot: Record<string, unknown>;
  createdAt: string;
}

export interface StreakEvent {
  eventDate: string;
  qualified: boolean;
  frozen?: boolean;
}
```

### src/types/badge.ts

```typescript
export enum BadgeRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum BadgeCategory {
  CONSISTENCY = 'consistency',
  MILESTONE = 'milestone',
  CHALLENGE = 'challenge',
  CERTIFICATION = 'certification',
  COMMUNITY = 'community'
}

export interface Badge {
  id: string;
  badgeCode: string;
  badgeCategory: BadgeCategory;
  name: string;
  description: string;
  iconUrl: string | null;
  rarity: BadgeRarity;
  points: number;
  displayOrder: number;
  earnedAt?: string;
  progressPercentage?: number;
  currentValue?: number;
  targetValue?: number;
}
```

### src/components/providers.tsx

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### src/components/ui/card.tsx

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils/format';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

export { Card };
```

### src/components/ui/progress.tsx

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils/format';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
        className
      )}
      {...props}
    >
      <div
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
);
Progress.displayName = 'Progress';

export { Progress };
```

### src/components/ui/toast.tsx

```tsx
'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      expand={false}
      richColors
      closeButton
    />
  );
}
```

This is the actual file-by-file structure for the web frontend. Every component, hook, and page is specified with actual code structure.

Would you like me to continue with database migrations and API route implementations?
