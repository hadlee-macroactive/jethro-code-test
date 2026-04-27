# Test Cases

## 1. Overview

This document contains detailed test cases for the Streaks & Badges System, organized by feature and testing type.

## 2. Streak System Test Cases

### 2.1 Streak Initialization

| ID | Test Case | Preconditions | Test Steps | Expected Result | Priority |
|----|-----------|----------------|------------|-----------------|----------|
| STR-001 | New user starts streak | User has no existing streaks | 1. User completes first workout<br>2. Check streak count | Streak count = 1, is_active = true | P0 |
| STR-002 | Streak starts on first qualified action | User has no existing streaks | 1. User logs workout (below threshold)<br>2. Check streak | No streak started | P1 |
| STR-003 | Streak type correctly categorized | User exists | 1. Complete workout<br>2. Log nutrition<br>3. Check streak types | Two separate streaks created | P0 |

### 2.2 Streak Increment

| ID | Test Case | Preconditions | Test Steps | Expected Result | Priority |
|----|-----------|----------------|------------|-----------------|----------|
| STR-004 | Consecutive day increments streak | User has 3-day streak | 1. Complete workout on day 4<br>2. Check streak | Streak count = 4 | P0 |
| STR-005 | Same day multiple actions | User has 3-day streak | 1. Complete 2 workouts<br>2. Check streak | Streak count = 4 (not 5) | P1 |
| STR-006 | Activity within 24h window | User has streak, activity at 11 PM | 1. Complete workout at 1 AM next day<br>2. Check streak | Streak incremented | P0 |
| STR-007 | Activity outside 24h window | User has streak, last activity 26h ago | 1. Complete workout<br>2. Check streak | New streak starts (count = 1) | P0 |

### 2.3 Streak Milestones

| ID | Test Case | Preconditions | Test Steps | Expected Result | Priority |
|----|-----------|----------------|------------|-----------------|----------|
| STR-008 | 7-day milestone triggers celebration | User has 6-day streak | 1. Complete 7th day workout<br>2. Check notification | Celebration shown, milestone event emitted | P0 |
| STR-009 | 30-day badge awarded | User has 29-day streak | 1. Complete 30th day workout<br>2. Check badges | "30-Day Machine" badge awarded | P0 |
| STR-010 | Non-milestone day no celebration | User has 5-day streak | 1. Complete 6th day workout<br>2. Check notification | No special celebration | P2 |

### 2.4 Streak Break

| ID | Test Case | Preconditions | Test Steps | Expected Result | Priority |
|----|-----------|----------------|------------|-----------------|----------|
| STR-011 | Streak breaks after 24h inactivity | User has active streak | 1. Wait 25h without activity<br>2. Run daily job<br>3. Check streak | is_active = false, history record created | P0 |
| STR-012 | Broken streak notification sent | User has active streak | 1. Streak breaks<br>2. Check notifications | Encouragement notification sent | P1 |
| STR-013 | Longest streak updated | User had 20-day longest, current at 25 | 1. Streak breaks at 25<br>2. Check longest | longest_streak_count = 25 | P1 |

### 2.5 Streak Freeze

| ID | Test Case | Preconditions | Test Steps | Expected Result | Priority |
|----|-----------|----------------|------------|-----------------|----------|
| STR-014 | Freeze preserves streak | User has 10-day streak, 1 freeze available | 1. Activate freeze<br>2. Skip day<br>3. Complete workout next day<br>4. Check streak | Streak continues at 11 | P0 |
| STR-015 | Freeze unavailable when used | User has 0 freezes available | 1. Attempt to activate freeze<br>2. Check response | Error: FREEZE_UNAVAILABLE | P0 |
| STR-016 | Freeze resets after 30 days | User used freeze 30 days ago | 1. Check freeze availability<br>2. Activate freeze | Freeze available and activated | P1 |
| STR-017 | Freeze doesn't count as activity | User activates freeze | 1. Check streak for frozen day<br>2. Check milestone | Streak preserved but not incremented | P1 |

### 2.6 Multi-Streak Types

| ID | Test Case | Preconditions | Test Steps | Expected Result | Priority |
|----|-----------|----------------|------------|-----------------|----------|
| STR-018 | Independent streak types | User has all streak types enabled | 1. Complete workout only<br>2. Check all streaks | Only workout streak increments | P0 |
| STR-019 | Nutrition streak increments | User has meal logging enabled | 1. Log 2 meals<br>2. Check nutrition streak | Nutrition streak incremented | P1 |
| STR-020 | Community streak increments | User has community enabled | 1. Post in community<br>2. Check community streak | Community streak incremented | P2 |

## 3. Badge System Test Cases

### 3.1 Badge Awarding

| ID | Test Case | Preconditions | Test Steps | Expected Result | Priority |
|----|-----------|----------------|------------|-----------------|----------|
| BAD-001 | Automatic badge on milestone | User reaches 7-day streak | 1. Complete 7th day<br>2. Check badges | "7-Day Consistency" badge awarded | P0 |
| BAD-002 | Badge only awarded once | User earns 7-day badge | 1. Break and restart to 7 days<br>2. Check badges | No duplicate badge | P1 |
| BAD-003 | Manual badge award | Creator awards custom badge | 1. Creator selects user<br>2. Creator awards badge<br>3. Check user badges | Badge awarded, notification sent | P0 |
| BAD-004 | Badge progress updates | User at 50 workouts | 1. Complete workout (51st)<br>2. Check badge progress | Progress = 51% | P1 |

### 3.2 Badge Criteria

| ID | Test Case | Preconditions | Test Steps | Expected Result | Priority |
|----|-----------|----------------|------------|-----------------|----------|
| BAD-005 | OR criteria evaluation | Badge requires (streak>=7 OR workouts>=10) | 1. User has 5-day streak, 15 workouts<br>2. Check badge eligibility | Badge awarded | P1 |
| BAD-006 | AND criteria evaluation | Badge requires (streak>=30 AND workouts>=50) | 1. User has 30-day streak, 40 workouts<br>2. Check badge eligibility | Badge not awarded | P1 |
| BAD-007 | Time-bound criteria | Badge requires 5 workouts in 7 days | 1. Complete 5 workouts in 5 days<br>2. Check badge eligibility | Badge awarded | P2 |

### 3.3 Badge Display

| ID | Test Case | Preconditions | Test Steps | Expected Result | Priority |
|----|-----------|----------------|------------|-----------------|----------|
| BAD-008 | Earned badges visible on profile | User has 3 badges | 1. View profile<br>2. Check badge display | All 3 badges shown | P0 |
| BAD-009 | In-progress badges show percentage | User working toward badge | 1. View badge collection<br>2. Check progress badge | Progress bar visible with % | P1 |
| BAD-010 | Locked badges not shown | User hasn't unlocked tier | 1. View badge collection<br>2. Check for locked badges | Only available badges shown | P2 |

### 3.4 Badge Rarity

| ID | Test Case | Preconditions | Test Steps | Expected Result | Priority |
|----|-----------|----------------|------------|-----------------|----------|
| BAD-011 | Common badge has no special effects | User earns common badge | 1. Check badge appearance | Standard display | P2 |
| BAD-012 | Rare badge has gradient | User earns rare badge | 1. Check badge appearance | Gradient visible | P1 |
| BAD-013 | Legendary badge has animation | User earns legendary badge | 1. Check badge appearance | Full animation plays | P1 |

## 4. Leaderboard Test Cases

### 4.1 Leaderboard Calculation

| ID | Test Case | Preconditions | Test Steps | Expected Result | Priority |
|----|-----------|----------------|------------|-----------------|----------|
| LD-001 | Weekly leaderboard accurate | Users have various workout counts | 1. Generate leaderboard<br>2. Verify rankings | Correct ranking by workout count | P0 |
| LD-002 | Tie handling | Two users have same score | 1. Generate leaderboard<br>2. Check tied users | Both have same rank | P1 |
| LD-003 | Current user highlighted | User viewing leaderboard | 1. User views leaderboard<br>2. Check display | Current row highlighted | P1 |

### 4.2 Leaderboard Privacy

| ID | Test Case | Preconditions | Test Steps | Expected Result | Priority |
|----|-----------|----------------|------------|-----------------|----------|
| LD-004 | Anonymous user hides name | User opts for anonymity | 1. Enable privacy<br>2. View leaderboard | Display name shows as "Anonymous" | P0 |
| LD-005 | Custom nickname displayed | User sets nickname | 1. Set nickname "GymRat123"<br>2. View leaderboard | Nickname shown | P1 |
| LD-006 | Opt-out removes from leaderboard | User opts out | 1. Enable opt-out<br>2. View leaderboard | User not listed | P1 |

## 5. API Test Cases

### 5.1 Streak API

| ID | Test Case | Method | Endpoint | Expected Result | Priority |
|----|-----------|--------|----------|-----------------|----------|
| API-001 | Get user streaks | GET | /api/v1/streaks/users/{id} | Returns all streaks | P0 |
| API-002 | Get streaks with history | GET | /api/v1/streaks/users/{id}?include_history=true | Includes history array | P1 |
| API-003 | Get non-existent user streaks | GET | /api/v1/streaks/users/999 | Returns empty array | P2 |
| API-004 | Activate freeze | POST | /api/v1/streaks/users/{id}/freeze | Freeze activated | P0 |
| API-005 | Activate freeze without availability | POST | /api/v1/streaks/users/{id}/freeze | Returns 400 error | P0 |

### 5.2 Badge API

| ID | Test Case | Method | Endpoint | Expected Result | Priority |
|----|-----------|--------|----------|-----------------|----------|
| API-006 | Get user badges | GET | /api/v1/badges/users/{id} | Returns earned badges | P0 |
| API-007 | Get badge catalog | GET | /api/v1/badges/catalog | Returns all badges | P1 |
| API-008 | Manual badge award (admin) | POST | /api/v1/badges/users/{id}/award | Badge awarded | P0 |

### 5.3 Authentication & Authorization

| ID | Test Case | Test Steps | Expected Result | Priority |
|----|-----------|------------|-----------------|----------|
| API-009 | Request without auth token | 1. Call API without token<br>2. Check response | 401 Unauthorized | P0 |
| API-010 | User cannot access other user data | 1. User A requests User B's streaks<br>2. Check response | 403 Forbidden | P0 |
| API-011 | Creator can only access own data | 1. Creator A tries to modify Creator B config<br>2. Check response | 403 Forbidden | P0 |

## 6. UI/UX Test Cases

### 6.1 Streak Display

| ID | Test Case | Test Steps | Expected Result | Priority |
|----|-----------|------------|-----------------|----------|
| UI-001 | Streak counter shows correct count | 1. View dashboard<br>2. Check streak counter | Count matches backend | P0 |
| UI-002 | Streak fire animation plays | 1. Have active streak<br>2. View streak widget | Fire icon animating | P2 |
| UI-003 | Frozen streak shows ice icon | 1. Activate freeze<br>2. View streak widget | Ice/snowflake icon shown | P1 |

### 6.2 Badge Display

| ID | Test Case | Test Steps | Expected Result | Priority |
|----|-----------|------------|-----------------|----------|
| UI-004 | Badge card shows all info | 1. View badge card<br>2. Check elements | Name, icon, rarity visible | P0 |
| UI-005 | Badge tap opens detail | 1. Tap on badge<br>2. Check navigation | Detail modal opens | P0 |
| UI-006 | Progress badge shows percentage | 1. View in-progress badge<br>2. Check display | Progress bar visible | P1 |

### 6.3 Responsive Design

| ID | Test Case | Test Steps | Expected Result | Priority |
|----|-----------|------------|-----------------|----------|
| UI-007 | Mobile layout usable | 1. Open on mobile<br>2. Navigate app | No horizontal scroll, readable | P0 |
| UI-008 | Tablet layout adapts | 1. Open on tablet<br>2. Check layout | Grid adjusts for screen | P1 |
| UI-009 | Desktop layout full width | 1. Open on desktop<br>2. Check layout | Full utilization of space | P2 |

## 7. Integration Test Cases

### 7.1 Event Processing

| ID | Test Case | Test Steps | Expected Result | Priority |
|----|-----------|------------|-----------------|----------|
| INT-001 | Workout event triggers streak | 1. Emit workout.completed event<br>2. Check streak | Streak incremented | P0 |
| INT-002 | Streak milestone triggers badge | 1. Reach 30-day streak<br>2. Check badges | Badge awarded | P0 |
| INT-003 | Badge award triggers notification | 1. Badge awarded<br>2. Check notifications | Push notification sent | P0 |

### 7.2 Database Integration

| ID | Test Case | Test Steps | Expected Result | Priority |
|----|-----------|------------|-----------------|----------|
| INT-004 | Streak persists correctly | 1. Create streak<br>2. Query database | Record in streaks table | P0 |
| INT-005 | History record created on break | 1. Break streak<br>2. Query streak_history | History record exists | P0 |
| INT-006 | Transaction rollback on error | 1. Simulate error during award<br>2. Check database | No partial records | P0 |

## 8. Edge Cases

| ID | Test Case | Test Steps | Expected Result | Priority |
|----|-----------|------------|-----------------|----------|
| EDGE-001 | Leap year day calculation | 1. Set date to Feb 28<br>2. Complete activity Feb 29<br>3. Check streak | Streak correctly increments | P2 |
| EDGE-002 | Daylight saving time boundary | 1. Complete workout before DST change<br>2. Complete workout after<br>3. Check streak | Streak correctly calculated | P2 |
| EDGE-003 | Timezone change while traveling | 1. User changes timezone<br>2. Complete workout<br>3. Check streak | Streak preserved correctly | P1 |
| EDGE-004 | Very long streak (365+ days) | 1. User has 365-day streak<br>2. Complete another day<br>3. Check streak | No integer overflow, correct count | P1 |

## 9. Negative Test Cases

| ID | Test Case | Test Steps | Expected Result | Priority |
|----|-----------|------------|-----------------|----------|
| NEG-001 | SQL injection attempt | 1. Send malicious input in API<br>2. Check response | Input sanitized/rejected | P0 |
| NEG-002 | Negative streak count | 1. Attempt to set negative count<br>2. Check response | Validation error | P1 |
| NEG-003 | Future-dated activity | 1. Log workout with future date<br>2. Check streak | Rejected or handled correctly | P1 |

## 10. Test Case Status Tracking

| ID | Title | Status | Last Run | Result |
|----|-------|--------|----------|--------|
| STR-001 | New user starts streak | Ready | - | - |
| STR-004 | Consecutive day increments | Ready | - | - |
| BAD-001 | Automatic badge on milestone | Ready | - | - |

**Legend:**
- Ready: Ready to execute
- Passed: Last execution passed
- Failed: Last execution failed
- Blocked: Cannot execute (dependency issue)
- N/A: Not applicable
