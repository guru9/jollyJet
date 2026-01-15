import { DI_TOKENS } from '@/shared/constants';
import { Logger } from '@/shared/logger';
import { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';

/**
 * CORS Logger Options
 */
export interface CorsLoggerOptions {
  logSuccess?: boolean;
  logViolations?: boolean;
  logPreflight?: boolean;
  detailed?: boolean;
  logLevels?: {
    success?: string;
    violation?: string;
    preflight?: string;
  };
}

/**
 * Helper to create a CORS logging middleware for a specific environment/config
 */
const createCorsLoggerMiddleware = (
  env: 'development' | 'production' | 'test',
  _options: CorsLoggerOptions = {}
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const logger = container.resolve<Logger>(DI_TOKENS.LOGGER);
    const origin = req.headers.origin;

    // Only log if it's a cross-origin request
    if (origin) {
      if (env === 'development') {
        logger.debug(
          `[CORS DEBUG] Request from Origin: ${origin} | Method: ${req.method} | Path: ${req.path}`
        );
      } else {
        // Essential logging for production/test
        logger.info(
          {
            type: 'CORS_REQUEST',
            origin,
            method: req.method,
            path: req.path,
            ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
          },
          'Inbound cross-origin request detected'
        );
      }
    }

    next();
  };
};

/**
 * CORS Logging Middleware Factory
 *
 * Provides specialized logging for CORS requests and potential security violations.
 */
export const corsLogger = (options: CorsLoggerOptions = {}) => {
  // Use environment to determine default behavior
  const env = (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development';
  return createCorsLoggerMiddleware(env, options);
};

/**
 * Specific factory for development logging
 */
export const corsLoggerDev = (options: CorsLoggerOptions = {}) => {
  return createCorsLoggerMiddleware('development', options);
};

/**
 * Specific factory for production logging
 */
export const corsLoggerProd = (options: CorsLoggerOptions = {}) => {
  return createCorsLoggerMiddleware('production', options);
};
