import dotenv from 'dotenv';
import { IEnvConfig, validateEnv } from './env.validation';

// Load environment variables
// Priority: .env.{NODE_ENV}.local > .env.{NODE_ENV} > .env.local > .env
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';

dotenv.config({ path: envFile, quiet: process.env.NODE_ENV !== 'development' });
dotenv.config({ path: '.env.local', quiet: true });

// Define config
const env = validateEnv();

/**
 * Main Application Configuration Interface
 */
export interface IAppConfig {
  env: IEnvConfig['NODE_ENV'];
  port: number;
  mongoUri: string;
  logLevel: IEnvConfig['LOG_LEVEL'];
  mongoConfig: {
    uri: string;
    host: string;
    port: number;
    username: string;
    password: string;
    authSource: string;
    authMechanism: string;
    replicaSet: string;
    srv: boolean;
    ssl: boolean;
    disabled: boolean;
    dbName: string;
    maxPoolSize: number;
    minPoolSize: number;
    connectionTimeout: number;
    socketTimeout: number;
    serverSelectionTimeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  redisConfig: {
    host: string;
    port: number;
    username: string;
    password: string;
    db: number;
    tls: boolean;
    disabled: boolean;
    expireTime: number;
    maxRetries: number;
    retryDelay: number;
    ttl: {
      default: number;
      short: number;
      long: number;
      never: number;
      session: number;
      temporary: number;
      permanent: number;
      max: number;
      min: number;
      rateLimit: number;
      product: number;
      user: number;
    };
    rateLimit: {
      window: number;
      limit: number;
      maxRequests: number;
      maxRetries: number;
    };
    consistency: {
      checkInterval: number;
      sampleSize: number;
      staleThreshold: number;
    };
  };
  jwtConfig: {
    secret: string;
    expiresIn: string;
  };
  rateLimitConfig: {
    windowMs: number;
    maxRequests: number;
  };
  cacheConfig: {
    defaultTtl: number;
  };
  corsConfig: {
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
    credentials: boolean;
    originValidationEnabled: boolean;
    logViolations: boolean;
    blockNonCorsRequests: boolean;
  };
  securityConfig: {
    headersEnabled: boolean;
    geoBlockingEnabled: boolean;
    geoAllowedCountries: string[];
    geoBlockedCountries: string[];
    ipWhitelist: string[];
    ipBlacklist: string[];
  };
}

/**
 * Application configuration object populated from validated environment variables.
 * Uses the IAppConfig interface for strong typing throughout the application.
 */
export const config: IAppConfig = {
  env: env.NODE_ENV,
  port: env.PORT,
  mongoUri: env.MONGODB_URI,
  logLevel: env.LOG_LEVEL,
  mongoConfig: {
    uri: env.MONGODB_URI || '',
    host: env.MONGODB_HOST,
    port: env.MONGODB_PORT,
    username: env.MONGODB_USERNAME,
    password: env.MONGODB_PASSWORD,
    authSource: env.MONGODB_AUTH_SOURCE,
    authMechanism: env.MONGODB_AUTH_MECHANISM,
    replicaSet: env.MONGODB_REPLICA_SET,
    srv: env.MONGODB_SRV,
    ssl: env.MONGODB_SSL,
    disabled: env.MONGODB_DISABLED,
    dbName: env.MONGODB_DB_NAME,
    maxPoolSize: env.MONGODB_MAX_POOL_SIZE,
    minPoolSize: env.MONGODB_MIN_POOL_SIZE,
    connectionTimeout: env.MONGODB_CONNECTION_TIMEOUT,
    socketTimeout: env.MONGODB_SOCKET_TIMEOUT,
    serverSelectionTimeout: env.MONGODB_SERVER_SELECTION_TIMEOUT,
    retryAttempts: env.MONGODB_RETRY_ATTEMPTS,
    retryDelay: env.MONGODB_RETRY_DELAY,
  },
  redisConfig: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    username: env.REDIS_USERNAME,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
    tls: env.REDIS_TLS,
    disabled: env.REDIS_DISABLED,
    expireTime: env.REDIS_EXPIRE_TIME,
    maxRetries: env.REDIS_MAX_RETRIES,
    retryDelay: env.REDIS_RETRY_DELAY,
    ttl: {
      default: env.REDIS_TTL_DEFAULT,
      short: env.REDIS_TTL_SHORT,
      long: env.REDIS_TTL_LONG,
      never: env.REDIS_TTL_NEVER,
      session: env.REDIS_TTL_SESSION,
      temporary: env.REDIS_TTL_TEMPORARY,
      permanent: env.REDIS_TTL_PERMANENT,
      max: env.REDIS_TTL_MAX,
      min: env.REDIS_TTL_MIN,
      rateLimit: env.REDIS_TTL_RATE_LIMIT,
      product: env.REDIS_TTL_PRODUCT,
      user: env.REDIS_TTL_USER,
    },
    rateLimit: {
      window: env.REDIS_RATE_LIMIT_WINDOW,
      limit: env.REDIS_RATE_LIMIT_LIMIT,
      maxRequests: env.REDIS_RATE_LIMIT_MAX_REQUESTS,
      maxRetries: env.REDIS_RATE_LIMIT_MAX_RETRIES,
    },
    consistency: {
      checkInterval: env.REDIS_CONSISTENCY_CHECK_INTERVAL,
      sampleSize: env.REDIS_CONSISTENCY_SAMPLE_SIZE,
      staleThreshold: env.REDIS_CONSISTENCY_STALE_THRESHOLD,
    },
  },
  jwtConfig: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  rateLimitConfig: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  cacheConfig: {
    defaultTtl: env.CACHE_DEFAULT_TTL,
  },
  corsConfig: {
    allowedOrigins: env.CORS_ALLOWED_ORIGINS.split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    allowedMethods: env.CORS_ALLOWED_METHODS.split(',')
      .map((m) => m.trim())
      .filter(Boolean),
    allowedHeaders: env.CORS_ALLOWED_HEADERS.split(',')
      .map((h) => h.trim())
      .filter(Boolean),
    exposedHeaders: env.CORS_EXPOSED_HEADERS.split(',')
      .map((h) => h.trim())
      .filter(Boolean),
    maxAge: env.CORS_MAX_AGE,
    credentials: env.CORS_CREDENTIALS,
    originValidationEnabled: env.CORS_ORIGIN_VALIDATION_ENABLED,
    logViolations: env.CORS_LOG_VIOLATIONS,
    blockNonCorsRequests: env.CORS_BLOCK_NON_CORS_REQUESTS,
  },
  securityConfig: {
    headersEnabled: env.SECURITY_HEADERS_ENABLED,
    geoBlockingEnabled: env.GEO_BLOCKING_ENABLED,
    geoAllowedCountries: env.GEO_ALLOWED_COUNTRIES.split(',')
      .map((c) => c.trim())
      .filter(Boolean),
    geoBlockedCountries: env.GEO_BLOCKED_COUNTRIES.split(',')
      .map((c) => c.trim())
      .filter(Boolean),
    ipWhitelist: env.IP_WHITELIST.split(',')
      .map((ip) => ip.trim())
      .filter(Boolean),
    ipBlacklist: env.IP_BLACKLIST.split(',')
      .map((ip) => ip.trim())
      .filter(Boolean),
  },
};

export default config;

// CORS functionality now integrated into security middleware
export * from './di-container';
export { swaggerSpec, swaggerUiOptions } from './swagger';
