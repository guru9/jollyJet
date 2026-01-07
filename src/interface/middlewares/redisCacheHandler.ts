import { IRedisService } from '@/domain/interfaces/redis/IRedisService';
import { CacheConsistencyService } from '@/domain/services/cache/CacheConsistencyService';
import {
  CACHE_KEYS_PATTERNS,
  CACHE_LOG_MESSAGES,
  CACHE_OPERATIONS,
  DI_TOKENS,
  REDIS_CONFIG,
} from '@/shared/constants';
import { Logger } from '@/shared/logger';
import { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';

/**
 * Redis Cache Middleware Handler
 *
 * Provides intelligent caching for Express.js routes using Redis.
 * This middleware intercepts GET requests and attempts to serve cached responses,
 * falling back to the next middleware if cache is unavailable or stale.
 *
 * Features:
 * - Response caching for GET requests only
 * - Configurable TTL and consistency options
 * - Background refresh for stale data
 * - Stampede protection to prevent cache stampedes
 * - Integration with cache consistency service for metrics
 *
 * @param ttl - Time-to-live for cached responses in seconds (optional)
 * @param options - Configuration options for caching behavior
 * @returns Express middleware function
 */
export const redisCacheHandler = (
  ttl?: number, // Time-to-live for cached responses in seconds (optional)
  options?: {
    consistencyCheck?: boolean; // Enable consistency check
    stampedeProtection?: boolean; // Enable stampede protection
    backgroundRefresh?: boolean; // Enable background refresh
  }
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Resolve dependencies from DI container
    const redisService = container.resolve<IRedisService>(DI_TOKENS.REDIS_SERVICE);
    const cacheConsistencyService = container.resolve(CacheConsistencyService);
    const logger = container.resolve<Logger>(DI_TOKENS.LOGGER);

    // Generate cache key based on request method and URL
    const cacheKey = CACHE_KEYS_PATTERNS.PRODUCT_LIST(`${req.method}:${req.originalUrl}`);

    // Skip caching for non-GET requests to avoid caching mutations
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Attempt to retrieve cached response from Redis
      const cachedResponse = await redisService.get(cacheKey);
      if (cachedResponse) {
        // Cache hit - log and track metrics
        logger.info({ key: cacheKey }, CACHE_LOG_MESSAGES.CACHE_HIT);
        cacheConsistencyService.trackCacheHit();

        // Optional consistency check for stale data detection
        if (options?.consistencyCheck) {
          const isStale = await cacheConsistencyService.checkStaleData(cacheKey);
          if (isStale) {
            logger.warn({ key: cacheKey, ttl: 'unknown' }, CACHE_LOG_MESSAGES.STALE_CACHE_DETECTED);
            cacheConsistencyService.trackStaleRead();

            // Trigger background refresh if enabled to update stale cache
            if (options.backgroundRefresh) {
              cacheConsistencyService.refreshAhead(
                cacheKey,
                async () => {
                  // Simulate request execution to refresh cache
                  const fakeRes = { statusCode: 200, jsonData: null } as unknown as Response;
                  const fakeNext = () => {};
                  await redisCacheHandler(ttl, options)(req, fakeRes, fakeNext);
                  return (fakeRes as unknown as { jsonData: unknown }).jsonData;
                },
                ttl || Number(REDIS_CONFIG.TTL.DEFAULT) // Default TTL if not provided
              );
            }
          }
        }

        // Return cached response directly
        return res.status(200).json(JSON.parse(cachedResponse));
      }

      // Cache miss - track metrics and prepare for caching
      cacheConsistencyService.trackCacheMiss();
      logger.info({ key: cacheKey, source: 'database' }, CACHE_LOG_MESSAGES.CACHE_MISS);

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = (body: unknown) => {
        if (res.statusCode === 200) {
          redisService.set(cacheKey, JSON.stringify(body), ttl || Number(REDIS_CONFIG.TTL.DEFAULT));
        }
        return originalJson.call(res, body);
      };

      next();
    } catch (error) {
      // Log cache middleware errors and continue with request processing
      logger.error(
        {
          operation: CACHE_OPERATIONS.CACHE_MIDDLEWARE,
          key: cacheKey,
          error: error instanceof Error ? error.message : String(error),
        },
        CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED
      );
      next();
    }
  };
};
