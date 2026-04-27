# Security Considerations

## 1. Overview

This document outlines security requirements, considerations, and anti-cheat measures for the Streaks & Badges System.

## 2. Security Principles

| Principle | Description |
|-----------|-------------|
| **Defense in Depth** | Multiple layers of security |
| **Least Privilege** | Minimum required access |
| **Fail Securely** | Default to secure behavior |
| **Zero Trust** | Verify every request |
| **Secure by Design** | Security built in from start |

## 3. Authentication & Authorization

### 3.1 Authentication

| Mechanism | Implementation |
|-----------|----------------|
| User Authentication | JWT via existing MacroActive auth |
| Creator Authentication | JWT + API keys |
| Admin Authentication | JWT + MFA |
| Service-to-Service | Mutual TLS |

**Token Validation:**
```typescript
// Every API request validates token
interface AuthContext {
  userId: number;
  creatorId?: number;
  role: 'user' | 'creator' | 'admin';
  permissions: string[];
}
```

### 3.2 Authorization Matrix

| Resource | User | Creator | Admin |
|----------|------|---------|-------|
| Own streaks | Read/Write | Read | Read/Write |
| Own badges | Read | Read | Read/Write |
| Creator config | None | Full | Full |
| All users | None | Own users only | Full |
| System settings | None | None | Full |

### 3.3 API Security

**Security Headers:**
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

## 4. Data Protection

### 4.1 Data Classification

| Classification | Data | Storage | Transmission |
|----------------|------|---------|--------------|
| Public | Badge catalog, leaderboards | Encrypted | Encrypted |
| Internal | System metrics, logs | Encrypted | Encrypted |
| Confidential | User streaks, badges | Encrypted | Encrypted |
| Restricted | PII, health data | Encrypted | Encrypted + Audit |

### 4.2 Encryption

| Data | At Rest | In Transit |
|------|---------|------------|
| Database | AES-256 | TLS 1.3 |
| Backups | AES-256 | TLS 1.3 |
| Cache | Optional | TLS 1.3 |
| Logs | N/A | TLS 1.3 |

### 4.3 PII Handling

**Collect Only:**
- User ID (internal)
- Creator ID (internal)
- Display name (user-provided)
- Timezone (for streak calculations)

**Never Collect:**
- Full names
- Email addresses in logs
- Physical addresses
- Phone numbers
- Birth dates
- Health measurements

### 4.4 GDPR Compliance

| Right | Implementation |
|-------|----------------|
| Right to access | User data export API |
| Right to rectification | Profile edit, support contact |
| Right to erasure | Account deletion (cascades to streaks/badges) |
| Right to portability | Data export API |
| Right to object | Opt-out of analytics |

## 5. Anti-Cheat Measures

### 5.1 Cheating Vectors

| Vector | Description | Risk |
|--------|-------------|------|
| Backdate activities | Manually set past dates | High |
| Multiple submissions | Submit same activity multiple times | Medium |
| Automated scripts | Bot to complete activities | High |
| Account sharing | Use multiple accounts for leaderboard | Low |
| API manipulation | Direct API calls to fake data | High |

### 5.2 Prevention Strategies

#### Activity Validation

```typescript
interface ActivityValidation {
  // Timestamp within acceptable window
  timestamp: {
    min: Date.now() - 24 hours;
    max: Date.now() + 5 minutes;
  };

  // Rate limiting
  rateLimit: {
    maxPerDay: 10;
    maxPerHour: 5;
  };

  // Source verification
  source: 'mobile_app' | 'web_app' | 'api';

  // Duplicate detection
  deduplication: {
    window: 1 hour;
    fields: ['user_id', 'activity_type', 'timestamp'];
  };
}
```

#### Streak Validation

| Check | Description |
|-------|-------------|
| Time window | Activity must be within 24h of previous |
| Source trust | Mobile app > web app > manual entry |
| Pattern analysis | Flag suspicious patterns (exact same time daily) |
| Velocity checks | Flag impossible activity sequences |
| Geographic check | Flag activities in impossible locations |

#### Badge Validation

| Check | Description |
|-------|-------------|
| Timestamp verification | Verify activity timestamps are legitimate |
| Progress tracking | Calculate progress independently |
| Manual review | Flag unusual badge earning patterns |

### 5.3 Detection & Response

**Detection Rules:**
```typescript
interface CheatDetection {
  // Suspicious patterns
  patterns: {
    exact_interval: 'activities at exactly 24h intervals';
    impossible_velocity: 'activities in different cities < 1h apart';
    bulk_submission: '10+ activities within 1 minute';
    api_only: 'no app activity, only API calls';
  };

  // Response actions
  response: {
    warning: 'notify user, flag account';
    shadowban: 'hide from leaderboards';
    suspend: 'temporarily suspend account';
    ban: 'permanently ban account';
  };
}
```

**Detection Pipeline:**
```
Activity → Validate → Check Patterns → Flag?
                ↓                          ↓
            Accept                    Review → Action
```

### 5.4 Leaderboard Fairness

| Measure | Implementation |
|---------|----------------|
| Nickname support | Users can display anonymous names |
| Opt-out option | Users can exclude themselves |
| Verification badges | Indicate verified accounts |
| Score auditing | Regular checks for anomalies |
| Shadowbanning | Cheaters see themselves but not on public leaderboard |

## 6. Input Validation

### 6.1 API Input Validation

| Input Type | Validation |
|------------|------------|
| User ID | Integer, positive, exists |
| Creator ID | Integer, positive, exists |
| Streak Type | Enum, allowed values |
| Date | ISO8601, within range |
| Badge Code | Alphanumeric, max 50 chars |
| Pagination | Integer, min 1, max 100 |

### 6.2 SQL Injection Prevention

```typescript
// Use parameterized queries
const result = await db.query(
  'SELECT * FROM streaks WHERE user_id = $1',
  [userId]
);

// Never use string concatenation
// WRONG: `SELECT * FROM streaks WHERE user_id = ${userId}`
```

### 6.3 XSS Prevention

```typescript
// Sanitize all user-generated content
import { sanitize } from 'sanitizer';

const cleanContent = sanitize(userInput);

// Content Security Policy
const csp = "default-src 'self'; script-src 'self' 'unsafe-inline'";
```

## 7. Rate Limiting

### 7.1 API Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| GET /streaks/* | 100/hour | Hour |
| POST /streaks/*/freeze | 10/day | Day |
| GET /badges/* | 100/hour | Hour |
| POST /badges/*/award | 50/day | Day |
| GET /leaderboards/* | 100/hour | Hour |

### 7.2 Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1714395600
Retry-After: 3600
```

## 8. Audit Logging

### 8.1 Audited Actions

| Action | Logged Data |
|--------|-------------|
| Streak modified | User ID, previous, new, timestamp, actor |
| Badge awarded | User ID, badge, reason, timestamp |
| Config changed | Creator ID, previous, new, timestamp |
| Manual intervention | Admin ID, action, reason, timestamp |
| Security event | Event type, details, timestamp |

### 8.2 Audit Log Format

```json
{
  "audit_id": "audit_123456",
  "timestamp": "2026-04-26T10:30:00Z",
  "actor": {
    "id": 789,
    "type": "creator",
    "ip": "192.168.1.1"
  },
  "action": "badge.manual_award",
  "target": {
    "type": "user",
    "id": 123456
  },
  "changes": {
    "badge_added": "custom_champion"
  },
  "reason": "Challenge winner"
}
```

## 9. Vulnerability Management

### 9.1 Dependency Scanning

| Tool | Frequency |
|------|-----------|
| npm audit | Every build |
| Snyk | Daily |
| OWASP Dependency Check | Weekly |

### 9.2 Penetration Testing

| Type | Frequency | Scope |
|------|-----------|-------|
| Automated scan | Weekly | All endpoints |
| Manual test | Quarterly | Critical flows |
| Third-party audit | Annually | Full system |

### 9.3 Security Review Checklist

- [ ] Authentication required for all endpoints
- [ ] Authorization checked for each action
- [ ] Input validation on all inputs
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Security headers configured
- [ ] Encryption enabled
- [ ] Logging enabled (no sensitive data)
- [ ] Dependencies up to date
- [ ] Secrets not in code

## 10. Incident Response

### 10.1 Security Incident Types

| Type | Example | Response |
|------|---------|----------|
| Data breach | Unauthorized data access | Immediate containment, legal notification |
| DoS attack | System flood | Rate limiting, upstream filtering |
| Account compromise | Credential theft | Account lock, password reset |
| Cheating | Exploiting streak system | Account suspension, data correction |

### 10.2 Response Process

1. **Detect** - Monitoring alert
2. **Triage** - Assess severity
3. **Contain** - Limit damage
4. **Eradicate** - Remove threat
5. **Recover** - Restore service
6. **Review** - Post-mortem

## 11. Compliance

### 11.1 Standards Compliance

| Standard | Status | Notes |
|----------|--------|-------|
| GDPR | Compliant | User data rights implemented |
| CCPA | Compliant | California privacy rights |
| SOC 2 | In Progress | Audit scheduled Q3 |
| ISO 27001 | Future | Planned for 2027 |

### 11.2 Data Residency

| Region | Data Storage |
|--------|--------------|
| US | US-East region |
| EU | EU region (Frankfurt) |
| AU | AP region (Sydney) |
| NZ | AP region (Sydney) |

## 12. Security Best Practices

### 12.1 Development

| Practice | Implementation |
|----------|----------------|
| Code review | Required for all changes |
| Security review | Required for auth/data changes |
| Secrets management | Environment variables, secret manager |
| Branch protection | Protected main branch |

### 12.2 Deployment

| Practice | Implementation |
|----------|----------------|
| Least privilege accounts | Service accounts with minimal permissions |
| Immutable infrastructure | Replace rather than modify |
|Separation of duties | Different accounts for deploy/ops |

### 12.3 Operations

| Practice | Implementation |
|----------|----------------|
| Access reviews | Quarterly |
| Key rotation | Every 90 days |
| Certificate renewal | Automated, 30 days before expiry |
| Security patches | Within 7 days of release |
