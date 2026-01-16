import { inject, injectable } from 'tsyringe';
import { IRedisService } from '@/domain/interfaces/redis/IRedisService';
import {
  DI_TOKENS,
  Logger,
  REDIS_CONFIG,
  CACHE_LOG_MESSAGES,
  CACHE_LOG_MESSAGES_ADDITIONAL,
} from '@/shared';

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
        this.logger.debug({ key }, CACHE_LOG_MESSAGES.CACHE_HIT);
        return JSON.parse(cached) as T;
      }
      this.logger.debug({ key }, CACHE_LOG_MESSAGES.CACHE_MISS);
      return null;
    } catch (error) {
      this.logger.warn(
        { key, error: error instanceof Error ? error.message : String(error) },
        CACHE_LOG_MESSAGES.CACHE_GET_FAILED
      );
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
        CACHE_LOG_MESSAGES.DATA_CACHED_SUCCESSFULLY
      );
    } catch (error) {
      this.logger.warn(
        { key, error: error instanceof Error ? error.message : String(error) },
        CACHE_LOG_MESSAGES.CACHE_SET_FAILED
      );
    }
  }

  /**
   * Delete data from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redisService.delete(key);
      this.logger.debug({ key }, CACHE_LOG_MESSAGES.CACHE_DELETE);
    } catch (error) {
      this.logger.warn(
        { key, error: error instanceof Error ? error.message : String(error) },
        CACHE_LOG_MESSAGES.CACHE_DELETE_FAILED
      );
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
        this.logger.debug({ pattern, count: keys.length }, CACHE_LOG_MESSAGES.CACHE_KEYS);
      }
    } catch (error) {
      this.logger.warn(
        { pattern, error: error instanceof Error ? error.message : String(error) },
        CACHE_LOG_MESSAGES.CACHE_PATTERN_DELETE_FAILED
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
      this.logger.error(
        { key, error: error instanceof Error ? error.message : String(error) },
        CACHE_LOG_MESSAGES.FETCH_FUNCTION_FAILED
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
