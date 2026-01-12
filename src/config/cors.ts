import { CORS_ERROR_MESSAGES, CORS_LOG_MESSAGES } from '@/shared/constants';
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
 * Validate origin based on CORS configuration
 * Handles null origins, URL validation, and whitelist checking
 *
 * @param origin - The origin header from the request
 * @param config - CORS configuration for the current environment
 * @returns boolean indicating if the origin is allowed
 */
const validateOrigin = (origin: string | undefined, config: ICorsConfig): boolean => {
  // Allow requests with no origin based on blockNonCorsRequests setting
  if (!origin) {
    return !config.blockNonCorsRequests;
  }

  // If origin validation is disabled, allow all origins
  if (!config.originValidationEnabled) {
    return true;
  }

  // Basic origin format validation
  try {
    const url = new URL(origin);
    if (!url.protocol.startsWith('http')) {
      return false;
    }
  } catch {
    // Invalid URL format
    return false;
  }

  // Check if origin is in allowed list
  return config.allowedOrigins.includes(origin);
};

/**
 * Validate CORS configuration for the given environment
 * Ensures all required fields are present and valid
 *
 * @param config - CORS configuration object
 * @param env - Environment name for error context
 */
const validateCorsConfig = (config: ICorsConfig, env: string): void => {
  // Required fields validation
  if (!Array.isArray(config.allowedOrigins) || config.allowedOrigins.length === 0) {
    throw new Error(`CORS configuration error in ${env}: allowedOrigins must be a non-empty array`);
  }

  // Type validation for all fields
  if (typeof config.maxAge !== 'number' || config.maxAge < 0) {
    throw new Error(`CORS configuration error in ${env}: maxAge must be a non-negative number`);
  }

  // Origin URL validation
  for (const origin of config.allowedOrigins) {
    try {
      new URL(origin);
    } catch {
      throw new Error(`CORS configuration error in ${env}: invalid origin URL: ${origin}`);
    }
  }

  // HTTP method validation
  const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
  for (const method of config.allowedMethods) {
    if (!validMethods.includes(method.toUpperCase())) {
      throw new Error(`CORS configuration error in ${env}: invalid HTTP method: ${method}`);
    }
  }
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
    throw new Error(CORS_ERROR_MESSAGES.CONFIG_NOT_FOUND.replace('{env}', env));
  }

  // Validate configuration before use
  validateCorsConfig(config, env);

  return {
    origin: (origin, callback) => {
      try {
        const isAllowed = validateOrigin(origin, config);

        if (isAllowed) {
          callback(null, true);
        } else {
          const error = new Error(
            CORS_ERROR_MESSAGES.ORIGIN_NOT_ALLOWED.replace('{origin}', origin || 'null')
          );

          // Log violations if enabled
          if (config.logViolations) {
            console.warn(
              CORS_LOG_MESSAGES.VIOLATION_DETECTED.replace('{origin}', origin || 'null').replace(
                '{env}',
                env
              )
            );
          }

          callback(error);
        }
      } catch (error) {
        callback(error as Error);
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
    throw new Error(CORS_ERROR_MESSAGES.CONFIG_NOT_FOUND.replace('{env}', env));
  }

  return config;
};
