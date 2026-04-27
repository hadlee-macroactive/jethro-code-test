# Cron Jobs & Background Processing

## 1. Overview

The Streaks & Badges System relies on scheduled jobs for periodic calculations, data synchronization, and maintenance tasks. Jobs are managed via a cron-style scheduler.

## 2. Job Schedule Overview

| Job | Frequency | Priority | Runtime Target |
|-----|-----------|----------|----------------|
| Daily Streak Reset | Daily 00:00 UTC | High | < 5 min |
| Real-time Streak Update | Every 5 min | High | < 30 sec |
| Batch Streak Evaluation | Hourly | Medium | < 10 min |
| Badge Progress Update | Every 15 min | Medium | < 5 min |
| Leaderboard Refresh | Every 30 min | Medium | < 5 min |
| Streak At-Risk Check | Every 2 hours | High | < 2 min |
| Notification Queue | Every 1 min | High | < 30 sec |
| Data Warehouse Sync | Hourly | Low | < 15 min |
| Event Archive | Daily 02:00 UTC | Low | < 30 min |
| Streak Freeze Reset | Daily 00:00 UTC | Medium | < 2 min |

## 3. Job Definitions

### 3.1 Daily Streak Reset

**Schedule:** `0 0 * * *` (Daily at midnight UTC)

**Description:** Identifies streaks that should be broken due to inactivity.

**Logic:**
```sql
-- Find users with activity yesterday but not today
-- Check if freeze was used
-- Break streak if no freeze and no activity

UPDATE streaks
SET is_active = FALSE,
    updated_at = NOW()
WHERE is_active = TRUE
  AND last_activity_date < CURRENT_DATE
  AND NOT EXISTS (
    SELECT 1 FROM streak_freezes
    WHERE user_id = streaks.user_id
      AND creator_id = streaks.creator_id
      AND streak_type = streaks.streak_type
      AND freeze_date = CURRENT_DATE
  );
```

**Side Effects:**
- Emits `streak.broken` events
- Triggers encouragement notifications
- Updates streak_history table

**Retry Policy:** 3 retries with exponential backoff

**Failure Handling:** Alert on failure, manual retry required

---

### 3.2 Real-time Streak Update

**Schedule:** `*/5 * * * *` (Every 5 minutes)

**Description:** Processes recent events for high-priority users (recently active, near milestones).

**Logic:**
```javascript
// Users who had activity in last 24 hours
// OR users within 2 days of a milestone
const targetUsers = await db.query(`
  SELECT DISTINCT user_id, creator_id
  FROM streak_events
  WHERE event_date >= CURRENT_DATE - INTERVAL '1 day'
     OR EXISTS (
       SELECT 1 FROM streaks s
       WHERE s.user_id = streak_events.user_id
         AND s.next_milestone - s.current_streak_count <= 2
     )
`);

// Process streak updates for these users
await processStreakUpdates(targetUsers);
```

**Side Effects:**
- Updates streak counts
- Emits milestone events
- Triggers badge evaluations

**Retry Policy:** Continue on failure, log errors

---

### 3.3 Batch Streak Evaluation

**Schedule:** `0 * * * *` (Hourly)

**Description:** Processes all pending events in batch for all users.

**Logic:**
```javascript
const unprocessedEvents = await eventQueue.fetchAll();
await processInBatches(unprocessedEvents, 100);
```

**Side Effects:**
- All streaks brought up to date
- Badge progress updated
- Leaderboard data refreshed

**Retry Policy:** Continue on failure, individual event errors logged

---

### 3.4 Badge Progress Update

**Schedule:** `*/15 * * * *` (Every 15 minutes)

**Description:** Recalculates progress for in-progress badges.

**Logic:**
```sql
-- Update progress for all users with in-progress badges
REFRESH MATERIALIZED VIEW CONCURRENTLY badge_progress_mv;
```

**Side Effects:**
- badge_progress table updated
- Progress change events emitted

**Retry Policy:** Skip on failure, next run will retry

---

### 3.5 Leaderboard Refresh

**Schedule:** `*/30 * * * *` (Every 30 minutes)

**Description:** Recalculates and caches leaderboard rankings.

**Logic:**
```sql
-- Weekly workout leaderboard
INSERT INTO leaderboards (creator_id, leaderboard_type, period_start, period_end, entries)
SELECT
    creator_id,
    'weekly_workout',
    date_trunc('week', CURRENT_DATE),
    date_trunc('week', CURRENT_DATE) + INTERVAL '6 days',
    jsonb_agg(
        jsonb_build_object(
            'user_id', se.user_id,
            'score', COUNT(*),
            'display_name', COALESCE(u.display_name, 'Anonymous')
        ) ORDER BY COUNT(*) DESC
    ) LIMIT 1000
FROM streak_events se
JOIN users u ON u.id = se.user_id
WHERE se.event_date >= date_trunc('week', CURRENT_DATE)
  AND se.streak_type = 'workout'
GROUP BY creator_id
ON CONFLICT (creator_id, leaderboard_type, period_start)
DO UPDATE SET entries = EXCLUDED.entries, last_refreshed = NOW();
```

**Side Effects:**
- Leaderboard cache updated
- Rank change events emitted for top movers

**Retry Policy:** Retry once on failure

---

### 3.6 Streak At-Risk Check

**Schedule:** `0 */2 * * *` (Every 2 hours)

**Description:** Identifies users at risk of losing their streak and sends reminders.

**Logic:**
```javascript
// Streaks with last activity 18+ hours ago
// No freeze available or already used
const atRiskUsers = await db.query(`
  SELECT s.*, u.timezone, u.notification_settings
  FROM streaks s
  JOIN users u ON u.id = s.user_id
  WHERE s.is_active = TRUE
    AND s.last_activity_date < CURRENT_TIMESTAMP - INTERVAL '18 hours'
    AND s.freeze_available = FALSE
    AND s.current_streak_count >= 3
`);

for (const user of atRiskUsers) {
  await notificationService.sendStreakAtRisk(user);
}
```

**Side Effects:**
- Push notifications sent
- In-app notifications created

**Retry Policy:** Retry once, then skip

---

### 3.7 Notification Queue Processor

**Schedule:** `* * * * *` (Every minute)

**Description:** Processes queued notifications for delivery.

**Logic:**
```javascript
const notifications = await notificationQueue.fetch(100);
for (const notification of notifications) {
  await pushService.send(notification);
  await notificationQueue.markDelivered(notification.id);
}
```

**Side Effects:**
- Push notifications delivered
- Delivery status updated
- Failed notifications queued for retry

**Retry Policy:** 3 retries with backoff, then dead letter queue

---

### 3.8 Data Warehouse Sync

**Schedule:** `0 * * * *` (Hourly)

**Description:** Syncs aggregated data to the data warehouse for analytics.

**Logic:**
```javascript
const hourlyStats = await db.query(`
  SELECT
    creator_id,
    COUNT(DISTINCT user_id) as active_users,
    SUM(current_streak_count) as total_streak_days,
    COUNT(*) FILTER (WHERE current_streak_count >= 30) as thirty_day_streaks
  FROM streaks
  WHERE is_active = TRUE
  GROUP BY creator_id
`);

await dataWarehouse.upsert('hourly_streak_metrics', hourlyStats);
```

**Side Effects:**
- Analytics data updated
- Retention metrics calculated

**Retry Policy:** Retry next hour on failure

---

### 3.9 Event Archive

**Schedule:** `0 2 * * *` (Daily at 2 AM UTC)

**Description:** Archives old events to cold storage.

**Logic:**
```javascript
// Move events older than 90 days to archive
await archiveEvents('streak_events', 90);
await archiveEvents('badge_events', 90);
```

**Side Effects:**
- Old events moved to archival storage
- Primary tables reduced in size

**Retry Policy:** Retry next day on failure

---

### 3.10 Streak Freeze Reset

**Schedule:** `0 0 * * *` (Daily at midnight UTC)

**Description:** Resets freeze availability based on configured period.

**Logic:**
```sql
-- Reset freezes for users whose period has elapsed
UPDATE streaks s
SET freeze_available = TRUE,
    freeze_used_count = 0,
    metadata = jsonb_set(
        s.metadata,
        '{freeze_history}',
        (s.metadata->'freeze_history') || jsonb_build_array(
            jsonb_build_object(
                'reset_date', CURRENT_DATE,
                'previous_used_count', s.freeze_used_count
            )
        )
    )
FROM creator_configuration cc
WHERE s.creator_id = cc.creator_id
  AND s.freeze_available = FALSE
  AND EXTRACT(DAY FROM AGE(CURRENT_DATE, s.freeze_last_used)) >=
      (cc.streak_settings->'freeze_settings'->>'period_days')::INTEGER;
```

**Side Effects:**
- Freeze availability reset
- Users notified of available freeze

**Retry Policy:** 3 retries

---

## 4. Job Monitoring

### 4.1 Metrics to Track

| Job | Success Rate | Runtime | Error Count |
|-----|--------------|---------|-------------|
| All Jobs | >99.9% | < SLA | <1% |

### 4.2 Health Checks

Each job emits a heartbeat event:

```json
{
  "job_name": "daily_streak_reset",
  "status": "completed",
  "started_at": "2026-04-26T00:00:00Z",
  "completed_at": "2026-04-26T00:04:32Z",
  "records_processed": 15432,
  "errors": 0
}
```

### 4.3 Alerting Rules

| Condition | Severity | Action |
|-----------|----------|--------|
| Job runtime > 2x SLA | Warning | Notify team |
| Job failure rate > 5% | Critical | Page on-call |
| Job missed schedule | Critical | Page on-call |
| Queue depth > threshold | Warning | Notify team |

## 5. Job Dependencies

```
┌─────────────────┐
│ Notification    │
│ Queue (1 min)   │─────┐
└─────────────────┘     │
                        ├───> Push Notifications
┌─────────────────┐     │
│ Real-time       │     │
│ Streak (5 min)  │─────┤
└─────────────────┘     │
                        ├───> Database Updates
┌─────────────────┐     │
│ Batch Streak    │     │
│ (hourly)        │─────┤
└─────────────────┘     │
                        ├───> Badge Evaluation
┌─────────────────┐     │
│ Badge Progress  │     │
│ (15 min)        │─────┤
└─────────────────┘     │
                        │
┌─────────────────┐     │
│ At-Risk Check   │     │
│ (2 hours)       │─────┘
└─────────────────┘
```

## 6. Failure Recovery

### 6.1 Retry Strategies

| Job Type | Retry Strategy | Max Retries |
|----------|----------------|-------------|
| Critical | Exponential backoff | 5 |
| Important | Fixed delay | 3 |
| Maintenance | Next scheduled run | 1 |

### 6.2 Dead Letter Queue

Failed events are sent to DLQ for manual inspection:

```sql
CREATE TABLE job_failure_log (
    id BIGSERIAL PRIMARY KEY,
    job_name VARCHAR(100),
    payload JSONB,
    error_message TEXT,
    failed_at TIMESTAMP,
    retry_count INTEGER,
    last_retry_at TIMESTAMP
);
```

## 7. Scaling Considerations

### 7.1 Horizontal Scaling

Jobs can run across multiple workers:

- Use database locks for single-instance jobs
- Use sharding for user-scoped jobs
- Use message queues for distributed processing

### 7.2 Load Distribution

```javascript
// Shard users by user_id for parallel processing
const shard = user_id % WORKER_COUNT;
if (shard === CURRENT_WORKER_ID) {
  processUser(user_id);
}
```

## 8. Maintenance Windows

| Time Window (UTC) | Activity |
|-------------------|----------|
| 00:00 - 00:10 | Daily resets (high load) |
| 02:00 - 03:00 | Archiving (low priority) |
| Other times | Normal operations |

Avoid deployments during:
- 00:00-00:10 UTC (daily reset)
- 23:50-00:10 UTC (reset preparation)
