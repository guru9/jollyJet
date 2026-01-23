import { IRedisService } from '@/domain/interfaces/redis/IRedisService';
import { Logger } from '@/shared/logger';
import Redis from 'ioredis';

/**
 * Mock RedisService for unit testing
 * Implements IRedisService interface with in-memory storage
 *
 * Features:
 * - In-memory key-value store
 * - TTL simulation with expiration
 * - Distributed locking simulation
 * - Connection state simulation
 * - Comprehensive logging
 */
export class MockRedisService implements IRedisService {
  private store: Map<string, { value: string; ttl?: number; expiresAt?: number }>;
  private locks: Set<string>;
  private logger: Logger;
  private connectedState: boolean;

  /**
   * Constructor
   * @param logger - Logger instance for logging operations
   * @param isConnected - Initial connection state (default: true)
   */
  constructor(logger: Logger, connected: boolean = true) {
    this.store = new Map();
    this.locks = new Set();
    this.logger = logger;
    this.connectedState = connected;
  }

  /**
   * Simulate connection issues for testing
   * @param connected - Connection state to simulate
   */
  setConnectionState(connected: boolean): void {
    this.connectedState = connected;
  }

  /**
   * Retrieves a value from the mock cache
   * @param key - The cache key to retrieve
   * @returns The cached value as string, or null if not found or expired
   */
  async get(key: string): Promise<string | null> {
    if (!this.connectedState) {
      this.logger.warn('MockRedis: Not connected, returning null');
      return null;
    }

    const item = this.store.get(key);
    if (!item) {
      this.logger.debug(`MockRedis: Cache miss for key: ${key}`);
      return null;
    }

    // Check TTL expiration
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      this.logger.debug(`MockRedis: Key expired: ${key}`);
      return null;
    }

    this.logger.debug(`MockRedis: Cache hit for key: ${key}`);
    return item.value;
  }

  /**
   * Stores a value in the mock cache with optional TTL
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttl - Optional time-to-live in seconds
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.connectedState) {
      this.logger.warn('MockRedis: Not connected, set operation skipped');
      return;
    }

    const item: { value: string; ttl?: number; expiresAt?: number } = { value };
    if (ttl) {
      item.ttl = ttl;
      item.expiresAt = Date.now() + ttl * 1000;
      this.logger.debug(`MockRedis: Set key: ${key} with TTL: ${ttl}`);
    } else {
      this.logger.debug(`MockRedis: Set key: ${key} with no TTL`);
    }

    this.store.set(key, item);
  }

  /**
   * Removes a key from the mock cache
   * @param key - The cache key to delete
   */
  async delete(key: string): Promise<void> {
    if (!this.connectedState) {
      this.logger.warn('MockRedis: Not connected, delete operation skipped');
      return;
    }

    this.store.delete(key);
    this.logger.debug(`MockRedis: Deleted key: ${key}`);
  }

  /**
   * Finds all keys matching a specific pattern
   * @param pattern - The pattern to match (supports * wildcard)
   * @returns Array of matching keys
   */
  async keys(pattern: string): Promise<string[]> {
    if (!this.connectedState) {
      this.logger.warn('MockRedis: Not connected, returning empty array');
      return [];
    }

    // Simple pattern matching - replace * with empty string for contains check
    const searchPattern = pattern.replace(/\*/g, '');
    const keys = Array.from(this.store.keys());
    const matchedKeys = keys.filter((key) => key.includes(searchPattern));

    this.logger.debug(`MockRedis: Found ${matchedKeys.length} keys matching pattern: ${pattern}`);
    return matchedKeys;
  }

  /**
   * Clears the entire mock cache
   */
  async flush(): Promise<void> {
    if (!this.connectedState) {
      this.logger.warn('MockRedis: Not connected, flush operation skipped');
      return;
    }

    this.store.clear();
    this.locks.clear();
    this.logger.info('MockRedis: Cache flushed successfully');
  }

  /**
   * Atomically increments a numeric value in cache
   * @param key - The key containing the numeric value
   * @returns The new value after increment
   */
  async increment(key: string): Promise<number> {
    if (!this.connectedState) {
      this.logger.warn('MockRedis: Not connected, returning 0');
      return 0;
    }

    const current = await this.get(key);
    const value = current ? parseInt(current, 10) + 1 : 1;
    await this.set(key, value.toString());

    this.logger.debug(`MockRedis: Incremented key: ${key} to value: ${value}`);
    return value;
  }

  /**
   * Sets a key with automatic expiration
   * @param key - The cache key
   * @param ttl - Time-to-live in seconds
   */
  async setWithExpiration(key: string, ttl: number): Promise<void> {
    if (!this.connectedState) {
      this.logger.warn('MockRedis: Not connected, setWithExpiration skipped');
      return;
    }

    await this.set(key, '1', ttl);
  }

  /**
   * Acquires a distributed lock
   * @param key - The lock key
   * @param ttl - Lock expiration time in seconds
   * @returns true if lock was acquired, false otherwise
   */
  async acquireLock(key: string, ttl: number): Promise<boolean> {
    if (!this.connectedState) {
      this.logger.warn('MockRedis: Not connected, lock acquisition failed');
      return false;
    }

    const lockKey = `lock:${key}`;
    if (this.locks.has(lockKey)) {
      this.logger.debug(`MockRedis: Lock already taken: ${lockKey}`);
      return false;
    }

    this.locks.add(lockKey);
    this.logger.debug(`MockRedis: Lock acquired: ${lockKey}`);

    // Auto-release after TTL (simulated)
    setTimeout(() => {
      this.locks.delete(lockKey);
      this.logger.debug(`MockRedis: Lock auto-released: ${lockKey}`);
    }, ttl * 1000);

    return true;
  }

  /**
   * Releases a previously acquired lock
   * @param key - The lock key to release
   */
  async releaseLock(key: string): Promise<void> {
    if (!this.connectedState) {
      this.logger.warn('MockRedis: Not connected, lock release skipped');
      return;
    }

    const lockKey = `lock:${key}`;
    this.locks.delete(lockKey);
    this.logger.debug(`MockRedis: Lock released: ${lockKey}`);
  }

  /**
   * Gets the underlying mock client (for testing purposes)
   * @returns Mock client object
   */
  getClient(): Redis {
    return {
      isMock: true,
      store: this.store,
      locks: this.locks,
      exists: async (key: string): Promise<number> => {
        if (!this.connectedState) {
          this.logger.warn('MockRedis: Not connected, exists returning 0');
          return 0;
        }
        const item = this.store.get(key);
        if (!item) {
          this.logger.debug(`MockRedis: Key does not exist: ${key}`);
          return 0;
        }
        if (item.expiresAt && Date.now() > item.expiresAt) {
          this.store.delete(key);
          this.logger.debug(`MockRedis: Key expired: ${key}`);
          return 0;
        }
        this.logger.debug(`MockRedis: Key exists: ${key}`);
        return 1;
      },
      ttl: async (key: string): Promise<number> => {
        if (!this.connectedState) {
          this.logger.warn('MockRedis: Not connected, ttl returning -2');
          return -2;
        }
        const item = this.store.get(key);
        if (!item) {
          this.logger.debug(`MockRedis: Key does not exist for ttl: ${key}`);
          return -2;
        }
        if (item.expiresAt && Date.now() > item.expiresAt) {
          this.store.delete(key);
          this.logger.debug(`MockRedis: Key expired for ttl: ${key}`);
          return -2;
        }
        if (!item.ttl || !item.expiresAt) {
          this.logger.debug(`MockRedis: Key has no TTL: ${key}`);
          return -1;
        }
        const remainingTTL = Math.floor((item.expiresAt - Date.now()) / 1000);
        this.logger.debug(`MockRedis: Key TTL: ${key} = ${remainingTTL}`);
        return remainingTTL;
      },
      dbsize: async (): Promise<number> => {
        if (!this.connectedState) {
          this.logger.warn('MockRedis: Not connected, dbsize returning 0');
          return 0;
        }
        return this.store.size;
      },
      info: async (section: string): Promise<string> => {
        if (!this.connectedState) {
          this.logger.warn('MockRedis: Not connected, info returning empty');
          return '';
        }
        if (section === 'server') {
          return 'uptime_in_seconds:1000\r\nredis_version:7.0.0';
        }
        if (section === 'memory') {
          return 'used_memory:1048576\r\nused_memory_rss:2097152';
        }
        return '';
      },
    } as unknown as Redis;
  }

  /**
   * Gets the TTL (time-to-live) of a key in seconds
   * @param key - The cache key
   * @returns TTL in seconds, or -2 if key doesn't exist, -1 if no TTL
   */
  async getTTL(key: string): Promise<number> {
    if (!this.connectedState) {
      this.logger.warn('MockRedis: Not connected, ttl returning -2');
      return -2;
    }

    const item = this.store.get(key);
    if (!item) {
      this.logger.debug(`MockRedis: Key does not exist for ttl: ${key}`);
      return -2;
    }

    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      this.logger.debug(`MockRedis: Key expired for ttl: ${key}`);
      return -2;
    }

    if (!item.ttl || !item.expiresAt) {
      this.logger.debug(`MockRedis: Key has no TTL: ${key}`);
      return -1;
    }

    const remainingTTL = Math.floor((item.expiresAt - Date.now()) / 1000);
    this.logger.debug(`MockRedis: Key TTL: ${key} = ${remainingTTL}`);
    return remainingTTL;
  }

  /**
   * Checks if the mock Redis is connected
   * @returns true if connected, false otherwise
   */
  isConnected(): boolean {
    return this.connectedState;
  }
}
