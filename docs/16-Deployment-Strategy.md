# Deployment Strategy

## 1. Overview

This document defines the deployment strategy for the Streaks & Badges System, including environments, processes, and rollback procedures.

## 2. Deployment Environments

### 2.1 Environment Configuration

| Environment | Purpose | Data | Access | Scale |
|-------------|---------|------|--------|-------|
| **Development** | Local development | Mock/test | Developers only | Single instance |
| **CI/CD** | Automated testing | Synthetic | CI/CD only | Auto-scaled |
| **Staging** | Pre-production testing | Anonymized prod snapshot | Internal + Beta users | Production-like |
| **Production** | Live system | Real user data | All users | Auto-scaled |

### 2.2 Environment URLs

| Environment | API URL | Web URL | Admin URL |
|-------------|---------|---------|-----------|
| Development | http://localhost:3000 | http://localhost:3001 | http://localhost:3002 |
| Staging | https://api-staging.macroactive.com | https://staging.macroactive.com | https://admin-staging.macroactive.com |
| Production | https://api.macroactive.com | https://macroactive.com | https://admin.macroactive.com |

## 3. Deployment Process

### 3.1 Deployment Flow

```
┌─────────────┐
│  Developer  │
│  Completes  │
│   Feature   │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Pull      │ ───▶ │    Merge    │ ───▶ │    Build    │
│  Request    │      │   to Main   │      │  & Test     │
└─────────────┘      └─────────────┘      └──────┬──────┘
                                                 │
                                                 ▼
                                          ┌─────────────┐
                                          │ Deploy to   │
                                          │  Staging    │
                                          └──────┬──────┘
                                                 │
                                                 ▼
                                          ┌─────────────┐
                                          │  Staging    │
                                          │   Tests     │
                                          └──────┬──────┘
                                                 │
                                        ┌────────┴────────┐
                                        │                 │
                                    Pass              Fail
                                        │                 │
                                        ▼                 ▼
                                ┌─────────────┐    ┌─────────────┐
                                │   Deploy    │    │   Create    │
                                │ Production  │    │    Ticket   │
                                └─────────────┘    └─────────────┘
                                        │
                                        ▼
                                ┌─────────────┐
                                │   Smoke     │
                                │   Tests     │
                                └──────┬──────┘
                                        │
                               ┌────────┴────────┐
                               │                 │
                           Pass               Fail
                               │                 │
                               ▼                 ▼
                       ┌─────────────┐    ┌─────────────┐
                       │   Complete  │    │   Rollback  │
                       └─────────────┘    └─────────────┘
```

### 3.2 Pre-Deployment Checklist

**Code Readiness:**
- [ ] All tests passing
- [ ] Code review approved
- [ ] No critical/high security issues
- [ ] Documentation updated
- [ ] Changelog updated

**Testing:**
- [ ] Unit tests passed
- [ ] Integration tests passed
- [ ] E2E tests passed
- [ ] Load tests passed
- [ ] Security scan passed

**Operations:**
- [ ] Runbook updated
- [ ] Monitoring configured
- [ ] Alerts configured
- [ ] Rollback plan documented
- [ ] Stakeholders notified

## 4. Deployment Strategies

### 4.1 Blue-Green Deployment

**Used for:** Major releases, database migrations

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                        │
└─────────────────────────────────────────────────────────┘
         │                             │
         ▼                             ▼
    ┌─────────┐                   ┌─────────┐
    │  BLUE   │                   │  GREEN  │
    │ (v1.0)  │                   │ (v1.1)  │
    │ Current │                   │  New    │
    └─────────┘                   └─────────┘
         ▲                             │
         │                             │
         └───────Traffic───────────────▶
              (Switch after tests)
```

**Steps:**
1. Deploy new version to Green environment
2. Run smoke tests on Green
3. Switch traffic to Green
4. Monitor for issues
5. Keep Blue for rollback

### 4.2 Rolling Deployment

**Used for:** API services, stateless components

```
Instance 1: [v1.0] → [v1.1] → [v1.1]
Instance 2: [v1.0] → [v1.0] → [v1.1]
Instance 3: [v1.0] → [v1.0] → [v1.0] → [v1.1]
```

**Steps:**
1. Deploy to one instance
2. Verify health
3. Deploy to next instance
4. Repeat until all updated

### 4.3 Canary Deployment

**Used for:** High-risk features

```
Traffic: 100% → 95% (old) + 5% (new) → 50/50 → 100% (new)
```

**Steps:**
1. Deploy to canary instances
2. Route 5% traffic to canary
3. Monitor metrics for 1 hour
4. Gradually increase traffic
5. Full rollout or rollback

## 5. Database Migrations

### 5.1 Migration Strategy

**Expand/Contract Pattern:**

1. **Expand:** Add new table/column alongside old
2. **Migrate:** Backfill data to new structure
3. **Update:** Switch code to use new structure
4. **Contract:** Remove old structure

### 5.2 Zero-Downtime Migrations

| Migration Type | Strategy | Downtime |
|----------------|----------|----------|
| Add table | Direct create | None |
| Add column | Direct add (nullable) | None |
| Modify column | Expand/contract | None |
| Delete column | Expand/contract | None |
| Index creation | CONCURRENTLY | None |

### 5.3 Migration Rollback

Each migration includes:
- Forward script
- Rollback script
- Validation query
- Rollback verification

## 6. Release Timeline

### 6.1 Phase 1 Release

| Activity | Date | Duration |
|----------|------|----------|
| Feature freeze | Week 5 | - |
| Code freeze | Week 6 | - |
| Staging deployment | Week 6 | 1 day |
| Testing | Week 6 | 3 days |
| Production deployment | Week 6 | 1 day |
| Pilot monitoring | Weeks 6-8 | 2 weeks |

### 6.2 Phase 2 Release

| Activity | Date | Duration |
|----------|------|----------|
| Feature freeze | Week 9 | - |
| Staging deployment | Week 10 | 1 day |
| Testing | Week 10 | 2 days |
| Production deployment | Week 10 | 1 day |
| Pilot monitoring | Weeks 10-12 | 2 weeks |

### 6.3 Phase 3 Release

| Activity | Date | Duration |
|----------|------|----------|
| Feature freeze | Week 15 | - |
| Staging deployment | Week 16 | 1 day |
| Testing | Week 16 | 3 days |
| Production deployment | Week 16 | 1 day |
| Beta rollout | Week 16 | 2 weeks |

### 6.4 Phase 4 Release

| Activity | Date | Duration |
|----------|------|----------|
| Feature freeze | Week 19 | - |
| Staging deployment | Week 20 | 1 day |
| Testing | Week 20 | 3 days |
| Production deployment | Week 20 | 1 day |
| Global launch | Week 20 | Ongoing |

## 7. Rollback Procedure

### 7.1 Rollback Triggers

| Condition | Action | Timeframe |
|-----------|--------|-----------|
| Error rate > 5% | Automatic rollback | Immediate |
| p95 latency > 2000ms | Investigate, rollback if needed | 5 min |
| Critical bug confirmed | Manual rollback | 15 min |
| Data corruption | Emergency rollback | Immediate |

### 7.2 Rollback Steps

**Application Rollback:**
1. Identify last known good version
2. Execute rollback script
3. Verify health checks pass
4. Monitor metrics
5. Create incident ticket

**Database Rollback:**
1. STOP: Do not rollback if data migrated
2. Assess: Can we run old code with new schema?
3. If yes: Rollback code, fix migration
4. If no: Execute rollback migration
5. Verify data integrity

### 7.3 Rollback Verification

- [ ] Error rate returned to normal
- [ ] Latency returned to normal
- [ ] Health checks passing
- [ ] No data corruption
- [ ] User complaints stopped

## 8. Feature Flags

### 8.1 Flag Strategy

| Feature | Flag Name | Default | Rollout Strategy |
|---------|-----------|---------|------------------|
| Streak System | `streaks_enabled` | false | Per creator |
| Badge System | `badges_enabled` | false | Per creator |
| Leaderboards | `leaderboards_enabled` | false | Per creator |
| Freeze Feature | `freeze_enabled` | false | Per creator |

### 8.2 Flag Management

**Implementation:**
- Stored in creator_configuration table
- Cached in Redis (TTL: 1 hour)
- Validated on each API call

**Emergency Disable:**
- Set feature flag to false
- Cache invalidates within 1 hour
- Force cache invalidation if urgent

## 9. Communication Plan

### 9.1 Pre-Deployment

| Audience | When | Content |
|----------|------|---------|
| Engineering | 1 week before | Deployment plan, roles |
| QA | 1 week before | Testing schedule |
| Support | 3 days before | Known issues, FAQs |
| Creators | 1 day before | Feature announcement |

### 9.2 During Deployment

| Audience | When | Content |
|----------|------|---------|
| Engineering | Real-time | #deployments channel |
| Stakeholders | On completion | Success/failure notification |

### 9.3 Post-Deployment

| Audience | When | Content |
|----------|------|---------|
| Engineering | 1 hour after | Metrics summary |
| Support | 1 hour after | Release notes, known issues |
| Creators | 1 day after | Feature announcement, training |

## 10. Deployment Runbook

### 10.1 Pre-Deployment

```bash
# 1. Verify branch is correct
git branch
# Expected: main or release/*

# 2. Pull latest
git pull origin main

# 3. Verify tests pass
npm test

# 4. Check environment status
./scripts/check-env.sh staging
```

### 10.2 Deployment

```bash
# 1. Deploy to staging
./scripts/deploy.sh staging

# 2. Run smoke tests
./scripts/smoke-tests.sh staging

# 3. If tests pass, deploy to production
./scripts/deploy.sh production

# 4. Verify health
./scripts/health-check.sh production
```

### 10.3 Post-Deployment

```bash
# 1. Monitor error rate
./scripts/monitor-errors.sh --duration 15m

# 2. Monitor latency
./scripts/monitor-latency.sh --duration 15m

# 3. Check alerts
./scripts/check-alerts.sh
```

## 11. Incident Response

### 11.1 Severity Levels

| Severity | Definition | Response Time |
|----------|------------|---------------|
| SEV-0 | Complete system outage | 5 min |
| SEV-1 | Major feature broken | 15 min |
| SEV-2 | Minor feature broken | 1 hour |
| SEV-3 | Performance degradation | 4 hours |

### 11.2 Incident Commands

| Role | Responsibilities |
|------|------------------|
| Incident Commander | Coordinate response, communicate |
| Technical Lead | Investigate, implement fix |
| Communications | Update stakeholders |
| Support Lead | Handle user issues |

## 12. Deployment Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Deployment frequency | 1 per phase | |
| Lead time | 2 weeks | |
| Change failure rate | < 5% | |
| Mean time to restore | < 1 hour | |
| Deployment time | < 30 min | |
