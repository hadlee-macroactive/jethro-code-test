# Database Schema

## 1. Overview

The database schema follows a relational design with PostgreSQL as the primary database. The schema supports streak tracking, badge management, event logging, and creator configuration.

## 2. Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│   users     │───────│  streaks    │───────│streak_events │
│             │  1:N  │             │  1:N  │              │
│ (existing)  │       │             │       │              │
└─────────────┘       └─────────────┘       └──────────────┘
       │                     │
       │ 1:N                 │ 1:1
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│ user_badges │       │streak_freeze│
│             │       │             │
└──────┬──────┘       └─────────────┘
       │
       │ N:1
       ▼
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   badges    │───────│badge_criteria│       │creator_conf │
│             │  1:N  │              │  1:N  │  iguration  │
└─────────────┘       └──────────────┘       └─────────────┘
                                                     │
                                                     │ N:1
                                                     ▼
                                            ┌─────────────┐
                                            │  creators   │
                                            │             │
                                            │ (existing)  │
                                            └─────────────┘
```

## 3. Table Definitions

### 3.1 streaks

Stores the current active streak for each user and streak type.

```sql
CREATE TABLE streaks (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL,
    creator_id              BIGINT NOT NULL,
    streak_type             VARCHAR(50) NOT NULL, -- 'workout', 'nutrition', 'habit', 'community'
    current_streak_count    INTEGER NOT NULL DEFAULT 0,
    longest_streak_count    INTEGER NOT NULL DEFAULT 0,
    last_activity_date      DATE NOT NULL,
    streak_start_date       DATE NOT NULL,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    next_milestone          INTEGER,
    milestone_progress      INTEGER NOT NULL DEFAULT 0,
    freeze_available        BOOLEAN NOT NULL DEFAULT TRUE,
    freeze_used_count       INTEGER NOT NULL DEFAULT 0,
    freeze_last_used        TIMESTAMP,
    metadata                JSONB DEFAULT '{}',
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_streaks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_streaks_creator FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_creator_type UNIQUE (user_id, creator_id, streak_type),
    CONSTRAINT chk_streak_type CHECK (streak_type IN ('workout', 'nutrition', 'habit', 'community'))
);

CREATE INDEX idx_streaks_user_id ON streaks(user_id);
CREATE INDEX idx_streaks_creator_id ON streaks(creator_id);
CREATE INDEX idx_streaks_active ON streaks(creator_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_streaks_last_activity ON streaks(last_activity_date);
```

### 3.2 streak_history

Historical log of streak changes for analytics and rollback capabilities.

```sql
CREATE TABLE streak_history (
    id                      BIGSERIAL PRIMARY KEY,
    streak_id               BIGINT NOT NULL,
    user_id                 BIGINT NOT NULL,
    creator_id              BIGINT NOT NULL,
    streak_type             VARCHAR(50) NOT NULL,
    event_type              VARCHAR(50) NOT NULL, -- 'started', 'incremented', 'broken', 'frozen', 'milestone'
    previous_count          INTEGER,
    new_count               INTEGER,
    milestone_achieved      INTEGER,
    reason                  TEXT,
    snapshot                JSONB,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_streak_history_streak FOREIGN KEY (streak_id) REFERENCES streaks(id) ON DELETE CASCADE,
    CONSTRAINT fk_streak_history_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_streak_event_type CHECK (event_type IN ('started', 'incremented', 'broken', 'frozen', 'milestone'))
);

CREATE INDEX idx_streak_history_streak_id ON streak_history(streak_id);
CREATE INDEX idx_streak_history_user_id ON streak_history(user_id);
CREATE INDEX idx_streak_history_created_at ON streak_history(created_at DESC);
```

### 3.3 streak_events

Daily tracking of activities that contribute to streaks.

```sql
CREATE TABLE streak_events (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL,
    creator_id              BIGINT NOT NULL,
    streak_type             VARCHAR(50) NOT NULL,
    event_date              DATE NOT NULL,
    activity_count          INTEGER NOT NULL DEFAULT 1,
    qualified               BOOLEAN NOT NULL DEFAULT TRUE,
    event_source            VARCHAR(100), -- Source system/event type
    source_event_id         VARCHAR(255), -- ID of source event
    metadata                JSONB DEFAULT '{}',
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_streak_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_streak_events_creator FOREIGN KEY (creator_id) REFERENCES creators(id),
    CONSTRAINT uq_streak_event UNIQUE (user_id, creator_id, streak_type, event_date, source_event_id)
);

CREATE INDEX idx_streak_events_user_date ON streak_events(user_id, event_date DESC);
CREATE INDEX idx_streak_events_creator_date ON streak_events(creator_id, event_date DESC);
CREATE INDEX idx_streak_events_qualified ON streak_events(qualified) WHERE qualified = TRUE;
```

### 3.4 streak_freezes

Records of streak freeze usage.

```sql
CREATE TABLE streak_freezes (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL,
    creator_id              BIGINT NOT NULL,
    streak_type             VARCHAR(50) NOT NULL,
    freeze_date             DATE NOT NULL,
    streak_count_at_freeze  INTEGER NOT NULL,
    reason                  VARCHAR(255),
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_streak_freezes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_streak_freezes_creator FOREIGN KEY (creator_id) REFERENCES creators(id)
);

CREATE INDEX idx_streak_freezes_user ON streak_freezes(user_id, freeze_date DESC);
CREATE INDEX idx_streak_freezes_creator ON streak_freezes(creator_id, freeze_date DESC);
```

### 3.5 badges

Badge catalog - all available badges in the system.

```sql
CREATE TABLE badges (
    id                      BIGSERIAL PRIMARY KEY,
    badge_code              VARCHAR(100) NOT NULL UNIQUE,
    badge_category          VARCHAR(50) NOT NULL, -- 'consistency', 'milestone', 'challenge', 'certification', 'community'
    name                    VARCHAR(255) NOT NULL,
    description             TEXT,
    icon_url                VARCHAR(500),
    rarity                  VARCHAR(20) NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    points                  INTEGER NOT NULL DEFAULT 0,
    display_order           INTEGER NOT NULL DEFAULT 0,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    is_creator_customizable BOOLEAN NOT NULL DEFAULT FALSE,
    required_badge_id       BIGINT, -- For progressive badges
    metadata                JSONB DEFAULT '{}',
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_badge_prerequisite FOREIGN KEY (required_badge_id) REFERENCES badges(id),
    CONSTRAINT chk_badge_rarity CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'))
);

CREATE INDEX idx_badges_category ON badges(badge_category);
CREATE INDEX idx_badges_active ON badges(is_active) WHERE is_active = TRUE;
```

### 3.6 badge_criteria

Criteria for earning badges (dynamic configuration).

```sql
CREATE TABLE badge_criteria (
    id                      BIGSERIAL PRIMARY KEY,
    badge_id                BIGINT NOT NULL,
    criterion_type          VARCHAR(50) NOT NULL, -- 'streak_days', 'workouts_count', 'weight_lifted', etc.
    comparison_operator     VARCHAR(10) NOT NULL, -- '>=', '=', '<=', etc.
    threshold_value         NUMERIC NOT NULL,
    time_period_days        INTEGER, -- NULL = all time
    streak_type             VARCHAR(50), -- For streak-based criteria
    is_required             BOOLEAN NOT NULL DEFAULT TRUE,
    metadata                JSONB DEFAULT '{}',
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_badge_criteria_badge FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

CREATE INDEX idx_badge_criteria_badge_id ON badge_criteria(badge_id);
```

### 3.7 user_badges

Records of badges awarded to users.

```sql
CREATE TABLE user_badges (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL,
    badge_id                BIGINT NOT NULL,
    creator_id              BIGINT NOT NULL,
    awarded_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    awarded_by              VARCHAR(100) DEFAULT 'system', -- 'system' or user ID for manual awards
    award_reason            TEXT,
    progress_percentage     INTEGER DEFAULT 100,
    is_displayed            BOOLEAN NOT NULL DEFAULT TRUE,
    display_priority        INTEGER NOT NULL DEFAULT 0,
    metadata                JSONB DEFAULT '{}',

    CONSTRAINT fk_user_badges_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_badges_badge FOREIGN KEY (badge_id) REFERENCES badges(id),
    CONSTRAINT fk_user_badges_creator FOREIGN KEY (creator_id) REFERENCES creators(id),
    CONSTRAINT uq_user_badge UNIQUE (user_id, badge_id, creator_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id, awarded_at DESC);
CREATE INDEX idx_user_badges_creator_id ON user_badges(creator_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
```

### 3.8 badge_progress

Tracks progress toward incomplete badges.

```sql
CREATE TABLE badge_progress (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL,
    badge_id                BIGINT NOT NULL,
    creator_id              BIGINT NOT NULL,
    progress_percentage     INTEGER NOT NULL DEFAULT 0,
    current_value           NUMERIC NOT NULL DEFAULT 0,
    target_value            NUMERIC NOT NULL,
    last_updated            TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_badge_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_badge_progress_badge FOREIGN KEY (badge_id) REFERENCES badges(id),
    CONSTRAINT fk_badge_progress_creator FOREIGN KEY (creator_id) REFERENCES creators(id),
    CONSTRAINT uq_badge_progress UNIQUE (user_id, badge_id, creator_id)
);

CREATE INDEX idx_badge_progress_user ON badge_progress(user_id, progress_percentage DESC);
```

### 3.9 creator_configuration

Creator-specific settings for streaks and badges.

```sql
CREATE TABLE creator_configuration (
    id                      BIGSERIAL PRIMARY KEY,
    creator_id              BIGINT NOT NULL UNIQUE,
    streak_settings         JSONB NOT NULL DEFAULT '{}',
    badge_settings          JSONB NOT NULL DEFAULT '{}',
    leaderboard_settings    JSONB NOT NULL DEFAULT '{}',
    notification_settings   JSONB NOT NULL DEFAULT '{}',
    feature_flags           JSONB NOT NULL DEFAULT '{}',
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_creator_config_creator FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE
);
```

### 3.10 leaderboards

Leaderboard entries (cached, periodically refreshed).

```sql
CREATE TABLE leaderboards (
    id                      BIGSERIAL PRIMARY KEY,
    creator_id              BIGINT NOT NULL,
    leaderboard_type        VARCHAR(50) NOT NULL, -- 'weekly_workout', 'monthly_streak', 'volume', 'challenge'
    period_start            DATE NOT NULL,
    period_end              DATE NOT NULL,
    entries                 JSONB NOT NULL DEFAULT '[]', -- Top 1000 entries
    last_refreshed          TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_leaderboards_creator FOREIGN KEY (creator_id) REFERENCES creators(id),
    CONSTRAINT chk_leaderboard_type CHECK (leaderboard_type IN ('weekly_workout', 'monthly_streak', 'volume', 'challenge'))
);

CREATE INDEX idx_leaderboards_creator_period ON leaderboards(creator_id, leaderboard_type, period_start DESC);
```

### 3.11 leaderboard_entries

Individual leaderboard entry history.

```sql
CREATE TABLE leaderboard_entries (
    id                      BIGSERIAL PRIMARY KEY,
    leaderboard_id          BIGINT NOT NULL,
    user_id                 BIGINT NOT NULL,
    rank                    INTEGER NOT NULL,
    score                   NUMERIC NOT NULL,
    display_name            VARCHAR(255), -- Anonymized if set
    is_anonymous            BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_leaderboard_entries_leaderboard FOREIGN KEY (leaderboard_id) REFERENCES leaderboards(id) ON DELETE CASCADE,
    CONSTRAINT fk_leaderboard_entries_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_leaderboard_entries_user ON leaderboard_entries(user_id);
```

## 4. JSONB Schema Details

### 4.1 creator_configuration.streak_settings

```json
{
  "enabled_streak_types": ["workout", "nutrition", "habit", "community"],
  "workout": {
    "enabled": true,
    "minimum_per_day": 1,
    "qualification_window_hours": 24
  },
  "nutrition": {
    "enabled": true,
    "minimum_meals_per_day": 2
  },
  "habit": {
    "enabled": true,
    "minimum_habits_per_day": 1
  },
  "community": {
    "enabled": true,
    "minimum_actions_per_day": 1,
    "actions": ["post", "comment", "like"]
  },
  "freeze_settings": {
    "freezes_per_period": 1,
    "period_days": 30,
    "auto_freeze_enabled": false
  },
  "milestones": {
    "enabled": [3, 7, 14, 30, 60, 90, 180, 365],
    "celebrations_enabled": true
  }
}
```

### 4.2 creator_configuration.badge_settings

```json
{
  "enabled_categories": ["consistency", "milestone", "challenge", "certification", "community"],
  "custom_badges": [],
  "display_settings": {
    "show_on_profile": true,
    "show_in_community": true,
    "show_rare_first": true
  },
  "auto_award_enabled": true
}
```

### 4.3 creator_configuration.notification_settings

```json
{
  "streak_at_risk": {
    "enabled": true,
    "hours_before_expiry": 6,
    "timezone_aware": true
  },
  "streak_milestone": {
    "enabled": true,
    "milestones": [7, 14, 30, 60, 90]
  },
  "badge_earned": {
    "enabled": true,
    "include_animation": true
  },
  "streak_broken": {
    "enabled": true,
    "encouragement_enabled": true
  }
}
```

## 5. Migration Strategy

### 5.1 Migration Order

1. Create new tables (no dependencies on existing schema)
2. Create indexes after data migration
3. Add foreign key constraints
4. Backfill any initial data
5. Update application code
6. Remove any deprecated columns/tables

### 5.2 Rollback Plan

Each migration includes a rollback script. All migrations are reversible unless explicitly marked as one-way.

### 5.3 Zero-Downtime Strategy

- Use expand/contract pattern for schema changes
- Create new tables before dropping old ones
- Run migrations during low-traffic periods
- Use feature flags to control new code activation

## 6. Data Retention

| Table | Retention Policy |
|-------|------------------|
| streak_history | 2 years |
| streak_events | 1 year (aggregate after) |
| leaderboard_entries | 6 months |
| user_badges | Forever (permanent record) |

## 7. Database Size Estimates

| Table | Estimated Rows (Year 1) | Size |
|-------|------------------------|------|
| streaks | 500,000 | 200 MB |
| streak_history | 10M | 2 GB |
| streak_events | 50M | 5 GB |
| badges | 100 | <1 MB |
| badge_criteria | 500 | <1 MB |
| user_badges | 5M | 500 MB |
| badge_progress | 10M | 1 GB |
| leaderboards | 100,000 | 50 MB |

**Total Estimated Storage (Year 1): ~9 GB**
