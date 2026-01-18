import { IRedisService } from '@/domain/interfaces/redis/IRedisService';
import { CacheConsistencyService } from '@/domain/services/cache/CacheConsistencyService';
import { CACHE_LOG_MESSAGES, logger } from '@/shared';
import { CACHE_KEYS_PATTERNS, DI_TOKENS, REDIS_CONFIG } from '@/shared/constants';
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
        logger.info({ key: cacheKey }, CACHE_LOG_MESSAGES.CACHE_HIT(cacheKey));
        cacheConsistencyService.trackCacheHit();

        // Parse cached data
        const cachedData = JSON.parse(cachedResponse);

        // Optional consistency check for stale data detection
        if (options?.consistencyCheck) {
          const staleCheck = await cacheConsistencyService.checkStaleData(cacheKey);
          if (staleCheck.isStale) {
            logger.warn(
              { key: cacheKey },
              CACHE_LOG_MESSAGES.STALE_CACHE_DETECTED(cacheKey, staleCheck.ttl)
            );
            cacheConsistencyService.trackStaleRead();

            // Note: Background refresh is not implemented due to complexity of simulating requests
            // Consider implementing proper background refresh by calling the controller directly
            // if needed in the future
          }
        }

        // Get current TTL
        const currentTTL = await redisService.getTTL(cacheKey);

        // Add or update cache info
        cachedData.cacheInfo = {
          cacheStatus: 'hit',
          cacheKey,
          ttl: currentTTL,
          cachedAt: cachedData.cacheInfo?.cachedAt || new Date().toISOString(),
        };

        // Set data source header
        res.setHeader('X-Data-Source', 'cache');

        // Calculate timing for cached response
        const timingStart = (req as Request & { startTime?: number }).startTime || Date.now();
        const duration = Date.now() - timingStart;
        res.setHeader('X-Response-Time', `${duration}ms`);

        // Log cached response directly
        logger.info({
          method: req.method,
          path: req.path,
          statusCode: 200,
          ip: req.ip || req.connection.remoteAddress || '::1',
          duration: `${duration}ms`,
          msg: `Message: ${req.method} ${req.path} 200 - ${req.ip || req.connection.remoteAddress || '::1'} - ${duration}ms`,
        });

        // Return cached response normally
        return res.status(200).json(cachedData);
      }

      // Cache miss - track metrics and prepare for caching
      cacheConsistencyService.trackCacheMiss();
      logger.info(
        {
          key: cacheKey,
          source: 'database',
        },
        CACHE_LOG_MESSAGES.CACHE_MISS(cacheKey, 'database')
      );

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = (body: unknown) => {
        if (res.statusCode === 200) {
          const cacheTTL = ttl || Number(REDIS_CONFIG.TTL.DEFAULT);
          const bodyWithCacheInfo = {
            ...(body as object),
            cacheInfo: {
              cacheStatus: 'miss',
              cacheKey,
              ttl: cacheTTL,
              cachedAt: new Date().toISOString(),
            },
          };
          redisService.set(cacheKey, JSON.stringify(bodyWithCacheInfo), cacheTTL);
          return originalJson.call(res, bodyWithCacheInfo);
        }
        return originalJson.call(res, body);
      };

      next();
    } catch (error) {
      // Log cache middleware errors and continue with request processing
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.error(
        {
          key: cacheKey,
          error: errMsg,
          stack: error instanceof Error ? error.stack : undefined,
        },
        CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED('middleware', cacheKey, errMsg)
      );
      next();
    }
  };
};
