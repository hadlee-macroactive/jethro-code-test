# Monitoring & Observability

## 1. Overview

This document defines the monitoring, logging, and observability strategy for the Streaks & Badges System.

## 2. Monitoring Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Metrics | Prometheus + Grafana | Performance monitoring |
| Tracing | Jaeger / OpenTelemetry | Request tracing |
| Logging | ELK Stack / Cloud Logging | Log aggregation |
| Error Tracking | Sentry | Error alerts |
| Uptime | Pingdom / UptimeRobot | Availability monitoring |
| Analytics | Mixpanel / Amplitude | User behavior |

## 3. Key Metrics

### 3.1 Business Metrics

| Metric | Description | Target | Alert |
|--------|-------------|--------|-------|
| Active Streaks | Users with active streak | > 50% | < 40% |
| Badges Awarded | Badges awarded per day | Trending up | < previous week |
| Streak Milestones | Milestones reached | Trending up | < previous week |
| Leaderboard Views | Leaderboard page views | > 10% DAU | N/A |
| Creator Adoption | Creators using features | > 60% | N/A |

### 3.2 Application Metrics

| Metric | Description | Target | Alert |
|--------|-------------|--------|-------|
| API Latency (p50) | Median response time | < 50ms | > 100ms |
| API Latency (p95) | 95th percentile | < 200ms | > 500ms |
| API Latency (p99) | 99th percentile | < 500ms | > 1000ms |
| Error Rate | Failed requests | < 0.1% | > 1% |
| Request Rate | Requests per second | 100-1000 | > 5000 |
| Queue Depth | Background job queue | < 10,000 | > 50,000 |

### 3.3 Infrastructure Metrics

| Metric | Description | Target | Alert |
|--------|-------------|--------|-------|
| CPU Usage | Server CPU utilization | < 70% | > 90% |
| Memory Usage | Server memory utilization | < 80% | > 95% |
| Disk Usage | Storage utilization | < 80% | > 90% |
| Network I/O | Network utilization | < 70% | > 90% |
| DB Connections | Active database connections | < 80% pool | > 95% pool |
| Cache Hit Rate | Redis cache effectiveness | > 80% | < 60% |

### 3.4 Database Metrics

| Metric | Description | Target | Alert |
|--------|-------------|--------|-------|
| Query Latency | Average query time | < 50ms | > 200ms |
| Slow Queries | Queries > 1s | < 1% | > 5% |
| Connection Pool | Active connections | < 80% | > 95% |
| Replication Lag | Replica delay | < 1s | > 5s |
| Deadlocks | Deadlock count | 0 | > 0 |

## 4. Dashboards

### 4.1 Main Dashboard

**Panels:**
- Request rate (requests/sec)
- Error rate (%)
- Latency (p50, p95, p99)
- Active users
- Queue depth
- CPU/memory usage

**Refresh:** 30 seconds

### 4.2 Streak System Dashboard

**Panels:**
- Active streaks count
- Streaks broken (today)
- Streak milestones reached
- Freeze activations
- Streak calculation duration
- Event processing rate

**Refresh:** 1 minute

### 4.3 Badge System Dashboard

**Panels:**
- Badges awarded (today)
- Badge awarding duration
- Most earned badges
- Badge progress updates
- Manual badge awards

**Refresh:** 1 minute

### 4.4 Creator Dashboard

**Panels:**
- Active creators
- Creator configurations
- API usage by creator
- Top engaged creators
- At-risk creators

**Refresh:** 5 minutes

### 4.5 Database Dashboard

**Panels:**
- Connection pool usage
- Query latency
- Slow queries
- Replication lag
- Table sizes
- Index usage

**Refresh:** 1 minute

## 5. Logging Strategy

### 5.1 Log Levels

| Level | Usage | Examples |
|-------|-------|----------|
| ERROR | Errors requiring attention | API failures, DB errors |
| WARN | Warning conditions | High latency, retry attempts |
| INFO | Normal operations | User actions, job completions |
| DEBUG | Detailed debugging | Variable values, execution flow |

### 5.2 Log Format

**Structured JSON:**
```json
{
  "timestamp": "2026-04-26T10:30:00Z",
  "level": "INFO",
  "service": "streak-service",
  "environment": "production",
  "request_id": "req_abc123",
  "user_id": 123456,
  "creator_id": 789,
  "event": "streak.incremented",
  "streak_type": "workout",
  "previous_count": 6,
  "new_count": 7,
  "duration_ms": 45
}
```

### 5.3 Log Retention

| Log Type | Retention | Storage |
|----------|-----------|---------|
| Application logs | 30 days | Hot storage |
| Access logs | 90 days | Hot storage |
| Audit logs | 7 years | Cold storage |
| Security logs | 7 years | Cold storage |

### 5.4 Sensitive Data Handling

**Never log:**
- Full credit card numbers
- Passwords (even hashed)
- API keys or secrets
- Personal health information
- Full addresses

**Mask in logs:**
- Email addresses: u***@example.com
- Phone numbers: ***-***-1234
- User IDs: OK to log

## 6. Distributed Tracing

### 6.1 Trace Configuration

| Setting | Value |
|---------|-------|
| Sampling rate | 10% (normal), 100% (debug) |
| Trace ID header | X-Trace-ID |
| Parent span header | X-Parent-Span-ID |

### 6.2 Trace Key Operations

**Streak Update Flow:**
```
[API: Receive Event] → [Service: Validate] → [Service: Calculate] → [DB: Update] → [Cache: Invalidate]
```

**Badge Award Flow:**
```
[API: Check Eligibility] → [Service: Evaluate] → [DB: Award] → [Notification: Send] → [Analytics: Track]
```

## 7. Alerting

### 7.1 Alert Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| API High Error Rate | error_rate > 5% | Critical | Page on-call |
| API High Latency | p95_latency > 1000ms | Warning | Email team |
| Service Down | health_check = false | Critical | Page on-call |
| Queue Backlog | queue_depth > 50,000 | Warning | Email team |
| Database Slow | query_p95 > 500ms | Warning | Email team |
| High CPU | cpu_usage > 90% | Warning | Email team |
| Memory Pressure | memory_usage > 95% | Critical | Page on-call |

### 7.2 Alert Escalation

| Severity | Immediate | 15 min | 1 hour | Unresolved |
|----------|-----------|--------|--------|-----------|
| Critical | Page on-call | Page manager | Page director | Continue escalation |
| Warning | Email team | Slack #incidents | Page on-call | Continue escalation |
| Info | Slack only | - | - | - |

### 7.3 On-Call Schedule

**Rotation:** Weekly primary, weekly secondary

**Responsibilities:**
- Respond to alerts within SLA
- Investigate and resolve or escalate
- Document incidents
- Update runbooks

## 8. Health Checks

### 8.1 Health Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| GET /health | Basic health | 200 OK |
| GET /health/ready | Readiness probe | 200 OK if ready |
| GET /health/live | Liveness probe | 200 OK if alive |
| GET /health/db | Database check | 200 OK if connected |
| GET /health/cache | Cache check | 200 OK if connected |

### 8.2 Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2026-04-26T10:30:00Z",
  "services": {
    "api": "healthy",
    "database": "healthy",
    "cache": "healthy",
    "queue": "healthy"
  },
  "version": "1.0.0"
}
```

## 9. Synthetic Monitoring

### 9.1 Synthetic Tests

| Test | Frequency | Check |
|------|-----------|-------|
| API availability | Every 1 min | API responds |
| API latency | Every 1 min | Latency < 500ms |
| Streak calculation | Every 5 min | Calculates correctly |
| Badge awarding | Every 5 min | Awards correctly |
| Leaderboard refresh | Every 15 min | Refreshes correctly |

### 9.2 Uptime Monitoring

| Check | Target | Alert Threshold |
|-------|--------|-----------------|
| API uptime | 99.9% | < 99.5% |
| Web app uptime | 99.9% | < 99.5% |
| Admin panel uptime | 99% | < 98% |

## 10. Performance Monitoring

### 10.1 APM Integration

**Tracked Operations:**
- API endpoints
- Database queries
- External service calls
- Background jobs

**Metrics per Operation:**
- Request count
- Response time (p50, p95, p99)
- Error rate
- Throughput

### 10.2 Real User Monitoring (RUM)

**Collected Data:**
- Page load time
- API call duration
- Error rate by browser
- Geographic performance

**Privacy:**
- No PII in RUM data
- IP anonymization
- Opt-out available

## 11. Analytics Events

### 11.1 Events to Track

| Event | Properties |
|-------|------------|
| streak.started | user_id, creator_id, streak_type |
| streak.incremented | user_id, creator_id, streak_type, count |
| streak.milestone | user_id, creator_id, milestone |
| streak.broken | user_id, creator_id, final_count |
| streak.frozen | user_id, creator_id, count |
| badge.earned | user_id, creator_id, badge_code |
| badge.viewed | user_id, badge_code |
| leaderboard.viewed | user_id, leaderboard_type |
| leaderboard.ranking_viewed | user_id, rank |

### 11.2 Funnel Tracking

**Streak Funnel:**
1. User signs up
2. User completes first workout
3. User views streak (day 2)
4. User reaches 7-day milestone
5. User reaches 30-day milestone

**Badge Funnel:**
1. User views badge catalog
2. User starts progress toward badge
3. User earns badge
4. User shares badge

## 12. Incident Response Dashboards

### 12.1 Incident Dashboard

During incidents, display:
- Current error rate
- Current latency
- Active incidents
- On-call personnel
- Recent deploys
- Recent configuration changes

### 12.2 Post-Incident Review

**Collected Data:**
- Timeline of events
- Metrics during incident
- Actions taken
- Root cause
- Prevention plan

## 13. Monitoring Runbook

### 13.1 Daily Checks

| Check | Command/URL |
|-------|-------------|
| Dashboard review | Grafana main dashboard |
| Error log review | Kibana error query |
| Alert review | Alert history |

### 13.2 Weekly Checks

| Check | Description |
|-------|-------------|
| Capacity planning | Review growth trends |
| Performance review | Check for degradation |
| Log review | Check for anomalies |
| Alert tuning | Adjust false positives |

### 13.3 Monthly Checks

| Check | Description |
|-------|-------------|
| SLA review | Compare vs targets |
| Cost review | Monitoring costs |
| Retention review | Adjust log retention |
| Drill | Incident response drill |

## 14. Monitoring Setup Commands

```bash
# Add tracing to service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4317
export OTEL_SERVICE_NAME=streak-service

# Health check configuration
curl http://localhost:3000/health

# Prometheus metrics
curl http://localhost:3000/metrics

# Log query example
curl -X POST "elasticsearch:9200/logs-*/_search" -d '
{
  "query": {"bool": {"must": [{"term": {"level": "ERROR"}}]}}}
'
```
