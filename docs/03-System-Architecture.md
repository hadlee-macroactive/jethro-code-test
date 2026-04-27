# System Architecture

## 1. Overview

The Streaks & Badges System is designed as a modular enhancement to the existing MacroActive platform. It follows an event-driven architecture with asynchronous processing for streak evaluation and badge awarding.

## 2. Architectural Principles

| Principle | Description |
|-----------|-------------|
| **Separation of Concerns** | Streak logic is isolated from badge logic and event tracking |
| **Event-Driven** | All user actions emit events that trigger streak evaluation |
| **Asynchronous Processing** | Heavy calculations happen in background jobs |
| **Idempotency** | All operations can be safely retried |
| **Scalability** | System handles 10x current user growth |
| **Data Consistency** | Eventual consistency acceptable for streaks, strong consistency for awards |

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                         │
│  │   iOS App   │  │ Android App │  │   Web App   │                         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                         │
│         │                │                │                                   │
└─────────┼────────────────┼────────────────┼───────────────────────────────────┘
          │                │                │
          │    REST API & GraphQL Endpoints  │
          └────────────────┼────────────────┘
┌─────────────────────────┼─────────────────────────────────────────────────────┐
│                         │              API GATEWAY                              │
│                         └────────────────┼─────────────────────────────────────┤
├──────────────────────────────────────────┼─────────────────────────────────────┤
│          ┌───────────────────────────────┴───────────────────────┐            │
│          │                   APPLICATION LAYER                   │            │
│          ├───────────────────────────────────────────────────────┤            │
│          │  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐ │            │
│          │  │ Streak      │  │ Badge       │  │ Creator       │ │            │
│          │  │ Service     │  │ Service     │  │ Config        │ │            │
│          │  │             │  │             │  │ Service       │ │            │
│          │  └──────┬──────┘  └──────┬──────┘  └───────┬───────┘ │            │
│          │         │                │                │         │            │
│          │  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴───────┐ │            │
│          │  │ Event       │  │ Evaluation  │  │ Notification  │ │            │
│          │  │ Ingestion   │  │ Engine      │  │ Service       │ │            │
│          │  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘ │            │
│          └─────────┼────────────────┼────────────────┼─────────┘            │
└────────────────────┼────────────────┼────────────────┼───────────────────────┘
                     │                │                │
┌────────────────────┼────────────────┼────────────────┼───────────────────────┐
│                     │         DATA LAYER              │                       │
├─────────────────────┼────────────────┼────────────────┼───────────────────────┤
│      ┌──────────────┴──────┐ ┌───────┴──────────┐ ┌────┴──────────────────┐  │
│      │   PostgreSQL        │ │   Redis Cache   │ │  Message Queue        │  │
│      │   (Primary DB)      │ │   (Session/     │ │  (Background Jobs)    │  │
│      │                     │ │    Streak Cache)│ │                       │  │
│      │ • Users             │ │                 │ │  • Streak Evaluation  │  │
│      │ • Streaks           │ │ • Active        │ │  • Badge Awarding     │  │
│      │ • Badges            │ │   Streaks       │ │  • Notifications      │  │
│      │ • Events            │ │ • Leaderboards  │ │  • Data Sync          │  │
│      │ • Config            │ │                 │ │                       │  │
│      └─────────────────────┘ └─────────────────┘ └───────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                     │                │                │
┌────────────────────┼────────────────┼────────────────┼───────────────────────┐
│                     │    INTEGRATION LAYER            │                       │
├─────────────────────┼────────────────┼────────────────┼───────────────────────┤
│      ┌──────────────┴──────┐ ┌───────┴──────────┐ ┌────┴──────────────────┐  │
│      │   Push Notification │ │   Data Warehouse │ │   Analytics Platform   │  │
│      │   Service           │ │   (Snowflake/BQ) │ │   (Mixpanel/Amplitude)│  │
│      └─────────────────────┘ └─────────────────┘ └───────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4. Component Details

### 4.1 API Gateway

**Technology:** Kong / AWS API Gateway

**Responsibilities:**
- Request routing
- Rate limiting
- Authentication/authorization
- Request/response logging
- SSL termination

**Rate Limits:**
- Authenticated: 1000 requests/hour
- Anonymous: 100 requests/hour

### 4.2 Streak Service

**Technology:** Node.js / TypeScript

**Responsibilities:**
- Streak calculation and tracking
- Streak freeze management
- Streak milestone evaluation
- Streak state queries

**API Endpoints:**
```
GET    /api/v1/streaks/users/{userId}
GET    /api/v1/streaks/users/{userId}/history
POST   /api/v1/streaks/users/{userId}/freeze
GET    /api/v1/streaks/leaderboard/{type}
```

### 4.3 Badge Service

**Technology:** Node.js / TypeScript

**Responsibilities:**
- Badge evaluation and awarding
- Badge inventory management
- Badge display configuration
- Badge progress tracking

**API Endpoints:**
```
GET    /api/v1/badges/users/{userId}
GET    /api/v1/badges/catalog
POST   /api/v1/badges/users/{userId}/award (admin)
GET    /api/v1/badges/users/{userId}/progress/{badgeId}
```

### 4.4 Event Ingestion Service

**Technology:** Kafka / Kinesis

**Responsibilities:**
- Event validation
- Event enrichment
- Event routing to processors
- Event persistence

**Event Types:**
```
workout.completed
nutrition.logged
habit.completed
community.post_created
community.comment_added
user enrolled
user.cancelled
```

### 4.5 Evaluation Engine

**Technology:** Node.js / Python (Worker Processes)

**Responsibilities:**
- Batch streak evaluation
- Daily streak reset calculation
- Badge eligibility checking
- Anti-cheat validation

**Job Schedule:**
```
Every 5 minutes:  Real-time streak update (high-priority users)
Hourly:           Batch streak evaluation
Daily (UTC 00:00): Daily streak reset and milestone check
```

### 4.6 Notification Service

**Technology:** Firebase Cloud Messaging / Apple Push Service

**Responsibilities:**
- Push notification delivery
- Notification template management
- Delivery tracking
- User preference handling

**Notification Types:**
```
streak.at_risk        - "Don't lose your streak! Log your workout today."
streak.milestone      - "🔥 30-day streak! You're on fire!"
badge.earned          - "🏆 New badge: 30-Day Machine"
streak.frozen         - "Streak freeze activated. Take a rest day!"
leaderboard.moved_up  - "You climbed to #5 on the weekly leaderboard!"
```

### 4.7 Creator Config Service

**Technology:** Node.js / TypeScript

**Responsibilities:**
- Creator configuration management
- Feature flag management
- Streak type configuration
- Badge catalog customization

**API Endpoints:**
```
GET    /api/v1/config/creators/{creatorId}
PUT    /api/v1/config/creators/{creatorId}/streaks
PUT    /api/v1/config/creators/{creatorId}/badges
GET    /api/v1/config/creators/{creatorId}/analytics
```

## 5. Data Flow

### 5.1 Event Flow (Streak Update)

```
1. User completes workout
   ↓
2. Mobile App → API Gateway
   ↓
3. Workout Service (existing) processes workout
   ↓
4. Event emitted: workout.completed
   ↓
5. Event Ingestion validates and enriches
   ↓
6. Event queued for processing
   ↓
7. Evaluation Engine processes event
   ↓
8. Streak Service updates streak
   ↓
9. Cache updated (Redis)
   ↓
10. Database updated (PostgreSQL)
    ↓
11. Notification Service sends push (if milestone)
    ↓
12. Analytics event emitted
```

### 5.2 Badge Awarding Flow

```
1. Streak milestone reached OR Manual award
   ↓
2. Evaluation Engine detects eligibility
   ↓
3. Badge Service validates and awards
   ↓
4. Database record created
   ↓
5. Cache updated
   ↓
6. Notification Service sends push
   ↓
7. WebSocket notification to client (real-time)
   ↓
8. Analytics event emitted
```

## 6. Technology Stack

### 6.1 Backend

| Component | Technology | Version |
|-----------|------------|---------|
| API Runtime | Node.js | 20.x LTS |
| Language | TypeScript | 5.x |
| Framework | Express / Fastify | Latest |
| Database | PostgreSQL | 15+ |
| Cache | Redis | 7.x |
| Message Queue | RabbitMQ / AWS SQS | Latest |
| ORM | Prisma / TypeORM | Latest |

### 6.2 Infrastructure

| Component | Technology | Provider |
|-----------|------------|----------|
| Hosting | AWS / GCP | Cloud |
| Container | Docker | - |
| Orchestration | Kubernetes | - |
| CDN | CloudFront / Cloud CDN | - |
| Monitoring | Datadog / New Relic | - |
| Logging | ELK / Cloud Logging | - |

## 7. Scalability Considerations

### 7.1 Horizontal Scaling

- **API Services:** Auto-scaling based on CPU/memory
- **Evaluation Workers:** Auto-scaling based on queue depth
- **Database:** Read replicas for reporting

### 7.2 Caching Strategy

| Data Type | Cache Layer | TTL |
|-----------|-------------|-----|
| Active Streaks | Redis | 1 hour |
| Leaderboards | Redis | 15 minutes |
| Badge Catalog | Redis | 24 hours |
| Creator Config | Redis | 1 hour |
| User Session | Redis | 7 days |

### 7.3 Database Partitioning

| Table | Partition Key | Strategy |
|-------|---------------|-----------|
| events | created_at | Time-based (monthly) |
| streak_history | user_id | Hash-based |
| notifications | user_id | Hash-based |

## 8. Security Architecture

### 8.1 Authentication & Authorization

- **Authentication:** JWT tokens via existing auth system
- **Authorization:** Role-based access control (RBAC)
- **API Security:** API keys for creator integrations

### 8.2 Data Protection

- **Encryption at Rest:** Database encryption enabled
- **Encryption in Transit:** TLS 1.3 for all communications
- **PII Handling:** Compliant with GDPR and privacy policies

## 9. Monitoring & Observability

### 9.1 Key Metrics to Monitor

| Metric Type | Examples |
|-------------|----------|
| Business | Streaks active, badges awarded, retention |
| Application | API latency, error rates, queue depth |
| Infrastructure | CPU, memory, disk I/O |
| Database | Connection pool, query performance |

### 9.2 Alerting Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| API Error Rate | 1% | 5% |
| API Latency (p95) | 500ms | 2000ms |
| Queue Depth | 10,000 | 50,000 |
| DB Connection Pool | 80% | 95% |
