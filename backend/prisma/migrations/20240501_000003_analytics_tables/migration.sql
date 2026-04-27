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
