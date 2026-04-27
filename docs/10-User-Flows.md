# User Flows

## 1. Overview

This document defines the key user journeys for the Streaks & Badges System, including state diagrams and interaction flows.

## 2. User Personas

### 2.1 End User (Fitness App Subscriber)

**Name:** Sarah
**Goals:**
- Stay motivated to exercise regularly
- See progress over time
- Compete with others (optional)
- Earn recognition for consistency

**Behaviors:**
- Checks app daily for workouts
- Posts progress in community
- Responds to notifications
- Competitively minded but not hardcore

### 2.2 Creator (Fitness Professional)

**Name:** Coach Mike
**Goals:**
- Increase subscriber retention
- Reduce manual follow-up
- Identify at-risk users
- Reward engaged members

**Behaviors:**
- Monitors engagement metrics
- Creates challenges
- Manually awards badges
- Configures streak types

## 3. Core User Flows

### 3.1 Streak Initiation Flow

```
┌─────────┐
│  User   │
│  Signs  │
│   Up    │
└────┬────┘
     │
     ▼
┌─────────────────────────────────────┐
│  Dashboard: Welcome message         │
│  "Start your first workout today!"  │
└─────────────────────────────────────┘
     │
     │ User completes first workout
     ▼
┌─────────────────────────────────────┐
│  Celebration:                       │
│  "Great start! Day 1 complete ✅"   │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│  Streak Counter Activated           │
│  🔥 1 DAY - Keep it up!             │
└─────────────────────────────────────┘
```

### 3.2 Daily Streak Maintenance Flow

```
                    ┌──────────────┐
                    │   New Day    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐     ┌──────────────┐
                    │ User opens   │────▶│ At Risk?     │
                    │ App          │     │ (>18h idle) │
                    └──────┬───────┘     └──────┬───────┘
                           │                    │
                           │                    ├─Yes─▶ Show Warning
                           │                    │       Banner
                           │                    │
                           ▼                    ▼
                    ┌──────────────┐    ┌──────────────┐
                    │ Log Workout  │    │ Use Freeze?  │
                    └──────┬───────┘    └──────┬───────┘
                           │                    │
                           ▼                    ├─Yes─▶ Streak Frozen
                    ┌──────────────┐    │       (count preserved)
                    │ Streak       │    │
                    │ Incremented  │    └─No───▶ No Action
                    └──────────────┘            (wait)
                           │
                           ▼
                    ┌──────────────┐
                    │ Show         │
                    │ Progress?    │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
      ┌──────────────┐          ┌──────────────┐
      │ Milestone?   │          │ Normal       │
      │ (7,14,30...) │          │ Increment    │
      └──────┬───────┘          └──────────────┘
             │
             ├─Yes─▶ Celebration
             │       Modal
             │       + Badge Awarded
             │
             └─No───▶ Continue
```

### 3.3 Streak Break Flow

```
┌─────────────────────────────────────┐
│  Daily Cron Job Runs (midnight)     │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Check: Any activity yesterday?     │
└─────────────────────────────────────┘
            │
     ┌──────┴──────┐
     │             │
    Yes           No
     │             │
     ▼             ▼
┌─────────┐  ┌────────────────────────┐
│Streak   │  │ Check: Freeze Active?  │
│Continues│  └───────────┬────────────┘
└─────────┘              │
                 ┌───────┴────────┐
                 │                │
                Yes              No
                 │                │
                 ▼                ▼
          ┌──────────┐    ┌──────────────────────┐
          │Streak    │    │ Streak Broken         │
          │Preserved │    │ - Set is_active=false │
          │(Frozen)  │    │ - Record in history   │
          └──────────┘    │ - Send "Don't give    │
                          │   up" notification     │
                          └──────────────────────┘
                                   │
                                   ▼
                          ┌──────────────────────┐
                          │ Offer Restart        │
                          │ "Start fresh today?" │
                          └──────────────────────┘
```

### 3.4 Badge Achievement Flow

```
┌─────────────────────────────────────┐
│  User Action Completed              │
│  (workout, check-in, etc.)          │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Event Emitted                      │
│  (e.g., workout.completed)          │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Evaluation Engine                  │
│  - Update streak                    │
│  - Check badge criteria             │
└─────────────────────────────────────┘
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
┌─────────┐  ┌────────────────────────┐
│Criteria │  │ Criteria Met?          │
│Not Met  │  └───────────┬────────────┘
└─────────┘              │
                 ┌───────┴────────┐
                 │                │
                No              Yes
                 │                │
                 ▼                ▼
          ┌──────────────┐  ┌────────────────┐
          │ Update       │  │ Badge Awarded  │
          │ Progress     │  │ - DB record    │
          │ (show %)     │  │ - Notification │
          └──────────────┘  │ - Celebration  │
                            └────────────────┘
                                   │
                                   ▼
                          ┌────────────────┐
                          │ Check: Unlocks │
                          │ next badge?    │
                          └────────────────┘
```

### 3.5 Freeze Activation Flow

```
┌─────────────────────────────────────┐
│  User sees streak at risk warning   │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  User taps "Activate Freeze"        │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Check: Freeze Available?           │
└─────────────────────────────────────┘
            │
     ┌──────┴──────┐
     │             │
    Yes           No
     │             │
     ▼             ▼
┌────────────┐  ┌──────────────────────┐
│ Show       │  │ Show: "No freezes    │
│Confirm     │  │ remaining. Complete  │
│Dialog      │  │ a workout today!"    │
│"Use freeze │  └──────────────────────┘
│for today?" │
└──────┬─────┘
       │
  ┌────┴────┐
  │         │
 Yes       No
  │         │
  ▼         ▼
┌─────────┐ ┌──────────┐
│Freeze   │ │Cancel    │
│Activated│ │(warning  │
│- Streak │ │ remains) │
│frozen   │ └──────────┘
│- Counter│
│reset    │
└─────────┘
```

## 4. State Diagrams

### 4.1 Streak State Machine

```
                    ┌─────────────┐
                    │   INACTIVE  │
                    │  (New User) │
                    └──────┬──────┘
                           │
                    First qualifying action
                           ▼
                    ┌─────────────┐
         ┌────────▶│    ACTIVE   │◀────────┐
         │         └──────┬──────┘         │
         │                │                │
         │         Daily activity          │
         │                │                │
         │                ▼                │
         │         ┌─────────────┐         │
         │         │   ACTIVE    │         │
 Freeze │         │  (At Risk)  │         │
 used   │         └──────┬──────┘         │
         │                │                │
         │         18-24h elapsed          │
         │                │                │
         │                ▼                │
         │    ┌─────────────┐     ┌─────────────┐
         │    │   FROZEN    │     │   BROKEN    │
         │    └──────┬──────┘     └──────┬──────┘
         │           │                   │
         │    Freeze expires      Restart possible
         │           │                   │
         │           └───────────────────┤
         │                              ▼
         │                       ┌─────────────┐
         │                       │   ACTIVE    │
         │                       │  (Restarted)│
         └───────────────────────┴─────────────┘
```

### 4.2 Badge State Machine

```
                    ┌─────────────┐
                    │   LOCKED    │
                    │ (Not visible│
                    │  to user)   │
                    └──────┬──────┘
                           │
                    Prerequisites met
                           ▼
                    ┌─────────────┐
                    │  AVAILABLE  │◀───────┐
                    │(Visible,    │        │
                    │ can track)  │        │
                    └──────┬──────┘        │
                           │               │
                    User progresses       │
                           │               │
                           ▼               │
                    ┌─────────────┐       │
                    │ IN_PROGRESS │       │
                    │ (Shows %)   │       │
                    └──────┬──────┘       │
                           │               │
                    100% complete         │
                           │               │
                           ▼               │
                    ┌─────────────┐       │
                    │   EARNED     │       │
                    │ (Awarded)    │───────┘
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  DISPLAYED  │
                    │ (On profile)│
                    └─────────────┘
```

## 5. Creator Flows

### 5.1 Configure Streak Types

```
┌─────────────────────────────────────┐
│  Creator Dashboard                  │
│  Settings → Streak Configuration    │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Toggle Streak Types:               │
│  ☑ Workout Streaks                  │
│  ☑ Nutrition Logging                │
│  ☐ Habit Completion                 │
│  ☐ Community Participation          │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Configure Thresholds:              │
│  - Minimum workouts/day: 1          │
│  - Minimum meals/day: 2             │
│  - Freeze allowance: 1 per 30 days  │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Set Milestones:                    │
│  ☑ 3, 7, 14, 30, 60, 90, 180, 365   │
│  ☑ Enable celebrations              │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Save Configuration                 │
│  "Changes will apply to all users"  │
└─────────────────────────────────────┘
```

### 5.2 Manual Badge Award

```
┌─────────────────────────────────────┐
│  Creator Dashboard                  │
│  Users → Search User                │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Select: Sarah Johnson              │
│  View: User Profile & Badges        │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  [ Award Custom Badge ]             │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Badge Selection:                   │
│  - OR Create Custom                 │
│  - Enter badge name                 │
│  - Upload icon                      │
│  - Add reason for award             │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Preview & Confirm                  │
│  "Sarah will receive a              │
│   notification"                     │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│  Badge Awarded                      │
│  ✓ Sarah notified                   │
└─────────────────────────────────────┘
```

## 6. Error States

### 6.1 Streak Calculation Error

```
┌─────────────────────────────────────⚠️
│  Error: Streak Calculation Failed   │
├─────────────────────────────────────┤
│  What happened:                     │
│  We couldn't update your streak.    │
│                                     │
│  Don't worry - your activity is     │
│  saved and we'll retry shortly.     │
│                                     │
│  [ RETRY ]        [ CONTACT SUPPORT ]│
└─────────────────────────────────────┘
```

### 6.2 Badge Award Error

```
┌─────────────────────────────────────⚠️
│  Oops! Something went wrong         │
├─────────────────────────────────────┤
│  We couldn't award your badge,      │
│  but you've earned it!              │
│                                     │
│  It will appear in your collection  │
│  shortly.                           │
│                                     │
│           [ OK ]                    │
└─────────────────────────────────────┘
```

## 7. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Timezone change | Streaks use user's timezone for day boundaries |
| Activity during freeze | Freeze still consumed, streak continues |
| Multiple activities in one day | Only counts once for streak |
| Late data sync | Backfill streak based on actual activity time |
| User unsubscribes and rejoins | Streak resets, badges retained |
| Creator changes configuration | Existing streaks continue, new rules apply going forward |
