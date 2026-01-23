import { CacheService } from '@/domain/services/cache/CacheService';
import { Logger } from '@/shared';

/**
 * Base Repository - Foundation for Data Access Layer
 *
 * This abstract base class implements common repository patterns using
 * cache-aside strategy. It provides consistent caching behavior across all
 * repository implementations while maintaining clean architecture principles.
 *
 * Key Features:
 * - Cache-aside pattern implementation
 * - Generic cache key generation with namespacing
 * - Automatic cache invalidation support
 * - Type-safe cache operations through CacheService
 * - Structured error handling and logging
 *
 * Performance Optimizations:
 * - Intelligent cache key generation for optimal Redis performance
 * - Bulk cache invalidation to prevent stale data
 * - Generic get-or-set pattern to reduce code duplication
 * - Separation of concerns between caching and data access logic
 */
export abstract class BaseRepository {
  constructor(
    protected logger: Logger,
    protected cacheService: CacheService
  ) {}

  /**
   * Generate cache key with namespace and parameters
   * Uses consistent serialization for optimal Redis performance
   */
  protected generateCacheKey(namespace: string, params: Record<string, unknown>): string {
    const paramString = Object.keys(params)
      .sort()
      .map((key) => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    return `${namespace}:${paramString}`;
  }

  /**
   * Invalidate cache entries by pattern
   * Supports bulk invalidation for maintaining data consistency
   */
  protected async invalidateCache(pattern: string): Promise<void> {
    await this.cacheService.deleteByPattern(pattern);
  }

  /**
   * Get data with cache-aside pattern
   * Implements get-or-set pattern for optimal performance
   */
  protected async getCachedData<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    return this.cacheService.getOrSet(cacheKey, fetchFn, ttl);
  }
}
