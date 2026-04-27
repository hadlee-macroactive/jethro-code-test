-- ============================================
-- STREAK TABLES
-- ============================================

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

CREATE OR REPLACE FUNCTION check_streak_break(p_streak_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_last_activity DATE;
    v_freeze_used BOOLEAN;
BEGIN
    SELECT "lastActivityDate" INTO v_last_activity
    FROM "streaks"
    WHERE "id" = p_streak_id;

    SELECT EXISTS(
        SELECT 1 FROM "streak_freezes"
        WHERE "userId" = (SELECT "userId" FROM "streaks" WHERE "id" = p_streak_id)
        AND "creatorId" = (SELECT "creatorId" FROM "streaks" WHERE "id" = p_streak_id)
        AND "streakType" = (SELECT "streakType" FROM "streaks" WHERE "id" = p_streak_id)
        AND "freezeDate" = CURRENT_DATE
    ) INTO v_freeze_used;

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
