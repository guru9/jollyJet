import { IRedisService } from '@/domain/interfaces/redis/IRedisService';
import { CacheConsistencyService } from '@/domain/services/cache/CacheConsistencyService';
import { CACHE_LOG_MESSAGES, DI_TOKENS } from '@/shared/constants';
import { Logger } from '@/shared/logger';
import { container } from 'tsyringe';

/**
 * Interface for Cacheable options
 */
export interface CacheOptions {
  /** Time-to-live in seconds (optional) */
  ttl?: number;
  /** Whether to check for stale data (consistency check) */
  consistencyCheck?: boolean;
  /** Whether to use distributed locking to prevent cache stampede */
  stampedeProtection?: boolean;
  /** Whether to refresh the cache in the background if stale */
  backgroundRefresh?: boolean;
  /** Optional custom key prefix */
  keyPrefix?: string;
}

/**
 * Cacheable decorator for caching method results with consistency features.
 * Automatically handles cache lookups, storage, and consistency monitoring.
 *
 * @param options - Cache configuration options
 */
export function Cacheable(options: number | CacheOptions = 3600) {
  // Normalize options (support both number for TTL and CacheOptions object)
  const finalOptions: CacheOptions = typeof options === 'number' ? { ttl: options } : options;
  const {
    ttl = 3600,
    consistencyCheck = true,
    stampedeProtection = true,
    backgroundRefresh = true,
    keyPrefix,
  } = finalOptions;

  return function (_target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      const redisService = container.resolve<IRedisService>(DI_TOKENS.REDIS_SERVICE);
      const cacheConsistencyService =
        container.resolve<CacheConsistencyService>(CacheConsistencyService);
      const logger = container.resolve<Logger>(DI_TOKENS.LOGGER);

      // Generate a unique cache key based on the class name, method name, and arguments
      // Note: We use the constructor name for the class name
      const className =
        (this as { constructor?: { name?: string } })?.constructor?.name || 'Anonymous';
      const prefix = keyPrefix || `${className}:${propertyKey}`;
      const cacheKey = `${prefix}:${JSON.stringify(args)}`;

      try {
        // 1. Try to get cached result
        const cachedResult = await redisService.get(cacheKey);

        if (cachedResult) {
          logger.debug({ key: cacheKey }, CACHE_LOG_MESSAGES.CACHE_HIT);
          cacheConsistencyService.trackCacheHit();

          // 2. Optional consistency check
          if (consistencyCheck) {
            const staleCheck = await cacheConsistencyService.checkStaleData(cacheKey);
            if (staleCheck.isStale) {
              logger.warn({ key: cacheKey }, CACHE_LOG_MESSAGES.STALE_CACHE_DETECTED);
              cacheConsistencyService.trackStaleRead();

              // 3. Background refresh if enabled
              if (backgroundRefresh) {
                // Refresh ahead asynchronously
                cacheConsistencyService
                  .refreshAhead(
                    cacheKey,
                    async () => {
                      const freshResult = await originalMethod.apply(this, args);
                      await redisService.set(cacheKey, JSON.stringify(freshResult), ttl);
                      return freshResult;
                    },
                    ttl
                  )
                  .catch((err) =>
                    logger.error({ key: cacheKey, error: err }, 'Background refresh failed')
                  );
              }
            }
          }

          return JSON.parse(cachedResult);
        }

        // 4. Cache Miss
        cacheConsistencyService.trackCacheMiss();
        logger.debug({ key: cacheKey }, CACHE_LOG_MESSAGES.CACHE_MISS);

        // 5. Stampede protection (Distributed Lock)
        if (stampedeProtection) {
          const lockKey = `lock:${cacheKey}`;
          const lockAcquired = await redisService.acquireLock(lockKey, 10); // 10s default lock ttl

          if (lockAcquired) {
            try {
              // Double-check cache after acquiring lock (someone else might have filled it)
              const secondCheck = await redisService.get(cacheKey);
              if (secondCheck) {
                return JSON.parse(secondCheck);
              }

              const result = await originalMethod.apply(this, args);
              await redisService.set(cacheKey, JSON.stringify(result), ttl);
              return result;
            } finally {
              await redisService.releaseLock(lockKey);
            }
            // Wait and retry if lock not acquired
            await new Promise((resolve) => setTimeout(resolve, 100));
            // Recursively call the same method (which will now hit either the cache or wait for the lock again)
            const target = this as Record<string, (...args: unknown[]) => Promise<unknown>>;
            return target[propertyKey](...args);
          }
        }

        // 6. Direct execution (if no stampede protection or fallback)
        const result = await originalMethod.apply(this, args);
        await redisService.set(cacheKey, JSON.stringify(result), ttl);
        return result;
      } catch (error) {
        logger.error({ key: cacheKey, error }, 'Cache decorator error');
        // Fail-open: Execute the original method if caching fails
        return originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

/**
 * CacheEvict decorator for invalidating cache entries following a successful method execution.
 * Useful for commands that modify data (Update, Delete, Create).
 *
 * @param pattern - Cache key pattern to evict (supports wildcard if redis service supports it)
 */
export function CacheEvict(pattern: string | ((...args: unknown[]) => string)) {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      const redisService = container.resolve<IRedisService>(DI_TOKENS.REDIS_SERVICE);
      const logger = container.resolve<Logger>(DI_TOKENS.LOGGER);

      // Execute original method first
      const result = await originalMethod.apply(this, args);

      try {
        // Resolve pattern if it's a function
        const finalPattern = typeof pattern === 'function' ? pattern(...args) : pattern;

        // Find and delete all matching keys
        const keys = await redisService.keys(finalPattern);

        if (keys.length > 0) {
          for (const key of keys) {
            await redisService.delete(key);
          }
          logger.info(`Evicted ${keys.length} cache keys for pattern: ${finalPattern}`);
        }
      } catch (error) {
        logger.error({ pattern, error }, 'Cache evacuation failed');
      }

      return result;
    };

    return descriptor;
  };
}
