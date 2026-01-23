import { IRedisService } from '@/domain/interfaces/redis/IRedisService';
import { CacheConsistencyService } from '@/domain/services/cache/CacheConsistencyService';
import { CACHE_LOG_MESSAGES } from '@/shared';
import { CACHE_KEYS_PATTERNS, DI_TOKENS, REDIS_CONFIG } from '@/shared/constants';
import { Logger } from '@/shared/logger';
import { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';

export const redisCacheHandler = (
  ttl?: number,
  options?: {
    consistencyCheck?: boolean;
    stampedeProtection?: boolean;
    backgroundRefresh?: boolean;
  }
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const redisService = container.resolve<IRedisService>(DI_TOKENS.REDIS_SERVICE);
    const cacheConsistencyService = container.resolve(CacheConsistencyService);
    const logger = container.resolve<Logger>(DI_TOKENS.LOGGER);

    const cacheKey = CACHE_KEYS_PATTERNS.PRODUCT_LIST(`${req.method}:${req.originalUrl}`);

    if (req.method !== 'GET') {
      return next();
    }

    try {
      const cachedResponse = await redisService.get(cacheKey);
      if (cachedResponse) {
        logger.info({ key: cacheKey }, CACHE_LOG_MESSAGES.CACHE_HIT(cacheKey));
        cacheConsistencyService.trackCacheHit();

        const cachedData = JSON.parse(cachedResponse);

        if (options?.consistencyCheck) {
          const staleCheck = await cacheConsistencyService.checkStaleData(cacheKey);
          if (staleCheck.isStale) {
            logger.warn(
              { key: cacheKey },
              CACHE_LOG_MESSAGES.STALE_CACHE_DETECTED(cacheKey, staleCheck.ttl)
            );
            cacheConsistencyService.trackStaleRead();
          }
        }

        const currentTTL = await redisService.getTTL(cacheKey);

        cachedData.cacheInfo = {
          cacheStatus: 'hit',
          cacheKey,
          ttl: currentTTL,
          cachedAt: cachedData.cacheInfo?.cachedAt || new Date().toISOString(),
        };

        res.setHeader('X-Data-Source', 'cache');

        const timingStart = (req as Request & { startTime?: number }).startTime || Date.now();
        const duration = Date.now() - timingStart;
        res.setHeader('X-Response-Time', `${duration}ms`);

        logger.info({
          method: req.method,
          path: req.path,
          statusCode: 200,
          ip: req.ip || req.connection.remoteAddress || '::1',
          duration: `${duration}ms`,
          msg: `Message: ${req.method} ${req.path} 200 - ${req.ip || req.connection.remoteAddress || '::1'} - ${duration}ms`,
        });

        return res.status(200).json(cachedData);
      }

      cacheConsistencyService.trackCacheMiss();
      logger.info(
        {
          key: cacheKey,
          source: 'database',
        },
        CACHE_LOG_MESSAGES.CACHE_MISS(cacheKey, 'database')
      );

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
