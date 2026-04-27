import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment-specific .env
const envFiles = {
  development: '.env.development',
  staging: '.env.staging',
  production: '.env.production'
};

const envFile = envFiles[process.env.NODE_ENV as keyof typeof envFiles] || '.env';

dotenv.config({ path: envFile });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  DATABASE_URL: z.string().min(1),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('6379'),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_ISSUER: z.string().default('macroactive'),
  FEATURE_STREAKS_ENABLED: z.string().transform(v => v === 'true').default('true'),
  FEATURE_BADGES_ENABLED: z.string().transform(v => v === 'true').default('true'),
  FEATURE_LEADERBOARDS_ENABLED: z.string().transform(v => v === 'true').default('true'),
});

export function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid environment variables:');
      error.errors.forEach(e => {
        console.error(`  - ${e.path.join('.')}: ${e.message}`);
      });
    }
    if (process.env.NODE_ENV !== 'production') {
      // In dev, return partial config with defaults
      return envSchema.parse({
        NODE_ENV: 'development',
        PORT: '3000',
        LOG_LEVEL: 'debug',
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/macroactive',
        REDIS_HOST: 'localhost',
        REDIS_PORT: '6379',
        JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key',
        JWT_EXPIRES_IN: '1h',
        JWT_ISSUER: 'macroactive',
        FEATURE_STREAKS_ENABLED: 'true',
        FEATURE_BADGES_ENABLED: 'true',
        FEATURE_LEADERBOARDS_ENABLED: 'true',
      });
    }
    process.exit(1);
  }
}

export const env = validateEnv();
export type Env = ReturnType<typeof validateEnv>;
