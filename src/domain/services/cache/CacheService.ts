import { IRedisService } from '@/domain/interfaces/redis/IRedisService';
import { CACHE_LOG_MESSAGES, DI_TOKENS, Logger, REDIS_CONFIG } from '@/shared';
import { inject, injectable } from 'tsyringe';

/**
 * Cache Service - High-Level Caching Abstraction
 *
 * This service provides a clean, type-safe interface for Redis operations
 * following cache-aside pattern. It handles error gracefully and provides
 * structured logging for all cache operations.
 *
 * Key Features:
 * - Generic type-safe cache operations
 * - Automatic error handling and fallback behavior
 * - Pattern-based cache invalidation
 * - Get-or-set pattern for cache-aside implementation
 * - Connection state monitoring
 * - Performance optimized with proper error boundaries
 *
 * Performance Considerations:
 * - Non-blocking error handling to prevent cache failures from affecting application flow
 * - Automatic TTL management with configurable defaults
 * - Bulk operations for cache invalidation
 * - Memory-efficient JSON serialization/deserialization
 */
@injectable()
export class CacheService {
  constructor(
    @inject(DI_TOKENS.REDIS_SERVICE) private redisService: IRedisService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger
  ) {}

  /**
   * Generic method to get data from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redisService.get(key);
      if (cached) {
        this.logger.debug({ key }, CACHE_LOG_MESSAGES.CACHE_HIT(key));
        return JSON.parse(cached) as T;
      }
      this.logger.debug({ key }, CACHE_LOG_MESSAGES.CACHE_MISS(key, 'upstream'));
      return null;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.warn({ key, error: errMsg }, CACHE_LOG_MESSAGES.CACHE_GET_FAILED(key, errMsg));
      return null;
    }
  }

  /**
   * Generic method to set data in cache
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    try {
      await this.redisService.set(
        key,
        JSON.stringify(data),
        ttl ?? Number(REDIS_CONFIG.TTL.DEFAULT)
      );
      this.logger.debug(
        { key, ttl: ttl ?? Number(REDIS_CONFIG.TTL.DEFAULT) },
        CACHE_LOG_MESSAGES.DATA_CACHED_SUCCESSFULLY(key, ttl ?? Number(REDIS_CONFIG.TTL.DEFAULT))
      );
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.warn({ key, error: errMsg }, CACHE_LOG_MESSAGES.CACHE_SET_FAILED(key, errMsg));
    }
  }

  /**
   * Delete data from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redisService.delete(key);
      this.logger.debug({ key }, CACHE_LOG_MESSAGES.CACHE_DELETE(key));
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.warn({ key, error: errMsg }, CACHE_LOG_MESSAGES.CACHE_DELETE_FAILED(key, errMsg));
    }
  }

  /**
   * Delete multiple cache entries by pattern
   */
  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redisService.keys(pattern);
      if (keys.length > 0) {
        await Promise.all(keys.map((key) => this.redisService.delete(key)));
        this.logger.debug(
          { pattern, count: keys.length },
          CACHE_LOG_MESSAGES.CACHE_KEYS(pattern, keys.length)
        );
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        { pattern, error: errMsg },
        CACHE_LOG_MESSAGES.CACHE_PATTERN_DELETE_FAILED(pattern, errMsg)
      );
    }
  }

  /**
   * Get or set pattern - fetch from cache if exists, otherwise execute function and cache result
   */
  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const data = await fetchFn();
      await this.set(key, data, ttl);
      return data;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        { key, error: errMsg },
        CACHE_LOG_MESSAGES.FETCH_FUNCTION_FAILED(key, errMsg)
      );
      throw error;
    }
  }

  /**
   * Check if Redis is connected
   */
  isConnected(): boolean {
    return this.redisService.isConnected();
  }
}
