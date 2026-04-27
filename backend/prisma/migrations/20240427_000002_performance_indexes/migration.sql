-- Partial indexes for better performance

CREATE INDEX "idx_streaks_active_lastActivity" ON "streaks"("lastActivityDate")
WHERE "isActive" = true;

CREATE INDEX "idx_streaks_at_risk" ON "streaks"("userId", "lastActivityDate")
WHERE "isActive" = true;

CREATE INDEX "idx_streaks_user_creator_covering" ON "streaks"(
    "userId", "creatorId", "streakType", "currentCount", "lastActivityDate", "isActive"
);

CREATE INDEX "idx_badge_progress_completion" ON "badge_progress"("userId", "progressPercentage")
WHERE "progressPercentage" < 100;

CREATE INDEX "idx_user_badges_leaderboard" ON "user_badges"("creatorId", "awardedAt" DESC, "badgeId")
WHERE "isDisplayed" = true;

CREATE INDEX "idx_streak_events_partition" ON "streak_events"("eventDate", "qualified");
