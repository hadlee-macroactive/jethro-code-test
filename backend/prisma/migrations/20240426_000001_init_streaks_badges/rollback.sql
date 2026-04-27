-- Drop in reverse order of creation

DROP VIEW IF EXISTS user_badge_summary;
DROP VIEW IF EXISTS active_streaks_summary;

DROP FUNCTION IF EXISTS check_streak_break(p_streak_id UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();

DROP TRIGGER IF EXISTS update_streaks_updated_at ON "streaks";
DROP TRIGGER IF EXISTS update_badges_updated_at ON "badges";
DROP TRIGGER IF EXISTS update_creator_configurations_updated_at ON "creator_configurations";

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
