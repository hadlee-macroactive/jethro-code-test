# Design System

## 1. Overview

The Streaks & Badges System uses MacroActive's existing design language with extensions for gamification elements. This document defines the visual design tokens, color palettes, and design patterns specific to streaks and badges.

## 2. Color Palette

### 2.1 Primary Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#FF6B35` | Primary actions, streak fire |
| `--color-primary-light` | `#FF8B5A` | Primary hover states |
| `--color-primary-dark` | `#E55A2B` | Primary active states |
| `--color-secondary` | `#2C3E50` | Secondary actions, text |
| `--color-accent` | `#27AE60` | Success, achievements |

### 2.2 Streak Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-streak-fire` | `#FF6B35` | Active streak indicators |
| `--color-streak-ice` | `#3498DB` | Frozen streak state |
| `--color-streak-broken` | `#95A5A6` | Broken/inactive streak |
| `--color-streak-gold` | `#F39C12` | Milestone achievements |

### 2.3 Badge Rarity Colors

| Rarity | Primary | Gradient Start | Gradient End | Usage |
|--------|---------|----------------|--------------|-------|
| Common | `#95A5A6` | `#BDC3C7` | `#95A5A6` | Standard badges |
| Rare | `#3498DB` | `#5DADE2` | `#3498DB` | 30-day streaks, 100 workouts |
| Epic | `#9B59B6` | `#BB8FCE` | `#9B59B6` | 60-90 day streaks |
| Legendary | `#F39C12` | `#F7DC6F` | `#F39C12` | 180+ day streaks |

### 2.4 Status Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | `#27AE60` | Completion, positive feedback |
| `--color-warning` | `#F39C12` | At-risk warnings |
| `--color-error` | `#E74C3C` | Broken streak, errors |
| `--color-info` | `#3498DB` | Informational messages |

### 2.5 Neutral Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-primary` | `#FFFFFF` | Main backgrounds |
| `--color-bg-secondary` | `#F8F9FA` | Card backgrounds |
| `--color-bg-tertiary` | `#ECF0F1` | Section backgrounds |
| `--color-text-primary` | `#2C3E50` | Headings, body text |
| `--color-text-secondary` | `#7F8C8D` | Secondary text, labels |
| `--color-text-tertiary` | `#BDC3C7` | Placeholder text |
| `--color-border` | `#ECF0F1` | Borders, dividers |

### 2.6 Dark Mode Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-dark-bg-primary` | `#1A1A1A` | Main backgrounds |
| `--color-dark-bg-secondary` | `#2C2C2C` | Card backgrounds |
| `--color-dark-text-primary` | `#FFFFFF` | Headings, body text |
| `--color-dark-text-secondary` | `#BDC3C7` | Secondary text |

## 3. Typography

### 3.1 Font Family

```css
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-display: 'Inter', sans-serif;
--font-family-monospace: 'SF Mono', 'Roboto Mono', monospace;
```

### 3.2 Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-xs` | 12px | 400/500 | 1.5 | Labels, captions |
| `--text-sm` | 14px | 400/500 | 1.5 | Secondary text |
| `--text-base` | 16px | 400 | 1.5 | Body text |
| `--text-lg` | 18px | 500/600 | 1.5 | Subheadings |
| `--text-xl` | 20px | 600 | 1.4 | Card titles |
| `--text-2xl` | 24px | 600 | 1.3 | Section headers |
| `--text-3xl` | 30px | 700 | 1.2 | Page titles |
| `--text-4xl` | 36px | 700 | 1.2 | Hero titles |
| `--text-display` | 48px+ | 800 | 1.1 | Milestone celebrations |

### 3.3 Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--font-normal` | 400 | Body text |
| `--font-medium` | 500 | Emphasized text |
| `--font-semibold` | 600 | Subheadings |
| `--font-bold` | 700 | Headings |
| `--font-extrabold` | 800 | Display text |

## 4. Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | 0 | None |
| `--space-1` | 4px | Tight spacing |
| `--space-2` | 8px | Compact spacing |
| `--space-3` | 12px | Default spacing |
| `--space-4` | 16px | Comfortable spacing |
| `--space-5` | 20px | Section spacing |
| `--space-6` | 24px | Large spacing |
| `--space-8` | 32px | Extra large spacing |
| `--space-10` | 40px | Component separation |
| `--space-12` | 48px | Page margins |
| `--space-16` | 64px | Section margins |

## 5. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0 | Straight edges |
| `--radius-sm` | 4px | Small elements |
| `--radius-md` | 8px | Cards, buttons |
| `--radius-lg` | 12px | Large cards |
| `--radius-xl` | 16px | Hero elements |
| `--radius-full` | 9999px | Pills, circles |

## 6. Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Cards |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Floating elements |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Modals, popovers |
| `--shadow-glow` | `0 0 20px rgba(255,107,53,0.4)` | Streak fire effect |

## 7. Animations

### 7.1 Durations

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 100ms | Micro-interactions |
| `--duration-fast` | 200ms | Hover states |
| `--duration-base` | 300ms | Standard transitions |
| `--duration-slow` | 500ms | Page transitions |
| `--duration-slower` | 1000ms | Celebrations |

### 7.2 Easing

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Enter animations |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Exit animations |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Smooth transitions |
| `--ease-bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Badge celebrations |

### 7.3 Key Animations

#### Streak Fire Pulse

```css
@keyframes streak-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
}

.streak-fire {
  animation: streak-pulse 2s ease-in-out infinite;
}
```

#### Badge Shine

```css
@keyframes badge-shine {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.badge-rare {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.4) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: badge-shine 3s ease-in-out infinite;
}
```

#### Milestone Celebration

```css
@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.confetti {
  animation: confetti-fall 3s ease-in forwards;
}
```

#### Streak Break Shake

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.streak-broken {
  animation: shake 0.5s ease-in-out;
}
```

## 8. Icon System

### 8.1 Icon Sizes

| Token | Value | Usage |
|-------|-------|-------|
| `--icon-xs` | 16px | Inline icons |
| `--icon-sm` | 20px | Button icons |
| `--icon-md` | 24px | Default icons |
| `--icon-lg` | 32px | Large icons |
| `--icon-xl` | 48px | Hero icons |

### 8.2 Streak Icons

| Icon | Usage |
|------|-------|
| 🔥 Fire | Active streak |
| ❄️ Snowflake | Frozen streak |
| 💔 Broken Heart | Broken streak |
| ⚡ Lightning | Streak freeze |
| 📅 Calendar | Streak calendar |
| 🏆 Trophy | Milestone achieved |

### 8.3 Badge Icons

Badge icons use rarity-based styling:

```
Common:  Single color icon
Rare:    Gradient fill + shine
Epic:    Animated gradient + particles
Legend:  Full animation + glow
```

## 9. Component-Specific Tokens

### 9.1 Streak Counter

```css
--streak-counter-size: 120px;
--streak-counter-ring-width: 8px;
--streak-counter-color: var(--color-streak-fire);
--streak-counter-bg: var(--color-bg-tertiary);
```

### 9.2 Badge Card

```css
--badge-card-width: 160px;
--badge-card-height: 200px;
--badge-icon-size: 80px;
--badge-padding: var(--space-4);
```

### 9.3 Leaderboard Row

```css
--leaderboard-row-height: 64px;
--leaderboard-rank-width: 40px;
--leaderboard-avatar-size: 40px;
```

## 10. Responsive Breakpoints

| Token | Value | Target |
|-------|-------|--------|
| `--breakpoint-xs` | 375px | Small phones |
| `--breakpoint-sm` | 640px | Large phones |
| `--breakpoint-md` | 768px | Tablets |
| `--breakpoint-lg` | 1024px | Small laptops |
| `--breakpoint-xl` | 1280px | Desktops |
| `--breakpoint-2xl` | 1536px | Large screens |

## 11. Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-dropdown` | 1000 | Dropdown menus |
| `--z-sticky` | 1100 | Sticky headers |
| `--z-modal` | 1200 | Modal overlays |
| `--z-notification` | 1300 | Toast notifications |
| `--z-tooltip` | 1400 | Tooltips |
| `--z-celebration` | 1500 | Milestone animations |
