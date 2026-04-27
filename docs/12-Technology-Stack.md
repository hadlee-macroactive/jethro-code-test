# Technology Stack

## 1. Overview

This document defines the technology choices for the Streaks & Badges System, including justifications and alignment with MacroActive's existing infrastructure.

## 2. Technology Choices

### 2.1 Backend Services

| Component | Technology | Version | Justification |
|-----------|------------|---------|---------------|
| **Runtime** | Node.js | 20.x LTS | Existing MacroActive stack, async I/O for event processing |
| **Language** | TypeScript | 5.x | Type safety for complex business logic, existing codebase |
| **API Framework** | Fastify | Latest | Better performance than Express, existing adoption |
| **ORM** | Prisma | Latest | Type-safe queries, migration management, existing use |
| **Validation** | Zod | Latest | Runtime type validation, TypeScript-first |

### 2.2 Data Layer

| Component | Technology | Version | Justification |
|-----------|------------|---------|---------------|
| **Primary Database** | PostgreSQL | 15+ | ACID compliance, JSONB, existing infrastructure |
| **Cache** | Redis | 7.x | In-memory caching for leaderboards, active streaks |
| **Message Queue** | RabbitMQ | Latest | Reliable event delivery, existing infrastructure |
| **Event Stream** | Kafka | Latest | High-throughput event processing (future) |

### 2.3 Infrastructure

| Component | Technology | Provider | Justification |
|-----------|------------|----------|---------------|
| **Hosting** | AWS / GCP | Cloud | Existing MacroActive hosting |
| **Containers** | Docker | - | Consistent deployment |
| **Orchestration** | Kubernetes | - | Scalability, existing infrastructure |
| **CDN** | CloudFront / Cloud CDN | - | Badge icon delivery |
| **File Storage** | S3 / GCS | - | Badge images, exports |

### 2.4 Frontend

| Component | Technology | Version | Justification |
|-----------|------------|---------|---------------|
| **Web Framework** | React | 18.x | Existing web app framework |
| **Mobile (iOS)** | Swift | Latest | Native iOS app |
| **Mobile (Android)** | Kotlin | Latest | Native Android app |
| **State Management** | Redux Toolkit | Latest | Existing state management |
| **UI Components** | Material UI / Custom | Latest | Consistent design system |

### 2.5 Observability

| Component | Technology | Justification |
|-----------|------------|---------------|
| **Monitoring** | Datadog / New Relic | APM, infrastructure monitoring |
| **Logging** | ELK Stack / Cloud Logging | Centralized logging |
| **Error Tracking** | Sentry | Real-time error alerts |
| **Analytics** | Mixpanel / Amplitude | User behavior analytics |
| **Metrics** | Prometheus + Grafana | Custom dashboards |

### 2.6 Development Tools

| Component | Technology | Justification |
|-----------|------------|---------------|
| **Version Control** | Git | Standard VCS |
| **CI/CD** | GitHub Actions | Existing pipeline |
| **Code Quality** | ESLint, Prettier | Code standards |
| **Testing** | Jest, Playwright | Unit and E2E tests |
| **API Docs** | OpenAPI/Swagger | API documentation |

## 3. Architecture Patterns

### 3.1 API Design

**RESTful Principles:**
- Resource-oriented URLs
- HTTP verbs for operations
- Standard status codes
- JSON for data exchange

**Example:**
```
GET    /api/v1/streaks/users/{userId}
POST   /api/v1/streaks/users/{userId}/freeze
GET    /api/v1/badges/users/{userId}
```

### 3.2 Event-Driven Architecture

**Pattern:** Publisher-Subscriber

**Components:**
- Event producers (existing services)
- Message broker (RabbitMQ)
- Event consumers (streak/badge services)

**Benefits:**
- Decoupling from existing services
- Asynchronous processing
- Scalability

### 3.3 Caching Strategy

**Cache-Aside Pattern:**

```
1. Check cache for data
2. If miss, query database
3. Populate cache
4. Return data
```

**Cache Invalidation:**
- Time-based TTL
- Write-through on critical updates
- Cache warming on deployment

## 4. Database Design Principles

### 4.1 Schema Design

- Normalized for data integrity
- JSONB for flexible metadata
- Indexes for query performance
- Partitioning for large tables

### 4.2 Migration Strategy

- Version-controlled migrations
- Forward and rollback scripts
- Zero-downtime deployments
- Blue-green deployment pattern

## 5. Security Considerations

### 5.1 Authentication & Authorization

| Mechanism | Technology |
|-----------|------------|
| Authentication | JWT (existing) |
| Authorization | RBAC |
| API Security | API Keys + Rate Limiting |

### 5.2 Data Protection

- Encryption at rest (database)
- Encryption in transit (TLS 1.3)
- PII masking in logs
- GDPR compliance

## 6. Performance Considerations

### 6.1 Target Performance

| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 200ms |
| API Response Time (p99) | < 500ms |
| Streak Calculation | < 5 seconds |
| Badge Awarding | < 5 seconds |
| Leaderboard Refresh | < 5 seconds |

### 6.2 Scaling Strategy

**Horizontal Scaling:**
- Stateless services
- Load balancing
- Auto-scaling groups

**Database Scaling:**
- Read replicas
- Connection pooling
- Query optimization

**Caching:**
- Redis for hot data
- CDN for static assets
- Application-level caching

## 7. Technology Alternatives Considered

### 7.1 Backend Runtime

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Node.js | Existing stack, async I/O | Single-threaded | ✅ Selected |
| Python | Good for data processing | Not in existing stack | ❌ Rejected |
| Go | High performance | New language for team | ❌ Rejected |

### 7.2 Database

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| PostgreSQL | ACID, JSONB, existing | - | ✅ Selected |
| MongoDB | Flexible schema | Not ACID by default | ❌ Rejected |
| MySQL | Good for relations | Less flexible JSON | ❌ Rejected |

### 7.3 Message Queue

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| RabbitMQ | Reliable, flexible | More complex | ✅ Selected |
| Redis Pub/Sub | Simple | Less reliable | ❌ Rejected |
| Kafka | High throughput | Overkill for current scale | Future |

## 8. Migration Strategy

### 8.1 From Existing Systems

The Streaks & Badges System will integrate with:

- User authentication (existing)
- Workout tracking (existing)
- Nutrition logging (existing)
- Community features (existing)
- Notification system (existing)

### 8.2 Integration Points

```
┌─────────────────────────────────────────────────────┐
│              Existing MacroActive Platform          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐│
│  │ Workout │  │Nutrition│  │ Habit   │  │Community││
│  │ Service │  │ Service │  │ Service │  │ Service ││
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘│
│       │            │            │            │      │
│       └────────────┴────────────┴────────────┘      │
│                      │                              │
│               Events │                              │
│                      ▼                              │
│  ┌─────────────────────────────────────────────┐   │
│  │         Streaks & Badges System             │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐     │   │
│  │  │ Streak  │  │ Badge   │  │ Leader  │     │   │
│  │  │ Service │  │ Service │  │ Board   │     │   │
│  │  └─────────┘  └─────────┘  └─────────┘     │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## 9. Version Control Strategy

### 9.1 Branch Strategy

```
main (production)
  ↑
develop (staging)
  ↑
feature/phase-1-streaks
feature/phase-2-badges
feature/phase-3-dashboard
feature/phase-4-leaderboards
```

### 9.2 Commit Conventions

| Type | Description | Example |
|------|-------------|---------|
| feat | New feature | `feat: add streak freeze` |
| fix | Bug fix | `fix: correct streak calc` |
| docs | Documentation | `docs: update API spec` |
| refactor | Refactoring | `refactor: simplify badge eval` |
| test | Tests | `test: add streak tests` |
| chore | Maintenance | `chore: update deps` |

## 10. Deployment Strategy

### 10.1 Environments

| Environment | Purpose | Data |
|-------------|---------|------|
| Development | Local development | Mock/test data |
| Staging | Pre-production testing | Anonymized production data |
| Production | Live system | Real user data |

### 10.2 Deployment Process

1. Create release branch
2. Run all tests
3. Deploy to staging
4. Run smoke tests
5. Get approval
6. Deploy to production (blue-green)
7. Monitor for issues
8. Rollback if needed

## 11. Technology Lifecycle Management

| Component | Current Version | Support End | Upgrade Plan |
|-----------|-----------------|-------------|--------------|
| Node.js | 20.x LTS | 2026-04 | Quarterly updates |
| PostgreSQL | 15 | 2027-11 | Security patches |
| Redis | 7.x | Ongoing | Minor updates |
| Fastify | Latest | Ongoing | Monthly updates |

## 12. Development Standards

### 12.1 Code Style

- ESLint for linting
- Prettier for formatting
- AirBnB style guide (customized)
- Mandatory type definitions (TypeScript)

### 12.2 Testing Standards

| Test Type | Coverage Target | Framework |
|-----------|-----------------|-----------|
| Unit | 80%+ | Jest |
| Integration | 70%+ | Jest + Supertest |
| E2E | Critical paths | Playwright |

### 12.3 Documentation Standards

- JSDoc for functions
- OpenAPI for API specs
- Architecture decision records (ADRs)
- Runbooks for operations
