# **PRODUCT REQUIREMENTS DOCUMENT**

## **Feature: Streaks & Badges System**

### **Objective: Increase End-User Retention, LTV, and Reduce Churn Across MacroActive Apps**

---

# **1\. Executive Summary**

MacroActive currently powers creator-led subscription apps in fitness, nutrition, and coaching. Platform growth depends on:

* Sustainable recurring revenue 

* Churn reduction 

* Improved LTV relative to CAC 

Multiple creator conversations highlight:

* High first-month churn (15%) 

* Engagement gaps impacting retention 

* Ongoing backlog around gamification, streaks, and leaderboards 

This PRD proposes a **platform-wide Streaks & Badges System** that:

1. Drives daily habit completion

2. Builds identity and status

3. Increases switching cost

4. Creates emotional lock-in

5. Provides creators with engagement tools

6. Improves retention during vulnerable early lifecycle periods

---

# **2\. Problem Statement**

### **Current Gaps**

* Users lack long-term habit reinforcement mechanics.

* Engagement relies heavily on creator content quality.

* There is limited identity/status signaling inside the app.

* No persistent progress identity across time.

* No habit-based retention scaffolding.

Given high early churn in some cohorts  , we need retention infrastructure that:

* Creates momentum in weeks 1–4

* Makes cancellation psychologically costly

* Encourages reactivation instead of drop-off

---

# **3\. Strategic Alignment**

This initiative aligns with our broader recurring revenue and growth philosophy:

* Rewarding sustainable engagement, not spikes 

* Driving healthier subscription businesses 

* Supporting long-term revenue predictability 

End-user retention → Creator retention → Platform NDR → Higher LTV:CAC.

---

# **4\. Product Vision**

We evolve MacroActive from:

Content delivery app

→ Habit-forming identity platform

Users do not just “follow workouts.”

They become:

* 30-Day Streak Earners

* Elite Consistency Members

* Challenge Champions

* Certified Finishers

Retention becomes identity-based, not content-based.

---

# **5\. Core Feature Architecture**

## **5.1 Streak System**

### **Definition**

A streak is a consecutive-day completion of a defined action.

### **Supported Streak Types (Phase 1\)**

1. Workout Completion Streak

2. Nutrition Log Streak

3. Habit Completion Streak (custom habits) 

4. Community Participation Streak 

### **Creator Configurability**

Creators can:

* Enable/disable streak types

* Define qualifying actions

* Set minimum thresholds (e.g. log at least 1 meal)

* Attach streak rewards

### **Streak Milestones**

* 3 Days

* 7 Days

* 14 Days

* 30 Days

* 60 Days

* 90 Days

* 180 Days

* 365 Days

### **Behavioral Psychology**

* Loss aversion messaging at risk of break

* Streak freeze (1 per 30 days)

* Countdown reminders

* Push notifications tied to streak state 

---

## **5.2 Badge System**

### **Badge Categories**

1. Consistency Badges

   * 7-Day Consistency

   * 30-Day Machine

   * 90-Day Elite

2. Milestone Badges

   * 100 Workouts Completed

   * 10kg Total Weight Lifted (ties to gamification concept) 

3. Challenge Badges

   * 5-Day Challenge Finisher

   * Transformation Champion

4. Certification Badges

   * Program Completion Certificate

   * Phase Completion Badge

      (Aligned with requests for certification / badges) 

5. Community Status Badges

   * Top Contributor

   * 50 Comments Posted

   * Accountability Leader

---

## **5.3 Leaderboards (Phase 2 Integration)**

Backlog already references leaderboards \+ streaks 

Types:

* Weekly Workout Leaderboard

* Monthly Streak Leaderboard

* Volume Lifted Leaderboard

* Challenge Leaderboard

Privacy Options:

* Nickname/alias support 

* Opt-in visibility

---

# **6\. User Experience**

## **Dashboard Additions**

New Widget:

“Your Streak”

Displays:

* Current streak

* Longest streak

* Next milestone

* Earned badges

Progress Visual:

Circular ring completion toward next badge.

## **Community Integration**

Badges appear:

* Next to username in community chat 

* In leaderboard view

* On profile page

Status builds aspiration, similar to Growth League identity mechanics 

---

# **7\. Creator Control Panel**

Creators can:

* Launch streak-based challenges

* Award manual badges

* See top engaged members

* Trigger automation when streak breaks

* Tie rewards to retention milestones

Example:

If user hits 60-day streak → Unlock bonus workout program.

---

# **8\. Retention Impact Hypothesis**

## **Early Lifecycle**

Problem:

First-month churn up to 15% in some cases 

Solution:

* 7-day and 14-day streak reinforcement

* Micro-badge reinforcement during vulnerable phase

* Social recognition

Expected Impact:

* Increase Day-7 retention

* Increase Day-30 retention

* Lower Month-1 churn

---

## **Mid-Lifecycle (Month 2–3)**

Goal:

Prevent stagnation drop-off.

Mechanics:

* 60-Day Elite badge

* Streak leaderboard

* Community spotlight

---

## **Long-Term**

Goal:

Increase LTV.

Tie-ins:

* Unlock premium content at milestone

* Anniversary badge at 12 months

* “Founding Member” status

Improved retention supports:

* Margin-adjusted LTV 

* CAC efficiency improvement 

---

# **9\. Success Metrics**

## **Primary KPIs**

* 30-Day Retention Rate

* 90-Day Retention Rate

* Average Subscription Length

* Churn % Reduction

* LTV Increase

* NDR Increase

## **Secondary KPIs**

* Daily Active Users

* Habit Completion Rate

* Community Participation Rate

* % Users With Active Streak

* Badge Earn Rate

---

# **10\. Experimentation Plan**

Phase 1:

Rollout to 10 pilot creators.

Measure:

* Cohort retention vs control

* Early churn delta

* Engagement delta

Phase 2:

Global rollout if:

* ≥10% improvement in Day-30 retention

* ≥5% reduction in first-month churn

---

# **11\. Technical Requirements**

* Event tracking layer for streak qualification

* Daily cron evaluation job

* Badge database schema

* Creator configuration interface

* Push notification triggers

* Leaderboard aggregation logic

* Anti-cheat logic

* Data warehouse integration for retention correlation

---

# **12\. Risks**

1. Superficial gamification without emotional depth

2. Over-complex UX

3. Streak burnout

4. Low creator adoption

5. Notification fatigue

Mitigation:

* Clean UX

* Creator education

* Clear milestone pacing

* Optionality

---

# **13\. Long-Term Platform Opportunity**

Once streaks and badges are mature:

* Cross-app identity layer

* MacroActive universal status level

* Inter-creator seasonal competitions

* Platform-wide challenges

This supports our broader philosophy of reinforcing identity and pride inside the ecosystem 

---

# **14\. Strategic Outcome**

This initiative shifts MacroActive from:

A tool creators use

→ A habit engine end users live inside

