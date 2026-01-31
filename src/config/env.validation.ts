import { ENV_VALIDATION_MESSAGES } from '@/shared/constants';
import z from 'zod';

const envSchema = z.object({
  // ============================================
  // 1) SERVER CONFIGURATION
  // ============================================
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // ============================================
  // 2) MONGODB CONFIGURATION (from constants.ts MONGODB_CONFIG)
  // ============================================
  MONGODB_HOST: z.string().default('localhost'),
  MONGODB_PORT: z.string().default('27017').transform(Number),
  MONGODB_USERNAME: z.string().default(''),
  MONGODB_PASSWORD: z.string().default(''),
  MONGODB_AUTH_SOURCE: z.string().default('admin'),
  MONGODB_AUTH_MECHANISM: z.string().default(''),
  MONGODB_REPLICA_SET: z.string().default(''),
  MONGODB_SRV: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  MONGODB_SSL: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  MONGODB_URI: z.preprocess(
    (val) => {
      // Prioritize explicit env var, then fallback
      if (typeof val === 'string' && val.length) return val;
      if (typeof process.env.MONGODB_URI === 'string' && process.env.MONGODB_URI.length)
        return process.env.MONGODB_URI;
      return val;
    },
    z
      .string()
      .optional()
      .default('')
      // Relaxed validation or check if empty
      .refine((uri) => !uri || /^mongodb(\+srv)?:\/\/.+/.test(uri), {
        message: ENV_VALIDATION_MESSAGES.MONGO_URI_INVALID,
      })
  ),
  MONGODB_DISABLED: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  MONGODB_DB_NAME: z.string().default('jollyjet'),
  MONGODB_MAX_POOL_SIZE: z.string().default('10').transform(Number),
  MONGODB_MIN_POOL_SIZE: z.string().default('2').transform(Number),
  MONGODB_CONNECTION_TIMEOUT: z.string().default('10000').transform(Number),
  MONGODB_SOCKET_TIMEOUT: z.string().default('45000').transform(Number),
  MONGODB_SERVER_SELECTION_TIMEOUT: z.string().default('5000').transform(Number),
  MONGODB_RETRY_ATTEMPTS: z.string().default('3').transform(Number),
  MONGODB_RETRY_DELAY: z.string().default('1000').transform(Number),

  // ============================================
  // 3) REDIS CONFIGURATION (from constants.ts REDIS_CONFIG)
  // ============================================
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379').transform(Number),
  REDIS_USERNAME: z.string().default(''),
  REDIS_PASSWORD: z.string().default(''),
  REDIS_DB: z.string().default('0').transform(Number),
  REDIS_TLS: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  REDIS_DISABLED: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  REDIS_EXPIRE_TIME: z
    .string()
    .default(String(60 * 60 * 24))
    .transform(Number),
  REDIS_MAX_RETRIES: z.string().default('5').transform(Number),
  REDIS_RETRY_DELAY: z.string().default('1000').transform(Number),

  // Redis TTL Configuration
  REDIS_TTL_DEFAULT: z
    .string()
    .default(String(60 * 60 * 24))
    .transform(Number),
  REDIS_TTL_SHORT: z
    .string()
    .default(String(60 * 60))
    .transform(Number),
  REDIS_TTL_LONG: z
    .string()
    .default(String(60 * 60 * 24 * 7))
    .transform(Number),
  REDIS_TTL_NEVER: z.string().default('0').transform(Number),
  REDIS_TTL_SESSION: z
    .string()
    .default(String(60 * 60 * 24))
    .transform(Number),
  REDIS_TTL_TEMPORARY: z
    .string()
    .default(String(60 * 60 * 24))
    .transform(Number),
  REDIS_TTL_PERMANENT: z
    .string()
    .default(String(60 * 60 * 24 * 365))
    .transform(Number),
  REDIS_TTL_MAX: z
    .string()
    .default(String(60 * 60 * 24 * 365))
    .transform(Number),
  REDIS_TTL_MIN: z
    .string()
    .default(String(60 * 60 * 24))
    .transform(Number),
  REDIS_TTL_RATE_LIMIT: z
    .string()
    .default(String(60 * 60 * 24))
    .transform(Number),
  REDIS_TTL_PRODUCT: z
    .string()
    .default(String(60 * 60 * 24))
    .transform(Number),
  REDIS_TTL_USER: z
    .string()
    .default(String(60 * 60 * 24))
    .transform(Number),

  // Redis Rate Limiting Configuration
  REDIS_RATE_LIMIT_WINDOW: z
    .string()
    .default(String(60 * 60 * 24))
    .transform(Number),
  REDIS_RATE_LIMIT_LIMIT: z.string().default('100').transform(Number),
  REDIS_RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),
  REDIS_RATE_LIMIT_MAX_RETRIES: z.string().default('5').transform(Number),

  // Redis Consistency Monitoring
  REDIS_CONSISTENCY_CHECK_INTERVAL: z
    .string()
    .default(String(60 * 60 * 24))
    .transform(Number),
  REDIS_CONSISTENCY_SAMPLE_SIZE: z.string().default('10').transform(Number),
  REDIS_CONSISTENCY_STALE_THRESHOLD: z
    .string()
    .default(String(60 * 60 * 24))
    .transform(Number),

  // ============================================
  // 4) JWT CONFIGURATION
  // ============================================
  JWT_SECRET: z.string().min(32).default('your-super-secret-jwt-key-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('24h'),

  // ============================================
  // 5) RATE LIMITING
  // ============================================
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),

  // ============================================
  // 6) CACHE CONFIGURATION
  // ============================================
  CACHE_DEFAULT_TTL: z.string().default('3600').transform(Number),

  // ============================================
  // 7) CORS CONFIGURATION
  // ============================================
  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  CORS_ALLOWED_METHODS: z.string().default('GET,POST,PUT,DELETE,OPTIONS'),
  CORS_ALLOWED_HEADERS: z.string().default('Content-Type,Authorization'),
  CORS_EXPOSED_HEADERS: z.string().default('X-Total-Count'),
  CORS_MAX_AGE: z.string().default('86400').transform(Number),
  CORS_CREDENTIALS: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),
  CORS_ORIGIN_VALIDATION_ENABLED: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  CORS_LOG_VIOLATIONS: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),
  CORS_BLOCK_NON_CORS_REQUESTS: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),

  // ============================================
  // 8) SECURITY CONFIGURATION
  // ============================================
  SECURITY_HEADERS_ENABLED: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  GEO_BLOCKING_ENABLED: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  GEO_ALLOWED_COUNTRIES: z.string().default(''),
  GEO_BLOCKED_COUNTRIES: z.string().default('CN,RU,KP,IR'),
  IP_WHITELIST: z.string().default(''),
  IP_BLACKLIST: z.string().default(''),
});

export type IEnvConfig = z.infer<typeof envSchema>;

export const validateEnv = (): IEnvConfig => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `${ENV_VALIDATION_MESSAGES.INVALID_CONFIGURATION}: ${result.error?.issues.map((i) => `${i.path.join('.')} - ${i.message}`).join(', ')}`
    );
  }

  return result.data;
};
