import { CorsOptions } from 'cors';

/**
 * CORS Configuration Interface
 * Defines the structure for CORS settings across different environments
 */
export interface ICorsConfig {
  /** Array of allowed origins for CORS requests */
  allowedOrigins: string[];
  /** HTTP methods allowed for CORS requests */
  allowedMethods: string[];
  /** Request headers allowed in CORS requests */
  allowedHeaders: string[];
  /** Response headers exposed to the client */
  exposedHeaders: string[];
  /** Preflight cache duration in seconds */
  maxAge: number;
  /** Whether to allow credentials (cookies, authorization headers) */
  credentials: boolean;
  /** Enable strict origin validation */
  originValidationEnabled: boolean;
  /** Log CORS violations for monitoring */
  logViolations: boolean;
  /** Block requests without Origin header in production */
  blockNonCorsRequests: boolean;
}

/**
 * Environment-specific CORS configurations
 * Defines different CORS policies for development, staging, and production environments
 */
const corsConfig: Record<string, ICorsConfig> = {
  development: {
    allowedOrigins: ['http://localhost:3000', 'http://localhost:3001'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400,
    credentials: true,
    originValidationEnabled: false,
    logViolations: true,
    blockNonCorsRequests: false,
  },
  staging: {
    allowedOrigins: ['https://staging.jollyjet.com'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400,
    credentials: true,
    originValidationEnabled: true,
    logViolations: true,
    blockNonCorsRequests: false,
  },
  production: {
    allowedOrigins: ['https://jollyjet.com', 'https://www.jollyjet.com'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400,
    credentials: true,
    originValidationEnabled: true,
    logViolations: true,
    blockNonCorsRequests: true,
  },
};

/**
 * Get CORS options based on the current environment
 * Returns configured CORS options compatible with the cors middleware
 *
 * @returns CorsOptions object for the current environment
 */
export const getCorsOptions = (): CorsOptions => {
  const env = process.env.NODE_ENV || 'development';
  const config = corsConfig[env];

  if (!config) {
    throw new Error(`CORS configuration not found for environment: ${env}`);
  }

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (config.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: config.allowedMethods,
    allowedHeaders: config.allowedHeaders,
    exposedHeaders: config.exposedHeaders,
    credentials: config.credentials,
    maxAge: config.maxAge,
  };
};

/**
 * Get the current CORS configuration object
 * Useful for accessing configuration values directly
 *
 * @returns ICorsConfig object for the current environment
 */
export const getCorsConfig = (): ICorsConfig => {
  const env = process.env.NODE_ENV || 'development';
  const config = corsConfig[env];

  if (!config) {
    throw new Error(`CORS configuration not found for environment: ${env}`);
  }

  return config;
};