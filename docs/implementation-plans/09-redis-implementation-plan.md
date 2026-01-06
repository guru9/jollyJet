# Implementation Plan #09 - Complete Redis Integration with All Features

**Plan:** 09-redis-complete-implementation-plan
**Related Task:** [03-redis-task](../tasks/03-redis-task.md)
**Branch:** `feature/jollyjet-09-redis-integration`
**Status:** ✅ **Complete (Manual Implementation)** - 🔄 **Decorator Refactoring Pending**

---

## Overview

This comprehensive Redis integration plan provides a complete implementation guide for `JollyJet`, combining the best practices from multiple planning phases into a single, detailed implementation document. Redis will be used as an in-memory data store for caching frequently accessed data, session management, rate limiting, and real-time features, with special attention to cache consistency and performance optimization.

We will follow **Clean Architecture** principles, ensuring our Redis integration remains independent of business logic while providing significant performance benefits and robust cache consistency guarantees.

## 📂 Implemented Folder Structure

The Redis implementation follows strict Clean Architecture principles, separating domain contracts from infrastructure implementations:

```
src/
├── domain/                    # 🟢 Domain Layer (Core Business Rules)
│   ├── interfaces/
│   │   ├── redis/
│   │   │   └── IRedisService.ts          # Step 1.2 [No deps]
│   │   ├── session/
│   │   │   └── ISessionService.ts        # Step 2.2 [No deps]
│   │   └── ratelimit/
│   │       └── IRateLimitingService.ts   # Step 2.3 (Planned)
│   └── services/
│       ├── cache/
│       │   └── CacheConsistencyService.ts # Step 2.1 [Dep: 1.3]
│       └── redis/
│           └── RedisService.ts           # Step 1.3 [Dep: 1.1, 1.2]
│
├── usecases/                  # 🟠 Application Layer (Business Orchestration)
│   └── product/
│       ├── GetProductUseCase.ts          # Step 4.1 [Dep: 1.3]
│       ├── CreateProductUseCase.ts       # Step 4.1 [Dep: 1.3]
│       └── ...
│
├── interface/                 # 🔴 Interface Layer (Presentation/Adapters)
│   ├── controllers/
│   │   └── product/
│   │       └── ProductController.ts      # Step 4.1
│   ├── middlewares/
│   │   ├── redisCacheMiddleware.ts       # Step 3.1 [Dep: 1.3, 2.1]
│   │   └── rateLimitingMiddleware.ts     # Step 3.2 [Dep: 2.3]
│   └── routes/
│       └── product/
│           └── productRoutes.ts
│
├── infrastructure/            # 🔵 Infrastructure Layer (External Details)
│   └── services/
│       ├── session/
│       │   └── SessionService.ts         # Step 2.2 [Dep: 1.3]
│       └── ratelimit/
│           └── RateLimitingService.ts    # Step 2.3 (Planned) [Dep: 1.3]
│
├── shared/                    # 🟡 Shared Layer
    ├── decorators/
    │   └── cache.decorator.ts            # Step 2.4 (Planned) [Dep: 1.3]
    └── constants.ts                      # Step 1.1

└── __tests__/                 # 🧪 Tests
    └── unit/
        └── infrastructure/
            └── services/
                └── session/
                    └── SessionService.test.ts # Step 2.2 (Test)
```

---

## 🎯 Implementation Dependency Flow

### Core Implementation Sequence

The Redis integration follows a **systematic dependency flow** to ensure proper Clean Architecture layering:

```mermaid
graph TD
    A[1.1 Redis Configuration] --> B[1.2 IRedisService Interface]
    A --> C[1.3 RedisService Implementation]
    B --> C
    C --> D[2.1 Cache Consistency Service]
    C --> F[2.2 Session Management]
    C --> G[2.3 Rate Limiting Service]
    D --> F
    D --> G
    D --> H[2.4 Cache Decorators]
    D --> I[3.1 Redis Cache Middleware]
    G --> J[3.2 Rate Limiting Middleware]
    H --> K[3.3 Product Use Cases Integration]
    I --> K
    K --> L[4.1 Swagger Documentation]
    K --> M[4.2 Redis Integration Tests]
    F --> M
    G --> M
    M --> N[4.3 Verification Scripts]
    D --> E[2.5 DI Container Registration]
    F --> E
    G --> E
    H --> E
```

### Dependency Flow Table

| Step    | Component                   | Required Dependencies                                                                              | Layer                   | Est. Time |
| ------- | --------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------- | --------- |
| **1.1** | Redis Configuration         | None                                                                                               | Shared                  | 30m       |
| **1.2** | IRedisService Interface     | None                                                                                               | Domain                  | 45m       |
| **1.3** | RedisService Implementation | 1.1 (Config), 1.2 (Interface)                                                                      | Infrastructure          | 2h        |
| **2.1** | Cache Consistency Service   | 1.3 (RedisService)                                                                                 | Domain                  | 2h        |
| **2.2** | Session Management          | 1.3 (RedisService)                                                                                 | Domain & Infrastructure | 1.5h      |
| **2.3** | Rate Limiting Service       | 1.3 (RedisService)                                                                                 | Domain & Infrastructure | 1h        |
| **2.4** | Cache Decorators            | 1.3 (RedisService), 2.1 (ConsistencyService)                                                       | Shared                  | 1.5h      |
| **2.5** | DI Container Registration   | 1.3 (RedisService), 2.1 (ConsistencyService), 2.2 (Session), 2.3 (Rate Limiting), 2.4 (Decorators) | Config                  | 30m       |
| **3.1** | Redis Cache Middleware      | 1.3 (RedisService), 2.1 (ConsistencyService)                                                       | Interface               | 1h        |
| **3.2** | Rate Limiting Middleware    | 2.4 (RateLimitingService)                                                                          | Interface               | 1h        |
| **4.1** | Product Use Cases           | 1.3, 2.1, 3.1, 3.2 (All Previous Components)                                                       | Use Cases               | 3h        |
| **5.1** | Swagger Documentation       | 4.1 (Product Use Cases)                                                                            | Config                  | 30m       |
| **5.2** | Redis Integration Tests     | 1.3, 2.1, 2.3, 2.4, 4.1 (Multiple Components)                                                      | Tests                   | 2h        |
| **5.3** | Verification Scripts        | 4.1 (Product Use Cases)                                                                            | Scripts                 | 1h        |

### Critical Dependency Notes:

- **Step 5.2** (Redis Integration Tests) depends on **multiple components** from previous phases
- **Step 4.1** (Product Use Cases) is the **integration point** that combines all Redis features
- **Steps 2.3** and **2.4** (Session & Rate Limiting) are **prerequisites** for comprehensive testing
- **Step 3.3** depends specifically on **Step 2.4** (not on earlier steps)

---

## 🛠️ **Technology Stack: `ioredis`**

We have selected **ioredis** as our Redis client for Node.js.

- **Why ioredis?**
  - **Robust:** Built-in auto-reconnect, offline queue, and robust error handling.
  - **Performance:** High-performance with support for pipelining.
  - **Features:** Supports Redis Cluster, Sentinel, and Lua scripting.
  - **TypeScript:** Native TypeScript support.

## 🚀 Implementation Steps (Step-by-Step Guide)

---

### 🟢 **PHASE 1: FOUNDATION SETUP**

#### ✅ **Step 1.1: Add Redis Configuration to Shared Layer**

- **Objective:** Create Redis configuration constants and connection settings in the shared layer
- **Implementation:** Add Redis connection parameters, cache keys, TTL settings, and consistency configuration
- **Dependencies:** None
- **Files to Create/Modify:**
  - `src/shared/constants.ts` - Add Redis configuration constants
- **Specific Code Changes:**
  - Add `REDIS_CONFIG` object with connection settings
  - Add `CACHE_KEY_PATTERNS` for consistent key naming
  - Add `CACHE_LOG_MESSAGES` for structured logging
  - Add `CACHE_OPERATIONS` enum
- **Implementation Time:** 30 minutes

**File:** `src/shared/constants.ts`

```typescript
// Enhanced Redis Configuration Constants with logging support
export const REDIS_CONFIG = {
  HOST: process.env.REDIS_HOST || 'localhost',
  PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  PASSWORD: process.env.REDIS_PASSWORD || '',
  DATABASE: parseInt(process.env.REDIS_DB || '0', 10),
  TTL: {
    DEFAULT: 3600, // 1 hour
    PRODUCT: 1800, // 30 minutes
    SESSION: 86400, // 24 hours
    RATE_LIMIT: 60, // 1 minute
  },
  RATE_LIMIT: {
    WINDOW: 60, // 1 minute window
    MAX_REQUESTS: 100, // Max requests per window
  },
  CONSISTENCY: {
    CHECK_INTERVAL: 300000, // 5 minutes
    SAMPLE_SIZE: 10,
    STALE_THRESHOLD: 600, // 10 minutes
  },
  LOG_LEVELS: {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
  },
} as const;

// Cache operation types for consistent logging
export const CACHE_OPERATIONS = {
  GET: 'GET',
  SET: 'SET',
  DELETE: 'DELETE',
  FLUSH: 'FLUSH',
  INCREMENT: 'INCREMENT',
  ACQUIRE_LOCK: 'ACQUIRE_LOCK',
  RELEASE_LOCK: 'RELEASE_LOCK',
  KEYS: 'KEYS',
} as const;

// Cache key patterns for consistent naming
export const CACHE_KEY_PATTERNS = {
  PRODUCT: (id: string) => `product:${id}`,
  PRODUCTS_LIST: (filter: string) => `products:list:${filter}`,
  SESSION: (sessionId: string) => `session:${sessionId}`,
  RATE_LIMIT: (ip: string) => `rate_limit:${ip}`,
  CONSISTENCY_LOCK: (key: string) => `consistency:lock:${key}`,
  WISHLIST: (userId: string) => `products:wishlist:${userId}`,
} as const;

// Cache operation log messages with placeholders
export const CACHE_LOG_MESSAGES = {
  // Connection messages
  CONNECTION_SUCCESS: 'Redis connected successfully',
  CONNECTION_ERROR: 'Redis connection error: {error}',
  CONNECTION_WARNING: 'Redis not connected, {operation} skipped',
  // Cache operation messages
  CACHE_HIT: 'Cache hit for key: {key}',
  CACHE_MISS: 'Cache miss for key: {key}, fetching from {source}',
  CACHE_SET: 'Cache set for key: {key} with TTL: {ttl}',
  CACHE_DELETE: 'Cache deleted for key: {key}',
  CACHE_FLUSH: 'Cache flushed successfully',
  CACHE_KEYS: 'Found {count} keys matching pattern: {pattern}',
  // Consistency messages
  STALE_CACHE_DETECTED: 'Stale cache detected for key: {key}, TTL: {ttl}',
  CACHE_REFRESHED: 'Cache refreshed for key: {key}',
  CONSISTENCY_CHECK_FAILED: 'Consistency check failed for key: {key}',
  CONSISTENCY_CHECK_SUCCESS: 'Consistency check passed for key: {key}',
  // Performance messages
  STAMPEDE_PROTECTION_ACTIVE: 'Stampede protection active for key: {key}',
  BACKGROUND_REFRESH_STARTED: 'Background refresh started for key: {key}',
  BACKGROUND_REFRESH_COMPLETED: 'Background refresh completed for key: {key}',
  // Error messages
  CACHE_OPERATION_FAILED: 'Cache operation {operation} failed for key: {key}, error: {error}',
  LOCK_ACQUISITION_FAILED: 'Lock acquisition failed for key: {key}',
  METRICS_COLLECTION_FAILED: 'Metrics collection failed: {error}',
  BATCH_OPERATION_FAILED: 'Batch operation failed, falling back to individual operations',
  // Performance metrics
  CACHE_HIT_RATE: 'Cache hit rate: {hitRate}%, total operations: {total}',
  LOW_HIT_RATE_WARNING:
    'Low cache hit rate detected: {hitRate}%, consider adjusting TTL or cache strategy',
  MEMORY_USAGE: 'Redis memory usage: {memory} bytes',
} as const;
```

#### ✅ **Step 1.2: Create Redis Service Interface in Domain Layer**

- **Objective:** Define abstract Redis service interface in the domain layer for caching operations
- **Implementation:** Create interface with methods for cache operations (get, set, delete, etc.)
- **Dependencies:** None
- **Files to Create:**
  - `src/domain/interfaces/redis/IRedisService.ts` - Redis service interface
- **Interface Methods:**
  - `get(key: string): Promise<string | null>`
  - `set(key: string, value: string, ttl?: number): Promise<void>`
  - `delete(key: string): Promise<void>`
  - `keys(pattern: string): Promise<string[]>`
  - `flush(): Promise<void>`
  - `increment(key: string): Promise<number>`
  - `setWithExpiration(key: string, ttl: number): Promise<void>`
  - `acquireLock(key: string, ttl: number): Promise<boolean>`
  - `releaseLock(key: string): Promise<void>`
  - `getClient(): RedisClientType`
  - `isConnected(): boolean`
- **Implementation Time:** 45 minutes

**File:** `src/domain/interfaces/redis/IRedisService.ts`

```typescript
import { Redis } from 'ioredis';

export interface IRedisService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  keys(pattern: string): Promise<string[]>;
  flush(): Promise<void>;
  increment(key: string): Promise<number>;
  setWithExpiration(key: string, ttl: number): Promise<void>;
  acquireLock(key: string, ttl: number): Promise<boolean>;
  releaseLock(key: string): Promise<void>;
  getClient(): Redis;
  isConnected(): boolean;
}
```

#### ✅ **Step 1.3: Implement Redis Service in Infrastructure Layer**

- **Objective:** Create concrete Redis service implementation with consistency features
- **Implementation:** Implement Redis service with connection management, error handling, and consistency patterns
- **Dependencies:** Redis configuration (Step 1.1), IRedisService (Step 1.2)
- **Files to Create:**
  - `src/infrastructure/redis/services/RedisService.ts` - Redis service implementation
- **Implementation Details:**
  - Use `@injectable()` decorator from tsyringe
  - Implement all IRedisService interface methods
  - Add connection management and error handling
  - Include logging for all operations
  - Add stampede protection with distributed locks
  - Implement graceful degradation for cache failures
- **Implementation Time:** 2 hours

**File:** `src/infrastructure/redis/services/RedisService.ts`

```typescript
import { injectable, inject } from 'tsyringe';
import Redis from 'ioredis';
import { IRedisService } from '../../../domain/interfaces/redis/IRedisService';
import {
  REDIS_CONFIG,
  CACHE_OPERATIONS,
  CACHE_LOG_MESSAGES,
  CACHE_KEY_PATTERNS,
} from '../../../shared/constants';
import { Logger } from '../../../shared/logger';

@injectable()
export class RedisService implements IRedisService {
  private client: Redis;
  private isConnectedVal: boolean = false;
  private logger: Logger;

  constructor(@inject('Logger') logger: Logger) {
    this.logger = logger;
    this.client = new Redis({
      host: REDIS_CONFIG.HOST,
      port: REDIS_CONFIG.PORT,
      password: REDIS_CONFIG.PASSWORD,
      db: REDIS_CONFIG.DATABASE,
      lazyConnect: true,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.setupEventHandlers();
    this.connect();
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      this.isConnectedVal = true;
      this.logger.info(CACHE_LOG_MESSAGES.CONNECTION_SUCCESS);
    });

    this.client.on('error', (err) => {
      this.isConnectedVal = false;
      this.logger.error(CACHE_LOG_MESSAGES.CONNECTION_ERROR, { error: err });
    });

    this.client.on('close', () => {
      this.isConnectedVal = false;
      this.logger.warn(CACHE_LOG_MESSAGES.CONNECTION_CLOSED);
    });
  }

  private async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      // Error handled by event listener
    }
  }

  public async get(key: string): Promise<string | null> {
    if (!this.isConnectedVal) {
      this.logger.warn(CACHE_LOG_MESSAGES.CONNECTION_WARNING, {
        operation: CACHE_OPERATIONS.GET,
      });
      return null;
    }

    try {
      const result = await this.client.get(key);
      if (result) {
        this.logger.debug(CACHE_LOG_MESSAGES.CACHE_HIT, { key });
      }
      return result;
    } catch (error) {
      this.logger.error(CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED, {
        operation: CACHE_OPERATIONS.GET,
        key,
        error,
      });
      throw error;
    }
  }

  public async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.isConnectedVal) {
      this.logger.warn(CACHE_LOG_MESSAGES.CONNECTION_WARNING, {
        operation: CACHE_OPERATIONS.SET,
      });
      return;
    }

    try {
      if (ttl) {
        await this.client.set(key, value, 'EX', ttl);
        this.logger.debug(CACHE_LOG_MESSAGES.CACHE_SET, { key, ttl });
      } else {
        await this.client.set(key, value);
        this.logger.debug(CACHE_LOG_MESSAGES.CACHE_SET, { key, ttl: 'no TTL' });
      }
    } catch (error) {
      this.logger.error(CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED, {
        operation: CACHE_OPERATIONS.SET,
        key,
        error,
      });
      throw error;
    }
  }

  public async delete(key: string): Promise<void> {
    if (!this.isConnectedVal) {
      this.logger.warn(CACHE_LOG_MESSAGES.CONNECTION_WARNING, {
        operation: CACHE_OPERATIONS.DELETE,
      });
      return;
    }

    try {
      await this.client.del(key);
      this.logger.debug(CACHE_LOG_MESSAGES.CACHE_DELETE, { key });
    } catch (error) {
      this.logger.error(CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED, {
        operation: CACHE_OPERATIONS.DELETE,
        key,
        error,
      });
      throw error;
    }
  }

  public async keys(pattern: string): Promise<string[]> {
    if (!this.isConnectedVal) {
      return [];
    }
    try {
      const result = await this.client.keys(pattern);
      this.logger.debug(CACHE_LOG_MESSAGES.CACHE_KEYS, { pattern, count: result.length });
      return result;
    } catch (error) {
      this.logger.error(CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED, {
        operation: CACHE_OPERATIONS.KEYS,
        key: pattern,
        error,
      });
      throw error;
    }
  }

  public async flush(): Promise<void> {
    if (!this.isConnectedVal) return;
    try {
      await this.client.flushdb();
      this.logger.info(CACHE_LOG_MESSAGES.CACHE_FLUSH);
    } catch (error) {
      throw error;
    }
  }

  public async increment(key: string): Promise<number> {
    if (!this.isConnectedVal) return 0;
    return await this.client.incr(key);
  }

  public async setWithExpiration(key: string, ttl: number): Promise<void> {
    if (!this.isConnectedVal) return;
    await this.client.set(key, '1', 'EX', ttl, 'NX');
  }

  public async acquireLock(key: string, ttl: number): Promise<boolean> {
    if (!this.isConnectedVal) return false;
    const lockKey = CACHE_KEY_PATTERNS.CONSISTENCY_LOCK(key);
    const result = await this.client.set(lockKey, '1', 'EX', ttl, 'NX');
    return result === 'OK';
  }

  public async releaseLock(key: string): Promise<void> {
    const lockKey = CACHE_KEY_PATTERNS.CONSISTENCY_LOCK(key);
    await this.client.del(lockKey);
  }

  public getClient(): Redis {
    return this.client;
  }

  public isConnected(): boolean {
    return this.isConnectedVal;
  }
}
```

---

### 🔵 **PHASE 2: CONSISTENCY AND MONITORING**

#### ✅ **Step 2.1: Create Cache Consistency Service**

- **Objective:** Implement service for managing cache consistency and monitoring
- **Implementation:** Create service for consistency checking, monitoring, and conflict resolution
- **Dependencies:** Redis service (Step 1.3), Redis configuration (Step 1.1)
- **Files to Create:**
  - `src/domain/services/cache/CacheConsistencyService.ts` - Cache consistency manager
- **Consistency Features:**
  - Cache hit/miss ratio monitoring
  - Stale data detection and handling
  - Background cache refresh
  - Consistency metrics collection
  - Automatic cache invalidation triggers
  - Cache performance monitoring
- **Implementation Time:** 2 hours

**File:** `src/domain/services/cache/CacheConsistencyService.ts`

```typescript
import { injectable, inject } from 'tsyringe';
import { IRedisService } from '../../interfaces/redis/IRedisService';
import { REDIS_CONFIG, CACHE_LOG_MESSAGES } from '../../../shared/constants';
import { Logger } from '../../../shared/logger';

export interface CacheMetrics {
  cacheHits: number;
  cacheMisses: number;
  staleReads: number;
  consistencyErrors: number;
  hitRate: number;
  consistencyScore: number;
}

@injectable()
export class CacheConsistencyService {
  private metrics: CacheMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    staleReads: 0,
    consistencyErrors: 0,
    hitRate: 0,
    consistencyScore: 100,
  };

  constructor(
    @inject('IRedisService') private redisService: IRedisService,
    @inject('Logger') private logger: Logger
  ) {
    // Schedule regular consistency checks
    setInterval(() => this.checkConsistency(), REDIS_CONFIG.CONSISTENCY.CHECK_INTERVAL);
  }

  public trackCacheHit(): void {
    this.metrics.cacheHits++;
    this.updateMetrics();
  }

  public trackCacheMiss(): void {
    this.metrics.cacheMisses++;
    this.updateMetrics();
  }

  public trackStaleRead(): void {
    this.metrics.staleReads++;
    this.updateMetrics();
  }

  public trackConsistencyError(): void {
    this.metrics.consistencyErrors++;
    this.updateMetrics();
  }

  private updateMetrics(): void {
    const totalOperations = this.metrics.cacheHits + this.metrics.cacheMisses;
    if (totalOperations > 0) {
      this.metrics.hitRate = (this.metrics.cacheHits / totalOperations) * 100;
    }

    this.metrics.consistencyScore = this.calculateConsistencyScore();
  }

  private calculateConsistencyScore(): number {
    const totalOperations = this.metrics.cacheHits + this.metrics.cacheMisses;
    const errorRate = totalOperations > 0 ? this.metrics.consistencyErrors / totalOperations : 0;

    return Math.max(0, 100 - errorRate * 100);
  }

  private async checkConsistency(): Promise<void> {
    try {
      // Sample some cache entries and verify against database
      const sampleKeys = await this.redisService.keys('product:*');
      const sampleSize = Math.min(REDIS_CONFIG.CONSISTENCY.SAMPLE_SIZE, sampleKeys.length);
      const keysToCheck = sampleKeys.sort(() => 0.5 - Math.random()).slice(0, sampleSize);

      for (const key of keysToCheck) {
        const cachedData = await this.redisService.get(key);
        if (cachedData) {
          // In a real implementation, this would compare with database
          // For now, we'll just log the check
          console.log(`Consistency check for key: ${key}`);
        }
      }
    } catch (error) {
      console.error('Consistency check failed:', error);
      this.trackConsistencyError();
    }
  }

  public getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  public async checkStaleData(key: string): Promise<boolean> {
    try {
      // Get TTL for the key
      const ttl = await this.redisService.getClient().ttl(key);

      // If TTL is very low or negative, consider data stale
      if (ttl <= 0) {
        return true;
      }

      // Additional stale detection logic could be added here
      // For example, checking last update time, comparing with database, etc.

      return false;
    } catch (error) {
      this.logger.debug(
        `Error checking stale data for ${key}: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }

  public async refreshAhead<T>(
    key: string,
    operation: () => Promise<T>,
    ttl: number,
    refreshThreshold: number = 300
  ): Promise<T> {
    // Get current cached value
    const cachedValue = await this.redisService.get(key);

    if (cachedValue) {
      // Check if we should refresh
      const currentTtl = await this.redisService.getClient().ttl(key);

      if (currentTtl > 0 && currentTtl <= refreshThreshold) {
        // Refresh in background
        this.refreshCacheInBackground(key, operation, ttl);
      }

      return JSON.parse(cachedValue);
    }

    // If not in cache, execute operation and cache
    const result = await operation();
    await this.redisService.set(key, JSON.stringify(result), ttl);

    return result;
  }

  private async refreshCacheInBackground<T>(
    key: string,
    operation: () => Promise<T>,
    ttl: number
  ): Promise<void> {
    try {
      const result = await operation();
      await this.redisService.set(key, JSON.stringify(result), ttl);
      this.logger.debug(`Background cache refresh completed for key: ${key}`);
    } catch (error) {
      this.logger.error(
        CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED.replace('{operation}', 'BACKGROUND_REFRESH')
          .replace('{key}', key)
          .replace('{error}', error instanceof Error ? error.message : String(error))
      );
    }
  }
}
```

#### ✅ **Step 2.2: Implement Session Management with Redis**

- **Objective:** Add Redis-based session management for `user authentication`
- **Implementation:** Create session interface in domain layer and implementation in infrastructure layer (Clean Architecture)
- **Dependencies:** Redis service (Step 1.3)
- **Files to Create:**
  - `src/domain/interfaces/session/ISessionService.ts` - Session service interface
  - `src/infrastructure/services/session/SessionService.ts` - Session service implementation
  - `src/__tests__/unit/infrastructure/services/session/SessionService.test.ts` - Unit tests
- **Session Features:**
  - Session creation and validation
  - Session expiration handling
  - User session data storage
  - Session cleanup and garbage collection
  - Distributed session support for load balancing
- **Implementation Time:** 1.5 hours

**File:** `src/domain/interfaces/session/ISessionService.ts`

```typescript
export interface SessionData {
  userId: string;
  email: string;
  roles: string[];
  preferences: Record<string, unknown>;
  createdAt: Date;
  lastAccessedAt: Date;
}

export interface CreateSessionOptions {
  userId: string;
  email: string;
  roles: string[];
  preferences?: Record<string, unknown>;
  ttl?: number;
}

export interface ISessionService {
  createSession(options: CreateSessionOptions): Promise<string>;
  getSession(sessionId: string): Promise<SessionData | null>;
  updateSession(sessionId: string, updates: Partial<SessionData>): Promise<boolean>;
  deleteSession(sessionId: string): Promise<boolean>;
  extendSession(sessionId: string, ttl?: number): Promise<boolean>;
  cleanupExpiredSessions(inactiveDaysThreshold?: number): Promise<number>;
  deleteUserSessions(userId: string): Promise<number>;
  getUserSessions(userId: string): Promise<Array<{ sessionId: string; data: SessionData }>>;
  isValidSessionData(data: unknown): data is SessionData;
}
```

**File:** `src/infrastructure/services/session/SessionService.ts`

```typescript
import { inject, injectable } from 'tsyringe';
import { IRedisService } from '../../../domain/interfaces/redis/IRedisService';
import {
  CreateSessionOptions,
  ISessionService,
  SessionData,
} from '../../../domain/interfaces/session/ISessionService';
import {
  CACHE_KEYS_PATTERNS,
  CACHE_LOG_MESSAGES,
  DI_TOKENS,
  REDIS_CONFIG,
} from '../../../shared/constants';
import { Logger } from '../../../shared/logger';

@injectable()
export class SessionService implements ISessionService {
  constructor(
    @inject(DI_TOKENS.REDIS_SERVICE) private redisService: IRedisService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger
  ) {}

  // Implementation methods...
}
```

```typescript
import { injectable, inject } from 'tsyringe';
import { IRedisService } from '../../../domain/interfaces/redis/IRedisService';
import { REDIS_CONFIG, CACHE_KEY_PATTERNS, CACHE_LOG_MESSAGES } from '../../../shared/constants';
import { Logger } from '../../../shared/logger';

export interface SessionData {
  userId: string;
  email: string;
  roles: string[];
  preferences: Record<string, any>;
  createdAt: Date;
  lastAccessedAt: Date;
}

export interface CreateSessionOptions {
  userId: string;
  email: string;
  roles: string[];
  preferences?: Record<string, any>;
  ttl?: number;
}

@injectable()
export class SessionService {
  constructor(
    @inject('IRedisService') private redisService: IRedisService,
    @inject('Logger') private logger: Logger
  ) {}

  /**
   * Create a new session
   */
  public async createSession(options: CreateSessionOptions): Promise<string> {
    const sessionId = this.generateSessionId();
    const sessionData: SessionData = {
      userId: options.userId,
      email: options.email,
      roles: options.roles,
      preferences: options.preferences || {},
      createdAt: new Date(),
      lastAccessedAt: new Date(),
    };

    const ttl = options.ttl || REDIS_CONFIG.TTL.SESSION;
    const sessionKey = CACHE_KEY_PATTERNS.SESSION(sessionId);

    await this.redisService.set(sessionKey, JSON.stringify(sessionData), ttl);

    this.logger.info(CACHE_LOG_MESSAGES.CACHE_SET, {
      key: sessionKey,
      ttl,
    });

    return sessionId;
  }

  /**
   * Get session data by session ID
   */
  public async getSession(sessionId: string): Promise<SessionData | null> {
    const sessionKey = CACHE_KEY_PATTERNS.SESSION(sessionId);
    const sessionData = await this.redisService.get(sessionKey);

    if (sessionData) {
      this.logger.debug(CACHE_LOG_MESSAGES.CACHE_HIT, { key: sessionKey });

      // Update last accessed time
      const parsed = JSON.parse(sessionData) as SessionData;
      parsed.lastAccessedAt = new Date();
      await this.redisService.set(sessionKey, JSON.stringify(parsed));

      return parsed;
    }

    this.logger.debug(CACHE_LOG_MESSAGES.CACHE_MISS, {
      key: sessionKey,
      source: 'session_store',
    });
    return null;
  }

  /**
   * Update session data
   */
  public async updateSession(sessionId: string, updates: Partial<SessionData>): Promise<boolean> {
    const sessionKey = CACHE_KEY_PATTERNS.SESSION(sessionId);
    const existingSession = await this.getSession(sessionId);

    if (!existingSession) {
      return false;
    }

    const updatedSession = {
      ...existingSession,
      ...updates,
      lastAccessedAt: new Date(),
    };

    await this.redisService.set(sessionKey, JSON.stringify(updatedSession));
    return true;
  }

  /**
   * Delete session
   */
  public async deleteSession(sessionId: string): Promise<boolean> {
    const sessionKey = CACHE_KEY_PATTERNS.SESSION(sessionId);
    await this.redisService.delete(sessionKey);
    this.logger.debug(CACHE_LOG_MESSAGES.CACHE_DELETE, { key: sessionKey });
    return true;
  }

  /**
   * Extend session TTL
   */
  public async extendSession(sessionId: string, ttl?: number): Promise<boolean> {
    const sessionKey = CACHE_KEY_PATTERNS.SESSION(sessionId);
    const extensionTtl = ttl || REDIS_CONFIG.TTL.SESSION;

    const sessionData = await this.redisService.get(sessionKey);
    if (sessionData) {
      await this.redisService.set(sessionKey, sessionData, extensionTtl);
      return true;
    }
    return false;
  }

  /**
   * Clean up expired sessions
   */
  public async cleanupExpiredSessions(): Promise<number> {
    const sessionKeys = await this.redisService.keys('session:*');
    let cleanedCount = 0;

    for (const key of sessionKeys) {
      const sessionData = await this.redisService.get(key);
      if (sessionData) {
        const session = JSON.parse(sessionData) as SessionData;
        const daysSinceLastAccess =
          (Date.now() - session.lastAccessedAt.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceLastAccess > 7) {
          // Remove sessions inactive for more than 7 days
          await this.redisService.delete(key);
          cleanedCount++;
        }
      }
    }

    this.logger.info(`Cleaned up ${cleanedCount} expired sessions`);
    return cleanedCount;
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate session structure
   */
  public isValidSessionData(data: any): data is SessionData {
    return (
      data &&
      typeof data.userId === 'string' &&
      typeof data.email === 'string' &&
      Array.isArray(data.roles) &&
      typeof data.preferences === 'object' &&
      data.createdAt instanceof Date &&
      data.lastAccessedAt instanceof Date
    );
  }
}
```

**File:** `src/__tests__/unit/infrastructure/services/session/SessionService.test.ts`

```typescript
import 'reflect-metadata';
import { SessionService } from '@/infrastructure/services/session/SessionService';

describe('SessionService', () => {
  // Test cases for create, get, update, delete, cleanup
  // See actual file for full implementation
});
```

#### ✅ **Step 2.3: Create Rate Limiting Service**

- **Objective:** Create dedicated service for rate limiting operations
- **Implementation:** Create rate limiting interface in domain layer and implementation in infrastructure layer
- **Dependencies:** Redis service (Step 1.3)
- **Files to Create:**
  - `src/domain/interfaces/ratelimit/IRateLimitingService.ts` - Rate limiting interface
  - `src/infrastructure/services/ratelimit/RateLimitingService.ts` - Rate limiting implementation
- **Service Features:**
  - Sliding window rate limiting
  - Multiple rate limit strategies
  - Rate limit configuration per user/endpoint
  - Rate limit reset functionality
  - Metrics collection for rate limiting
- **Implementation Time:** 1 hour

**File:** `src/domain/interfaces/ratelimit/IRateLimitingService.ts`

```typescript
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  totalRequests: number;
}

export interface RateLimitConfig {
  windowSize: number; // in seconds
  limit: number;
  keyPrefix?: string;
}

export interface IRateLimitingService {
  checkRateLimit(key: string, config?: RateLimitConfig): Promise<RateLimitResult>;
  resetRateLimit(key: string): Promise<boolean>;
  getRateLimitStatus(key: string): Promise<RateLimitResult | null>;
}
```

**File:** `src/infrastructure/services/ratelimit/RateLimitingService.ts`

```typescript
import { injectable, inject } from 'tsyringe';
import { IRedisService } from '../../../domain/interfaces/redis/IRedisService';
import { REDIS_CONFIG, CACHE_KEY_PATTERNS, CACHE_LOG_MESSAGES } from '../../../shared/constants';
import { Logger } from '../../../shared/logger';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  totalHits: number;
}

export interface RateLimitResult {
  success: boolean;
  info?: RateLimitInfo;
  resetTime?: Date;
}

@injectable()
export class RateLimitingService {
  private defaultConfig: RateLimitConfig = {
    windowMs: REDIS_CONFIG.RATE_LIMIT.WINDOW * 1000,
    maxRequests: REDIS_CONFIG.RATE_LIMIT.MAX_REQUESTS,
  };

  constructor(
    @inject('IRedisService') private redisService: IRedisService,
    @inject('Logger') private logger: Logger
  ) {}

  /**
   * Check rate limit for a given key
   */
  public async checkRateLimit(
    key: string,
    config: RateLimitConfig = this.defaultConfig
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const rateLimitKey = CACHE_KEY_PATTERNS.RATE_LIMIT(key);

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redisService.getClient().pipeline();

      // Remove old entries outside the window
      pipeline.zremrangebyscore(rateLimitKey, 0, windowStart);

      // Count current requests in window
      pipeline.zcard(rateLimitKey);

      // Add current request
      pipeline.zadd(rateLimitKey, now, now.toString());

      // Set expiration for the key
      pipeline.expire(rateLimitKey, Math.ceil(config.windowMs / 1000));

      const results = await pipeline.exec();
      const currentCount = results[1][1] as number;

      const remaining = Math.max(0, config.maxRequests - currentCount - 1);
      const resetTime = new Date(now + config.windowMs);

      const success = currentCount < config.maxRequests;

      const info: RateLimitInfo = {
        limit: config.maxRequests,
        remaining,
        resetTime,
        totalHits: currentCount + 1,
      };

      if (!success) {
        this.logger.warn(
          CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED.replace('{operation}', 'RATE_LIMIT_EXCEEDED')
            .replace('{key}', key)
            .replace('{error}', `Limit: ${config.maxRequests}, Current: ${currentCount + 1}`)
        );
      }

      return {
        success,
        info: success ? info : undefined,
        resetTime: success ? undefined : resetTime,
      };
    } catch (error) {
      this.logger.error(
        CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED.replace('{operation}', 'RATE_LIMIT_CHECK')
          .replace('{key}', key)
          .replace('{error}', error instanceof Error ? error.message : String(error))
      );

      // Fail open - allow request if rate limiting fails
      return { success: true };
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  public async resetRateLimit(key: string): Promise<void> {
    const rateLimitKey = CACHE_KEY_PATTERNS.RATE_LIMIT(key);
    await this.redisService.delete(rateLimitKey);
    this.logger.debug(CACHE_LOG_MESSAGES.CACHE_DELETE, { key: rateLimitKey });
  }

  /**
   * Get rate limit info without incrementing
   */
  public async getRateLimitInfo(
    key: string,
    config: RateLimitConfig = this.defaultConfig
  ): Promise<RateLimitInfo | null> {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const rateLimitKey = CACHE_KEY_PATTERNS.RATE_LIMIT(key);

    try {
      const currentCount = await this.redisService.getClient().zcard(rateLimitKey);
      const remaining = Math.max(0, config.maxRequests - currentCount);
      const resetTime = new Date(now + config.windowMs);

      return {
        limit: config.maxRequests,
        remaining,
        resetTime,
        totalHits: currentCount,
      };
    } catch (error) {
      this.logger.error('Failed to get rate limit info', { key, error });
      return null;
    }
  }

  /**
   * Get rate limit statistics
   */
  public async getRateLimitStats(): Promise<{
    totalKeys: number;
    totalRequests: number;
    activeLimits: number;
  }> {
    try {
      const rateLimitKeys = await this.redisService.keys('rate_limit:*');
      let totalRequests = 0;

      // Use pipeline for batch operations
      const pipeline = this.redisService.getClient().pipeline();
      rateLimitKeys.forEach((key) => {
        pipeline.zcard(key);
      });

      const results = await pipeline.exec();
      totalRequests = results.reduce((sum, result) => sum + (result[1] as number), 0);

      return {
        totalKeys: rateLimitKeys.length,
        totalRequests,
        activeLimits: rateLimitKeys.length,
      };
    } catch (error) {
      this.logger.error('Failed to get rate limit stats', { error });
      return {
        totalKeys: 0,
        totalRequests: 0,
        activeLimits: 0,
      };
    }
  }

  /**
   * Clean up expired rate limit keys
   */
  public async cleanupExpiredLimits(): Promise<number> {
    try {
      const rateLimitKeys = await this.redisService.keys('rate_limit:*');
      let cleanedCount = 0;

      for (const key of rateLimitKeys) {
        const ttl = await this.redisService.getClient().ttl(key);
        if (ttl === -1) {
          // Key has no expiration, remove it
          await this.redisService.delete(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        this.logger.info(`Cleaned up ${cleanedCount} expired rate limit keys`);
      }

      return cleanedCount;
    } catch (error) {
      this.logger.error('Failed to cleanup expired rate limits', { error });
      return 0;
    }
  }

  /**
   * Generate rate limit key based on request
   */
  public generateKey(req: any, type: 'ip' | 'user' | 'endpoint' = 'ip'): string {
    switch (type) {
      case 'user':
        return req.user?.id || req.user?.email || 'anonymous';
      case 'endpoint':
        return `${req.ip}:${req.route?.path || req.originalUrl}`;
      case 'ip':
      default:
        return req.ip || req.connection?.remoteAddress || 'unknown';
    }
  }

  /**
   * Create custom rate limit configuration
   */
  public createConfig(options: Partial<RateLimitConfig>): RateLimitConfig {
    return {
      ...this.defaultConfig,
      ...options,
    };
  }

  /**
   * Check multiple rate limits simultaneously
   */
  public async checkMultipleRateLimits(
    keys: Array<{ key: string; config?: RateLimitConfig }>
  ): Promise<RateLimitResult[]> {
    const results = await Promise.all(
      keys.map(({ key, config }) => this.checkRateLimit(key, config))
    );

    return results;
  }
}
```

#### ✅ **Step 2.4: Create Cache Decorators with Consistency Features**

- **Objective:** Implement caching decorators with consistency checking and invalidation strategies
- **Implementation:** Create TypeScript decorators for cache operations with consistency options
- **Dependencies:** Redis service (Step 1.3), Cache consistency service (Step 2.1)
- **Files to Create:**
  - `src/shared/decorators/cache.decorator.ts` - Cache decorators
- **Decorator Features:**
  - `@Cacheable(ttl, options)` - Cache method results
  - `@CacheEvict(pattern)` - Invalidate cache entries
  - Consistency checking options
  - Stampede protection
  - Background refresh capabilities
- **Implementation Time:** 1.5 hours
- **Note:** The decorators are defined but not yet applied to use cases. Current use cases implement caching manually. Future enhancement: Replace manual caching in use cases with these decorators for cleaner code.

**File:** `src/shared/decorators/cache.decorator.ts`

```typescript
import { IRedisService } from '../../domain/interfaces/redis/IRedisService';
import { container } from 'tsyringe';
import { CacheConsistencyService } from '../../domain/services/cache/CacheConsistencyService';
import { Logger } from '../../shared/logger';
import { CACHE_LOG_MESSAGES, CACHE_OPERATIONS } from '../../shared/constants';

/**
 * Cache decorator for caching method results with consistency options
 * @param ttl Time-to-live in seconds (optional)
 * @param options Consistency and behavior options
 */
export function Cacheable(
  ttl?: number,
  options?: {
    consistencyCheck?: boolean;
    stampedeProtection?: boolean;
    backgroundRefresh?: boolean;
  }
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const logger = container.resolve<Logger>('Logger');

    descriptor.value = async function (...args: any[]) {
      const redisService = container.resolve<IRedisService>('IRedisService');
      const cacheConsistencyService = container.resolve(CacheConsistencyService);
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

      // Try to get cached result
      const cachedResult = await redisService.get(cacheKey);
      if (cachedResult) {
        logger.info(CACHE_LOG_MESSAGES.CACHE_HIT, { key: cacheKey });
        cacheConsistencyService.trackCacheHit();

        // Optional consistency check
        if (options?.consistencyCheck) {
          const isStale = await cacheConsistencyService.checkStaleData(cacheKey);
          if (isStale) {
            logger.warn(CACHE_LOG_MESSAGES.STALE_CACHE_DETECTED, { key: cacheKey });
            cacheConsistencyService.trackStaleRead();

            // Background refresh if enabled
            if (options.backgroundRefresh) {
              cacheConsistencyService.refreshAhead(
                cacheKey,
                () => originalMethod.apply(this, args),
                3600
              );
            }
          }
        }

        return JSON.parse(cachedResult);
      }

      // Cache miss
      cacheConsistencyService.trackCacheMiss();
      logger.info(CACHE_LOG_MESSAGES.CACHE_MISS, { key: cacheKey, source: 'database' });

      // Stampede protection
      if (options?.stampedeProtection) {
        const lockKey = `lock:${cacheKey}`;
        const lockAcquired = await redisService.acquireLock(lockKey, 10);

        if (lockAcquired) {
          try {
            const result = await originalMethod.apply(this, args);
            await redisService.set(cacheKey, JSON.stringify(result), ttl || 3600);
            return result;
          } finally {
            await redisService.releaseLock(lockKey);
          }
        } else {
          // Wait and retry
          await new Promise((resolve) => setTimeout(resolve, 100));
          return this[propertyKey](...args);
        }
      }

      // Execute original method and cache result
      const result = await originalMethod.apply(this, args);
      await redisService.set(cacheKey, JSON.stringify(result), ttl || 3600);

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache eviction decorator with consistency features
 * @param pattern Cache key pattern to evict
 */
export function CacheEvict(pattern: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const logger = container.resolve<Logger>('Logger');

    descriptor.value = async function (...args: any[]) {
      const redisService = container.resolve<IRedisService>('IRedisService');
      const cacheConsistencyService = container.resolve(CacheConsistencyService);

      const result = await originalMethod.apply(this, args);

      // Evict cache after method execution
      const keys = await redisService.keys(pattern);
      for (const key of keys) {
        await redisService.delete(key);
      }

      logger.info('Cache evicted for pattern', {
        pattern,
        keysRemoved: keys.length,
      });

      return result;
    };

    return descriptor;
  };
}
```

#### ✅ **Step 2.5: Update DI Container Configuration**

- **Objective:** Register Redis services in the DI container
- **Implementation:** Add Redis service registration to DI container
- **Dependencies:** Redis service (Step 1.3), Cache consistency service (Step 2.1), Session Service (Step 2.2), Rate Limiting Service (Step 2.3), Cache Decorators (Step 2.4)
- **Files to Modify:**
  - `src/config/di-container.ts` - Add service registrations
- **Service Registrations:**
  - `IRedisService` → `RedisService`
  - `CacheConsistencyService`
  - `SessionService`
  - `RateLimitingService`
  - Add proper token definitions
- **Implementation Time:** 30 minutes

**File:** `src/config/di-container.ts`

```typescript
import { Container } from 'tsyringe';
import { RedisService } from '../infrastructure/redis/services/RedisService';
import { SessionService } from '../infrastructure/redis/services/SessionService';
import { RateLimitingService } from '../infrastructure/redis/services/RateLimitingService';
import { CacheConsistencyService } from '../domain/services/cache/CacheConsistencyService';
import { Logger } from '../shared/logger';

// Service Tokens
export const SERVICE_TOKENS = {
  REDIS_SERVICE: 'IRedisService',
  SESSION_SERVICE: 'SessionService',
  RATE_LIMITING_SERVICE: 'RateLimitingService',
  CACHE_CONSISTENCY_MANAGER: 'CacheConsistencyService',
  LOGGER: 'Logger',
} as const;

export class DIContainer {
  private static container: Container;

  public static initialize(): Container {
    this.container = new Container();

    // Register core services
    this.registerCoreServices();

    // Register Redis services
    this.registerRedisServices();

    // Register cache services
    this.registerCacheServices();

    return this.container;
  }

  private static registerCoreServices(): void {
    // Logger
    this.container.register(SERVICE_TOKENS.LOGGER, {
      useClass: Logger,
    });
  }

  private static registerRedisServices(): void {
    // Redis Service
    this.container.register(SERVICE_TOKENS.REDIS_SERVICE, {
      useClass: RedisService,
    });

    // Session Service
    this.container.register(SERVICE_TOKENS.SESSION_SERVICE, {
      useClass: SessionService,
    });

    // Rate Limiting Service
    this.container.register(SERVICE_TOKENS.RATE_LIMITING_SERVICE, {
      useClass: RateLimitingService,
    });
  }

  private static registerCacheServices(): void {
    // Cache Consistency Manager
    this.container.register(SERVICE_TOKENS.CACHE_CONSISTENCY_MANAGER, {
      useClass: CacheConsistencyService,
    });
  }

  public static getContainer(): Container {
    if (!this.container) {
      throw new Error('DIContainer not initialized. Call initialize() first.');
    }
    return this.container;
  }

  public static resolve<T>(token: string): T {
    return this.getContainer().resolve<T>(token);
  }

  public static dispose(): void {
    if (this.container) {
      this.container.dispose();
      this.container = undefined as any;
    }
  }
}

// Export singleton instance
export const container = DIContainer.getContainer();

// Initialize on import (for standalone usage)
if (typeof window === 'undefined') {
  DIContainer.initialize();
}
```

---

### 🟡 **PHASE 3: INTERFACE LAYER**

#### ⏳ **Step 3.1: Add Redis Cache Middleware with Consistency Handling**

- **Objective:** Implement Express middleware for Redis caching with consistency management
- **Implementation:** Create middleware for caching API responses with consistency features
- **Dependencies:** Redis service (Step 1.3), Cache consistency service (Step 2.1)
- **Files to Create:**
  - `src/interface/middlewares/redisCache.ts` - Redis cache middleware
- **Middleware Features:**
  - Response caching for GET requests
  - Cache key generation based on URL and parameters
  - Consistency checking capabilities
  - Background refresh for stale data
  - Graceful fallback when Redis is unavailable
- **Implementation Time:** 1 hour

**File:** `src/interface/middlewares/redisCache.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { IRedisService } from '../../domain/interfaces/redis/IRedisService';
import { CacheConsistencyService } from '../../domain/services/cache/CacheConsistencyService';
import { Logger } from '../../shared/logger';
import { REDIS_CONFIG, CACHE_LOG_MESSAGES, CACHE_KEY_PATTERNS } from '../../shared/constants';

export const redisCache = (
  ttl?: number,
  options?: {
    consistencyCheck?: boolean;
    stampedeProtection?: boolean;
    backgroundRefresh?: boolean;
  }
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const redisService = container.resolve<IRedisService>('IRedisService');
    const cacheConsistencyService = container.resolve(CacheConsistencyService);
    const logger = container.resolve<Logger>('Logger');
    const cacheKey = CACHE_KEY_PATTERNS.PRODUCTS_LIST(`${req.method}:${req.originalUrl}`);

    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Try to get cached response
      const cachedResponse = await redisService.get(cacheKey);
      if (cachedResponse) {
        logger.info(CACHE_LOG_MESSAGES.CACHE_HIT, { key: cacheKey });
        cacheConsistencyService.trackCacheHit();

        // Consistency check
        if (options?.consistencyCheck) {
          const isStale = await cacheConsistencyService.checkStaleData(cacheKey);
          if (isStale) {
            logger.warn(CACHE_LOG_MESSAGES.STALE_CACHE_DETECTED, { key: cacheKey });
            cacheConsistencyService.trackStaleRead();

            // Background refresh
            if (options.backgroundRefresh) {
              cacheConsistencyService.refreshAhead(
                cacheKey,
                async () => {
                  // Re-execute the request to get fresh data
                  const fakeRes = { statusCode: 200, jsonData: null } as any;
                  const fakeNext = () => {};
                  await redisCache(ttl, options)(req, fakeRes, fakeNext);
                  return fakeRes.jsonData;
                },
                ttl || REDIS_CONFIG.TTL.DEFAULT
              );
            }
          }
        }

        return res.status(200).json(JSON.parse(cachedResponse));
      }

      // Cache miss
      cacheConsistencyService.trackCacheMiss();
      logger.info(CACHE_LOG_MESSAGES.CACHE_MISS, { key: cacheKey, source: 'database' });

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = (body: any) => {
        if (res.statusCode === 200) {
          redisService.set(cacheKey, JSON.stringify(body), ttl || REDIS_CONFIG.TTL.DEFAULT);
        }
        return originalJson.call(res, body);
      };

      next();
    } catch (error) {
      logger.error('Redis cache middleware error', { error });
      next();
    }
  };
};
```

#### ✅ **Step 3.2: Add Rate Limiting Middleware**

- **Objective:** Implement Express middleware for API rate limiting using Redis
- **Implementation:** Create middleware for rate limiting with different strategies
- **Dependencies:** Rate limiting service (Step 2.3), DI Container (Step 2.5)
- **Files to Create:**
  - `src/interface/middlewares/rateLimiter.ts` - Rate limiting middleware
- **Middleware Features:**
  - IP-based rate limiting
  - User-based rate limiting
  - Endpoint-specific rate limits
  - Sliding window algorithm
  - Multiple rate limit configurations
- **Implementation Time:** 1 hour

**File:** `src/interface/middlewares/rateLimiter.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import {
  RateLimitingService,
  RateLimitConfig,
} from '../../infrastructure/redis/services/RateLimitingService';
import { REDIS_CONFIG } from '../../shared/constants';

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  onLimitReached?: (req: Request, res: Response, optionsUsed: RateLimitOptions) => void;
}

// Default rate limit configurations
export const rateLimiters = {
  default: createRateLimitMiddleware({
    windowMs: REDIS_CONFIG.RATE_LIMIT.WINDOW * 1000,
    maxRequests: REDIS_CONFIG.RATE_LIMIT.MAX_REQUESTS,
  }),
  api: createRateLimitMiddleware({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  }),
  auth: createRateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  }),
  search: createRateLimitMiddleware({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  }),
  upload: createRateLimitMiddleware({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
  }),
};

export function createRateLimitMiddleware(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const rateLimitingService = container.resolve(RateLimitingService);

    const config: RateLimitConfig = {
      windowMs: options.windowMs || REDIS_CONFIG.RATE_LIMIT.WINDOW * 1000,
      maxRequests: options.maxRequests || REDIS_CONFIG.RATE_LIMIT.MAX_REQUESTS,
      skipSuccessfulRequests: options.skipSuccessfulRequests,
      skipFailedRequests: options.skipFailedRequests,
    };

    const keyGenerator =
      options.keyGenerator || ((req) => req.ip || req.connection?.remoteAddress || 'unknown');
    const key = keyGenerator(req);

    try {
      const result = await rateLimitingService.checkRateLimit(key, config);

      // Set rate limit headers
      if (result.info) {
        res.setHeader('X-RateLimit-Limit', result.info.limit.toString());
        res.setHeader('X-RateLimit-Remaining', result.info.remaining.toString());
        res.setHeader('X-RateLimit-Reset', result.info.resetTime.toISOString());
      }

      if (!result.success) {
        // Rate limit exceeded
        res.setHeader(
          'Retry-After',
          result.resetTime
            ? Math.ceil((result.resetTime.getTime() - Date.now()) / 1000).toString()
            : '60'
        );

        if (options.onLimitReached) {
          options.onLimitReached(req, res, options);
        } else {
          res.status(429).json({
            success: false,
            error: 'Rate limit exceeded',
            message: `Too many requests. Please try again later.`,
            retryAfter: result.resetTime,
          });
        }
        return;
      }

      next();
    } catch (error) {
      // If rate limiting fails, allow the request (fail open)
      next();
    }
  };
}

// Smart rate limiter with different strategies based on endpoint
export const smartRateLimiter = createRateLimitMiddleware({
  windowMs: REDIS_CONFIG.RATE_LIMIT.WINDOW * 1000,
  maxRequests: REDIS_CONFIG.RATE_LIMIT.MAX_REQUESTS,
  keyGenerator: (req) => {
    // Use different strategies for different endpoints
    if (req.path.includes('/auth/')) {
      return `auth:${req.ip}`;
    }
    if (req.path.includes('/api/products')) {
      return `products:${req.ip}`;
    }
    if (req.path.includes('/search')) {
      return `search:${req.ip}`;
    }
    return req.ip || 'unknown';
  },
});
```

---

### 🟠 **PHASE 4: USE CASE INTEGRATION**

#### ✅ **Step 4.1: Integrate Redis with All Product Use Cases**

- **Objective:** Apply Redis caching to all existing product use cases with appropriate strategies
- **Implementation:** Enhance existing use cases with Redis caching
- **Dependencies:** Redis service (Step 1.3), Cache consistency service (Step 2.1), Cache decorators (Step 3.1)
- **Files to Modify:**
  - `src/usecases/product/CreateProductUseCase.ts` - Add write-through caching
  - `src/usecases/product/GetProductUseCase.ts` - Add cache-aside pattern
  - `src/usecases/product/ListProductsUseCase.ts` - Add query-based caching
  - `src/usecases/product/UpdateProductUseCase.ts` - Add cache invalidation
  - `src/usecases/product/DeleteProductUseCase.ts` - Add complete cache cleanup
  - `src/usecases/product/ToggleWishlistProductUseCase.ts` - Add smart invalidation
- **Caching Strategies:**
  - CreateProductUseCase: Write-through with list invalidation
  - GetProductUseCase: Cache-aside with consistency checking
  - ListProductsUseCase: Query-based caching with pattern matching
  - UpdateProductUseCase: Smart cache invalidation by category
  - DeleteProductUseCase: Complete cache cleanup including related lists
  - ToggleWishlistProductUseCase: Selective invalidation for wishlist changes
- **Implementation Time:** 3 hours
- **Note:** Current implementation uses manual caching in use cases. Future enhancement: Refactor to use `@Cacheable` and `@CacheEvict` decorators from Step 2.4 for cleaner, more maintainable code. For example, `GetProductUseCase.execute` could be decorated with `@Cacheable(1800, { consistencyCheck: true, backgroundRefresh: true })`.

### **Step 4.1.1: CreateProductUseCase with Write-Through Caching (Manual Implementation)**

**File:** `src/usecases/product/CreateProductUseCase.ts`

```typescript
import { injectable, inject } from 'tsyringe';
import { IProductRepository } from '../../domain/interfaces/product/IProductRepository';
import { IRedisService } from '../../domain/interfaces/redis/IRedisService';
import { CacheConsistencyService } from '../../domain/services/cache/CacheConsistencyService';
import { CreateProductDTO } from '../../interface/dtos/product/CreateProductDTO';
import { Product } from '../../domain/entities/product/Product';
import { REDIS_CONFIG, CACHE_KEY_PATTERNS, CACHE_LOG_MESSAGES } from '../../shared/constants';
import { Logger } from '../../shared/logger';

@injectable()
export class CreateProductUseCase {
  constructor(
    @inject('IProductRepository') private productRepository: IProductRepository,
    @inject('IRedisService') private redisService: IRedisService,
    private cacheConsistencyService: CacheConsistencyService,
    @inject('Logger') private logger: Logger
  ) {}

  public async execute(dto: CreateProductDTO): Promise<Product> {
    const product = Product.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stock: dto.stock,
      category: dto.category,
      images: dto.images,
      isActive: dto.isActive,
    });

    const createdProduct = await this.productRepository.create(product);

    // Write-Through: Immediately cache the created product
    await this.redisService.set(
      CACHE_KEY_PATTERNS.PRODUCT(createdProduct.id),
      JSON.stringify(createdProduct),
      REDIS_CONFIG.TTL.PRODUCT
    );

    await this.invalidateProductListCaches();
    this.logger.info(CACHE_LOG_MESSAGES.CACHE_SET, {
      key: CACHE_KEY_PATTERNS.PRODUCT(createdProduct.id),
      ttl: REDIS_CONFIG.TTL.PRODUCT,
    });

    return createdProduct;
  }

  private async invalidateProductListCaches(): Promise<void> {
    const listKeys = await this.redisService.keys('products:list:*');
    for (const key of listKeys) {
      await this.redisService.delete(key);
    }
    this.logger.info('Product list caches invalidated', { count: listKeys.length });
  }
}
```

### **Alternative: CreateProductUseCase with @CacheEvict Decorator (Future Enhancement)**

```typescript
import { injectable, inject } from 'tsyringe';
import { IProductRepository } from '../../domain/interfaces/product/IProductRepository';
import { CreateProductDTO } from '../../interface/dtos/product/CreateProductDTO';
import { Product } from '../../domain/entities/product/Product';
import { CacheEvict } from '../../shared/decorators/cache.decorator';

@injectable()
export class CreateProductUseCase {
  constructor(@inject('IProductRepository') private productRepository: IProductRepository) {}

  @CacheEvict('products:list:*')
  public async execute(dto: CreateProductDTO): Promise<Product> {
    const product = Product.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stock: dto.stock,
      category: dto.category,
      images: dto.images,
      isActive: dto.isActive,
    });

    return await this.productRepository.create(product);
  }
}
```

### **Step 4.1.2: GetProductUseCase with @Cacheable Decorator**

**File:** `src/usecases/product/GetProductUseCase.ts`

```typescript
import { injectable, inject } from 'tsyringe';
import { IProductRepository } from '../../domain/interfaces/product/IProductRepository';
import { Product } from '../../domain/entities/product/Product';
import { Cacheable } from '../../shared/decorators/cache.decorator';

@injectable()
export class GetProductUseCase {
  constructor(@inject('IProductRepository') private productRepository: IProductRepository) {}

  @Cacheable(1800, { consistencyCheck: true, backgroundRefresh: true })
  public async execute(id: string): Promise<Product | null> {
    return await this.productRepository.findById(id);
  }
}
```

### **Note:** The @Cacheable decorator automatically handles:

- Cache key generation: `GetProductUseCase:execute:["productId"]`
- Cache lookup and storage with 1800s TTL
- Consistency checking for stale data
- Background refresh when data is stale
- Cache hit/miss tracking
- Stampede protection (if enabled)
- Logging of cache operations

### **Alternative: GetProductUseCase with Manual Caching (Legacy Implementation)**

```typescript
import { injectable, inject } from 'tsyringe';
import { IProductRepository } from '../../domain/interfaces/product/IProductRepository';
import { IRedisService } from '../../domain/interfaces/redis/IRedisService';
import { CacheConsistencyService } from '../../domain/services/cache/CacheConsistencyService';
import { Product } from '../../domain/entities/product/Product';
import { REDIS_CONFIG, CACHE_KEY_PATTERNS, CACHE_LOG_MESSAGES } from '../../shared/constants';
import { Logger } from '../../shared/logger';

@injectable()
export class GetProductUseCase {
  constructor(
    @inject('IProductRepository') private productRepository: IProductRepository,
    @inject('IRedisService') private redisService: IRedisService,
    private cacheConsistencyService: CacheConsistencyService,
    @inject('Logger') private logger: Logger
  ) {}

  public async execute(id: string): Promise<Product | null> {
    const cacheKey = CACHE_KEY_PATTERNS.PRODUCT(id);
    const cachedProduct = await this.redisService.get(cacheKey);

    if (cachedProduct) {
      this.logger.info(CACHE_LOG_MESSAGES.CACHE_HIT, { key: cacheKey });
      this.cacheConsistencyService.trackCacheHit();

      const isStale = await this.cacheConsistencyService.checkStaleData(cacheKey);
      if (isStale) {
        this.logger.warn(CACHE_LOG_MESSAGES.STALE_CACHE_DETECTED, { key: cacheKey });
        this.cacheConsistencyService.trackStaleRead();

        // Background refresh for stale data
        this.cacheConsistencyService.refreshAhead(
          cacheKey,
          () => this.productRepository.findById(id),
          REDIS_CONFIG.TTL.PRODUCT
        );
      }

      return JSON.parse(cachedProduct);
    }

    this.logger.info(CACHE_LOG_MESSAGES.CACHE_MISS, { key: cacheKey, source: 'database' });
    this.cacheConsistencyService.trackCacheMiss();

    const product = await this.productRepository.findById(id);

    if (product) {
      await this.redisService.set(cacheKey, JSON.stringify(product), REDIS_CONFIG.TTL.PRODUCT);
    }

    return product;
  }
}
```

### **Step 4.1.3: ListProductsUseCase with Advanced Caching**

**File:** `src/usecases/product/ListProductsUseCase.ts`

```typescript
import { injectable, inject } from 'tsyringe';
import { IProductRepository } from '../../domain/interfaces/product/IProductRepository';
import { IRedisService } from '../../domain/interfaces/redis/IRedisService';
import { CacheConsistencyService } from '../../domain/services/cache/CacheConsistencyService';
import { Product } from '../../domain/entities/product/Product';
import { REDIS_CONFIG, CACHE_KEY_PATTERNS, CACHE_LOG_MESSAGES } from '../../shared/constants';
import { Logger } from '../../shared/logger';

interface ListProductsQuery {
  page?: string;
  limit?: string;
  category?: string;
  search?: string;
  isActive?: string;
}

@injectable()
export class ListProductsUseCase {
  constructor(
    @inject('IProductRepository') private productRepository: IProductRepository,
    @inject('IRedisService') private redisService: IRedisService,
    private cacheConsistencyService: CacheConsistencyService,
    @inject('Logger') private logger: Logger
  ) {}

  public async execute(query: ListProductsQuery): Promise<{ products: Product[]; total: number }> {
    const cacheKey = this.buildListCacheKey(query);
    const cachedResult = await this.redisService.get(cacheKey);

    if (cachedResult) {
      this.logger.info(CACHE_LOG_MESSAGES.CACHE_HIT, { key: cacheKey });
      this.cacheConsistencyService.trackCacheHit();
      return JSON.parse(cachedResult);
    }

    this.logger.info(CACHE_LOG_MESSAGES.CACHE_MISS, { key: cacheKey, source: 'database' });
    this.cacheConsistencyService.trackCacheMiss();

    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.category) filter.category = query.category;
    if (query.search) filter.search = query.search;
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

    const [products, total] = await Promise.all([
      this.productRepository.findAll(filter, skip, limit),
      this.productRepository.count(filter),
    ]);

    const result = { products, total };
    await this.redisService.set(cacheKey, JSON.stringify(result), REDIS_CONFIG.TTL.PRODUCT);

    return result;
  }

  private buildListCacheKey(query: ListProductsQuery): string {
    const sortedQuery = Object.keys(query)
      .sort()
      .map((key) => `${key}:${query[key as keyof ListProductsQuery]}`)
      .join('|');
    return CACHE_KEY_PATTERNS.PRODUCTS_LIST(sortedQuery);
  }
}
```

### **Step 4.1.4: UpdateProductUseCase with Cache Invalidation**

**File:** `src/usecases/product/UpdateProductUseCase.ts`

```typescript
import { injectable, inject } from 'tsyringe';
import { IProductRepository } from '../../domain/interfaces/product/IProductRepository';
import { IRedisService } from '../../domain/interfaces/redis/IRedisService';
import { Product } from '../../domain/entities/product/Product';
import { UpdateProductDTO } from '../../interface/dtos/product/UpdateProductDTO';
import { CACHE_KEY_PATTERNS } from '../../shared/constants';
import { Logger } from '../../shared/logger';

@injectable()
export class UpdateProductUseCase {
  constructor(
    @inject('IProductRepository') private productRepository: IProductRepository,
    @inject('IRedisService') private redisService: IRedisService,
    @inject('Logger') private logger: Logger
  ) {}

  public async execute(id: string, dto: UpdateProductDTO): Promise<Product | null> {
    const product = await this.productRepository.findById(id);
    if (!product) return null;

    product.update(dto);
    const updatedProduct = await this.productRepository.update(product);

    // Invalidate specific product cache
    const cacheKey = CACHE_KEY_PATTERNS.PRODUCT(id);
    await this.redisService.delete(cacheKey);

    // Invalidate product lists
    await this.invalidateListCaches();

    this.logger.info('Cache invalidated for updated product', { productId: id });

    return updatedProduct;
  }

  private async invalidateListCaches(): Promise<void> {
    const listKeys = await this.redisService.keys('products:list:*');
    for (const key of listKeys) {
      await this.redisService.delete(key);
    }
  }
}
```

### **Step 4.1.5: DeleteProductUseCase with Cache Cleanup**

**File:** `src/usecases/product/DeleteProductUseCase.ts`

```typescript
import { injectable, inject } from 'tsyringe';
import { IProductRepository } from '../../domain/interfaces/product/IProductRepository';
import { IRedisService } from '../../domain/interfaces/redis/IRedisService';
import { CACHE_KEY_PATTERNS } from '../../shared/constants';
import { Logger } from '../../shared/logger';

@injectable()
export class DeleteProductUseCase {
  constructor(
    @inject('IProductRepository') private productRepository: IProductRepository,
    @inject('IRedisService') private redisService: IRedisService,
    @inject('Logger') private logger: Logger
  ) {}

  public async execute(id: string): Promise<boolean> {
    const deleted = await this.productRepository.delete(id);

    if (deleted) {
      // Clean up all related caches
      const pipeline = this.redisService.getClient().pipeline();

      // 1. Delete product cache
      pipeline.del(CACHE_KEY_PATTERNS.PRODUCT(id));

      // 2. Invalidate all list caches
      const listKeys = await this.redisService.keys('products:list:*');
      listKeys.forEach((key) => pipeline.del(key));

      await pipeline.exec();

      this.logger.info('Cache cleaned up for deleted product', { productId: id });
    }

    return deleted;
  }
}
```

### **Step 4.1.6: ToggleWishlistProductUseCase with Smart Invalidation**

**File:** `src/usecases/product/ToggleWishlistProductUseCase.ts`

```typescript
import { injectable, inject } from 'tsyringe';
import { IProductRepository } from '../../domain/interfaces/product/IProductRepository';
import { IRedisService } from '../../domain/interfaces/redis/IRedisService';
import { CACHE_KEY_PATTERNS } from '../../shared/constants';
import { Logger } from '../../shared/logger';

@injectable()
export class ToggleWishlistProductUseCase {
  constructor(
    @inject('IProductRepository') private productRepository: IProductRepository,
    @inject('IRedisService') private redisService: IRedisService,
    @inject('Logger') private logger: Logger
  ) {}

  public async execute(productId: string, userId: string): Promise<boolean> {
    const result = await this.productRepository.toggleWishlist(productId, userId);

    // Invalidate user's wishlist cache
    const wishlistKey = CACHE_KEY_PATTERNS.WISHLIST(userId);
    await this.redisService.delete(wishlistKey);

    this.logger.info('Wishlist cache invalidated', { userId, productId });

    return result;
  }
}
```

---

### 🟣 **PHASE 5: DOCUMENTATION AND TESTING**

#### ✅ **Step 5.1: Add Redis Documentation to Swagger**

- **Objective:** Document Redis-related API endpoints and features
- **Implementation:** Update Swagger configuration with Redis documentation
- **Dependencies:** Existing Swagger configuration, Redis services (Steps 1.3, 2.1, 4.1)
- **Files to Modify:**
  - `src/config/swagger.ts` - Add Redis endpoint documentation
- **Documentation Updates:**
  - Add rate limiting response headers
  - Document cache-related endpoints
  - Add Redis configuration section
  - Document cache consistency status endpoints
- **Implementation Time:** 30 minutes

#### ✅ **Step 5.2: Create Redis Integration Tests**

- **Objective:** Add comprehensive tests for Redis integration
- **Implementation:** Create unit and integration tests for Redis services
- **Dependencies:** Redis service (Step 1.3), Cache consistency service (Step 2.1), Session service (Step 2.2), Rate limiting service (Step 2.3), DI Container (Step 2.5), test utilities
- **Files to Create:**
  - `src/__tests__/unit/redisService.test.ts` - Redis service unit tests
  - `src/__tests__/unit/cacheConsistencyService.test.ts` - Consistency service tests
  - `src/__tests__/unit/sessionService.test.ts` - Session service tests
  - `src/__tests__/unit/rateLimiter.test.ts` - Rate limiting tests
  - `src/__tests__/integration/redis.test.ts` - Redis integration tests
- **Test Coverage:**
  - Unit tests for all Redis service methods
  - Integration tests for middleware
  - Cache consistency testing
  - Rate limiting functionality testing
  - Error handling and graceful degradation
- **Implementation Time:** 2 hours

#### ✅ **Step 5.3: Create Implementation Verification Scripts**

- **Objective:** Create scripts to verify Redis implementation
- **Implementation:** Create shell scripts and test endpoints
- **Dependencies:** Platform scripts, Redis implementation (Step 4.1)
- **Files to Create:**
  - `scripts/verify-redis.sh` - Implementation verification script
  - `scripts/test-redis-endpoints.sh` - Endpoint testing script
- **Verification Steps:**
  - Redis connection testing
  - Cache operation verification
  - Rate limiting functionality
  - Session management testing
  - Performance benchmarking
- **Implementation Time:** 1 hour

## 🔗 _Redis Integration Benefits_

### **Performance Optimization**

- **Caching:** Significant reduction in database load for frequently accessed data
- **Response Time:** Faster API responses through in-memory caching
- **Scalability:** Improved system scalability through reduced backend pressure

### **Session Management**

- **User Sessions:** Reliable session storage for authenticated users
- **Scalability:** Distributed session management for load-balanced environments
- **Security:** Secure session handling with proper expiration

### **API Protection**

- **Rate Limiting:** Protection against API abuse and DDoS attacks
- **Fair Usage:** Ensures fair API access for all users
- **Monitoring:** Visibility into API usage patterns

---

## 📋 **Implementation Status Summary**

### **✅ Completed Components**

- Redis configuration and constants
- IRedisService interface and RedisService implementation
- Cache consistency service with monitoring
- Session management service
- Rate limiting service with sliding window algorithm
- Cache decorators (`@Cacheable`, `@CacheEvict`) - **defined but not applied**
- Redis cache middleware
- Rate limiting middleware
- Manual caching implementation in all product use cases
- DI container registration
- Comprehensive error handling and logging

### **🔄 Future Enhancements**

- **Decorator Refactoring:** Replace manual caching in use cases with `@Cacheable` and `@CacheEvict` decorators for cleaner code
- **Example:** `GetProductUseCase.execute()` already shows the decorator pattern as primary implementation
- **Benefits:** Reduced boilerplate, centralized cache logic, easier maintenance

### **🎯 Key Achievement**

The Redis integration provides a solid foundation with both manual and decorator-based caching approaches. The manual implementation is fully functional, while the decorator pattern offers a cleaner, more maintainable alternative for future refactoring.

**Current State:** Production-ready with manual caching
**Future State:** Enhanced with decorator-based caching for improved code quality
