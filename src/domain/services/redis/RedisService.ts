import Redis from 'ioredis';
import { inject, injectable } from 'tsyringe';
import redisConnection from '../../../infrastructure/database/redis';
import {
  CACHE_KEYS_PATTERNS,
  CACHE_LOG_MESSAGES,
  CACHE_OPERATIONS,
  DI_TOKENS,
} from '../../../shared/constants';
import { Logger } from '../../../shared/logger';
import { IRedisService } from '../../interfaces/redis/IRedisService';

/**
 * Redis Service Implementation
 *
 * Concrete implementation of IRedisService interface providing comprehensive Redis caching
 * functionality with robust error handling, connection management, and detailed logging.
 *
 * Features:
 * - Automatic connection management with retry strategy
 * - Comprehensive error handling and graceful degradation
 * - Detailed logging for all operations
 * - Connection state tracking
 * - Distributed locking for cache consistency
 */
@injectable()
export class RedisService implements IRedisService {
  private logger: Logger;

  /**
   * Constructor - Initializes Redis service with logger
   * @param logger - Injected logger instance for logging operations
   */
  constructor(@inject(DI_TOKENS.LOGGER) logger: Logger) {
    this.logger = logger;
  }

  /**
   * Retrieves a value from Redis cache by key
   * @param key - The cache key to retrieve
   * @returns The cached value as string, or null if not found or Redis is unavailable
   *
   * Error Handling:
   * - Returns null if Redis connection is not available (graceful degradation)
   * - Logs warning if connection is unavailable
   * - Re-throws Redis operation errors for caller to handle
   * - Logs detailed error information including operation type, key, and error message
   */
  public async get(key: string): Promise<string | null> {
    if (!this.isConnected()) {
      this.logger.warn(
        CACHE_LOG_MESSAGES.CONNECTION_WARNING.replace('{operation}', CACHE_OPERATIONS.GET)
      );
      return null;
    }

    try {
      const result = await this.getClient().get(key);
      if (result) {
        this.logger.debug(CACHE_LOG_MESSAGES.CACHE_HIT.replace('{key}', key));
      }
      return result;
    } catch (error) {
      this.logger.error(
        CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED.replace('{operation}', CACHE_OPERATIONS.GET)
          .replace('{key}', key)
          .replace('{error}', error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  }

  /**
   * Stores a value in Redis cache with optional TTL (Time-To-Live)
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttl - Optional time-to-live in seconds
   *
   * Error Handling:
   * - Silently returns if Redis connection is unavailable (graceful degradation)
   * - Logs warning if connection is unavailable
   * - Re-throws Redis operation errors for caller to handle
   * - Logs detailed error information including operation type, key, and error message
   */
  public async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.isConnected()) {
      this.logger.warn(
        CACHE_LOG_MESSAGES.CONNECTION_WARNING.replace('{operation}', CACHE_OPERATIONS.SET)
      );
      return;
    }

    try {
      if (ttl) {
        await this.getClient().set(key, value, 'EX', ttl);
        this.logger.debug(
          CACHE_LOG_MESSAGES.CACHE_SET.replace('{key}', key).replace('{ttl}', ttl.toString())
        );
      } else {
        await this.getClient().set(key, value);
        this.logger.debug(
          CACHE_LOG_MESSAGES.CACHE_SET.replace('{key}', key).replace('{ttl}', 'no TTL')
        );
      }
    } catch (error) {
      this.logger.error(
        CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED.replace('{operation}', CACHE_OPERATIONS.SET)
          .replace('{key}', key)
          .replace('{error}', error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  }

  /**
   * Removes a key from Redis cache
   * @param key - The cache key to delete
   *
   * Error Handling:
   * - Silently returns if Redis connection is unavailable (graceful degradation)
   * - Logs warning if connection is unavailable
   * - Re-throws Redis operation errors for caller to handle
   * - Logs detailed error information including operation type, key, and error message
   */
  public async delete(key: string): Promise<void> {
    if (!this.isConnected()) {
      this.logger.warn(
        CACHE_LOG_MESSAGES.CONNECTION_WARNING.replace('{operation}', CACHE_OPERATIONS.DEL)
      );
      return;
    }

    try {
      await this.getClient().del(key);
      this.logger.debug(CACHE_LOG_MESSAGES.CACHE_DELETE.replace('{key}', key));
    } catch (error) {
      this.logger.error(
        CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED.replace('{operation}', CACHE_OPERATIONS.DEL)
          .replace('{key}', key)
          .replace('{error}', error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  }

  /**
   * Finds all keys matching a specific pattern
   * @param pattern - The pattern to match (supports Redis glob-style patterns)
   * @returns Array of matching keys, or empty array if Redis is unavailable
   *
   * Error Handling:
   * - Returns empty array if Redis connection is unavailable (graceful degradation)
   * - Re-throws Redis operation errors for caller to handle
   * - Logs detailed error information including operation type, pattern, and error message
   */
  public async keys(pattern: string): Promise<string[]> {
    if (!this.isConnected()) {
      return [];
    }
    try {
      const result = await this.getClient().keys(pattern);
      this.logger.debug(
        CACHE_LOG_MESSAGES.CACHE_KEYS.replace('{pattern}', pattern).replace(
          '{count}',
          result.length.toString()
        )
      );
      return result;
    } catch (error) {
      this.logger.error(
        CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED.replace('{operation}', CACHE_OPERATIONS.KEYS)
          .replace('{key}', pattern)
          .replace('{error}', error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  }

  /**
   * Clears the entire Redis cache
   * WARNING: This removes ALL cached data
   *
   * Error Handling:
   * - Silently returns if Redis connection is unavailable (graceful degradation)
   * - Re-throws Redis operation errors for caller to handle
   */
  public async flush(): Promise<void> {
    if (!this.isConnected()) return;
    await this.getClient().flushdb();
    this.logger.info(CACHE_LOG_MESSAGES.CACHE_FLUSH);
  }

  /**
   * Atomically increments a numeric value in cache
   * @param key - The key containing the numeric value
   * @returns The new value after increment, or 0 if Redis is unavailable
   *
   * Error Handling:
   * - Returns 0 if Redis connection is unavailable (graceful degradation)
   * - Re-throws Redis operation errors for caller to handle
   */
  public async increment(key: string): Promise<number> {
    if (!this.isConnected()) return 0;
    try {
      return await this.getClient().incr(key);
    } catch (error) {
      this.logger.error(
        CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED.replace('{operation}', CACHE_OPERATIONS.INCREMENT)
          .replace('{key}', key)
          .replace('{error}', error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  }

  /**
   * Sets a key with automatic expiration (used for rate limiting)
   * @param key - The cache key
   * @param ttl - Time-to-live in seconds
   *
   * Error Handling:
   * - Silently returns if Redis connection is unavailable (graceful degradation)
   * - Re-throws Redis operation errors for caller to handle
   */
  public async setWithExpiration(key: string, ttl: number): Promise<void> {
    if (!this.isConnected()) return;
    try {
      await this.getClient().set(key, '1', 'EX', ttl, 'NX');
    } catch (error) {
      this.logger.error(
        CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED.replace('{operation}', CACHE_OPERATIONS.SET)
          .replace('{key}', key)
          .replace('{error}', error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  }

  /**
   * Acquires a distributed lock for cache consistency
   * @param key - The lock key
   * @param ttl - Lock expiration time in seconds
   * @returns true if lock was acquired, false otherwise
   *
   * Error Handling:
   * - Returns false if Redis connection is unavailable (graceful degradation)
   * - Returns false if lock acquisition fails
   * - Re-throws Redis operation errors for caller to handle
   */
  public async acquireLock(key: string, ttl: number): Promise<boolean> {
    if (!this.isConnected()) return false;
    try {
      const lockKey = CACHE_KEYS_PATTERNS.CONSISTENCY_LOCK(key);
      const result = await this.getClient().set(lockKey, '1', 'EX', ttl, 'NX');
      return result === 'OK';
    } catch (error) {
      this.logger.error(
        CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED.replace(
          '{operation}',
          CACHE_OPERATIONS.AQUIRE_LOCK
        )
          .replace('{key}', key)
          .replace('{error}', error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  }

  /**
   * Releases a previously acquired lock
   * @param key - The lock key to release
   *
   * Error Handling:
   * - Silently returns if Redis connection is unavailable (graceful degradation)
   * - Re-throws Redis operation errors for caller to handle
   */
  public async releaseLock(key: string): Promise<void> {
    if (!this.isConnected()) return;
    try {
      const lockKey = CACHE_KEYS_PATTERNS.CONSISTENCY_LOCK(key);
      await this.getClient().del(lockKey);
    } catch (error) {
      this.logger.error(
        CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED.replace(
          '{operation}',
          CACHE_OPERATIONS.RELEASE_LOCK
        )
          .replace('{key}', key)
          .replace('{error}', error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  }

  /**
   * Gets the underlying Redis client instance
   * @returns The Redis client for advanced operations
   *
   * Note: Use with caution - direct client access bypasses service-level error handling
   */
  public getClient(): Redis {
    return redisConnection.getClient();
  }

  /**
   * Checks if Redis connection is active
   * @returns true if connected, false otherwise
   */
  public isConnected(): boolean {
    return redisConnection.getConnectionStatus();
  }
}
