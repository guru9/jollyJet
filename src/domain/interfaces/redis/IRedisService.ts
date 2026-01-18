import Redis from 'ioredis';

/**
 * Redis Service Interface
 *
 * Defines the contract for Redis cache operations in the JollyJet e-commerce platform.
 * This interface provides a comprehensive set of methods for cache management, including
 * basic CRUD operations, advanced caching patterns, and connection management.
 *
 * Key Features:
 * - Basic cache operations (get, set, delete)
 * - Key pattern matching and bulk operations
 * - Atomic counters and increment operations
 * - Distributed locking mechanism for cache consistency
 * - Connection state management
 * - Direct Redis client access for advanced operations
 */
export interface IRedisService {
  /**
   * Retrieves a value from Redis cache by key
   * @param key - The cache key to retrieve
   * @returns The cached value as string, or null if not found
   */
  get(key: string): Promise<string | null>;

  /**
   * Stores a value in Redis cache with optional TTL (Time-To-Live)
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttl - Optional time-to-live in seconds
   */
  set(key: string, value: string, ttl?: number): Promise<void>;

  /**
   * Removes a key from Redis cache
   * @param key - The cache key to delete
   */
  delete(key: string): Promise<void>;

  /**
   * Finds all keys matching a specific pattern
   * @param pattern - The pattern to match (supports Redis glob-style patterns)
   * @returns Array of matching keys
   */
  keys(pattern: string): Promise<string[]>;

  /**
   * Clears the entire Redis cache
   * WARNING: This removes ALL cached data
   */
  flush(): Promise<void>;

  /**
   * Atomically increments a numeric value in cache
   * @param key - The key containing the numeric value
   * @returns The new value after increment
   */
  increment(key: string): Promise<number>;

  /**
   * Sets a key with automatic expiration
   * @param key - The cache key
   * @param ttl - Time-to-live in seconds
   */
  setWithExpiration(key: string, ttl: number): Promise<void>;

  /**
   * Acquires a distributed lock for cache consistency
   * @param key - The lock key
   * @param ttl - Lock expiration time in seconds
   * @returns true if lock was acquired, false otherwise
   */
  acquireLock(key: string, ttl: number): Promise<boolean>;

  /**
   * Releases a previously acquired lock
   * @param key - The lock key to release
   */
  releaseLock(key: string): Promise<void>;

  /**
   * Gets the underlying Redis client instance
   * @returns The Redis client for advanced operations
   */
  getClient(): Redis;

  /**
   * Gets the TTL (time-to-live) of a key in seconds
   * @param key - The cache key
   * @returns TTL in seconds, or -2 if key doesn't exist, -1 if no TTL
   */
  getTTL(key: string): Promise<number>;

  /**
   * Checks if Redis connection is active
   * @returns true if connected, false otherwise
   */
  isConnected(): boolean;
}
