# API Specification

## 1. Overview

The Streaks & Badges System exposes RESTful APIs for client applications and creator tools. All APIs follow standard HTTP conventions and return JSON responses.

## 2. Base URL

```
Production:  https://api.macroactive.com/v1
Staging:     https://api-staging.macroactive.com/v1
Development: http://localhost:3000/v1
```

## 3. Authentication

All API requests require authentication via JWT tokens.

```http
Authorization: Bearer <token>
```

## 4. Response Format

### Success Response

```json
{
  "success": true,
  "data": { },
  "meta": {
    "timestamp": "2026-04-26T00:00:00Z",
    "request_id": "req_abc123"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "STREAK_NOT_FOUND",
    "message": "Streak not found for the specified user",
    "details": { }
  }
}
```

## 5. Streak Endpoints

### 5.1 Get User Streaks

Retrieves all active streaks for a user.

```http
GET /streaks/users/{userId}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | integer | Yes | User ID |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| include_history | boolean | No | Include streak history (default: false) |
| include_badges | boolean | No | Include earned badges (default: false) |

**Response:**
```json
{
  "success": true,
  "data": {
    "streaks": [
      {
        "id": "str_123456",
        "type": "workout",
        "current_count": 14,
        "longest_count": 30,
        "last_activity_date": "2026-04-26",
        "started_date": "2026-04-12",
        "is_active": true,
        "next_milestone": 30,
        "milestone_progress": 47,
        "freeze_available": true,
        "freeze_used_count": 0,
        "freeze_reset_date": "2026-05-12"
      }
    ],
    "summary": {
      "total_active_streaks": 3,
      "longest_overall": 45,
      "badges_earned": 12
    }
  }
}
```

### 5.2 Get Streak History

```http
GET /streaks/users/{userId}/history
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| streak_type | string | No | Filter by streak type |
| limit | integer | No | Results per page (default: 20, max: 100) |
| offset | integer | No | Pagination offset |

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "event_type": "milestone",
        "previous_count": 6,
        "new_count": 7,
        "milestone_achieved": 7,
        "created_at": "2026-04-26T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 156,
      "limit": 20,
      "offset": 0
    }
  }
}
```

### 5.3 Activate Streak Freeze

```http
POST /streaks/users/{userId}/freeze
```

**Request Body:**
```json
{
  "streak_type": "workout",
  "reason": "Taking a rest day"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "freeze_activated": true,
    "freeze_date": "2026-04-26",
    "streak_count_preserved": 14,
    "next_freeze_available": "2026-05-26"
  }
}
```

### 5.4 Get Leaderboard

```http
GET /streaks/leaderboards/{leaderboardType}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| leaderboardType | string | weekly_workout, monthly_streak, volume, challenge |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| period_start | date | No | Start date filter |
| creator_id | integer | No | Filter by creator |
| limit | integer | No | Results (default: 50, max: 100) |

**Response:**
```json
{
  "success": true,
  "data": {
    "leaderboard_type": "weekly_workout",
    "period_start": "2026-04-20",
    "period_end": "2026-04-26",
    "entries": [
      {
        "rank": 1,
        "user_id": 123456,
        "display_name": "FitnessMaster",
        "score": 7,
        "is_anonymous": false,
        "badges": ["30-day-machine", "workout-warrior"]
      }
    ],
    "current_user": {
      "rank": 45,
      "score": 3,
      "percentile": 85
    }
  }
}
```

## 6. Badge Endpoints

### 6.1 Get User Badges

```http
GET /badges/users/{userId}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| include_progress | boolean | No | Include in-progress badges |
| category | string | No | Filter by category |

**Response:**
```json
{
  "success": true,
  "data": {
    "earned": [
      {
        "id": "badge_789",
        "code": "30_day_machine",
        "category": "consistency",
        "name": "30-Day Machine",
        "description": "Completed 30 consecutive days of workouts",
        "icon_url": "https://cdn.macroactive.com/badges/30day.png",
        "rarity": "rare",
        "points": 500,
        "awarded_at": "2026-04-26T10:30:00Z",
        "display_priority": 10
      }
    ],
    "in_progress": [
      {
        "id": "badge_100",
        "code": "100_workouts",
        "name": "100 Workouts",
        "progress_percentage": 67,
        "current_value": 67,
        "target_value": 100
      }
    ],
    "summary": {
      "total_badges": 12,
      "total_points": 3500,
      "rarest_badge": "legendary"
    }
  }
}
```

### 6.2 Get Badge Catalog

```http
GET /badges/catalog
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter by category |
| creator_id | integer | No | Creator-specific badges |

**Response:**
```json
{
  "success": true,
  "data": {
    "badges": [
      {
        "id": "badge_789",
        "code": "30_day_machine",
        "category": "consistency",
        "name": "30-Day Machine",
        "description": "Completed 30 consecutive days",
        "icon_url": "https://cdn.macroactive.com/badges/30day.png",
        "rarity": "rare",
        "points": 500,
        "criteria": [
          {
            "type": "streak_days",
            "operator": ">=",
            "threshold": 30,
            "streak_type": "workout"
          }
        ],
        "available": true,
        "locked": false
      }
    ]
  }
}
```

### 6.3 Get Badge Progress

```http
GET /badges/users/{userId}/progress/{badgeCode}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "badge": {
      "code": "100_workouts",
      "name": "100 Workouts",
      "icon_url": "https://cdn.macroactive.com/badges/100workout.png"
    },
    "progress": {
      "percentage": 67,
      "current_value": 67,
      "target_value": 100,
      "estimated_completion": "2026-05-15"
    },
    "next_milestone": {
      "value": 75,
      "reward": "bronze_milestone_badge"
    }
  }
}
```

## 7. Creator Configuration Endpoints

### 7.1 Get Creator Configuration

```http
GET /config/creators/{creatorId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "streak_settings": {
      "enabled_streak_types": ["workout", "nutrition"],
      "workout": {
        "enabled": true,
        "minimum_per_day": 1
      },
      "freeze_settings": {
        "freezes_per_period": 1,
        "period_days": 30
      },
      "milestones": {
        "enabled": [7, 14, 30, 60, 90]
      }
    },
    "badge_settings": {
      "enabled_categories": ["consistency", "milestone"],
      "auto_award_enabled": true
    },
    "feature_flags": {
      "leaderboards_enabled": true,
      "beta_features": false
    }
  }
}
```

### 7.2 Update Streak Configuration

```http
PUT /config/creators/{creatorId}/streaks
```

**Request Body:**
```json
{
  "enabled_streak_types": ["workout", "nutrition", "habit"],
  "workout": {
    "enabled": true,
    "minimum_per_day": 1
  },
  "nutrition": {
    "enabled": true,
    "minimum_meals_per_day": 2
  },
  "freeze_settings": {
    "freezes_per_period": 2,
    "period_days": 30
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "configuration_updated": true,
    "effective_at": "2026-04-26T12:00:00Z"
  }
}
```

### 7.3 Update Badge Configuration

```http
PUT /config/creators/{creatorId}/badges
```

**Request Body:**
```json
{
  "enabled_categories": ["consistency", "milestone", "challenge"],
  "custom_badges": [
    {
      "name": "Creator Champion",
      "description": "Completed my exclusive 30-day challenge",
      "icon_url": "https://cdn.macroactive.com/badges/custom/champion.png",
      "criteria": {
        "type": "challenge_completion",
        "challenge_id": "chal_123"
      }
    }
  ],
  "auto_award_enabled": true
}
```

### 7.4 Manual Badge Award

```http
POST /badges/users/{userId}/award
```

**Request Body:**
```json
{
  "badge_code": "special_achievement",
  "reason": "Completed transformation challenge with amazing results",
  "notify_user": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "badge_awarded": true,
    "badge": {
      "code": "special_achievement",
      "name": "Special Achievement"
    },
    "notification_sent": true
  }
}
```

### 7.5 Get Creator Analytics

```http
GET /config/creators/{creatorId}/analytics
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| period_start | date | No | Start date |
| period_end | date | No | End date |

**Response:**
```json
{
  "success": true,
  "data": {
    "streak_metrics": {
      "total_active_streaks": 1234,
      "average_streak_length": 18.5,
      "streak_distribution": {
        "1-7_days": 450,
        "8-30_days": 512,
        "31-90_days": 220,
        "90+_days": 52
      }
    },
    "badge_metrics": {
      "total_badges_earned": 3456,
      "most_common_badge": "7_day_consistency",
      "completion_rate_by_badge": {
        "7_day_streak": 0.45,
        "30_day_streak": 0.12
      }
    },
    "retention_impact": {
      "day_7_retention": 0.72,
      "day_30_retention": 0.45,
      "churn_reduction": 0.08
    }
  }
}
```

## 8. Webhook Endpoints

### 8.1 Register Webhook

```http
POST /webhooks
```

**Request Body:**
```json
{
  "url": "https://creator-webhook.example.com/streaks",
  "events": ["streak.milestone", "badge.earned", "streak.broken"],
  "secret": "webhook_secret_key"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "webhook_id": "wh_123456",
    "status": "active"
  }
}
```

## 9. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| STREAK_NOT_FOUND | 404 | Streak not found |
| STREAK_EXPIRED | 410 | Streak has expired |
| FREEZE_UNAVAILABLE | 400 | No freeze available |
| BADGE_NOT_FOUND | 404 | Badge not found |
| ALREADY_EARNED | 409 | Badge already earned |
| INVALID_CRITERIA | 400 | Badge criteria invalid |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Access denied |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

## 10. Rate Limiting

| Tier | Limit | Window |
|------|-------|--------|
| Free | 100 requests/hour | Hour |
| Pro | 1,000 requests/hour | Hour |
| Enterprise | 10,000 requests/hour | Hour |

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1714395600
```
