# Remaining Implementation Work

**Last updated:** 2026-04-27

## Current State

### Frontend (`web/`)
- **72 source files** across app pages, components, API layer, hooks, stores, types, and utilities
- **10 routes** building successfully (`next build` passes clean)
- All component specs from `04-Component-Specs.md` implemented
- Creator portal with dashboard, settings, and analytics pages
- TypeScript strict mode passing (`tsc --noEmit` clean)
- Running Next.js 16.2.4 with Turbopack, React 19, Tailwind 3

### Backend (`backend/`)
- **54 source files** across API controllers, services, repositories, jobs, types, utils, config
- Prisma schema with 3 migrations (init, performance indexes, analytics tables)
- Fastify server with auth, RBAC, rate-limit, validation middleware
- 6 background jobs (daily reset, evaluation, badge progress, leaderboard refresh, at-risk check, notification queue)
- TypeScript compiles (was verified with fixes; needs re-verification)

---

## Phase 3: Backend Hardening

### 3.1 Tests
- [ ] **Unit tests for services** - StreakService, BadgeService, CreatorConfigService, LeaderboardService
- [ ] **Unit tests for repositories** - StreakRepository, BadgeRepository, UserRepository, EventRepository
- [ ] **Unit tests for utilities** - streak.utils, date.utils, badge.utils
- [ ] **Integration tests for API routes** - streak routes, badge routes, creator routes, leaderboard routes
- [ ] **Middleware tests** - auth, RBAC, validation, rate-limit, error-handler
- [ ] **Job tests** - all 6 background jobs
- [ ] **Test configuration** - jest.config.ts, test setup files, test database setup

**Files to create:**
```
backend/
├── jest.config.ts
├── jest.setup.ts
├── src/__tests__/
│   ├── unit/
│   │   ├── services/streak.service.test.ts
│   │   ├── services/badge.service.test.ts
│   │   ├── services/creator-config.service.test.ts
│   │   ├── services/cache.service.test.ts
│   │   ├── services/leaderboard.service.test.ts
│   │   ├── repositories/streak.repository.test.ts
│   │   ├── repositories/badge.repository.test.ts
│   │   ├── utils/streak.utils.test.ts
│   │   └── utils/date.utils.test.ts
│   └── integration/
│       ├── routes/streak.routes.test.ts
│       ├── routes/badge.routes.test.ts
│       ├── routes/creator.routes.test.ts
│       └── routes/leaderboard.routes.test.ts
```

### 3.2 Seed Data
- [ ] **Database seeder script** (`prisma/seeds/seed.ts`)
- [ ] Sample users (10 users across 2 creators)
- [ ] Sample streaks (active, frozen, broken, at-risk across all types)
- [ ] Sample badges (earned, in-progress, locked across all categories/rarities)
- [ ] Sample streak history events (started, incremented, broken, frozen, milestone)
- [ ] Sample leaderboard entries
- [ ] Creator configuration defaults
- [ ] Seed runner script in `package.json`

**Files to create:**
```
backend/
├── prisma/
│   └── seeds/
│       ├── seed.ts              # Main seeder entry
│       ├── users.seed.ts        # User + Creator data
│       ├── streaks.seed.ts      # Streaks + history
│       ├── badges.seed.ts       # Badges + progress
│       └── leaderboards.seed.ts # Leaderboard entries
```

### 3.3 Backend Build Re-verification
- [ ] Run `npx tsc --noEmit` on backend and fix any regressions
- [ ] Verify Prisma client generates cleanly (`npx prisma generate`)

---

## Phase 4: Infrastructure & DevOps

### 4.1 Docker Setup
- [ ] **Backend Dockerfile** - Node.js runtime, multi-stage build
- [ ] **Frontend Dockerfile** - Next.js standalone build
- [ ] **docker-compose.yml** - PostgreSQL, Redis, backend, frontend
- [ ] **docker-compose.test.yml** - Test environment with isolated DB
- [ ] **.dockerignore** files for both projects

**Files to create:**
```
repo root/
├── docker-compose.yml
├── docker-compose.test.yml
├── backend/
│   ├── Dockerfile
│   └── .dockerignore
├── web/
│   ├── Dockerfile
│   └── .dockerignore
```

### 4.2 Environment Configuration
- [ ] Consolidated `.env.example` at repo root
- [ ] Environment validation for frontend (`NEXT_PUBLIC_*` vars)
- [ ] Production vs development config profiles

### 4.3 CI/CD Pipeline
- [ ] GitHub Actions workflow (lint, type-check, test, build)
- [ ] Branch protection rules
- [ ] Automated deployment pipeline (if applicable)

**Files to create:**
```
.github/
└── workflows/
    └── ci.yml
```

---

## Phase 5: BFF / API Routes

### 5.1 Next.js API Routes
- [ ] **BFF proxy routes** - Server-side API proxy to avoid CORS and add server-side auth
- [ ] Token refresh logic
- [ ] Server-side session management

**Files to create:**
```
web/src/app/api/
├── auth/
│   ├── login/route.ts
│   ├── logout/route.ts
│   └── refresh/route.ts
├── streaks/route.ts         # Proxy to backend /streaks/*
├── badges/route.ts          # Proxy to backend /badges/*
├── leaderboards/route.ts    # Proxy to backend /leaderboards/*
└── creator/route.ts         # Proxy to backend /config/creators/*
```

---

## Phase 6: Polish & PRD Future Features

### 6.1 Notification Preferences UI
- [ ] Notification settings page or section in profile
- [ ] Toggle streak-at-risk, milestone, badge-earned, freeze notifications
- [ ] Push notification permission prompt

### 6.2 Social Sharing
- [ ] Share milestone to social media (deep link + og:image generation)
- [ ] Share badge to social media
- [ ] Shareable streak summary card

### 6.3 Accessibility
- [ ] Keyboard navigation audit (tab order, focus management)
- [ ] ARIA labels on interactive elements
- [ ] Color contrast verification (WCAG 2.1 AA)
- [ ] Screen reader testing
- [ ] Reduced-motion media query support for animations

### 6.4 Performance
- [ ] Image optimization for badge icons (next/image)
- [ ] Component lazy loading for heavy components (calendar, confetti)
- [ ] API response caching strategy review
- [ ] Bundle size audit

### 6.5 Error Handling & Edge Cases
- [ ] Offline mode / service worker for PWA
- [ ] API error retry with exponential backoff
- [ ] Optimistic UI updates for freeze activation, badge award
- [ ] Network error boundary with retry
- [ ] 404 page for invalid badge IDs

### 6.6 Remaining Spec Items from PRD
- [ ] Webhook endpoint registration (spec section 8)
- [ ] Badge recommendation engine (suggest badges close to completion)
- [ ] Streak comparison (compare with previous period)
- [ ] Export analytics as CSV/PDF
- [ ] Creator onboarding wizard (first-time setup flow)

---

## Known Issues & Technical Debt

1. **`date-fns` import not used yet** - Frontend has `date-fns` installed but the `lib/utils/date.ts` file is a stub; the streak-calendar uses `date-fns` directly
2. **`react-hook-form` unused** - Installed but not wired up; the creator settings page uses raw controlled inputs. Should be used for validation in settings/award forms
3. **`@radix-ui/react-progress` unused** - Installed but the custom `Progress` component doesn't use it (hand-rolled div-based progress bar)
4. **API client `api.get` returns typed `any`** - The native fetch client wraps all responses in `any`; proper generic typing through the full chain would improve type safety
5. **No auth flow** - The app assumes a token in localStorage but has no login page or auth provider. The UserNav has a "Log out" button that doesn't do anything
6. **Empty `web/src/app/api/streaks/` directory** - Leftover from initial scaffolding; needs BFF routes or removal
7. **Backend `creator.controller.ts` only has `getConfig` and `updateConfig`** - Missing dedicated endpoints for streak-specific update, badge-specific update, analytics, and manual badge award (these are defined in `creator.routes.ts` but the controller methods may need expansion)
8. **No pagination** - API endpoints for badges and history don't implement pagination yet
