# Environment Configuration

## Environment Variables

Complete list of all environment variables needed for the project.

## Backend (.env)

```bash
# ============================================
# APPLICATION
# ============================================
NODE_ENV=production
PORT=3000
API_VERSION=v1
APP_NAME="Streaks & Badges API"
LOG_LEVEL=info

# ============================================
# DATABASE (PostgreSQL)
# ============================================
DATABASE_URL="postgresql://user:password@localhost:5432/macroactive?schema=public&pgbouncer=true"
DATABASE_POOL_MIN=10
DATABASE_POOL_MAX=100
DATABASE_TIMEOUT=30000
DATABASE_STATEMENT_TIMEOUT=10000

# Direct connection for migrations
DATABASE_DIRECT_URL="postgresql://user:password@localhost:5432/macroactive"

# ============================================
# REDIS (Cache & Queue)
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TLS=false
REDIS_SENTINEL_MODE=false
REDIS_CLUSTER_MODE=false

# Redis connection settings
REDIS_CONNECT_TIMEOUT=10000
REDIS_RETRY_STRATEGY_TIME=100
REDIS_MAX_RETRIES_PER_REQUEST=3

# ============================================
# QUEUE (Bull)
# ============================================
QUEUE_PREFIX=streaks-badges
QUEUE_REDIS_TLS=false
QUEUE_DEFAULT_JOB_OPTIONS_REMOVE_ON_COMPLETE=100
QUEUE_DEFAULT_JOB_OPTIONS_REMOVE_ON_FAIL=50
QUEUE_CONCURRENCY=10
QUEUE_LIMITE_MAX=10000

# ============================================
# JWT AUTHENTICATION
# ============================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=macroactive
JWT_AUDIENCE=macroactive-api

# ============================================
# EXTERNAL SERVICES
# ============================================

# Push Notification Service
PUSH_SERVICE_URL=https://push.macroactive.com
PUSH_SERVICE_API_KEY=
PUSH_SERVICE_TIMEOUT=5000

# Analytics
MIXPANEL_API_KEY=
MIXPANEL_API_HOST=https://api.mixpanel.com

AMPLITUDE_API_KEY=
AMPLITUDE_API_ENDPOINT=https://api.amplitude.com

# Sentry (Error Tracking)
SENTRY_DSN=
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1

# Data Warehouse
SNOWFLAKE_ACCOUNT=
SNOWFLAKE_USERNAME=
SNOWFLAKE_PASSWORD=
SNOWFLAKE_DATABASE=
SNOWFLAKE_WAREHOUSE=
SNOWFLAKE_SCHEMA=public

# ============================================
# FEATURE FLAGS
# ============================================
FEATURE_STREAKS_ENABLED=true
FEATURE_BADGES_ENABLED=true
FEATURE_LEADERBOARDS_ENABLED=true
FEATURE_FREEZE_ENABLED=true
FEATURE_ANALYTICS_ENABLED=true

# ============================================
# STREAK CONFIGURATION
# ============================================
STREAK_DEFAULT_QUALIFICATION_HOURS=24
STREAK_RESET_TIME_UTC=00:00
STREAK_AT_RISK_HOURS=18
STREAK_BREAK_HOURS=24

STREAK_FREEZE_PER_PERIOD=1
STREAK_FREEZE_PERIOD_DAYS=30

# Streak milestones
STREAK_MILESTONES=3,7,14,30,60,90,180,365

# ============================================
# BADGE CONFIGURATION
# ============================================
BADGE_AUTO_AWARD=true
BADGE_CELEBRATION_ENABLED=true
BADGE_SHARE_ENABLED=true

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
RATE_LIMIT_SKIP_SUCCESS_REQUESTS=false

# Rate limits by tier
RATE_LIMIT_FREE=100
RATE_LIMIT_PRO=1000
RATE_LIMIT_ENTERPRISE=10000

# ============================================
# CORS
# ============================================
CORS_ORIGIN=https://macroactive.com,https://staging.macroactive.com
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,PATCH
CORS_ALLOWED_HEADERS=Content-Type,Authorization

# ============================================
# WEBHOOK
# ============================================
WEBHOOK_TIMEOUT=10000
WEBHOOK_RETRY_ATTEMPTS=3
WEBHOOK_RETRY_DELAY=1000

# ============================================
# TIMEZONE
# ============================================
DEFAULT_TIMEZONE=Pacific/Auckland
TZ=Pacific/Auckland
```

## Frontend/Web (Next.js .env.local)

```bash
# ============================================
# NEXT.JS
# ============================================
NEXT_PUBLIC_APP_NAME="MacroActive"
NEXT_PUBLIC_APP_URL=https://macroactive.com

# ============================================
# API
# ============================================
NEXT_PUBLIC_API_URL=https://api.macroactive.com/v1
NEXT_PUBLIC_API_TIMEOUT=10000

# ============================================
# AUTHENTICATION
# ============================================
NEXT_PUBLIC_AUTH_DOMAIN=auth.macroactive.com
NEXT_PUBLIC_AUTH_CLIENT_ID=
NEXT_PUBLIC_AUTH_CALLBACK_URL=/auth/callback

# ============================================
# ENVIRONMENT
# ============================================
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_SENTRY_DSN=

# ============================================
# ANALYTICS
# ============================================
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_MIXPANEL_TOKEN=
NEXT_PUBLIC_AMPLITUDE_API_KEY=

# ============================================
# FEATURE FLAGS
# ============================================
NEXT_PUBLIC_STREAKS_ENABLED=true
NEXT_PUBLIC_BADGES_ENABLED=true
NEXT_PUBLIC_LEADERBOARDS_ENABLED=true

# ============================================
# STRIPE (if needed for payments)
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
```

## Docker/Compose (.env)

```bash
# ============================================
# DOCKER COMPOSE
# ============================================
COMPOSE_PROJECT_NAME=macroactive
COMPOSE_FILE=docker-compose.yml,docker-compose.prod.yml

# ============================================
# POSTGRES
# ============================================
POSTGRES_VERSION=15-alpine
POSTGRES_USER=macroactive
POSTGRES_PASSWORD=changeme
POSTGRES_DB=macroactive
POSTGRES_PORT=5432
PGDATA=/var/lib/postgresql/data

# ============================================
# REDIS
# ============================================
REDIS_VERSION=7-alpine
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_MAXMEMORY=256mb
REDIS_MAXMEMORY_POLICY=allkeys-lru

# ============================================
# APP (Backend)
# ============================================
BACKEND_PORT=3000
BACKEND_NODE_ENV=production

# ============================================
# NGINX
# ============================================
NGINX_PORT=80
NGINX_SSL_PORT=443
NGINX_SSL_CERT=/etc/nginx/certs/cert.pem
NGINX_SSL_KEY=/etc/nginx/certs/key.pem
```

## CI/CD (GitHub Actions - secrets)

```yaml
# Repository Secrets Required:
- DATABASE_URL
- REDIS_URL
- JWT_SECRET
- SENTRY_AUTH_TOKEN
- NPM_TOKEN
- DEPLOY_KEY
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
```

## Kubernetes ConfigMaps

### api-configmap.yaml

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
  namespace: macroactive
data:
  NODE_ENV: "production"
  PORT: "3000"
  LOG_LEVEL: "info"
  DATABASE_POOL_MIN: "10"
  DATABASE_POOL_MAX: "100"
  REDIS_PORT: "6379"
  REDIS_DB: "0"
  QUEUE_PREFIX: "streaks-badges"
  QUEUE_CONCURRENCY: "10"
  JWT_EXPIRES_IN: "1h"
  JWT_ISSUER: "macroactive"
  FEATURE_STREAKS_ENABLED: "true"
  FEATURE_BADGES_ENABLED: "true"
  STREAK_DEFAULT_QUALIFICATION_HOURS: "24"
  STREAK_RESET_TIME_UTC: "00:00"
  STREAK_AT_RISK_HOURS: "18"
  STREAK_BREAK_HOURS: "24"
  STREAK_FREEZE_PER_PERIOD: "1"
  STREAK_FREEZE_PERIOD_DAYS: "30"
```

## Environment-Specific Values

### Development

```bash
NODE_ENV=development
LOG_LEVEL=debug
DATABASE_URL=postgresql://postgres:password@localhost:5432/macroactive_dev
REDIS_HOST=localhost
FEATURE_STREAKS_ENABLED=true
FEATURE_BADGES_ENABLED=true
FEATURE_LEADERBOARDS_ENABLED=false
SENTRY_DSN=
```

### Staging

```bash
NODE_ENV=staging
LOG_LEVEL=debug
DATABASE_URL=postgresql://user:pass@staging-db.example.com:5432/macroactive_staging
REDIS_HOST=staging-redis.example.com
FEATURE_STREAKS_ENABLED=true
FEATURE_BADGES_ENABLED=true
FEATURE_LEADERBOARDS_ENABLED=true
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Production

```bash
NODE_ENV=production
LOG_LEVEL=info
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/macroactive?pool_min=10&pool_max=100
REDIS_HOST=prod-redis.example.com
REDIS_PASSWORD=[strong-password]
FEATURE_STREAKS_ENABLED=true
FEATURE_BADGES_ENABLED=true
FEATURE_LEADERBOARDS_ENABLED=true
SENTRY_DSN=https://xxx@sentry.io/xxx
JWT_SECRET=[cryptographically-secure-random-string]
```

## Secrets Management

### Required Secrets (never commit to git)

1. **Database passwords**
2. **JWT secret** (min 32 characters, cryptographically random)
3. **Redis password**
4. **API keys** for external services
5. **Webhook signing secrets**
6. **Encrypted environment variables**

### Generating Secrets

```bash
# JWT Secret (32 bytes random)
openssl rand -base64 32

# Database password (16 chars)
openssl rand -base64 16 | tr -d "=+/" | cut -c1-16

# Generic API key
openssl rand -hex 32
```

### Secrets Storage

| Environment | Storage Method |
|-------------|----------------|
| Local | .env files (gitignored) |
| Docker | Docker secrets or .env file |
| Kubernetes | Secrets (base64 encoded) |
| AWS | Secrets Manager or Parameter Store |
| GCP | Secret Manager |
| Azure | Key Vault |

## Docker Compose Full Example

### docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: macroactive-db
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-macroactive}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-macroactive}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-macroactive}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis
  redis:
    image: redis:7-alpine
    container_name: macroactive-redis
    command: redis-server --appendonly yes
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: macroactive-api
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      PORT: 3000
      DATABASE_URL: postgresql://${POSTGRES_USER:-macroactive}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-macroactive}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "${BACKEND_PORT:-3000}:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src
      - /app/node_modules

  # Frontend (Next.js)
  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    container_name: macroactive-web
    environment:
      NEXT_PUBLIC_API_URL: http://api:3000/v1
    ports:
      - "${WEB_PORT:-3001}:3000"
    depends_on:
      - api

  # Worker (background jobs)
  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: macroactive-worker
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      WORKER_MODE: "true"
      DATABASE_URL: postgresql://${POSTGRES_USER:-macroactive}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-macroactive}
      REDIS_HOST: redis
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

volumes:
  postgres_data:
  redis_data:
```

## Validation

### Env Validation Script

**File:** `backend/src/config/validation.ts`

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MIN: z.string().transform(Number).pipe(z.number().min(1)),
  DATABASE_POOL_MAX: z.string().transform(Number).pipe(z.number().min(1)),

  // Redis
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string(),
  JWT_ISSUER: z.string(),

  // Features
  FEATURE_STREAKS_ENABLED: z.string().transform(v => v === 'true'),
  FEATURE_BADGES_ENABLED: z.string().transform(v => v === 'true'),
  FEATURE_LEADERBOARDS_ENABLED: z.string().transform(v => v === 'true'),
});

export function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:');
    console.error(z.formatError(error).map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n'));
    process.exit(1);
  }
}
```

## Environment Setup Script

**File:** `scripts/setup-env.sh`

```bash
#!/bin/bash

set -e

echo "🔧 Setting up environment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

# Generate JWT secret if not set
if ! grep -q "JWT_SECRET=your-super-secret" .env; then
    echo "JWT_SECRET already set"
else
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i.bak "s/JWT_SECRET=your-super-secret/JWT_SECRET=$JWT_SECRET/" .env
    rm .env.bak
    echo "Generated new JWT_SECRET"
fi

# Check required variables
required_vars=(
    "DATABASE_URL"
    "REDIS_HOST"
    "JWT_SECRET"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if grep -q "^${var}=.*$" .env; then
        echo "✓ $var is set"
    else
        echo "✗ $var is missing"
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo ""
    echo "❌ Missing required environment variables:"
    printf '%s\n' "${missing_vars[@]}"
    exit 1
fi

echo ""
echo "✅ Environment setup complete!"
```

## Environment Loading

**File:** `backend/src/config/index.ts`

```typescript
import dotenv from 'dotenv';
import { validateEnv } from './validation';

// Load environment-specific .env
const envFiles = {
  development: '.env.development',
  staging: '.env.staging',
  production: '.env.production'
};

const envFile = envFiles[process.env.NODE_ENV as keyof typeof envFiles] || '.env';

dotenv.config({ path: envFile });

// Validate and export
export const env = validateEnv();

// Export typed env for use in app
export type Env = ReturnType<typeof validateEnv>;
```
