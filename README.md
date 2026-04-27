# MacroActive — Streaks & Badges

Gamification system for MacroActive's white-label fitness coaching platform. Tracks user streaks, awards badges, and maintains leaderboards to increase retention and reduce churn.

## Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | Node.js 20, TypeScript, Fastify 4, Prisma 5, PostgreSQL 16, Redis 7, Bull |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 3, TanStack React Query, Zustand |
| **Infra** | Docker, Docker Compose, GitHub Actions CI |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose (for containerized setup)
- **OR** for local development: Node.js 20, PostgreSQL 16, Redis 7

## Quick Start (Docker)

```bash
# Clone the repository
git clone <repo-url> && cd code-test-macroactive

# Copy environment variables
cp .env.example .env

# Start all services
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/v1
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Local Development

### 1. Environment setup

```bash
cp .env.example .env
```

Edit `.env` if your local PostgreSQL or Redis connection details differ from the defaults (`macroactive:macroactive@localhost:5432/streaks_badges`, Redis on `localhost:6379`).

### 2. Backend

```bash
cd backend

npm install
npx prisma generate
npx prisma migrate deploy

# Seed the database with sample data
npm run prisma:seed

npm run dev
```

The API runs on http://localhost:3001.

### 3. Frontend

```bash
cd web

npm install
npm run dev
```

The app runs on http://localhost:3000.

## Environment Variables

All configuration is in the root `.env` file (copied from `.env.example`). Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://macroactive:macroactive@localhost:5432/streaks_badges` | PostgreSQL connection string |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `JWT_SECRET` | `change-me-in-production` | Secret for signing JWT tokens |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/v1` | Backend API URL for the frontend |
| `PORT` | `3001` | Backend server port |

Feature flags (`FEATURE_STREAKS_ENABLED`, `FEATURE_BADGES_ENABLED`, `FEATURE_LEADERBOARDS_ENABLED`) are enabled by default.

## Useful Commands

### Backend

```bash
cd backend

npm run dev              # Start dev server with hot reload
npm run build            # Compile TypeScript to dist/
npm run start            # Run compiled server
npm run prisma:seed      # Seed database with sample data
npm run test             # Run tests
npm run test:coverage    # Run tests with coverage report
npm run lint             # Lint with ESLint
npm run format           # Format with Prettier
```

### Frontend

```bash
cd web

npm run dev              # Start Next.js dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Lint with ESLint
npm run type-check       # TypeScript type checking
npm run test             # Run tests
```

## Running Tests

### Unit tests (backend)

```bash
cd backend && npm test
```

### Integration tests (Docker)

```bash
docker compose -f docker-compose.test.yml up --build
```

This spins up isolated PostgreSQL (port 5433) and Redis (port 6380) instances, runs Prisma migrations, and executes the Jest test suite with coverage.

## Database

The app uses Prisma ORM with PostgreSQL. There are 3 migrations and 12 models covering streaks, badges, leaderboards, and analytics.

```bash
cd backend

npx prisma migrate status     # Check migration status
npx prisma migrate deploy     # Apply pending migrations
npx prisma studio             # Open Prisma Studio GUI
npm run prisma:seed           # Load sample data
```

## CI

GitHub Actions runs on every push/PR to `main` (`.github/workflows/ci.yml`):

1. **Backend** — lint, type-check, test, build
2. **Frontend** — lint, type-check, build
3. **Integration** — full Docker Compose test suite

## Project Structure

```
├── backend/                  # Fastify API server
│   ├── prisma/               # Schema, migrations, seeds
│   └── src/
│       ├── api/              # Routes, controllers, middleware, schemas
│       ├── config/           # Database, logger config
│       ├── constants/        # Streak, badge, error constants
│       ├── db/               # Prisma repositories
│       ├── jobs/             # Bull queue jobs (leaderboard refresh, notifications)
│       ├── services/         # Business logic services
│       ├── types/            # TypeScript type definitions
│       └── utils/            # Utility functions
├── web/                      # Next.js frontend
│   └── src/
│       ├── app/              # App Router pages and API routes
│       ├── components/       # UI components (streak, badge, leaderboard, etc.)
│       ├── hooks/            # React Query hooks
│       ├── lib/              # API client, utilities
│       ├── store/            # Zustand stores
│       └── types/            # TypeScript type definitions
├── docs/                     # PRD, architecture, implementation specs
├── docker-compose.yml        # Production services
└── docker-compose.test.yml   # Integration test services
```
