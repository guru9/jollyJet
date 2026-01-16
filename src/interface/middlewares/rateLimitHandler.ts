import { IRateLimitingService } from '@/domain/interfaces/ratelimit/IRateLimitingService';
import {
  CACHE_LOG_MESSAGES,
  CACHE_OPERATIONS,
  DI_TOKENS,
  HTTP_STATUS,
  RATE_LIMIT_HEADERS,
  RATE_LIMIT_MESSAGES,
  REDIS_CONFIG,
} from '@/shared/constants';
import { Logger } from '@/shared/logger';
import { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';

/**
 * Configuration options for the Rate Limit Handler
 */
export interface RateLimitOptions {
  /** Window size in seconds */
  windowSize?: number;
  /** Maximum number of requests allowed in the window */
  limit?: number;
  /** Unique prefix for the rate limit key to avoid collisions between routes */
  keyPrefix?: string;
}

/**
 * Redis-based Rate Limiting Middleware
 *
 * Protects routes from excessive usage by enforcing a sliding window rate limit.
 * Uses the client's IP address as the default identifier.
 *
 * @param options - Optional configuration to override default rate limits
 * @returns Express middleware function
 */
export const rateLimitHandler = (options?: RateLimitOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const rateLimitingService = container.resolve<IRateLimitingService>(
      DI_TOKENS.RATE_LIMIT_SERVICE
    );
    const logger = container.resolve<Logger>(DI_TOKENS.LOGGER);

    // Identify the client (IP address is the default)
    const clientIdentifier =
      req.ip || req.socket.remoteAddress || RATE_LIMIT_MESSAGES.UNKNOWN_CLIENT;
    const key = options?.keyPrefix ? `${options.keyPrefix}:${clientIdentifier}` : clientIdentifier;

    try {
      // Check rate limit status for the current client
      const result = await rateLimitingService.checkRateLimit(key, {
        windowSize: options?.windowSize,
        limit: options?.limit,
      });

      // Set standard rate limit headers
      res.set({
        [RATE_LIMIT_HEADERS.LIMIT]: (
          options?.limit || Number(REDIS_CONFIG.RATE_LIMIT.LIMIT)
        ).toString(),
        [RATE_LIMIT_HEADERS.REMAINING]: result.remaining.toString(),
        [RATE_LIMIT_HEADERS.RESET]: result.resetAt.getTime().toString(),
      });

      if (!result.allowed) {
        logger.warn(
          {
            key,
            totalRequests: result.totalRequests,
            limit: options?.limit,
            ip: clientIdentifier,
          },
          CACHE_LOG_MESSAGES.RATE_LIMIT_EXCEEDED(key)
        );

        return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
          status: 'error',
          message: RATE_LIMIT_MESSAGES.TOO_MANY_REQUESTS,
          retryAfter: result.resetAt,
        });
      }

      next();
    } catch (error) {
      // In case of rate limit service failure, log the error and allow the request to proceed
      // (Fail-open strategy to maintain availability)
      logger.error(
        {
          operation: CACHE_OPERATIONS.RATE_LIMIT_MIDDLEWARE,
          key,
          error: error instanceof Error ? error.message : String(error),
        },
        CACHE_LOG_MESSAGES.RATE_LIMIT_CHECK_FAILED(
          key,
          error instanceof Error ? error.message : String(error)
        )
      );
      next();
    }
  };
};
