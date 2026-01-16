import { inject, injectable } from 'tsyringe';
import { CACHE_LOG_MESSAGES, DI_TOKENS, REDIS_CONFIG } from '../../../shared/constants';
import { Logger } from '../../../shared/logger';
import { IRedisService } from '../../interfaces/redis/IRedisService';

/**
 * Cache Consistency Service Interface
 *
 * Defines the contract for cache consistency management including
 * metrics collection, stale data detection, and background refresh capabilities.
 */
export interface CacheMetrics {
  cacheHits: number; // Number of cache hits
  cacheMisses: number; // Number of cache misses
  staleReads: number; // Number of stale reads
  consistencyErrors: number; // Number of consistency errors
  hitRate: number; // Cache hit rate percentage
  consistencyScore: number; // Cache consistency score
  totalOperations: number; // Total number of operations
  lastCheckTime?: Date; // Last check time
}

/**
 * Stale Data Check Result
 *
 * Result of a stale data detection operation.
 */
export interface StaleDataCheckResult {
  isStale: boolean; // Whether the data is stale
  ttl: number; // Time to live for the cache entry
  age: number; // Age of the cache entry
  threshold: number; // Stale threshold
}

/**
 * Cache Consistency Service
 *
 * Comprehensive service for managing cache consistency and monitoring.
 * Provides features for:
 * - Cache hit/miss ratio monitoring
 * - Stale data detection and handling
 * - Background cache refresh
 * - Consistency metrics collection
 * - Automatic cache invalidation triggers
 * - Cache performance monitoring
 *
 * This service operates in the Domain layer and depends on the Redis service
 * for cache operations while providing business logic for consistency management.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const metrics = await cacheConsistencyService.getMetrics();
 * logger.info(`Cache hit rate: ${metrics.hitRate}%`);
 *
 * // Check if data is stale
 * const isStale = await cacheConsistencyService.checkStaleData('product:123');
 *
 * // Refresh cache ahead of time
 * const result = await cacheConsistencyService.refreshAhead(
 *   'product:123',
 *   () => productRepository.findById('123'),
 *   3600
 * );
 * ```
 */
@injectable()
export class CacheConsistencyService {
  private metrics: CacheMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    staleReads: 0,
    consistencyErrors: 0,
    hitRate: 0,
    consistencyScore: 100,
    totalOperations: 0,
    lastCheckTime: undefined,
  };

  private consistencyCheckInterval?: NodeJS.Timeout;

  /**
   * Constructor - Initializes the cache consistency service
   * @param redisService - Injected Redis service for cache operations
   * @param logger - Injected logger service for logging operations
   */
  constructor(
    @inject(DI_TOKENS.REDIS_SERVICE) private redisService: IRedisService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger
  ) {
    this.initializeConsistencyChecks();
  }

  /**
   * Initialize regular consistency checks
   * Schedules periodic consistency checks based on configuration
   */
  private initializeConsistencyChecks(): void {
    const checkInterval = Number(REDIS_CONFIG.CONSISTENCY.CHECK_INTERVAL);

    this.consistencyCheckInterval = setInterval(() => {
      this.performConsistencyCheck().catch((error) => {
        this.logger.error(
          CACHE_LOG_MESSAGES.CONSISTENCY_CHECK_FAILED('batch_check') +
            `, error: ${error instanceof Error ? error.message : String(error)}`
        );
        this.trackConsistencyError();
      });
    }, checkInterval);

    this.logger.info(
      CACHE_LOG_MESSAGES.CONSISTENCY_MONITORING_INIT(
        checkInterval.toString(),
        REDIS_CONFIG.CONSISTENCY.SAMPLE_SIZE.toString(),
        REDIS_CONFIG.CONSISTENCY.STALE_THRESHOLD.toString()
      )
    );
  }

  /**
   * Track a cache hit operation
   * Updates metrics for cache hit tracking
   */
  public trackCacheHit(): void {
    this.metrics.cacheHits++;
    this.updateMetrics();
    this.logger.debug(CACHE_LOG_MESSAGES.CACHE_HIT_TRACKED);
  }

  /**
   * Track a cache miss operation
   * Updates metrics for cache miss tracking
   */
  public trackCacheMiss(): void {
    this.metrics.cacheMisses++;
    this.updateMetrics();
    this.logger.debug(CACHE_LOG_MESSAGES.CACHE_MISS_TRACKED);
  }

  /**
   * Track a stale read operation
   * Updates metrics when stale data is detected and served
   */
  public trackStaleRead(): void {
    this.metrics.staleReads++;
    this.updateMetrics();
    this.logger.warn(CACHE_LOG_MESSAGES.STALE_READ_DETECTED);
  }

  /**
   * Track a consistency error
   * Updates metrics when consistency checks fail
   */
  public trackConsistencyError(): void {
    this.metrics.consistencyErrors++;
    this.updateMetrics();
    this.logger.warn(CACHE_LOG_MESSAGES.CONSISTENCY_ERROR_DETECTED);
  }

  /**
   * Update internal metrics based on current state
   * Calculates derived metrics like hit rate and consistency score
   */
  private updateMetrics(): void {
    this.metrics.totalOperations = this.metrics.cacheHits + this.metrics.cacheMisses;

    if (this.metrics.totalOperations > 0) {
      this.metrics.hitRate = (this.metrics.cacheHits / this.metrics.totalOperations) * 100;
    }

    this.metrics.consistencyScore = this.calculateConsistencyScore();
    this.metrics.lastCheckTime = new Date();
  }

  /**
   * Calculate consistency score based on error rates
   * @returns Consistency score between 0 and 100
   */
  private calculateConsistencyScore(): number {
    const totalOperations = this.metrics.totalOperations;
    const totalErrors = this.metrics.consistencyErrors + this.metrics.staleReads;

    // If no operations and no errors, return 100
    if (totalOperations === 0 && totalErrors === 0) return 100;

    // If there are errors but no operations, return 0
    if (totalOperations === 0 && totalErrors > 0) return 0;

    const errorRate = totalErrors / totalOperations;
    return Math.max(0, Math.min(100, 100 - errorRate * 100));
  }

  /**
   * Perform comprehensive consistency check
   * Samples cache entries and verifies their consistency
   */
  private async performConsistencyCheck(): Promise<void> {
    try {
      this.logger.debug(CACHE_LOG_MESSAGES.CONSISTENCY_CHECK_STARTED);

      // Sample cache entries for consistency verification
      const sampleKeys = await this.redisService.keys('product:*');

      if (sampleKeys.length === 0) {
        this.logger.debug(CACHE_LOG_MESSAGES.NO_CACHE_ENTRIES_FOUND);
        return;
      }

      const sampleSize = Math.min(Number(REDIS_CONFIG.CONSISTENCY.SAMPLE_SIZE), sampleKeys.length);
      const keysToCheck = this.selectRandomKeys(sampleKeys, sampleSize);

      let staleCount = 0;
      let checkedCount = 0;

      for (const key of keysToCheck) {
        try {
          const cachedData = await this.redisService.get(key);
          if (cachedData) {
            checkedCount++;

            const staleCheck = await this.checkStaleData(key);
            if (staleCheck.isStale) {
              staleCount++;
              this.logger.warn(
                CACHE_LOG_MESSAGES.STALE_CACHE_DETECTED(key, staleCheck.ttl) +
                  `, age: ${staleCheck.age}`
              );
            }
          }
        } catch (error) {
          this.logger.warn(
            'Error checking key during consistency check, key: ' +
              key +
              ', error: ' +
              (error instanceof Error ? error.message : String(error))
          );
        }
      }

      const staleRatio = checkedCount > 0 ? staleCount / checkedCount : 0;

      this.logger.info(
        'Cache consistency check completed: total keys: ' +
          sampleKeys.length +
          ', checked keys: ' +
          checkedCount +
          ', stale keys: ' +
          staleCount +
          ', stale ratio: ' +
          (staleRatio * 100).toFixed(2) +
          '%, consistency score: ' +
          this.metrics.consistencyScore
      );

      // Log low hit rate warning if applicable
      if (this.metrics.hitRate < 50 && this.metrics.totalOperations > 100) {
        this.logger.warn(
          CACHE_LOG_MESSAGES.LOW_HIT_RATE_WARNING(this.metrics.hitRate.toFixed(2)) +
            ', total operations: ' +
            this.metrics.totalOperations
        );
      }
    } catch (error) {
      this.logger.error(
        'Cache consistency check failed: ' +
          (error instanceof Error ? error.message : String(error))
      );
      this.trackConsistencyError();
      throw error;
    }
  }

  /**
   * Select random keys from array for sampling
   * @param keys - Array of keys to select from
   * @param count - Number of keys to select
   * @returns Array of randomly selected keys
   */
  private selectRandomKeys(keys: string[], count: number): string[] {
    const shuffled = [...keys].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Get current cache consistency metrics
   * @returns Current metrics snapshot
   */
  public getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if cached data is stale based on TTL and thresholds
   * @param key - Cache key to check
   * @returns Result of stale data detection
   */
  public async checkStaleData(key: string): Promise<StaleDataCheckResult> {
    try {
      const client = this.redisService.getClient();
      const ttl = await client.ttl(key);

      // If TTL is negative or very low, consider data stale
      const isStale = ttl <= 0 || ttl < Number(REDIS_CONFIG.CONSISTENCY.STALE_THRESHOLD) / 1000;

      const result: StaleDataCheckResult = {
        isStale,
        ttl,
        age: ttl < 0 ? Math.abs(ttl) : 0,
        threshold: Number(REDIS_CONFIG.CONSISTENCY.STALE_THRESHOLD),
      };

      if (isStale) {
        this.logger.debug(
          'Stale data detected for key: ' +
            key +
            ', TTL: ' +
            ttl +
            ', threshold: ' +
            REDIS_CONFIG.CONSISTENCY.STALE_THRESHOLD
        );
      }

      return result;
    } catch (error) {
      this.logger.warn(
        'Error checking stale data for key: ' +
          key +
          ', error: ' +
          (error instanceof Error ? error.message : String(error))
      );

      // Return conservative result on error
      return {
        isStale: true,
        ttl: 0,
        age: 0,
        threshold: Number(REDIS_CONFIG.CONSISTENCY.STALE_THRESHOLD),
      };
    }
  }

  /**
   * Refresh-ahead pattern implementation
   * Retrieves cached data and refreshes it in background if approaching expiration
   * @param key - Cache key
   * @param operation - Function to fetch fresh data
   * @param ttl - Time-to-live for the cache entry
   * @param refreshThreshold - Threshold in seconds before expiration to trigger refresh
   * @returns Cached or fresh data
   */
  public async refreshAhead<T>(
    key: string,
    operation: () => Promise<T>,
    ttl: number,
    refreshThreshold: number = 300 // 5 minutes default
  ): Promise<T> {
    try {
      // Get current cached value
      const cachedValue = await this.redisService.get(key);

      if (cachedValue !== null) {
        // Check if we should refresh
        const staleCheck = await this.checkStaleData(key);

        if (!staleCheck.isStale && staleCheck.ttl > refreshThreshold) {
          // Data is fresh, return cached value
          this.trackCacheHit();
          return JSON.parse(cachedValue);
        }

        // Data is stale or approaching expiration, refresh in background
        this.logger.debug(CACHE_LOG_MESSAGES.BACKGROUND_REFRESH_STARTED(key));
        this.refreshCacheInBackground(key, operation, ttl);

        // Return stale data for now to maintain performance
        this.trackStaleRead();
        return JSON.parse(cachedValue);
      }

      // Cache miss, fetch and cache
      this.trackCacheMiss();
      this.logger.debug(CACHE_LOG_MESSAGES.CACHE_MISS(key, 'database'));

      const result = await operation();
      await this.redisService.set(key, JSON.stringify(result), ttl);

      return result;
    } catch (error) {
      this.logger.error(
        'Refresh-ahead operation failed for key: ' +
          key +
          ', error: ' +
          (error instanceof Error ? error.message : String(error))
      );

      // Fallback to direct operation
      return operation();
    }
  }

  /**
   * Refresh cache entry in background
   * @param key - Cache key to refresh
   * @param operation - Function to fetch fresh data
   * @param ttl - Time-to-live for the cache entry
   */
  private async refreshCacheInBackground<T>(
    key: string,
    operation: () => Promise<T>,
    ttl: number
  ): Promise<void> {
    try {
      const result = await operation();
      await this.redisService.set(key, JSON.stringify(result), ttl);

      this.logger.debug(CACHE_LOG_MESSAGES.BACKGROUND_REFRESH_COMPLETED(key));
    } catch (error) {
      this.logger.error(
        CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED(
          'BACKGROUND_REFRESH',
          key,
          error instanceof Error ? error.message : String(error)
        )
      );
    }
  }

  /**
   * Force refresh a specific cache entry
   * @param key - Cache key to refresh
   * @param operation - Function to fetch fresh data
   * @param ttl - Time-to-live for the cache entry
   * @returns Fresh data
   */
  public async forceRefresh<T>(key: string, operation: () => Promise<T>, ttl: number): Promise<T> {
    this.logger.info('Force refreshing cache entry: ' + key);

    try {
      const result = await operation();
      await this.redisService.set(key, JSON.stringify(result), ttl);

      this.logger.info(CACHE_LOG_MESSAGES.CACHE_REFRESHED(key));
      return result;
    } catch (error) {
      this.logger.error(
        'Force refresh failed for key: ' +
          key +
          ', error: ' +
          (error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  }

  /**
   * Invalidate cache entries matching a pattern
   * @param pattern - Redis key pattern to match
   * @returns Number of keys invalidated
   */
  public async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redisService.keys(pattern);

      if (keys.length === 0) {
        this.logger.debug('No keys found for pattern: ' + pattern);
        return 0;
      }

      let invalidatedCount = 0;
      for (const key of keys) {
        try {
          await this.redisService.delete(key);
          invalidatedCount++;
        } catch (error) {
          this.logger.warn(
            'Failed to delete key during pattern invalidation, key: ' +
              key +
              ', pattern: ' +
              pattern +
              ', error: ' +
              (error instanceof Error ? error.message : String(error))
          );
        }
      }

      this.logger.info(
        `Pattern-based cache invalidation completed, pattern: ${pattern}, total keys: ${keys.length}, invalidated keys: ${invalidatedCount}`
      );

      return invalidatedCount;
    } catch (error) {
      this.logger.error(
        `Pattern invalidation failed for pattern: ${pattern}, error: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Get cache performance statistics
   * @returns Performance statistics object
   */
  public getPerformanceStats(): {
    hitRate: number;
    consistencyScore: number;
    totalOperations: number;
    averageResponseTime?: number;
    memoryUsage?: number;
  } {
    // Explicitly cast metrics to ensure TypeScript recognizes all properties
    const metrics = this.metrics as CacheMetrics;

    return {
      hitRate: metrics.hitRate,
      consistencyScore: metrics.consistencyScore,
      totalOperations: metrics.totalOperations,
      // Note: Response time and memory usage would require additional instrumentation
    };
  }

  /**
   * Reset all metrics
   * Clears all tracked metrics and starts fresh
   */
  public resetMetrics(): void {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      staleReads: 0,
      consistencyErrors: 0,
      hitRate: 0,
      consistencyScore: 100,
      totalOperations: 0,
      lastCheckTime: undefined,
    };

    this.logger.info(CACHE_LOG_MESSAGES.METRICS_RESET);
  }

  /**
   * Cleanup resources
   * Clears intervals and performs cleanup
   */
  public cleanup(): void {
    if (this.consistencyCheckInterval) {
      clearInterval(this.consistencyCheckInterval);
      this.consistencyCheckInterval = undefined;
    }

    this.logger.info(CACHE_LOG_MESSAGES.SERVICE_CLEANUP_COMPLETED);
  }
}
