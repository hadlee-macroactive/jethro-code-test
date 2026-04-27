# Database Migrations

## Prisma Schema

### prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// STREAK TABLES
// ============================================

model Streak {
  id                 String   @id @default(uuid())
  userId             BigInt
  creatorId          BigInt
  streakType         String
  currentCount        Int      @default(0)
  longestCount        Int      @default(0)
  lastActivityDate   DateTime @db.Date
  streakStartDate    DateTime @db.Date
  isActive           Boolean  @default(true)
  nextMilestone      Int?
  milestoneProgress  Int      @default(0)
  freezeAvailable    Boolean  @default(true)
  freezeUsedCount    Int      @default(0)
  freezeLastUsed     DateTime?
  metadata           Json     @default("{}")
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  creator            Creator  @relation(fields: [creatorId], references: [id], onDelete: Cascade)

  history            StreakHistory[]
  freezes            StreakFreeze[]
  events             StreakEvent[]

  @@unique([userId, creatorId, streakType], name: "uq_user_creator_type")
  @@index([userId])
  @@index([creatorId])
  @@index([creatorId, isActive])
  @@index([lastActivityDate])
  @@map("streaks")
}

model StreakHistory {
  id                 String   @id @default(uuid())
  streakId           String
  userId             BigInt
  creatorId          BigInt
  streakType         String
  eventType          String
  previousCount      Int?
  newCount           Int
  milestoneAchieved  Int?
  reason             String?
  snapshot           Json     @default("{}")
  createdAt          DateTime @default(now())

  streak             Streak    @relation(fields: [streakId], references: [id], onDelete: Cascade)

  @@index([streakId])
  @@index([userId])
  @@index([createdAt(sort: Desc)])
  @@map("streak_history")
}

model StreakEvent {
  id              String   @id @default(uuid())
  userId          BigInt
  creatorId       BigInt
  streakType      String
  eventDate       DateTime @db.Date
  activityCount   Int      @default(1)
  qualified       Boolean  @default(true)
  eventSource     String
  sourceEventId   String
  metadata        Json     @default("{}")
  createdAt       DateTime @default(now())

  streak          Streak    @relation(fields: [userId, creatorId, streakType], references: [userId, creatorId, streakType])

  @@unique([userId, creatorId, streakType, eventDate, sourceEventId], name: "uq_streak_event")
  @@index([userId, eventDate(sort: Desc)])
  @@index([creatorId, eventDate(sort: Desc)])
  @@index([qualified])
  @@map("streak_events")
}

model StreakFreeze {
  id                   String   @id @default(uuid())
  userId               BigInt
  creatorId            BigInt
  streakType           String
  freezeDate           DateTime @db.Date
  streakCountAtFreeze  Int
  reason               String?
  createdAt            DateTime @default(now())

  @@index([userId, freezeDate(sort: Desc)])
  @@index([creatorId, freezeDate(sort: Desc)])
  @@map("streak_freezes")
}

// ============================================
// BADGE TABLES
// ============================================

model Badge {
  id                      String          @id @default(uuid())
  badgeCode               String          @unique
  badgeCategory           String
  name                    String
  description             String?
  iconUrl                 String?
  rarity                  String          @default("common")
  points                  Int             @default(0)
  displayOrder            Int             @default(0)
  isActive                Boolean         @default(true)
  isCreatorCustomizable   Boolean         @default(false)
  requiredBadgeId         String?
  metadata                Json            @default("{}")
  createdAt               DateTime        @default(now())
  updatedAt               DateTime        @updatedAt

  requiredBadge           Badge?          @relation("BadgePrerequisite", fields: [requiredBadgeId], references: [id])
  prerequisiteBadges      Badge[]         @relation("BadgePrerequisite")
  criteria                BadgeCriteria[]
  userBadges              UserBadge[]
  badgeProgress           BadgeProgress[]

  @@index([badgeCategory])
  @@index([isActive])
  @@map("badges")
}

model BadgeCriteria {
  id                String   @id @default(uuid())
  badgeId           String
  criterionType     String
  comparisonOperator String
  thresholdValue    Decimal  @db.Decimal(10, 2)
  timePeriodDays    Int?
  streakType        String?
  isRequired        Boolean  @default(true)
  metadata          Json     @default("{}")
  createdAt         DateTime @default(now())

  badge             Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)

  @@index([badgeId])
  @@map("badge_criteria")
}

model UserBadge {
  id                  String   @id @default(uuid())
  userId              BigInt
  badgeId             String
  creatorId           BigInt
  awardedAt           DateTime @default(now())
  awardedBy           String   @default("system")
  awardReason         String?
  progressPercentage  Int      @default(100)
  isDisplayed         Boolean  @default(true)
  displayPriority     Int      @default(0)
  metadata            Json     @default("{}")

  badge               Badge    @relation(fields: [badgeId], references: [id])

  @@unique([userId, badgeId, creatorId], name: "uq_user_badge")
  @@index([userId, awardedAt(sort: Desc)])
  @@index([creatorId])
  @@index([badgeId])
  @@map("user_badges")
}

model BadgeProgress {
  id              String   @id @default(uuid())
  userId          BigInt
  badgeId         String
  creatorId       BigInt
  progressPercentage Int    @default(0)
  currentValue    Decimal  @default(0) @db.Decimal(10, 2)
  targetValue     Decimal  @default(0) @db.Decimal(10, 2)
  lastUpdated     DateTime @default(now())

  badge           Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeId, creatorId], name: "uq_badge_progress")
  @@index([userId, progressPercentage(sort: Desc)])
  @@map("badge_progress")
}

// ============================================
// CREATOR CONFIGURATION
// ============================================

model CreatorConfiguration {
  id                    String   @id @default(uuid())
  creatorId             BigInt   @unique
  streakSettings        Json     @default("{}")
  badgeSettings         Json     @default("{}")
  leaderboardSettings  Json     @default("{}")
  notificationSettings Json     @default("{}")
  featureFlags         Json     @default("{}")
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@map("creator_configurations")
}

// ============================================
// LEADERBOARDS
// ============================================

model Leaderboard {
  id              String   @id @default(uuid())
  creatorId       BigInt
  leaderboardType String
  periodStart     DateTime @db.Date
  periodEnd       DateTime @db.Date
  entries         Json     @default("[]")
  lastRefreshed   DateTime @default(now())

  @@index([creatorId, leaderboardType, periodStart(sort: Desc)])
  @@map("leaderboards")
}

// ============================================
// EXISTING TABLES (References)
// ============================================

model User {
  id    BigInt @id
  email String
  name  String?

  streaks Streak[]
}

model Creator {
  id    BigInt @id
  name  String
  email String

  streaks       Streak[]
  configuration CreatorConfiguration?
}
```

## Migration Files

### Migration 001: Initial Schema

**File:** `prisma/migrations/20240426_000001_init_streaks_badges/migration.sql`

```sql
-- ============================================
-- STREAK TABLES
-- ============================================

-- Streaks table
CREATE TABLE "streaks" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" BIGINT NOT NULL,
    "creatorId" BIGINT NOT NULL,
    "streakType" VARCHAR(50) NOT NULL,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "longestCount" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" DATE NOT NULL,
    "streakStartDate" DATE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "nextMilestone" INTEGER,
    "milestoneProgress" INTEGER NOT NULL DEFAULT 0,
    "freezeAvailable" BOOLEAN NOT NULL DEFAULT true,
    "freezeUsedCount" INTEGER NOT NULL DEFAULT 0,
    "freezeLastUsed" TIMESTAMP,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT "chk_streak_type" CHECK (
        "streakType" IN ('workout', 'nutrition', 'habit', 'community')
    )
);

CREATE UNIQUE INDEX "uq_user_creator_type" ON "streaks"("userId", "creatorId", "streakType");
CREATE INDEX "idx_streaks_userId" ON "streaks"("userId");
CREATE INDEX "idx_streaks_creatorId" ON "streaks"("creatorId");
CREATE INDEX "idx_streaks_active" ON "streaks"("creatorId", "isActive") WHERE "isActive" = true;
CREATE INDEX "idx_streaks_lastActivityDate" ON "streaks"("lastActivityDate");

-- Streak History
CREATE TABLE "streak_history" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "streakId" UUID NOT NULL,
    "userId" BIGINT NOT NULL,
    "creatorId" BIGINT NOT NULL,
    "streakType" VARCHAR(50) NOT NULL,
    "eventType" VARCHAR(50) NOT NULL,
    "previousCount" INTEGER,
    "newCount" INTEGER NOT NULL,
    "milestoneAchieved" INTEGER,
    "reason" TEXT,
    "snapshot" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT "chk_streak_event_type" CHECK (
        "eventType" IN ('started', 'incremented', 'broken', 'frozen', 'milestone')
    )
);

CREATE INDEX "idx_streak_history_streakId" ON "streak_history"("streakId");
CREATE INDEX "idx_streak_history_userId" ON "streak_history"("userId");
CREATE INDEX "idx_streak_history_createdAt" ON "streak_history"("createdAt" DESC);

-- Streak Events (daily activity tracking)
CREATE TABLE "streak_events" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" BIGINT NOT NULL,
    "creatorId" BIGINT NOT NULL,
    "streakType" VARCHAR(50) NOT NULL,
    "eventDate" DATE NOT NULL,
    "activityCount" INTEGER NOT NULL DEFAULT 1,
    "qualified" BOOLEAN NOT NULL DEFAULT true,
    "eventSource" VARCHAR(100),
    "sourceEventId" VARCHAR(255),
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX "uq_streak_event" ON "streak_events"(
    "userId", "creatorId", "streakType", "eventDate", "sourceEventId"
);
CREATE INDEX "idx_streak_events_user_date" ON "streak_events"("userId", "eventDate" DESC);
CREATE INDEX "idx_streak_events_creator_date" ON "streak_events"("creatorId", "eventDate" DESC);
CREATE INDEX "idx_streak_events_qualified" ON "streak_events"("qualified") WHERE "qualified" = true;

-- Streak Freezes
CREATE TABLE "streak_freezes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" BIGINT NOT NULL,
    "creatorId" BIGINT NOT NULL,
    "streakType" VARCHAR(50) NOT NULL,
    "freezeDate" DATE NOT NULL,
    "streakCountAtFreeze" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_streak_freezes_user" ON "streak_freezes"("userId", "freezeDate" DESC);
CREATE INDEX "idx_streak_freezes_creator" ON "streak_freezes"("creatorId", "freezeDate" DESC);

-- ============================================
-- BADGE TABLES
-- ============================================

-- Badges
CREATE TABLE "badges" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "badgeCode" VARCHAR(100) UNIQUE NOT NULL,
    "badgeCategory" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "iconUrl" VARCHAR(500),
    "rarity" VARCHAR(20) NOT NULL DEFAULT 'common',
    "points" INTEGER NOT NULL DEFAULT 0,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCreatorCustomizable" BOOLEAN NOT NULL DEFAULT false,
    "requiredBadgeId" UUID,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT "chk_badge_rarity" CHECK (
        "rarity" IN ('common', 'rare', 'epic', 'legendary')
    )
);

CREATE INDEX "idx_badges_category" ON "badges"("badgeCategory");
CREATE INDEX "idx_badges_active" ON "badges"("isActive") WHERE "isActive" = true;

-- Badge Criteria
CREATE TABLE "badge_criteria" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "badgeId" UUID NOT NULL,
    "criterionType" VARCHAR(50) NOT NULL,
    "comparisonOperator" VARCHAR(10) NOT NULL,
    "thresholdValue" DECIMAL(10, 2) NOT NULL,
    "timePeriodDays" INTEGER,
    "streakType" VARCHAR(50),
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_badge_criteria_badgeId" ON "badge_criteria"("badgeId");

-- User Badges (awarded badges)
CREATE TABLE "user_badges" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" BIGINT NOT NULL,
    "badgeId" UUID NOT NULL,
    "creatorId" BIGINT NOT NULL,
    "awardedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "awardedBy" VARCHAR(100) DEFAULT 'system',
    "awardReason" TEXT,
    "progressPercentage" INTEGER DEFAULT 100,
    "isDisplayed" BOOLEAN NOT NULL DEFAULT true,
    "displayPriority" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB DEFAULT '{}'
);

CREATE UNIQUE INDEX "uq_user_badge" ON "user_badges"("userId", "badgeId", "creatorId");
CREATE INDEX "idx_user_badges_userId" ON "user_badges"("userId", "awardedAt" DESC);
CREATE INDEX "idx_user_badges_creatorId" ON "user_badges"("creatorId");
CREATE INDEX "idx_user_badges_badgeId" ON "user_badges"("badgeId");

-- Badge Progress (in-progress badges)
CREATE TABLE "badge_progress" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" BIGINT NOT NULL,
    "badgeId" UUID NOT NULL,
    "creatorId" BIGINT NOT NULL,
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "currentValue" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "targetValue" DECIMAL(10, 2) NOT NULL,
    "lastUpdated" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX "uq_badge_progress" ON "badge_progress"("userId", "badgeId", "creatorId");
CREATE INDEX "idx_badge_progress_user" ON "badge_progress"("userId", "progressPercentage" DESC);

-- ============================================
-- CREATOR CONFIGURATION
-- ============================================

CREATE TABLE "creator_configurations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "creatorId" BIGINT UNIQUE NOT NULL,
    "streakSettings" JSONB DEFAULT '{}',
    "badgeSettings" JSONB DEFAULT '{}',
    "leaderboardSettings" JSONB DEFAULT '{}',
    "notificationSettings" JSONB DEFAULT '{}',
    "featureFlags" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- LEADERBOARDS
-- ============================================

CREATE TABLE "leaderboards" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "creatorId" BIGINT NOT NULL,
    "leaderboardType" VARCHAR(50) NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "entries" JSONB DEFAULT '[]',
    "lastRefreshed" TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT "chk_leaderboard_type" CHECK (
        "leaderboardType" IN ('weekly_workout', 'monthly_streak', 'volume', 'challenge')
    )
);

CREATE INDEX "idx_leaderboards_creator_period" ON "leaderboards"("creatorId", "leaderboardType", "periodStart" DESC);

-- ============================================
-- FOREIGN KEYS
-- ============================================

ALTER TABLE "streaks"
    ADD CONSTRAINT "fk_streaks_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    ADD CONSTRAINT "fk_streaks_creator" FOREIGN KEY ("creatorId") REFERENCES "creators"("id") ON DELETE CASCADE;

ALTER TABLE "streak_history"
    ADD CONSTRAINT "fk_streak_history_streak" FOREIGN KEY ("streakId") REFERENCES "streaks"("id") ON DELETE CASCADE;

ALTER TABLE "streak_events"
    ADD CONSTRAINT "fk_streak_events_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    ADD CONSTRAINT "fk_streak_events_creator" FOREIGN KEY ("creatorId") REFERENCES "creators"("id") ON DELETE CASCADE;

ALTER TABLE "streak_freezes"
    ADD CONSTRAINT "fk_streak_freezes_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    ADD CONSTRAINT "fk_streak_freezes_creator" FOREIGN KEY ("creatorId") REFERENCES "creators"("id") ON DELETE CASCADE;

ALTER TABLE "badges"
    ADD CONSTRAINT "fk_badge_prerequisite" FOREIGN KEY ("requiredBadgeId") REFERENCES "badges"("id");

ALTER TABLE "badge_criteria"
    ADD CONSTRAINT "fk_badge_criteria_badge" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE;

ALTER TABLE "user_badges"
    ADD CONSTRAINT "fk_user_badges_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    ADD CONSTRAINT "fk_user_badges_badge" FOREIGN KEY ("badgeId") REFERENCES "badges"("id"),
    ADD CONSTRAINT "fk_user_badges_creator" FOREIGN KEY ("creatorId") REFERENCES "creators"("id") ON DELETE CASCADE;

ALTER TABLE "badge_progress"
    ADD CONSTRAINT "fk_badge_progress_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    ADD CONSTRAINT "fk_badge_progress_badge" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE,
    ADD CONSTRAINT "fk_badge_progress_creator" FOREIGN KEY ("creatorId") REFERENCES "creators"("id") ON DELETE CASCADE;

ALTER TABLE "leaderboards"
    ADD CONSTRAINT "fk_leaderboards_creator" FOREIGN KEY ("creatorId") REFERENCES "creators"("id") ON DELETE CASCADE;

ALTER TABLE "creator_configurations"
    ADD CONSTRAINT "fk_creator_config_creator" FOREIGN KEY ("creatorId") REFERENCES "creators"("id") ON DELETE CASCADE;

-- ============================================
-- INITIAL BADGE DATA
-- ============================================

INSERT INTO "badges" ("badgeCode", "badgeCategory", "name", "description", "rarity", "points", "displayOrder") VALUES
    ('3_day_streak', 'consistency', '3 Day Streak', 'Complete 3 consecutive days', 'common', 50, 1),
    ('7_day_consistency', 'consistency', '7-Day Consistency', 'Completed 7 consecutive days', 'common', 100, 2),
    ('14_day_streak', 'consistency', '14 Day Streak', 'Complete 14 consecutive days', 'common', 150, 3),
    ('30_day_machine', 'consistency', '30-Day Machine', 'Completed 30 consecutive days', 'rare', 500, 4),
    ('60_day_elite', 'consistency', '60-Day Elite', 'Completed 60 consecutive days', 'epic', 1000, 5),
    ('90_day_elite', 'consistency', '90-Day Elite', 'Completed 90 consecutive days', 'epic', 1500, 6),
    ('180_day_legend', 'consistency', '180-Day Legend', 'Completed 180 consecutive days', 'legendary', 3000, 7),
    ('365_day_mythic', 'consistency', '365-Day Mythic', 'Completed a full year!', 'legendary', 5000, 8),
    ('100_workouts', 'milestone', '100 Workouts', 'Completed 100 total workouts', 'rare', 500, 20),
    ('500_workouts', 'milestone', '500 Workouts', 'Completed 500 total workouts', 'epic', 2000, 21),
    ('1000_workouts', 'milestone', '1000 Workouts', 'Completed 1000 total workouts', 'legendary', 5000, 22);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to check if streak should be broken
CREATE OR REPLACE FUNCTION check_streak_break(p_streak_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_last_activity DATE;
    v_freeze_used BOOLEAN;
BEGIN
    SELECT "lastActivityDate" INTO v_last_activity
    FROM "streaks"
    WHERE "id" = p_streak_id;

    -- Check if freeze exists for today
    SELECT EXISTS(
        SELECT 1 FROM "streak_freezes"
        WHERE "userId" = (SELECT "userId" FROM "streaks" WHERE "id" = p_streak_id)
        AND "creatorId" = (SELECT "creatorId" FROM "streaks" WHERE "id" = p_streak_id)
        AND "streakType" = (SELECT "streakType" FROM "streaks" WHERE "id" = p_streak_id)
        AND "freezeDate" = CURRENT_DATE
    ) INTO v_freeze_used;

    -- Break streak if more than 24 hours since last activity AND no freeze used
    IF v_lastActivity < CURRENT_DATE - INTERVAL '1 day' AND NOT v_freeze_used THEN
        UPDATE "streaks"
        SET "isActive" = false
        WHERE "id" = p_streak_id;
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_streaks_updated_at
    BEFORE UPDATE ON "streaks"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_badges_updated_at
    BEFORE UPDATE ON "badges"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_configurations_updated_at
    BEFORE UPDATE ON "creator_configurations"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS
-- ============================================

-- Active streaks summary view
CREATE OR REPLACE VIEW active_streaks_summary AS
SELECT
    "creatorId",
    "streakType",
    COUNT(*) as "activeCount",
    AVG("currentCount") as "avgStreakLength",
    MAX("currentCount") as "maxStreakLength"
FROM "streaks"
WHERE "isActive" = true
GROUP BY "creatorId", "streakType";

-- User badge summary view
CREATE OR REPLACE VIEW user_badge_summary AS
SELECT
    u."userId",
    u."creatorId",
    COUNT(*) as "totalBadges",
    SUM(b."points") as "totalPoints",
    COUNT(*) FILTER (WHERE b."rarity" = 'legendary') as "legendaryBadges",
    COUNT(*) FILTER (WHERE b."rarity" = 'epic') as "epicBadges"
FROM "user_badges" u
JOIN "badges" b ON u."badgeId" = b."id"
GROUP BY u."userId", u."creatorId";
```

### Migration 002: Performance Indexes

**File:** `prisma/migrations/20240427_000002_performance_indexes/migration.sql`

```sql
-- Partial indexes for better performance

-- Index for finding active streaks that need processing
CREATE INDEX "idx_streaks_active_lastActivity" ON "streaks"("lastActivityDate")
WHERE "isActive" = true;

-- Index for finding at-risk streaks
CREATE INDEX "idx_streaks_at_risk" ON "streaks"("userId", "lastActivityDate")
WHERE "isActive" = true AND "lastActivityDate" < CURRENT_DATE - INTERVAL '18 hours';

-- Covering index for streak API queries
CREATE INDEX "idx_streaks_user_creator_covering" ON "streaks"(
    "userId", "creatorId", "streakType", "currentCount", "lastActivityDate", "isActive"
);

-- Badge progress index for queries
CREATE INDEX "idx_badge_progress_completion" ON "badge_progress"("userId", "progressPercentage")
WHERE "progressPercentage" < 100;

-- Leaderboard query optimization
CREATE INDEX "idx_user_badges_leaderboard" ON "user_badges"("creatorId", "awardedAt" DESC, "badgeId")
WHERE "isDisplayed" = true;

-- Event partitioning helper index
CREATE INDEX "idx_streak_events_partition" ON "streak_events"("eventDate", "qualified");
```

### Migration 003: Analytics Tables

**File:** `prisma/migrations/20240501_000003_analytics_tables/migration.sql`

```sql
-- Daily aggregation table for streak metrics
CREATE TABLE "daily_streak_metrics" (
    "id" BIGSERIAL PRIMARY KEY,
    "creatorId" BIGINT NOT NULL,
    "metricDate" DATE NOT NULL,
    "totalActiveStreaks" INTEGER NOT NULL DEFAULT 0,
    "newStreaksStarted" INTEGER NOT NULL DEFAULT 0,
    "streaksBroken" INTEGER NOT NULL DEFAULT 0,
    "streaksFrozen" INTEGER NOT NULL DEFAULT 0,
    "milestonesAchieved" INTEGER NOT NULL DEFAULT 0,
    "avgStreakLength" DECIMAL(10, 2),
    "longestStreak" INTEGER,
    "streakTypeBreakdown" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE("creatorId", "metricDate")
);

CREATE INDEX "idx_daily_streak_metrics_date" ON "daily_streak_metrics"("metricDate" DESC);

-- Daily badge metrics
CREATE TABLE "daily_badge_metrics" (
    "id" BIGSERIAL PRIMARY KEY,
    "creatorId" BIGINT NOT NULL,
    "metricDate" DATE NOT NULL,
    "badgesAwarded" INTEGER NOT NULL DEFAULT 0,
    "uniqueUsersEarned" INTEGER NOT NULL DEFAULT 0,
    "topBadges" JSONB DEFAULT '[]',
    "badgeCategoryBreakdown" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE("creatorId", "metricDate")
);

CREATE INDEX "idx_daily_badge_metrics_date" ON "daily_badge_metrics"("metricDate" DESC);
```

## Rollback Scripts

Each migration folder also contains a `rollback.sql` file:

### 001 Rollback

**File:** `prisma/migrations/20240426_000001_init_streaks_badges/rollback.sql`

```sql
-- Drop in reverse order of creation

-- Views
DROP VIEW IF EXISTS user_badge_summary;
DROP VIEW IF EXISTS active_streaks_summary;

-- Functions
DROP FUNCTION IF EXISTS check_streak_break(p_streak_id UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Triggers
DROP TRIGGER IF EXISTS update_streaks_updated_at ON "streaks";
DROP TRIGGER IF EXISTS update_badges_updated_at ON "badges";
DROP TRIGGER IF EXISTS update_creator_configurations_updated_at ON "creator_configurations";

-- Tables (with CASCADE for foreign keys)
DROP TABLE IF EXISTS "daily_badge_metrics" CASCADE;
DROP TABLE IF EXISTS "daily_streak_metrics" CASCADE;
DROP TABLE IF EXISTS "leaderboards" CASCADE;
DROP TABLE IF EXISTS "creator_configurations" CASCADE;
DROP TABLE IF EXISTS "badge_progress" CASCADE;
DROP TABLE IF EXISTS "user_badges" CASCADE;
DROP TABLE IF EXISTS "badge_criteria" CASCADE;
DROP TABLE IF EXISTS "badges" CASCADE;
DROP TABLE IF EXISTS "streak_freezes" CASCADE;
DROP TABLE IF EXISTS "streak_events" CASCADE;
DROP TABLE IF EXISTS "streak_history" CASCADE;
DROP TABLE IF EXISTS "streaks" CASCADE;
```

## Seed Data

**File:** `prisma/seeds/001_badges.sql`

```sql
-- Consistency Badges
INSERT INTO "badges" ("badgeCode", "badgeCategory", "name", "description", "rarity", "points", "displayOrder", "iconUrl") VALUES
('3_day_streak', 'consistency', '3 Day Streak', 'Started your journey! 3 consecutive days completed.', 'common', 50, 1, 'https://cdn.macroactive.com/badges/3day.png'),
('7_day_consistency', 'consistency', '7-Day Consistency', 'One week of dedication!', 'common', 100, 2, 'https://cdn.macroactive.com/badges/7day.png'),
('14_day_streak', 'consistency', 'Two Week Streak', 'Two weeks of consistent effort.', 'common', 150, 3, 'https://cdn.macroactive.com/badges/14day.png'),
('30_day_machine', 'consistency', '30-Day Machine', 'A full month of consistency!', 'rare', 500, 4, 'https://cdn.macroactive.com/badges/30day.png'),
('60_day_elite', 'consistency', '60-Day Elite', 'Two months of dedication.', 'epic', 1000, 5, 'https://cdn.macroactive.com/badges/60day.png'),
('90_day_elite', 'consistency', '90-Day Elite', 'Three months of unstoppable effort.', 'epic', 1500, 6, 'https://cdn.macroactive.com/badges/90day.png'),
('180_day_legend', 'consistency', '180-Day Legend', 'Six months of commitment.', 'legendary', 3000, 7, 'https://cdn.macroactive.com/badges/180day.png'),
('365_day_mythic', 'consistency', '365-Day Mythic', 'An entire year of consistency!', 'legendary', 5000, 8, 'https://cdn.macroactive.com/badges/365day.png');

-- Milestone Badges
INSERT INTO "badges" ("badgeCode", "badgeCategory", "name", "description", "rarity", "points", "displayOrder", "iconUrl") VALUES
('10_workouts', 'milestone', '10 Workouts', 'Completed 10 workouts.', 'common', 50, 20, 'https://cdn.macroactive.com/badges/10workout.png'),
('25_workouts', 'milestone', '25 Workouts', 'Completed 25 workouts.', 'common', 100, 21, 'https://cdn.macroactive.com/badges/25workout.png'),
('50_workouts', 'milestone', '50 Workouts', 'Completed 50 workouts.', 'common', 200, 22, 'https://cdn.macroactive.com/badges/50workout.png'),
('100_workouts', 'milestone', '100 Workouts', 'Century club! 100 workouts completed.', 'rare', 500, 23, 'https://cdn.macroactive.com/badges/100workout.png'),
('250_workouts', 'milestone', '250 Workouts', '250 workouts completed.', 'epic', 1500, 24, 'https://cdn.macroactive.com/badges/250workout.png'),
('500_workouts', 'milestone', '500 Workouts', 'Half a thousand workouts!', 'epic', 2000, 25, 'https://cdn.macroactive.com/badges/500workout.png'),
('1000_workouts', 'milestone', '1000 Workouts', '1000 workouts. You are a machine!', 'legendary', 5000, 26, 'https://cdn.macroactive.com/badges/1000workout.png');

-- Badge Criteria
INSERT INTO "badge_criteria" ("badgeId", "criterionType", "comparisonOperator", "thresholdValue", "streakType")
SELECT "id", 'streak_days', '>=', '3', 'workout' FROM "badges" WHERE "badgeCode" = '3_day_streak';

INSERT INTO "badge_criteria" ("badgeId", "criterionType", "comparisonOperator", "thresholdValue", "streakType")
SELECT "id", 'streak_days', '>=', '7', 'workout' FROM "badges" WHERE "badgeCode" = '7_day_consistency';

INSERT INTO "badge_criteria" ("badgeId", "criterionType", "comparisonOperator", "thresholdValue", "streakType")
SELECT "id", 'streak_days', '>=', '30', 'workout' FROM "badges" WHERE "badgeCode" = '30_day_machine';

INSERT INTO "badge_criteria" ("badgeId", "criterionType", "comparisonOperator", "thresholdValue")
SELECT "id", 'total_workouts', '>=', '100' FROM "badges" WHERE "badgeCode" = '100_workouts';
```

## Running Migrations

```bash
# Create migration
npx prisma migrate dev --name init_streaks_badges

# Deploy to production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database
psql $DATABASE_URL < prisma/seeds/001_badges.sql
```
