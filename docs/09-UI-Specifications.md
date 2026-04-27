# UI Specifications

## 1. Overview

This document defines the UI components for the Streaks & Badges System across iOS, Android, and Web platforms.

## 2. Component Library

### 2.1 Streak Counter Widget

**Purpose:** Display current streak with visual progress indicator

**Variants:**
- Compact (40px)
- Standard (80px)
- Large (120px) - Dashboard hero

**States:**
- Active (fire animation)
- Frozen (ice animation)
- At Risk (pulsing warning)
- Broken (grey, static)

**Component Structure:**
```
┌─────────────────────┐
│     🔥 14           │  <-- Icon + Count
│   DAYS IN A ROW     │  <-- Label
│  ●●●●●●●○○○○○○○○○  │  <-- Progress to next milestone
└─────────────────────┘
```

**Props:**
```typescript
interface StreakCounterProps {
  type: 'workout' | 'nutrition' | 'habit' | 'community';
  currentCount: number;
  longestCount: number;
  nextMilestone: number;
  isActive: boolean;
  isFrozen: boolean;
  freezeAvailable: boolean;
  size?: 'compact' | 'standard' | 'large';
}
```

**Specifications:**
| Size | Container | Icon | Text |
|------|-----------|------|------|
| Compact | 40×40px | 16px | 12px bold |
| Standard | 80×80px | 28px | 14px bold |
| Large | 120×120px | 40px | 18px bold |

---

### 2.2 Badge Card

**Purpose:** Display badge with rarity visual treatment

**Variants:**
- Locked (greyed out)
- In Progress (with percentage)
- Earned (full color)

**Component Structure:**
```
┌─────────────────────┐
│      ┌─────┐        │
│      │ 🏆 │        │  <-- Icon (rarity styled)
│      └─────┘        │
│    30-Day Machine   │  <-- Name
│   30 day streak     │  <-- Description
│  ████████░░ 80%     │  <-- Progress (if in progress)
└─────────────────────┘
```

**Rarity Visual Treatment:**

| Rarity | Border | Icon | Animation |
|--------|--------|------|-----------|
| Common | Grey solid | Flat | None |
| Rare | Blue gradient | Gradient fill | Subtle shine |
| Epic | Purple gradient | Gradient + glow | Pulse |
| Legendary | Gold animated | Full animation | Particles |

**Props:**
```typescript
interface BadgeCardProps {
  badge: Badge;
  state: 'locked' | 'progress' | 'earned';
  progress?: number;
  showLabel?: boolean;
  onPress?: () => void;
}
```

---

### 2.3 Streak Calendar

**Purpose:** Visual calendar showing streak history

**Component Structure:**
```
┌─────────────────────────────┐
│     April 2026              │
│  S M T W T F S             │
│        1 2 3 4             │
│  5 6 7 8 9 10 11           │
│  🔥🔥🔥🔥🔥🔥🔥             │  <-- Fire icons
│  ❄️🔥🔥🔥🔥🔥🔥             │  <-- Freeze + Fire
└─────────────────────────────┘
```

**Legend:**
- 🔥 Active day
- ❄️ Frozen day
- ⚪ Missed day (streak broken)
- 🔵 Future date

**Props:**
```typescript
interface StreakCalendarProps {
  month: Date;
  streakData: StreakDay[];
  streakType: StreakType;
  onDaySelect?: (day: Date) => void;
}
```

---

### 2.4 Badge Collection Grid

**Purpose:** Display all earned and available badges

**Layout:** Responsive grid (2-4 columns depending on screen size)

**Component Structure:**
```
┌──────────────┬──────────────┬──────────────┐
│   🏆         │   🔒         │   🏆         │
│ 7 Day        │ 30 Day       │ 100 Workout  │
│   EARNED     │   LOCKED     │   EARNED     │
│   RARE       │   RARE       │   EPIC       │
└──────────────┴──────────────┴──────────────┘
```

**Props:**
```typescript
interface BadgeGridProps {
  badges: Badge[];
  filter?: BadgeCategory | 'all';
  sortBy?: 'recent' | 'rarity' | 'category';
  onBadgePress?: (badge: Badge) => void;
}
```

---

### 2.5 Leaderboard Row

**Purpose:** Display single leaderboard entry

**Variants:**
- Standard
- Current User (highlighted)
- Top 3 (special treatment)

**Component Structure:**
```
┌─────────────────────────────────────┐
│  🥇  Jane D.    🔥🔥🔥    45 pts    │
│  #1              30-day             │
└─────────────────────────────────────┘
```

**Rank Indicators:**
| Rank | Icon | Background |
|------|------|------------|
| 1 | 🥇 | Gold gradient |
| 2 | 🥈 | Silver gradient |
| 3 | 🥉 | Bronze gradient |
| 4-10 | Number | Light grey |
| 11+ | Number | Transparent |

**Props:**
```typescript
interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser?: boolean;
  showBadges?: boolean;
}
```

---

### 2.6 Streak Freeze Button

**Purpose:** Allow user to activate streak freeze

**States:**
- Available (enabled, shows count)
- Active/Used (disabled)
- None Available (disabled, greyed)

**Component Structure:**
```
┌───────────────────┐
│    ❄️ Freeze      │  <-- Available
│    1 remaining    │
└───────────────────┘

┌───────────────────┐
│    ✅ Frozen      │  <-- Active
│    Reset in 29d   │
└───────────────────┘
```

**Props:**
```typescript
interface FreezeButtonProps {
  available: boolean;
  remainingCount: number;
  resetDate?: Date;
  onActivate: () => void;
}
```

---

### 2.7 Milestone Celebration Modal

**Purpose:** Celebrate when user reaches a streak milestone

**Component Structure:**
```
┌─────────────────────────────┐
│                             │
│       🎉 CONFETTI 🎉        │
│                             │
│         🔥 30 DAYS          │
│                             │
│      You're on fire!        │
│  Keep up the amazing work   │
│                             │
│    [ SHARE ] [ CLOSE ]      │
└─────────────────────────────┘
```

**Features:**
- Full-screen celebration animation
- Confetti particle effect
- Shareable card generation
- Badge showcase

**Props:**
```typescript
interface MilestoneCelebrationProps {
  milestone: number;
  streakType: StreakType;
  badge?: Badge;
  onShare: () => void;
  onClose: () => void;
}
```

---

### 2.8 Streak At-Risk Banner

**Purpose:** Warn user when streak is at risk of breaking

**Component Structure:**
```
┌─────────────────────────────┐
│  ⚠️ Your streak is at risk! │
│  Log a workout in 6 hours   │
│           [ ACTIVATE ]      │
│           STREAK FREEZE     │
└─────────────────────────────┘
```

**States:**
- Warning (yellow, 6-12 hours remaining)
- Critical (orange, 2-6 hours remaining)
- Urgent (red, <2 hours remaining)

**Props:**
```typescript
interface AtRiskBannerProps {
  hoursRemaining: number;
  freezeAvailable: boolean;
  onFreezeActivate: () => void;
  onDismiss: () => void;
}
```

---

### 2.9 Badge Detail Modal

**Purpose:** Show full badge details and progress

**Component Structure:**
```
┌─────────────────────────────┐
│         🏆                  │
│    30-Day Machine           │
│                             │
│    Complete 30 consecutive  │
│    workout days             │
│                             │
│  Progress: 27/30 days       │
│  ████████████████░░░ 90%    │
│                             │
│  Earned by: 1,234 users     │
│  Rarity: Rare               │
│  Points: 500                │
│                             │
│        [ CLOSE ]            │
└─────────────────────────────┘
```

**Props:**
```typescript
interface BadgeDetailProps {
  badge: Badge;
  progress?: BadgeProgress;
  earnedDate?: Date;
  onClose: () => void;
}
```

---

### 2.10 Creator Dashboard Widget

**Purpose:** Show creators streak/badge engagement metrics

**Component Structure:**
```
┌─────────────────────────────────┐
│  STREAK ENGAGEMENT              │
│  ┌─────────────────────────┐   │
│  │ Active Streaks: 1,234   │   │
│  │ +15% vs last week       │   │
│  ├─────────────────────────┤   │
│  │ Avg Streak Length: 18d  │   │
│  │ +2d vs last month       │   │
│  ├─────────────────────────┤   │
│  │ Badges Earned: 456      │   │
│  │ This week               │   │
│  └─────────────────────────┘   │
│           [ VIEW DETAILS ]      │
└─────────────────────────────────┘
```

---

## 3. Screen Specifications

### 3.1 User Profile Screen

**Layout:**

```
┌─────────────────────────────────────┐
│  Profile Header                     │
│  Avatar, Name, Stats                │
├─────────────────────────────────────┤
│                                     │
│  🔥 YOUR STREAKS                    │
│  ┌─────────┬─────────┬─────────┐   │
│  │ Workout │Nutrition│ Habit   │   │
│  │   14    │    7    │   21    │   │
│  └─────────┴─────────┴─────────┘   │
│                                     │
│  🏆 BADGES (12)                     │
│  ┌────┬────┬────┬────┬────┐       │
│  │ 🏆 │ 🏆 │ 🏆 │ 🏆 │ 🏆 │       │
│  └────┴────┴────┴────┴────┘       │
│  ┌────┬────┬────┬────┬────┐       │
│  │ 🏆 │ 🏆 │ 🏆 │ 🔒 │ 🔒 │       │
│  └────┴────┴────┴────┴────┘       │
│  [ View All Badges ]               │
│                                     │
│  📊 STREAK CALENDAR                │
│  ┌─────────────────────────────┐  │
│  │ April Calendar View         │  │
│  └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Content:**
- Profile header with avatar
- Streak counters for all active types
- Badge grid (earned badges first)
- Mini calendar view
- Leaderboard ranking

---

### 3.2 Badge Collection Screen

**Layout:**

```
┌─────────────────────────────────────┐
│  🏆 My Badges        [↓ Filter]    │
├─────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐          │
│  │ 🏆  │ │ 🏆  │ │ 🏆  │          │
│  │7 Day│ │30Day│ │100  │          │
│  │     │ │     │ │Work │          │
│  └─────┘ └─────┘ └─────┘          │
│                                     │
│  [ Consistency ] [ Milestones ]    │
│  [ Challenges ] [ Community ]      │
│                                     │
│  IN PROGRESS                        │
│  ┌─────┐ ┌─────┐ ┌─────┐          │
│  │ 🏆  │ │ 🏆  │ │ 🏆  │          │
│  │67%  │ │45%  │ │10%  │          │
│  └─────┘ └─────┘ └─────┘          │
└─────────────────────────────────────┘
```

**Features:**
- Filter by category
- Filter by earned/locked
- Sort by recent/rarity
- Search badges

---

### 3.3 Leaderboard Screen

**Layout:**

```
┌─────────────────────────────────────┐
│  🏆 Leaderboards                    │
├─────────────────────────────────────┤
│  [ Weekly ] [ Monthly ] [ All Time ]│
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │  🥇 FitnessFanatic           │   │
│  │     🔥🔥🔥 30 day streak    │   │
│  │              45 points      │   │
│  ├─────────────────────────────┤   │
│  │  🥈 WorkoutWarrior          │   │
│  │     🔥🔥🔥 30 day streak    │   │
│  │              42 points      │   │
│  ├─────────────────────────────┤   │
│  │  🥉 HealthHero               │   │
│  │     🔥🔥🔥 28 day streak    │   │
│  │              40 points      │   │
│  ├─────────────────────────────┤   │
│  │  4 GymRat                   │   │
│  │     🔥🔥 25 day streak      │   │
│  │              35 points      │   │
│  ├─────────────────────────────┤   │
│  │  ⭐ YOU (Rank 12)           │   │
│  │     🔥🔥 18 day streak      │   │
│  │              28 points      │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 4. Notification Templates

### 4.1 Push Notification: Streak At Risk

```
⚠️ Don't lose your streak!
Log a workout today to keep your 14-day streak alive.
[ACTIVATE FREEZE]
```

### 4.2 Push Notification: Milestone Achieved

```
🔥 30-Day Machine!
You've completed 30 days in a row. You're unstoppable!
[VIEW BADGE]
```

### 4.3 Push Notification: Badge Earned

```
🏆 New Badge Unlocked!
You earned the "Workout Warrior" badge!
[VIEW COLLECTION]
```

### 4.4 In-App: Streak Broken

```
┌─────────────────────────────┐
│  💔 Streak Broken           │
│                             │
│  Your 14-day streak has     │
│  ended. But don't worry—    │
│  you can start again today! │
│                             │
│  [ START NEW STREAK ]       │
└─────────────────────────────┘
```
