# Event Schema

## 1. Overview

The Streaks & Badges System uses an event-driven architecture. All user actions that may affect streaks or badges emit standardized events.

## 2. Event Format

All events follow a common schema:

```json
{
  "event_id": "evt_abc123xyz456",
  "event_type": "workout.completed",
  "event_version": "1.0",
  "occurred_at": "2026-04-26T10:30:00Z",
  "user_id": 123456,
  "creator_id": 789,
  "source": "mobile_app",
  "source_metadata": {
    "platform": "ios",
    "app_version": "3.2.1"
  },
  "data": { },
  "context": { }
}
```

## 3. Core Event Types

### 3.1 workout.completed

Emitted when a user completes a workout session.

```json
{
  "event_type": "workout.completed",
  "data": {
    "workout_id": "wo_123456",
    "workout_type": "strength",
    "duration_minutes": 45,
    "calories_burned": 320,
    "exercises_completed": 8,
    "total_weight_kg": 2500,
    "completed_at": "2026-04-26T10:30:00Z"
  },
  "context": {
    "program_id": "prog_456",
    "phase": "strength_block_2"
  }
}
```

**Streak Impact:** Increments workout streak if daily threshold met.

### 3.2 workout.logged

Emitted when a workout is manually logged (not completed via app).

```json
{
  "event_type": "workout.logged",
  "data": {
    "workout_date": "2026-04-26",
    "workout_type": "cardio",
    "duration_minutes": 30,
    "notes": "Morning run",
    "verified": false
  }
}
```

**Streak Impact:** Increments workout streak if daily threshold met.

### 3.3 nutrition.logged

Emitted when a user logs a meal or nutrition entry.

```json
{
  "event_type": "nutrition.logged",
  "data": {
    "meal_id": "meal_789",
    "meal_type": "lunch",
    "calories": 650,
    "macros": {
      "protein_g": 45,
      "carbs_g": 60,
      "fat_g": 22
    },
    "logged_at": "2026-04-26T12:30:00Z"
  },
  "context": {
    "meal_plan_id": "plan_123",
    "day_in_plan": 14
  }
}
```

**Streak Impact:** Increments nutrition streak if daily meal threshold met.

### 3.4 habit.completed

Emitted when a user completes a custom habit.

```json
{
  "event_type": "habit.completed",
  "data": {
    "habit_id": "habit_456",
    "habit_name": "Drink 8 glasses of water",
    "habit_category": "wellness",
    "completed_at": "2026-04-26T18:00:00Z",
    "streak_count": 5
  },
  "context": {
    "habit_program_id": "prog_789"
  }
}
```

**Streak Impact:** Increments habit completion streak.

### 3.5 community.post_created

Emitted when a user creates a community post.

```json
{
  "event_type": "community.post_created",
  "data": {
    "post_id": "post_123456",
    "post_type": "text",
    "content_length": 250,
    "has_media": true,
    "created_at": "2026-04-26T14:00:00Z"
  },
  "context": {
    "community_id": "comm_456",
    "thread_id": "thread_789"
  }
}
```

**Streak Impact:** Increments community participation streak.

### 3.6 community.comment_added

Emitted when a user comments on a post.

```json
{
  "event_type": "community.comment_added",
  "data": {
    "comment_id": "comment_789",
    "post_id": "post_123456",
    "comment_length": 85,
    "created_at": "2026-04-26T14:30:00Z"
  },
  "context": {
    "community_id": "comm_456",
    "is_reply": false
  }
}
```

**Streak Impact:** Increments community participation streak.

### 3.7 community.like_given

Emitted when a user likes a post or comment.

```json
{
  "event_type": "community.like_given",
  "data": {
    "target_type": "post",
    "target_id": "post_123456",
    "created_at": "2026-04-26T14:05:00Z"
  }
}
```

**Streak Impact:** Optional - counts if configured by creator.

## 4. System Events

### 4.1 streak.started

Emitted when a new streak begins (after the first qualifying action).

```json
{
  "event_type": "streak.started",
  "data": {
    "streak_id": "str_123456",
    "streak_type": "workout",
    "user_id": 123456,
    "creator_id": 789,
    "start_date": "2026-04-26"
  }
}
```

### 4.2 streak.incremented

Emitted when a streak count increases.

```json
{
  "event_type": "streak.incremented",
  "data": {
    "streak_id": "str_123456",
    "streak_type": "workout",
    "previous_count": 6,
    "new_count": 7,
    "current_milestone": "7-day"
  }
}
```

### 4.3 streak.milestone_achieved

Emitted when a streak reaches a configured milestone.

```json
{
  "event_type": "streak.milestone_achieved",
  "data": {
    "streak_id": "str_123456",
    "streak_type": "workout",
    "milestone_days": 30,
    "current_count": 30,
    "is_longest": true,
    "badge_awarded": {
      "badge_code": "30_day_machine",
      "badge_id": "badge_456"
    }
  }
}
```

### 4.4 streak.broken

Emitted when a streak is broken (no qualifying activity within 24 hours).

```json
{
  "event_type": "streak.broken",
  "data": {
    "streak_id": "str_123456",
    "streak_type": "workout",
    "final_count": 14,
    "last_activity_date": "2026-04-25",
    "broken_date": "2026-04-27",
    "reason": "no_activity_within_window",
    "was_longest": false
  },
  "context": {
    "freeze_was_available": true,
    "freeze_not_used": true
  }
}
```

### 4.5 streak.frozen

Emitted when a streak freeze is activated.

```json
{
  "event_type": "streak.frozen",
  "data": {
    "streak_id": "str_123456",
    "streak_type": "workout",
    "freeze_date": "2026-04-26",
    "streak_count_preserved": 14,
    "freeze_reason": "user_requested",
    "freezes_remaining": 0
  }
}
```

### 4.6 badge.earned

Emitted when a user earns a badge.

```json
{
  "event_type": "badge.earned",
  "data": {
    "badge_id": "badge_789",
    "badge_code": "30_day_machine",
    "badge_category": "consistency",
    "badge_name": "30-Day Machine",
    "user_id": 123456,
    "earned_at": "2026-04-26T10:30:00Z",
    "trigger_event": "streak.milestone_achieved",
    "award_type": "automatic"
  }
}
```

### 4.7 badge.progress_updated

Emitted when progress toward a badge changes.

```json
{
  "event_type": "badge.progress_updated",
  "data": {
    "badge_id": "badge_100",
    "badge_code": "100_workouts",
    "user_id": 123456,
    "previous_progress": 66,
    "new_progress": 67,
    "current_value": 67,
    "target_value": 100
  }
}
```

## 5. Admin Events

### 5.1 badge.manually_awarded

Emitted when a creator manually awards a badge.

```json
{
  "event_type": "badge.manually_awarded",
  "data": {
    "badge_id": "badge_custom1",
    "badge_code": "special_champion",
    "user_id": 123456,
    "awarded_by": "creator_789",
    "awarded_by_name": "John's Fitness",
    "reason": "Completed transformation challenge",
    "awarded_at": "2026-04-26T15:00:00Z"
  }
}
```

### 5.2 streak.config_updated

Emitted when creator updates streak configuration.

```json
{
  "event_type": "streak.config_updated",
  "data": {
    "creator_id": 789,
    "updated_by": "user_123",
    "previous_config": { },
    "new_config": { },
    "changes": ["enabled_nutrition_streak", "changed_freeze_limit"]
  }
}
```

## 6. Event Processing Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ User Action
       ▼
┌─────────────────┐
│ Existing APIs   │
│ (Workout, etc.) │
└──────┬──────────┘
       │ Emit Event
       ▼
┌─────────────────────┐
│  Event Bus (Kafka)  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Streak Consumer    │
│  - Validate event   │
│  - Update streak    │
│  - Check milestones │
└──────┬──────────────┘
       │ Emit: streak.incremented
       │       streak.milestone_achieved
       ▼
┌─────────────────────┐
│  Badge Consumer     │
│  - Check criteria   │
│  - Award badges     │
│  - Update progress  │
└──────┬──────────────┘
       │ Emit: badge.earned
       │       badge.progress_updated
       ▼
┌─────────────────────┐
│ Notification Service│
│  - Send push        │
│  - Trigger webhooks │
└─────────────────────┘
```

## 7. Event Validation Rules

### 7.1 Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| event_id | string | Yes | Unique event identifier (UUID) |
| event_type | string | Yes | Event type identifier |
| event_version | string | Yes | Schema version |
| occurred_at | ISO8601 | Yes | When the event occurred |
| user_id | integer | Yes | User who triggered event |
| creator_id | integer | Yes | Creator context |
| source | string | Yes | Source system |

### 7.2 Validation Checks

- **Timestamp Validation:** Event timestamp must be within 24 hours of receipt
- **User Validation:** User must be active and have an active subscription
- **Creator Validation:** Creator must exist and have features enabled
- **Duplicate Detection:** Events are idempotent based on event_id

### 7.3 Error Handling

| Error | Action |
|-------|--------|
| Invalid schema | Reject event, log error |
| Future timestamp | Reject event |
| Duplicate event_id | Acknowledge, skip processing |
| User not found | Queue for retry (transient error) |

## 8. Event Priority

Events are processed with different priorities:

| Priority | Events | Processing |
|----------|--------|------------|
| High | streak.milestone_achieved, badge.earned | Real-time (< 5 sec) |
| Medium | workout.completed, nutrition.logged | Near real-time (< 1 min) |
| Low | community.*, badge.progress_updated | Batch (< 5 min) |

## 9. Event Retention

| Event Type | Retention | Reason |
|------------|-----------|--------|
| All raw events | 90 days | Compliance, debugging |
| Aggregated metrics | 2 years | Analytics |
| Audit events | 7 years | Legal compliance |

## 10. Testing Events

For testing purposes, a sandbox environment accepts test events:

```http
POST /events/test
```

```json
{
  "event_type": "workout.completed",
  "user_id": 123456,
  "creator_id": 789,
  "data": { },
  "_test": true,
  "_timestamp_override": "2026-04-26T10:30:00Z"
}
```
