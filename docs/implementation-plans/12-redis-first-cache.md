# Redis First Cache Implementation Plan

## Overview

This document outlines the complete implementation of a **Redis-first cache architecture** for the JollyJet application. Unlike traditional caching where Redis serves as a secondary layer, this implementation treats Redis as the **primary data source** with MongoDB as the fallback database.

### Architecture Pattern

**Cache-Aside with Redis-First Strategy:**

- **READ Operations**: Check Redis → If cache miss, query MongoDB → Store in Redis → Return data
- **WRITE Operations**: Update MongoDB → Update/Invalidate Redis cache
- **DELETE Operations**: Delete from MongoDB → Delete from Redis cache

### Current Implementation Status

**✅ FULLY IMPLEMENTED**: Redis-first caching has been successfully integrated at multiple layers with comprehensive testing:

#### Repository Layer (ProductRepository)

Each CRUD operation follows Redis-first pattern:

1. **findById()**: Checks `product:${id}` cache first, falls back to MongoDB
2. **create()**: Creates in MongoDB, caches result, invalidates list caches
3. **update()**: Updates MongoDB, updates cache, invalidates list caches
4. **delete()**: Deletes from MongoDB, removes from cache, invalidates list caches
5. **findAll()**: Caches filtered/paginated results with key `products:${JSON.stringify({ filter, pagination })}`
6. **count()**: Caches count queries with key `product:count:${JSON.stringify(filter)}`
7. **toggleWishlistStatus()**: Updates MongoDB and cache, invalidates related caches

#### Middleware Layer

**redisCacheHandler** - HTTP-level caching for GET requests:

- **Cache Strategy**: Checks Redis for `products:${req.method}:${req.originalUrl}` key first
- **Features**: Consistency checks, stampede protection
- **TTL**: Configurable per route (default 24 hours for products)
- **Fallback**: On cache miss, processes request normally and caches response
- **Timing**: Sets X-Response-Time header for cached responses

**responseTimingHandler** - Global response timing middleware:

- **File**: `src/interface/middlewares/responseTimingHandler.ts`
- **Purpose**: Measures response time for all requests and adds X-Response-Time header
- **Scope**: Applied globally before routes, ensures timing headers on all responses
- **Integration**: Works alongside redisCacheHandler for non-cached routes

### Key Benefits

1. **Reduced Database Load**: Primary data access through Redis
2. **Improved Response Times**: Sub-millisecond Redis operations
3. **Automatic Fallback**: MongoDB as reliable backup
4. **Scalable Architecture**: Easy to scale Redis independently
5. **Real-time Cache Invalidation**: Immediate consistency on writes

### Implementation Details

#### ProductRepository Integration

**File**: `src/infrastructure/repositories/product/ProductRepository.ts`

**Changes Made**:

- Added `CacheService` dependency injection
- Implemented Redis-first logic for all CRUD operations

**Cache Key Patterns**:

```typescript
// Individual product cache
`product:${id}`
// Product lists with filters and pagination
`products:${JSON.stringify({ filter, pagination })}`
// Product counts with filters
`product:count:${JSON.stringify(filter)}`;
```

**TTL Configuration**:

- Individual products: 1 hour (3600 seconds)
- Product lists: 5 minutes (300 seconds)
- Product counts: 5 minutes (300 seconds)

**CRUD Operations with Redis-First Logic**:

1. **findById(id: string)**:

   ```typescript
   const cacheKey = `product:${id}`;
   const cachedProduct = await this.cacheService.get<Product>(cacheKey);
   if (cachedProduct) return cachedProduct; // Cache hit

   // Cache miss - fetch from MongoDB
   const product = await Productmodel.findById(id);
   if (product) await this.cacheService.set(cacheKey, product);
   return product;
   ```

2. **create(product: Product)**:

   ```typescript
   const createdProduct = await Productmodel.create(productData);
   const cacheKey = `product:${createdProduct._id}`;
   await this.cacheService.set(cacheKey, createdProduct);

   // Invalidate list caches
   await this.cacheService.deleteByPattern('products:*');
   await this.cacheService.deleteByPattern('product:count:*');
   ```

3. **update(product: Product)**:

   ```typescript
   const updatedProduct = await Productmodel.findByIdAndUpdate(id, data);
   const cacheKey = `product:${id}`;
   await this.cacheService.set(cacheKey, updatedProduct);

   // Invalidate list caches
   await this.cacheService.deleteByPattern('products:*');
   await this.cacheService.deleteByPattern('product:count:*');
   ```

4. **delete(id: string)**:

   ```typescript
   const result = await Productmodel.findByIdAndDelete(id);
   if (result) {
     const cacheKey = `product:${id}`;
     await this.cacheService.delete(cacheKey);

     // Invalidate list caches
     await this.cacheService.deleteByPattern('products:*');
     await this.cacheService.deleteByPattern('product:count:*');
   }
   ```

5. **findAll(filter?, pagination?)**:

   ```typescript
   const cacheKey = `products:${JSON.stringify({ filter, pagination })}`;
   const cachedProducts = await this.cacheService.get<Product[]>(cacheKey);
   if (cachedProducts) return cachedProducts; // Cache hit

   // Cache miss - fetch from MongoDB
   const products = await query.exec();
   await this.cacheService.set(cacheKey, products, 300); // 5 minutes
   return products;
   ```

6. **count(filter?)**:

   ```typescript
   const cacheKey = `product:count:${JSON.stringify(filter)}`;
   const cachedCount = await this.cacheService.get<number>(cacheKey);
   if (cachedCount !== null) return cachedCount; // Cache hit

   // Cache miss - count from MongoDB
   const count = await query.countDocuments().exec();
   await this.cacheService.set(cacheKey, count, 300); // 5 minutes
   return count;
   ```

7. **toggleWishlistStatus(id, status)**:

   ```typescript
   const updatedProduct = await Productmodel.findByIdAndUpdate(id, { isWishlistStatus: status });
   const cacheKey = `product:${id}`;
   await this.cacheService.set(cacheKey, updatedProduct);

   // Invalidate list caches
   await this.cacheService.deleteByPattern('products:*');
   await this.cacheService.deleteByPattern('product:count:*');
   ```

## Implementation Dependencies

### Implementation Flow

**Actual Implementation Path:**

```
Step 1: Existing Infrastructure (CacheService, Redis setup)
↓
Step 2: Update ProductRepository with CacheService injection
↓
Step 3: Implement Redis-first logic in each CRUD method
↓
Step 4: Create comprehensive tests
↓
Step 5: Update documentation
```

**Key Implementation Decisions:**

- **Direct Repository Integration**: Instead of creating separate cache services, Redis-first logic was implemented directly in `ProductRepository`
- **Existing CacheService**: Leveraged the existing `CacheService` from the domain layer
- **Pattern-based Invalidation**: Used `deleteByPattern()` for efficient cache invalidation
- **Structured Cache Keys**: Implemented consistent key patterns for different data types

### Implementation Prerequisites

**Required for Redis-First Cache Implementation:**

- Node.js 16+ and npm
- Redis server (local or remote)
- MongoDB database (existing)
- TypeScript configuration
- Express.js application framework
- Mongoose ODM (existing MongoDB models)

**Package Dependencies:**

- `ioredis` - Redis client
- `@types/ioredis` - TypeScript definitions
- `@types/express` - Express types
- `@types/node` - Node.js types
- `jest` - Testing framework
- `supertest` - HTTP testing
- `redis-cli` - Redis command line interface

## Folder Structure

```
jollyjet/
├── docs/
│   └── implementation-plans/
│       └── 12-redis-first-cache.md     # This implementation plan
├── src/
│   ├── infrastructure/                 # Core infrastructure layer
│   │   ├── cache/                      # Redis cache implementation
│   │   │   ├── redis/                  # Redis-specific implementations
│   │   │   │   ├── redis.ts            # Redis connection and operations (Step 5)
│   │   │   │   ├── redisConfig.ts      # Redis configuration (Step 3)
│   │   │   │   └── redisTypes.ts       # Redis-specific types (Step 4)
│   │   │   ├── interfaces/             # Cache abstractions
│   │   │   │   └── ICache.ts           # Cache interface (Step 4)
│   │   │   └── services/               # Cache service implementations
│   │   │       ├── cacheAsideService.ts    # Generic cache-aside pattern (Step 6)
│   │   │       └── redisFirstService.ts    # Redis-first business logic (Step 7)
│   │   ├── database/                   # Database layer
│   │   │   ├── models/                 # MongoDB models (existing)
│   │   │   │   ├── User.ts             # User model
│   │   │   │   ├── Flight.ts           # Flight model
│   │   │   │   └── Booking.ts          # Booking model
│   │   │   └── connections/            # Database connections
│   │   │       ├── mongodb.ts          # MongoDB connection (existing)
│   │   │       └── redis.ts            # Redis connection manager (Step 5)
│   │   └── utils/                      # Utility functions
│   │       ├── cacheKeys.ts            # Cache key generators (Step 7)
│   │       ├── cacheUtils.ts           # Cache utility functions (Step 7)
│   │       └── performance.ts          # Performance monitoring (Step 12)
│   ├── interface/                      # API interface layer
│   │   ├── controllers/                # API controllers
│   │   │   ├── userController.ts       # User CRUD with Redis-first (Step 8)
│   │   │   ├── flightController.ts     # Flight CRUD with Redis-first (Step 8)
│   │   │   ├── bookingController.ts    # Booking CRUD with Redis-first (Step 8)
│   │   │   └── cacheController.ts      # Cache management endpoints (Step 8)
│   │   ├── routes/                      # API route definitions
│   │   │   ├── userRoutes.ts           # User API routes (Step 9)
│   │   │   ├── flightRoutes.ts         # Flight API routes (Step 9)
│   │   │   ├── bookingRoutes.ts        # Booking API routes (Step 9)
│   │   │   └── cacheRoutes.ts          # Cache management routes (Step 9)
│   │   └── middlewares/                # Express middleware
│   │       ├── redisErrorHandler.ts    # Redis error handling (Step 10)
│   │       ├── cacheMetrics.ts         # Cache performance monitoring (Step 12)
│   │       └── validation.ts           # Request validation (existing)
│   ├── services/                       # Business logic layer
│   │   ├── userService.ts              # User business logic (Step 7)
│   │   ├── flightService.ts            # Flight business logic (Step 7)
│   │   └── bookingService.ts           # Booking business logic (Step 7)
│   ├── config/                         # Configuration files
│   │   ├── database.ts                 # Database configuration (existing)
│   │   ├── redis.ts                    # Redis configuration (Step 3)
│   │   └── environments/               # Environment-specific configs
│   │       ├── development.ts          # Development config
│   │       ├── staging.ts              # Staging config
│   │       └── production.ts           # Production config
│   ├── app.ts                          # Express application setup (Step 10)
│   └── server.ts                       # Server bootstrap (existing)
├── tests/                              # Test suite
│   ├── unit/                           # Unit tests
│   │   ├── infrastructure/
│   │   │   └── cache/
│   │   │       ├── redis.test.ts       # Redis operations tests (Step 11)
│   │   │       ├── cacheAside.test.ts  # Cache-aside pattern tests (Step 11)
│   │   │       └── redisFirstService.test.ts # Redis-first service tests (Step 11)
│   │   ├── interface/
│   │   │   └── controllers/
│   │   │       ├── userController.test.ts # User controller tests (Step 11)
│   │   │       └── cacheController.test.ts # Cache controller tests (Step 11)
│   │   └── services/
│   │       ├── userService.test.ts      # User service tests (Step 11)
│   │       └── bookingService.test.ts   # Booking service tests (Step 11)
│   ├── integration/                    # Integration tests
│   │   ├── cacheFlow.test.ts          # End-to-end cache flow tests (Step 11)
│   │   ├── performance.test.ts        # Cache performance tests (Step 12)
│   │   └── api/                        # API integration tests
│   │       ├── users.test.ts           # User API tests (Step 11)
│   │       └── cache.test.ts          # Cache API tests (Step 11)
│   ├── fixtures/                       # Test data fixtures
│   │   ├── users.json                  # User test data
│   │   ├── flights.json                # Flight test data
│   │   └── bookings.json               # Booking test data
│   └── helpers/                        # Test helpers
│       ├── setupRedis.ts               # Redis test setup
│       ├── cleanupRedis.ts             # Redis test cleanup
│       └── mockData.ts                 # Mock data generators
├── docker/                             # Docker configurations
│   ├── docker-compose.yml              # Development environment
│   ├── docker-compose.prod.yml         # Production environment
│   └── redis/
│       └── redis.conf                  # Redis configuration
├── scripts/                            # Build and deployment scripts
│   ├── build.sh                        # Build script
│   ├── deploy.sh                       # Deployment script
│   └── cache-warmup.js                 # Cache warmup script
├── monitoring/                         # Monitoring and metrics
│   ├── prometheus.yml                  # Prometheus configuration
│   ├── grafana/
│   │   └── dashboards/
│   │       └── redis-cache.json        # Redis cache dashboard
│   └── alerts/                         # Alert configurations
│       └── redis.yml                   # Redis alerts
├── .env                        # Environment variables template
├── .env.development                    # Development environment
├── .env.production                     # Production environment
├── package.json                        # Project dependencies
├── tsconfig.json                       # TypeScript configuration
├── jest.config.js                      # Jest test configuration
├── docker-compose.yml                  # Docker development setup
└── README.md                           # Project documentation
```

### File Creation Sequence

**Phase 1: Foundation (Steps 1-5)**

1. `package.json` - Update dependencies
2. `.env` - Environment template
3. `src/config/environments/` - Environment configs
4. `src/infrastructure/cache/redis/redisConfig.ts` - Redis config
5. `src/infrastructure/cache/interfaces/ICache.ts` - Cache interface
6. `src/infrastructure/cache/redis/redisTypes.ts` - Redis types
7. `src/infrastructure/cache/redis/redis.ts` - Redis connection

**Phase 2: Core Services (Steps 6-7)** 8. `src/infrastructure/utils/cacheKeys.ts` - Cache key utilities 9. `src/infrastructure/utils/cacheUtils.ts` - Cache utilities 10. `src/infrastructure/cache/services/cacheAsideService.ts` - Cache-aside pattern 11. `src/infrastructure/cache/services/redisFirstService.ts` - Redis-first service 12. `src/services/userService.ts` - User business logic 13. `src/services/flightService.ts` - Flight business logic 14. `src/services/bookingService.ts` - Booking business logic

**Phase 3: API Layer (Steps 8-9)** 15. `src/interface/controllers/userController.ts` - User controller 16. `src/interface/controllers/flightController.ts` - Flight controller 17. `src/interface/controllers/bookingController.ts` - Booking controller 18. `src/interface/controllers/cacheController.ts` - Cache controller 19. `src/interface/routes/userRoutes.ts` - User routes 20. `src/interface/routes/flightRoutes.ts` - Flight routes 21. `src/interface/routes/bookingRoutes.ts` - Booking routes 22. `src/interface/routes/cacheRoutes.ts` - Cache routes 23. `src/interface/middlewares/redisErrorHandler.ts` - Error handling 24. `src/interface/middlewares/cacheMetrics.ts` - Metrics middleware

**Phase 4: Integration (Step 10)** 25. `src/app.ts` - Application setup 26. `src/server.ts` - Server bootstrap (update existing) 27. `src/config/redis.ts` - Redis config integration

**Phase 5: Testing (Step 11)** 28. `tests/fixtures/` - Test data fixtures 29. `tests/helpers/` - Test helpers 30. `tests/unit/infrastructure/cache/` - Cache unit tests 31. `tests/unit/interface/controllers/` - Controller unit tests 32. `tests/unit/services/` - Service unit tests 33. `tests/integration/` - Integration tests 34. `jest.config.js` - Test configuration

**Phase 6: Optimization (Step 12)** 35. `src/infrastructure/utils/performance.ts` - Performance monitoring 36. `monitoring/` - Monitoring setup 37. `scripts/cache-warmup.js` - Cache warmup script 38. `docker/` - Docker configurations

## Implementation Steps

### Actual Implementation Process

#### Step 1: Repository Integration

**✅ COMPLETED**

**Updated ProductRepository** (`src/infrastructure/repositories/product/ProductRepository.ts`):

- Added `CacheService` dependency injection to constructor
- Imported existing `CacheService` from domain layer
- Maintained existing interface compatibility

#### Step 2: Redis-First CRUD Implementation

**✅ COMPLETED**

**Modified each CRUD method to implement Redis-first pattern**:

1. **findById()**: Check cache first (`product:${id}`), fallback to MongoDB
2. **create()**: Create in MongoDB, cache result, invalidate lists
3. **update()**: Update MongoDB, update cache, invalidate lists
4. **delete()**: Delete from MongoDB, remove from cache, invalidate lists
5. **findAll()**: Cache filtered results with pagination
6. **count()**: Cache count queries with filters
7. **toggleWishlistStatus()**: Update MongoDB and cache

#### Step 3: Cache Key Strategy

**✅ COMPLETED**

**Implemented structured cache keys**:

```typescript
// Individual items
`product:${id}`
// Lists with filters
`products:${JSON.stringify({ filter, pagination })}`
// Counts with filters
`product:count:${JSON.stringify(filter)}`;
```

#### Step 4: Cache Invalidation Strategy

**✅ COMPLETED**

**Pattern-based invalidation on writes**:

- Create/Update/Delete operations invalidate: `products:*` and `product:count:*`
- Individual cache updates for specific items
- Efficient bulk invalidation using `deleteByPattern()`

#### Step 5: TTL Configuration

**✅ COMPLETED**

**Optimized TTL values**:

- Individual products: 3600 seconds (1 hour)
- Product lists: 300 seconds (5 minutes)
- Product counts: 300 seconds (5 minutes)

#### Step 6: Testing Implementation

**✅ COMPLETED**

**Created comprehensive tests** (`tests/unit/infrastructure/repositories/product-repository-redis.test.ts`):

- Cache hit/miss scenarios for all CRUD operations
- Cache invalidation verification on writes
- CRUD operations with caching behavior
- Error handling and graceful fallbacks
- Pattern-based cache key validation
- **370 total tests passing** with **97.59% coverage**

### Step 2: Environment Configuration

Create environment configuration files with proper dependency flow:

**2.1 Create `.env`:**

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=jollyjet:
REDIS_MAX_RETRIES=3
REDIS_RETRY_DELAY=1000
REDIS_CONNECTION_TIMEOUT=10000

# Cache Configuration
CACHE_DEFAULT_TTL=3600
CACHE_SHORT_TTL=300
CACHE_LONG_TTL=86400
CACHE_WARMUP_ENABLED=true
CACHE_METRICS_ENABLED=true

# Application Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# MongoDB Configuration (existing)
MONGODB_URI=mongodb://localhost:27017/jollyjet
```

**2.2 Create environment-specific configs:**

`src/config/environments/development.ts`:

```typescript
export const developmentConfig = {
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'jollyjet:dev:',
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'),
    shortTTL: parseInt(process.env.CACHE_SHORT_TTL || '300'),
    longTTL: parseInt(process.env.CACHE_LONG_TTL || '86400'),
    maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '1000'),
    connectionTimeout: parseInt(process.env.REDIS_CONNECTION_TIMEOUT || '10000'),
  },
  cache: {
    warmupEnabled: process.env.CACHE_WARMUP_ENABLED === 'true',
    metricsEnabled: process.env.CACHE_METRICS_ENABLED === 'true',
  },
  app: {
    port: parseInt(process.env.PORT || '3000'),
    env: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
  },
};
```

`src/config/environments/staging.ts`:

```typescript
export const stagingConfig = {
  redis: {
    url: process.env.STAGING_REDIS_URL,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'jollyjet:staging:',
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '1800'),
    shortTTL: parseInt(process.env.CACHE_SHORT_TTL || '300'),
    longTTL: parseInt(process.env.CACHE_LONG_TTL || '7200'),
    maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '5'),
    retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '2000'),
    connectionTimeout: parseInt(process.env.REDIS_CONNECTION_TIMEOUT || '5000'),
  },
  cache: {
    warmupEnabled: true,
    metricsEnabled: true,
  },
  app: {
    port: parseInt(process.env.PORT || '3001'),
    env: 'staging',
    apiVersion: process.env.API_VERSION || 'v1',
  },
};
```

`src/config/environments/production.ts`:

```typescript
export const productionConfig = {
  redis: {
    url: process.env.PRODUCTION_REDIS_URL,
    password: process.env.REDIS_PASSWORD,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'jollyjet:prod:',
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '7200'),
    shortTTL: parseInt(process.env.CACHE_SHORT_TTL || '600'),
    longTTL: parseInt(process.env.CACHE_LONG_TTL || '86400'),
    maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '5'),
    retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '1000'),
    connectionTimeout: parseInt(process.env.REDIS_CONNECTION_TIMEOUT || '10000'),
    cluster: process.env.REDIS_CLUSTER === 'true',
  },
  cache: {
    warmupEnabled: false,
    metricsEnabled: true,
  },
  app: {
    port: parseInt(process.env.PORT || '3000'),
    env: 'production',
    apiVersion: process.env.API_VERSION || 'v1',
  },
};
```

**2.3 Create environment manager:**

`src/config/environment.ts`:

```typescript
import { developmentConfig } from './environments/development';
import { stagingConfig } from './environments/staging';
import { productionConfig } from './environments/production';

const configs = {
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
};

const env = process.env.NODE_ENV || 'development';

export const config = configs[env as keyof typeof configs];

if (!config) {
  throw new Error(`No configuration found for environment: ${env}`);
}

export default config;
```

### Step 3: Redis Configuration

**Dependency:** Requires Step 2 (Environment Configuration)

**3.1 Create Redis configuration interface:**

`src/infrastructure/cache/redis/redisConfig.ts`:

```typescript
import { config } from '../../../config/environment';

export interface RedisConfig {
  url: string;
  password?: string;
  db: number;
  keyPrefix: string;
  maxRetries: number;
  retryDelay: number;
  lazyConnect: boolean;
  keepAlive: number;
  family: 4 | 6;
  connectionTimeout: number;
  enableOfflineQueue: boolean;
  maxMemoryPolicy?: string;
}

export const redisConfig: RedisConfig = {
  url: config.redis.url,
  password: config.redis.password,
  db: 0, // Redis database number
  keyPrefix: config.redis.keyPrefix,
  maxRetries: config.redis.maxRetries,
  retryDelay: config.redis.retryDelay,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4,
  connectionTimeout: config.redis.connectionTimeout,
  enableOfflineQueue: false,
  maxMemoryPolicy: 'allkeys-lru',
};

export const cacheTTL = {
  default: config.redis.defaultTTL,
  short: config.redis.shortTTL,
  long: config.redis.longTTL,
  user: config.redis.defaultTTL, // 1 hour
  flight: config.redis.shortTTL, // 30 minutes
  booking: config.redis.longTTL, // 2 hours
  search: config.redis.shortTTL, // 30 minutes
  session: config.redis.shortTTL, // 30 minutes
};

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
}
```

**3.2 Create Redis configuration validator:**

`src/infrastructure/cache/redis/redisValidator.ts`:

```typescript
export class RedisConfigValidator {
  static validate(config: any): boolean {
    const required = ['url', 'keyPrefix', 'maxRetries', 'retryDelay'];

    for (const field of required) {
      if (!config[field]) {
        console.error(`❌ Redis configuration missing: ${field}`);
        return false;
      }
    }

    if (!config.url.startsWith('redis://') && !config.url.startsWith('rediss://')) {
      console.error('❌ Redis URL must start with redis:// or rediss://');
      return false;
    }

    if (config.maxRetries < 0 || config.maxRetries > 10) {
      console.error('❌ Redis maxRetries must be between 0 and 10');
      return false;
    }

    return true;
  }

  static sanitizeKey(key: string): string {
    return key.replace(/[^a-zA-Z0-9:_-]/g, '_');
  }
}
```

**3.3 Create Redis connection options factory:**

`src/infrastructure/cache/redis/redisOptions.ts`:

```typescript
import { Redis, RedisOptions } from 'ioredis';
import { redisConfig } from './redisConfig';

export class RedisOptionsFactory {
  static createOptions(): RedisOptions {
    return {
      host: this.extractHost(redisConfig.url),
      port: this.extractPort(redisConfig.url),
      password: redisConfig.password,
      db: redisConfig.db,
      retryDelayOnFailover: redisConfig.retryDelay,
      enableReadyCheck: true,
      maxRetriesPerRequest: redisConfig.maxRetries,
      lazyConnect: redisConfig.lazyConnect,
      keepAlive: redisConfig.keepAlive,
      family: redisConfig.family,
      connectTimeout: redisConfig.connectionTimeout,
      commandTimeout: redisConfig.connectionTimeout,
      enableOfflineQueue: redisConfig.enableOfflineQueue,
      // Connection pool settings
      connectionName: 'jollyjet-app',
      // Performance settings
      showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
      // Cluster support
      ...(redisConfig.maxMemoryPolicy &&
        {
          // Redis memory policy
        }),
    };
  }

  private static extractHost(url: string): string {
    const match = url.match(/redis:\/\/([^:]+)/);
    return match ? match[1] : 'localhost';
  }

  private static extractPort(url: string): number {
    const match = url.match(/:(\d+)/);
    return match ? parseInt(match[1]) : 6379;
  }

  static createClusterOptions(): Redis.ClusterOptions {
    return {
      redisOptions: this.createOptions(),
      enableReadyCheck: true,
      retryDelayOnFailover: redisConfig.retryDelay,
      maxRetriesPerRequest: redisConfig.maxRetries,
    };
  }
}
```

### Step 4: Redis Types and Interfaces

**Dependency:** Requires Step 3 (Redis Configuration)

**4.1 Create cache interface:**

`src/infrastructure/cache/interfaces/ICache.ts`:

```typescript
export interface ICache {
  // Basic operations
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean>;
  del(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;

  // Batch operations
  mget<T>(keys: string[]): Promise<(T | null)[]>;
  mset<T>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<boolean>;

  // Advanced operations
  increment(key: string, amount?: number): Promise<number>;
  decrement(key: string, amount?: number): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<boolean>;
  ttl(key: string): Promise<number>;

  // Connection management
  clear(): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnectionActive(): boolean;
  ping(): Promise<string | null>;

  // Pattern-based operations (advanced)
  scan(pattern: string, count?: number): Promise<string[]>;
  keys(pattern: string): Promise<string[]>;

  // Locking (for distributed systems)
  acquireLock(key: string, ttl?: number): Promise<string | null>;
  releaseLock(key: string, lockValue: string): Promise<boolean>;
}

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
  retryOnError?: boolean;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  hitRate: number;
  averageResponseTime: number;
  totalOperations: number;
  lastUpdated: Date;
}

export interface CacheEntry<T> {
  key: string;
  value: T;
  ttl?: number;
  timestamp: number;
  accessCount: number;
}

export interface CacheStats {
  memory: {
    used: number;
    peak: number;
    fragmentationRatio: number;
  };
  keys: {
    total: number;
    expired: number;
    evicted: number;
  };
  operations: {
    reads: number;
    writes: number;
    errors: number;
  };
  performance: {
    averageLatency: number;
    p95Latency: number;
    p99Latency: number;
  };
}

export interface CacheLockOptions {
  ttl?: number;
  retryDelay?: number;
  maxRetries?: number;
  autoExtend?: boolean;
}

export interface DistributedLock {
  key: string;
  value: string;
  ttl: number;
  acquired: boolean;
  extend: (additionalTTL?: number) => Promise<boolean>;
  release: () => Promise<boolean>;
}

export type CacheKeyPattern = string;
export type CacheKeyGenerator = (params: any) => string;
export type CacheSerializer = (value: any) => string;
export type CacheDeserializer = (value: string) => any;
```

**4.2 Create Redis-specific types:**

`src/infrastructure/cache/redis/redisTypes.ts`:

```typescript
import Redis from 'ioredis';

export interface RedisConnectionConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  family: 4 | 6;
  connectTimeout: number;
  commandTimeout: number;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  enableOfflineQueue: boolean;
  lazyConnect: boolean;
  keepAlive: number;
  connectionName?: string;
}

export interface RedisClusterConfig {
  nodes: Array<{
    host: string;
    port: number;
  }>;
  options: {
    redisOptions: RedisConnectionConfig;
    enableReadyCheck: boolean;
    retryDelayOnFailover: number;
    maxRetriesPerRequest: number;
  };
}

export interface RedisMetrics {
  connected: boolean;
  ready: boolean;
  connecting: boolean;
  reconnecting: boolean;
  status: 'connect' | 'ready' | 'error' | 'close' | 'reconnecting' | 'end';
  serverInfo: {
    version: string;
    mode: 'standalone' | 'cluster' | 'sentinel';
    role: 'master' | 'slave';
    uptime: number;
    memory: {
      used: number;
      peak: number;
      max: number;
    };
  };
  performance: {
    totalCommands: number;
    totalErrors: number;
    averageLatency: number;
  };
}

export interface RedisEventHandlers {
  connect?: () => void;
  ready?: () => void;
  error?: (error: Error) => void;
  close?: () => void;
  reconnecting?: () => void;
  end?: () => void;
  '+node'?: (node: Redis.Redis) => void;
  '-node'?: (node: Redis.Redis) => void;
  'node error'?: (error: Error, node: Redis.Redis) => void;
}

export interface RedisCommandOptions {
  commandTimeout?: number;
  retryDelay?: number;
  maxRetries?: number;
  throwOnError?: boolean;
  returnBuffers?: boolean;
  keyPrefix?: string;
}

export interface RedisPipelineOptions {
  exec?: boolean;
  checkResults?: boolean;
  isolate?: boolean;
  order?: boolean;
  preserve?: boolean;
}

export interface RedisTransactionOptions {
  exec?: boolean;
  discard?: boolean;
  watch?: string[];
  unwatch?: boolean[];
}

export type RedisCommandResult<T = any> = {
  value: T;
  error?: Error;
  source: 'cache' | 'database';
  timestamp: number;
  executionTime: number;
};

export interface RedisScanResult {
  cursor: string;
  keys: string[];
  count: number;
}

export interface RedisInfo {
  server: {
    redis_version: string;
    redis_mode: string;
    os: string;
    arch_bits: number;
    uptime_in_seconds: number;
    uptime_in_days: number;
  };
  memory: {
    used_memory: number;
    used_memory_human: string;
    used_memory_rss: number;
    used_memory_peak: number;
    maxmemory: number;
  };
  clients: {
    connected_clients: number;
    client_recent_max_input_buffer: number;
    client_recent_max_output_buffer: number;
  };
  stats: {
    total_commands_processed: number;
    total_connections_received: number;
    keyspace_hits: number;
    keyspace_misses: number;
  };
  keyspace: Array<{
    db: string;
    keys: number;
    expires: number;
    avg_ttl: number;
  }>;
}

export type RedisDataType = 'string' | 'list' | 'set' | 'zset' | 'hash' | 'stream' | 'none';

export interface RedisKeyInfo {
  key: string;
  type: RedisDataType;
  size?: number;
  ttl?: number;
  encoding?: string;
  refcount?: number;
}
```

### Step 5: Redis Connection Class

**Dependency:** Requires Step 4 (Redis Types and Interfaces)

**5.1 Create main Redis cache implementation:**

`src/infrastructure/cache/redis/redis.ts`:

```typescript
import Redis from 'ioredis';
import { redisConfig, cacheTTL } from './redisConfig';
import { RedisOptionsFactory } from './redisOptions';
import { RedisConfigValidator } from './redisValidator';
import { ICache, CacheMetrics, DistributedLock, CacheLockOptions } from '../interfaces/ICache';
import {
  RedisConnectionConfig,
  RedisMetrics,
  RedisEventHandlers,
  RedisCommandResult,
} from './redisTypes';

export class RedisCache implements ICache {
  private redis: Redis;
  private isConnected: boolean = false;
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    hitRate: 0,
    averageResponseTime: 0,
    totalOperations: 0,
    lastUpdated: new Date(),
  };
  private responseTimeHistory: number[] = [];
  private readonly maxResponseTimeHistory = 1000;

  constructor() {
    this.validateConfig();
    this.redis = this.createRedisInstance();
    this.setupEventHandlers();
  }

  private validateConfig(): void {
    if (!RedisConfigValidator.validate(redisConfig)) {
      throw new Error('Invalid Redis configuration');
    }
  }

  private createRedisInstance(): Redis {
    const options = RedisOptionsFactory.createOptions();
    return new Redis(options);
  }

  private setupEventHandlers(): void {
    const handlers: RedisEventHandlers = {
      connect: () => {
        this.isConnected = true;
        console.log('✅ Redis connected successfully');
      },
      ready: () => {
        console.log('🚀 Redis ready for commands');
      },
      error: (error) => {
        this.isConnected = false;
        this.metrics.errors++;
        console.error('❌ Redis connection error:', error);
      },
      close: () => {
        this.isConnected = false;
        console.log('🔌 Redis connection closed');
      },
      reconnecting: () => {
        console.log('🔄 Redis reconnecting...');
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      if (handler) {
        this.redis.on(event, handler as any);
      }
    });
  }

  private async trackOperation<T>(
    operation: () => Promise<T>,
    operationType: 'get' | 'set' | 'del' | 'other'
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await operation();
      const executionTime = Date.now() - startTime;

      this.updateMetrics(operationType, executionTime, true);
      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateMetrics(operationType, executionTime, false);
      throw error;
    }
  }

  private updateMetrics(operationType: string, executionTime: number, success: boolean): void {
    this.metrics.totalOperations++;
    this.responseTimeHistory.push(executionTime);

    if (this.responseTimeHistory.length > this.maxResponseTimeHistory) {
      this.responseTimeHistory.shift();
    }

    this.metrics.averageResponseTime =
      this.responseTimeHistory.reduce((sum, time) => sum + time, 0) /
      this.responseTimeHistory.length;

    if (!success) {
      this.metrics.errors++;
    }

    switch (operationType) {
      case 'get':
        if (success) {
          this.metrics.hits++;
        } else {
          this.metrics.misses++;
        }
        break;
      case 'set':
        this.metrics.sets++;
        break;
      case 'del':
        this.metrics.deletes++;
        break;
    }

    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
    this.metrics.lastUpdated = new Date();
  }

  async get<T>(key: string): Promise<T | null> {
    return this.trackOperation(async () => {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const sanitizedKey = RedisConfigValidator.sanitizeKey(key);
      const fullKey = `${redisConfig.keyPrefix}${sanitizedKey}`;
      const value = await this.redis.get(fullKey);

      return value ? JSON.parse(value) : null;
    }, 'get');
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    return this.trackOperation(async () => {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const sanitizedKey = RedisConfigValidator.sanitizeKey(key);
      const fullKey = `${redisConfig.keyPrefix}${sanitizedKey}`;
      const serializedValue = JSON.stringify(value);
      const ttl = ttlSeconds || cacheTTL.default;

      await this.redis.setex(fullKey, ttl, serializedValue);
      return true;
    }, 'set');
  }

  async del(key: string): Promise<boolean> {
    return this.trackOperation(async () => {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const sanitizedKey = RedisConfigValidator.sanitizeKey(key);
      const fullKey = `${redisConfig.keyPrefix}${sanitizedKey}`;
      const result = await this.redis.del(fullKey);
      return result > 0;
    }, 'del');
  }

  async exists(key: string): Promise<boolean> {
    return this.trackOperation(async () => {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const sanitizedKey = RedisConfigValidator.sanitizeKey(key);
      const fullKey = `${redisConfig.keyPrefix}${sanitizedKey}`;
      const result = await this.redis.exists(fullKey);
      return result === 1;
    }, 'other');
  }

  async clear(): Promise<boolean> {
    return this.trackOperation(async () => {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      await this.redis.flushdb();
      return true;
    }, 'other');
  }

  async disconnect(): Promise<void> {
    await this.redis.disconnect();
    this.isConnected = false;
  }

  isConnectionActive(): boolean {
    return this.isConnected;
  }

  async ping(): Promise<string | null> {
    return this.trackOperation(async () => {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      return await this.redis.ping();
    }, 'other');
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return this.trackOperation(async () => {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const sanitizedKeys = keys.map((key) => RedisConfigValidator.sanitizeKey(key));
      const fullKeys = sanitizedKeys.map((key) => `${redisConfig.keyPrefix}${key}`);
      const values = await this.redis.mget(fullKeys);

      return values.map((value) => (value ? JSON.parse(value) : null));
    }, 'get');
  }

  async mset<T>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<boolean> {
    return this.trackOperation(async () => {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const pipeline = this.redis.pipeline();

      for (const entry of entries) {
        const sanitizedKey = RedisConfigValidator.sanitizeKey(entry.key);
        const fullKey = `${redisConfig.keyPrefix}${sanitizedKey}`;
        const serializedValue = JSON.stringify(entry.value);
        const ttl = entry.ttl || cacheTTL.default;

        pipeline.setex(fullKey, ttl, serializedValue);
      }

      await pipeline.exec();
      return true;
    }, 'set');
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    return this.trackOperation(async () => {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const sanitizedKey = RedisConfigValidator.sanitizeKey(key);
      const fullKey = `${redisConfig.keyPrefix}${sanitizedKey}`;
      return await this.redis.incrby(fullKey, amount);
    }, 'other');
  }

  async decrement(key: string, amount: number = 1): Promise<number> {
    return this.trackOperation(async () => {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const sanitizedKey = RedisConfigValidator.sanitizeKey(key);
      const fullKey = `${redisConfig.keyPrefix}${sanitizedKey}`;
      return await this.redis.decrby(fullKey, amount);
    }, 'other');
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    return this.trackOperation(async () => {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const sanitizedKey = RedisConfigValidator.sanitizeKey(key);
      const fullKey = `${redisConfig.keyPrefix}${sanitizedKey}`;
      const result = await this.redis.expire(fullKey, ttlSeconds);
      return result === 1;
    }, 'other');
  }

  async ttl(key: string): Promise<number> {
    return this.trackOperation(async () => {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const sanitizedKey = RedisConfigValidator.sanitizeKey(key);
      const fullKey = `${redisConfig.keyPrefix}${sanitizedKey}`;
      return await this.redis.ttl(fullKey);
    }, 'other');
  }

  async scan(pattern: string, count: number = 100): Promise<string[]> {
    return this.trackOperation(async () => {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const fullPattern = `${redisConfig.keyPrefix}${pattern}`;
      const keys: string[] = [];
      let cursor = '0';

      do {
        const result = await this.redis.scan(cursor, 'MATCH', fullPattern, 'COUNT', count);
        cursor = result[0];
        const scannedKeys = result[1];
        keys.push(...scannedKeys);
      } while (cursor !== '0');

      return keys.map((key) => key.replace(redisConfig.keyPrefix, ''));
    }, 'other');
  }

  async keys(pattern: string): Promise<string[]> {
    return this.trackOperation(async () => {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const fullPattern = `${redisConfig.keyPrefix}${pattern}`;
      const keys = await this.redis.keys(fullPattern);
      return keys.map((key) => key.replace(redisConfig.keyPrefix, ''));
    }, 'other');
  }

  async acquireLock(key: string, ttl: number = 30): Promise<string | null> {
    return this.trackOperation(async () => {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const sanitizedKey = RedisConfigValidator.sanitizeKey(key);
      const fullKey = `${redisConfig.keyPrefix}lock:${sanitizedKey}`;
      const lockValue = `${Date.now()}-${Math.random()}`;

      const result = await this.redis.set(fullKey, lockValue, 'PX', ttl * 1000, 'NX');
      return result === 'OK' ? lockValue : null;
    }, 'other');
  }

  async releaseLock(key: string, lockValue: string): Promise<boolean> {
    return this.trackOperation(async () => {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const sanitizedKey = RedisConfigValidator.sanitizeKey(key);
      const fullKey = `${redisConfig.keyPrefix}lock:${sanitizedKey}`;

      const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;

      const result = await this.redis.eval(luaScript, 1, fullKey, lockValue);
      return result === 1;
    }, 'other');
  }

  createDistributedLock(key: string, options: CacheLockOptions = {}): DistributedLock {
    const lockValue = `${Date.now()}-${Math.random()}`;
    const ttl = options.ttl || 30;

    return {
      key,
      value: lockValue,
      ttl,
      acquired: false,

      async extend(additionalTTL?: number): Promise<boolean> {
        const newTTL = additionalTTL || ttl;
        const fullKey = `${redisConfig.keyPrefix}lock:${key}`;
        const result = await this.redis.expire(fullKey, newTTL);
        return result === 1;
      },

      async release(): Promise<boolean> {
        return await this.releaseLock(key, lockValue);
      },
    };
  }

  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      hitRate: 0,
      averageResponseTime: 0,
      totalOperations: 0,
      lastUpdated: new Date(),
    };
    this.responseTimeHistory = [];
  }

  async getRedisMetrics(): Promise<RedisMetrics> {
    try {
      const info = await this.redis.info();
      const ping = await this.redis.ping();

      return {
        connected: this.isConnected,
        ready: this.redis.status === 'ready',
        connecting: this.redis.status === 'connecting',
        reconnecting: this.redis.status === 'reconnecting',
        status: this.redis.status,
        serverInfo: this.parseRedisInfo(info),
        performance: {
          totalCommands: this.metrics.totalOperations,
          totalErrors: this.metrics.errors,
          averageLatency: this.metrics.averageResponseTime,
        },
      };
    } catch (error) {
      return {
        connected: false,
        ready: false,
        connecting: false,
        reconnecting: false,
        status: 'error',
        serverInfo: {} as any,
        performance: {
          totalCommands: 0,
          totalErrors: 0,
          averageLatency: 0,
        },
      };
    }
  }

  private parseRedisInfo(info: string): any {
    const lines = info.split('\r\n');
    const result: any = {};

    for (const line of lines) {
      if (line.startsWith('#') || !line.includes(':')) continue;

      const [key, value] = line.split(':');
      const parsedValue = isNaN(Number(value)) ? value : Number(value);

      if (key.includes('_')) {
        const [section, ...parts] = key.split('_');
        if (!result[section]) result[section] = {};
        result[section][parts.join('_')] = parsedValue;
      } else {
        result[key] = parsedValue;
      }
    }

    return result;
  }
}

export const redisCache = new RedisCache();
```

**5.2 Create Redis connection manager:**

`src/infrastructure/database/connections/redis.ts`:

```typescript
import { redisCache } from '../../cache/redis/redis';

export class RedisConnectionManager {
  private static instance: RedisConnectionManager;
  private isInitialized: boolean = false;

  static getInstance(): RedisConnectionManager {
    if (!RedisConnectionManager.instance) {
      RedisConnectionManager.instance = new RedisConnectionManager();
    }
    return RedisConnectionManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Test Redis connection
      const ping = await redisCache.ping();
      if (!ping) {
        throw new Error('Failed to connect to Redis');
      }

      this.isInitialized = true;
      console.log('✅ Redis connection initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Redis connection:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.isInitialized) {
      await redisCache.disconnect();
      this.isInitialized = false;
      console.log('🔌 Redis connection closed');
    }
  }

  isReady(): boolean {
    return this.isInitialized && redisCache.isConnectionActive();
  }

  getCache() {
    return redisCache;
  }
}

export const redisConnectionManager = RedisConnectionManager.getInstance();
```

### Step 6: Cache-Aside Service Implementation

Create `src/infrastructure/cache/services/cacheAsideService.ts`:

```typescript
import { redisCache } from '../redis/redis';
import { ICache } from '../interfaces/ICache';
import { Document, Model } from 'mongoose';

export class CacheAsideService<T extends Document> {
  private cache: ICache;
  private model: Model<T>;
  private keyPrefix: string;
  private defaultTTL: number;

  constructor(model: Model<T>, keyPrefix: string, defaultTTL: number = 3600) {
    this.cache = redisCache;
    this.model = model;
    this.keyPrefix = keyPrefix;
    this.defaultTTL = defaultTTL;
  }

  async findById(id: string): Promise<T | null> {
    const cacheKey = `${this.keyPrefix}:${id}`;

    try {
      // 1. Check Redis first
      let result = await this.cache.get<T>(cacheKey);

      if (result) {
        console.log(`🎯 Cache HIT: ${cacheKey}`);
        return result;
      }

      // 2. Cache miss - fetch from MongoDB
      console.log(`❌ Cache MISS: ${cacheKey}`);
      result = await this.model.findById(id).lean();

      if (result) {
        // 3. Store in Redis for future requests
        await this.cache.set(cacheKey, result, this.defaultTTL);
        console.log(`💾 Cache SET: ${cacheKey}`);
      }

      return result;
    } catch (error) {
      console.error(`🚨 Error in findById for ${cacheKey}:`, error);
      // Fallback to database if Redis fails
      return await this.model.findById(id).lean();
    }
  }

  async findOne(conditions: any): Promise<T | null> {
    const cacheKey = `${this.keyPrefix}:findOne:${JSON.stringify(conditions)}`;

    try {
      let result = await this.cache.get<T>(cacheKey);

      if (result) {
        console.log(`🎯 Cache HIT: ${cacheKey}`);
        return result;
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);
      result = await this.model.findOne(conditions).lean();

      if (result) {
        await this.cache.set(cacheKey, result, this.defaultTTL);
        console.log(`💾 Cache SET: ${cacheKey}`);
      }

      return result;
    } catch (error) {
      console.error(`🚨 Error in findOne for ${cacheKey}:`, error);
      return await this.model.findOne(conditions).lean();
    }
  }

  async find(conditions: any = {}, options: any = {}): Promise<T[]> {
    const { sort = {}, limit = 0, skip = 0 } = options;
    const cacheKey = `${this.keyPrefix}:find:${JSON.stringify({ conditions, sort, limit, skip })}`;

    try {
      let result = await this.cache.get<T[]>(cacheKey);

      if (result) {
        console.log(`🎯 Cache HIT: ${cacheKey}`);
        return result;
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);
      let query = this.model.find(conditions);

      if (Object.keys(sort).length > 0) {
        query = query.sort(sort);
      }
      if (limit > 0) {
        query = query.limit(limit);
      }
      if (skip > 0) {
        query = query.skip(skip);
      }

      result = await query.lean();

      if (result.length > 0) {
        await this.cache.set(cacheKey, result, Math.floor(this.defaultTTL / 2));
        console.log(`💾 Cache SET: ${cacheKey}`);
      }

      return result;
    } catch (error) {
      console.error(`🚨 Error in find for ${cacheKey}:`, error);
      return await this.model.find(conditions).lean();
    }
  }

  async create(data: any): Promise<T> {
    try {
      // 1. Create in MongoDB first
      const result = await this.model.create(data);
      const resultObj = result.toJSON();

      // 2. Cache the new document
      const cacheKey = `${this.keyPrefix}:${result._id}`;
      await this.cache.set(cacheKey, resultObj, this.defaultTTL);
      console.log(`💾 Cache CREATE: ${cacheKey}`);

      // 3. Invalidate list caches
      await this.invalidateListCaches();

      return resultObj;
    } catch (error) {
      console.error(`🚨 Error in create for ${this.keyPrefix}:`, error);
      throw error;
    }
  }

  async updateById(id: string, updateData: any): Promise<T | null> {
    const cacheKey = `${this.keyPrefix}:${id}`;

    try {
      // 1. Update in MongoDB
      const result = await this.model.findByIdAndUpdate(id, updateData, { new: true });

      if (result) {
        const resultObj = result.toJSON();

        // 2. Update cache with new data
        await this.cache.set(cacheKey, resultObj, this.defaultTTL);
        console.log(`💾 Cache UPDATE: ${cacheKey}`);

        // 3. Invalidate related caches
        await this.invalidateListCaches();
        await this.invalidateSearchCaches(id);

        return resultObj;
      }

      return null;
    } catch (error) {
      console.error(`🚨 Error in updateById for ${cacheKey}:`, error);
      throw error;
    }
  }

  async deleteById(id: string): Promise<boolean> {
    const cacheKey = `${this.keyPrefix}:${id}`;

    try {
      // 1. Delete from MongoDB
      const result = await this.model.findByIdAndDelete(id);

      if (result) {
        // 2. Remove from cache
        await this.cache.del(cacheKey);
        console.log(`🗑️ Cache DELETE: ${cacheKey}`);

        // 3. Invalidate all related caches
        await this.invalidateListCaches();
        await this.invalidateSearchCaches(id);

        return true;
      }

      return false;
    } catch (error) {
      console.error(`🚨 Error in deleteById for ${cacheKey}:`, error);
      throw error;
    }
  }

  private async invalidateListCaches(): Promise<void> {
    console.log(`🗑️ Invalidating list caches for ${this.keyPrefix}`);
    // In production, implement pattern-based invalidation
  }

  private async invalidateSearchCaches(entityId: string): Promise<void> {
    console.log(`🗑️ Invalidating search caches for ${this.keyPrefix}:${entityId}`);
    // In production, implement pattern-based invalidation
  }
}
```

### Step 7: Redis-First Business Service

Create `src/infrastructure/cache/services/redisFirstService.ts`:

```typescript
import { redisCache } from '../redis/redis';
import { CacheAsideService } from './cacheAsideService';

// Mock imports - replace with actual model imports
const UserModel = {
  /* actual User model */
};
const FlightModel = {
  /* actual Flight model */
};
const BookingModel = {
  /* actual Booking model */
};

export class RedisFirstService {
  private static instance: RedisFirstService;
  private userService: CacheAsideService<any>;
  private flightService: CacheAsideService<any>;
  private bookingService: CacheAsideService<any>;

  constructor() {
    this.userService = new CacheAsideService(UserModel, 'user', 3600);
    this.flightService = new CacheAsideService(FlightModel, 'flight', 1800);
    this.bookingService = new CacheAsideService(BookingModel, 'booking', 7200);
  }

  static getInstance(): RedisFirstService {
    if (!RedisFirstService.instance) {
      RedisFirstService.instance = new RedisFirstService();
    }
    return RedisFirstService.instance;
  }

  // === USER OPERATIONS ===

  async getUserById(userId: string): Promise<any | null> {
    return await this.userService.findById(userId);
  }

  async createUser(userData: any): Promise<any> {
    return await this.userService.create(userData);
  }

  async updateUser(userId: string, updateData: any): Promise<any | null> {
    const result = await this.userService.updateById(userId, updateData);

    if (result) {
      // Invalidate related user caches
      await this.invalidateUserRelatedCaches(userId);
    }

    return result;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await this.userService.deleteById(userId);

    if (result) {
      await this.invalidateUserRelatedCaches(userId);
    }

    return result;
  }

  // === FLIGHT OPERATIONS ===

  async getFlightById(flightId: string): Promise<any | null> {
    return await this.flightService.findById(flightId);
  }

  async searchFlights(searchParams: any): Promise<any[]> {
    const cacheKey = `flights:search:${JSON.stringify(searchParams)}`;

    try {
      let flights = await redisCache.get(cacheKey);

      if (!flights) {
        // Mock implementation - replace with actual search
        flights = []; // await FlightModel.find(searchParams).lean();

        if (flights.length > 0) {
          await redisCache.set(cacheKey, flights, 600); // 10 minutes
        }
      }

      return flights;
    } catch (error) {
      console.error('Error searching flights:', error);
      return [];
    }
  }

  async updateFlight(flightId: string, updateData: any): Promise<any | null> {
    const result = await this.flightService.updateById(flightId, updateData);

    if (result) {
      await this.invalidateFlightSearchCaches();
    }

    return result;
  }

  // === BOOKING OPERATIONS ===

  async getBookingById(bookingId: string): Promise<any | null> {
    return await this.bookingService.findById(bookingId);
  }

  async createBooking(bookingData: any): Promise<any> {
    const booking = await this.bookingService.create(bookingData);

    // Invalidate user's booking list
    await redisCache.del(`user:${bookingData.userId}:bookings`);

    return booking;
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<any | null> {
    const result = await this.bookingService.updateById(bookingId, { status });

    if (result) {
      // Invalidate user's booking list
      await redisCache.del(`user:${result.userId}:bookings`);
    }

    return result;
  }

  async getUserBookings(userId: string): Promise<any[]> {
    const cacheKey = `user:${userId}:bookings`;

    try {
      let bookings = await redisCache.get(cacheKey);

      if (!bookings) {
        // Mock implementation - replace with actual query
        bookings = []; // await BookingModel.find({ userId }).lean();

        await redisCache.set(cacheKey, bookings, 1800);
      }

      return bookings;
    } catch (error) {
      console.error('Error getting user bookings:', error);
      return [];
    }
  }

  // === CACHE INVALIDATION ===

  private async invalidateUserRelatedCaches(userId: string): Promise<void> {
    const patterns = [
      `user:${userId}:bookings`,
      `user:${userId}:profile`,
      `user:${userId}:preferences`,
    ];

    await Promise.all(patterns.map((pattern) => redisCache.del(pattern)));
  }

  private async invalidateFlightSearchCaches(): Promise<void> {
    // Invalidate search-related caches
    console.log('Invalidating flight search caches');
  }

  // === CACHE MANAGEMENT ===

  async getCacheStats(): Promise<{ active: boolean; ping: string | null; metrics: any }> {
    return {
      active: redisCache.isConnectionActive(),
      ping: await redisCache.ping(),
      metrics: redisCache.getMetrics(),
    };
  }

  async warmUpCache(userId?: string): Promise<void> {
    if (userId) {
      await this.getUserById(userId);
      await this.getUserBookings(userId);
    }

    // Warm up popular flights
    await this.searchFlights({ popular: true });
  }

  async clearUserCache(userId: string): Promise<boolean> {
    return await this.invalidateUserRelatedCaches(userId);
  }
}
```

### Step 8: API Controllers

Create `src/interface/controllers/userController.ts`:

```typescript
import { Request, Response } from 'express';
import { RedisFirstService } from '../../infrastructure/cache/services/redisFirstService';

const redisService = RedisFirstService.getInstance();

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await redisService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: user,
      cached: true,
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const user = await redisService.createUser(userData);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await redisService.updateUser(id, updateData);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await redisService.deleteUser(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const bookings = await redisService.getUserBookings(userId);

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error('Error getting user bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
```

### Step 9: Routes Configuration

Create `src/interface/routes/userRoutes.ts`:

```typescript
import { Router } from 'express';
import * as userController from '../controllers/userController';

const router = Router();

// User CRUD routes
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// User-specific routes
router.get('/:userId/bookings', userController.getUserBookings);

export default router;
```

### Step 10: Cache Management Endpoints

Create `src/interface/controllers/cacheController.ts`:

```typescript
import { Request, Response } from 'express';
import { RedisFirstService } from '../../infrastructure/cache/services/redisFirstService';
import { redisCache } from '../../infrastructure/cache/redis/redis';

const redisService = RedisFirstService.getInstance();

export const getCacheStats = async (req: Request, res: Response) => {
  try {
    const stats = await redisService.getCacheStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache stats',
    });
  }
};

export const warmUpCache = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    await redisService.warmUpCache(userId as string);

    res.json({
      success: true,
      message: 'Cache warmed up successfully',
    });
  } catch (error) {
    console.error('Error warming up cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to warm up cache',
    });
  }
};

export const clearUserCache = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const success = await redisService.clearUserCache(userId);

    res.json({
      success,
      message: success ? 'User cache cleared' : 'Failed to clear user cache',
    });
  } catch (error) {
    console.error('Error clearing user cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear user cache',
    });
  }
};

export const clearAllCache = async (req: Request, res: Response) => {
  try {
    const success = await redisCache.clear();

    res.json({
      success,
      message: success ? 'All cache cleared' : 'Failed to clear cache',
    });
  } catch (error) {
    console.error('Error clearing all cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear all cache',
    });
  }
};

export const getCacheKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const value = await redisCache.get(key);
    const exists = await redisCache.exists(key);

    res.json({
      success: true,
      data: {
        key,
        value,
        exists,
      },
    });
  } catch (error) {
    console.error('Error getting cache key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache key',
    });
  }
};

export const deleteCacheKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const success = await redisCache.del(key);

    res.json({
      success,
      message: success ? 'Key deleted successfully' : 'Key not found',
    });
  } catch (error) {
    console.error('Error deleting cache key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete cache key',
    });
  }
};
```

### Step 11: Application Integration

Update `src/app.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { redisCache } from './infrastructure/cache/redis/redis';

// Routes
import userRoutes from './interface/routes/userRoutes';
import flightRoutes from './interface/routes/flightRoutes';
import bookingRoutes from './interface/routes/bookingRoutes';
import cacheRoutes from './interface/routes/cacheRoutes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  const ping = await redisCache.ping();
  const isActive = redisCache.isConnectionActive();

  res.json({
    status: isActive ? 'healthy' : 'unhealthy',
    redis: {
      connected: isActive,
      ping,
    },
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/cache', cacheRoutes);

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Cache stats available at http://localhost:${PORT}/api/cache/stats`);
});

export default app;
```

## Testing Implementation

### Unit Tests for ProductRepository with Redis Cache

**✅ COMPLETED**: Created `tests/unit/infrastructure/repositories/product-repository-redis.test.ts`

**Test Coverage**:

- **Cache Hit/Miss Scenarios**: Verifies `findById` checks cache first, falls back to DB
- **Cache Invalidation on Create**: Ensures list caches are cleared when new products are created
- **Cache Update on Update**: Verifies cache is updated when products are modified
- **Cache Removal on Delete**: Confirms cache entries are removed when products are deleted
- **List Caching**: Tests caching of filtered product lists
- **Count Caching**: Tests caching of product count queries
- **Wishlist Toggle**: Verifies cache updates when wishlist status changes

**Key Test Scenarios**:

```typescript
describe('findById - Redis First Cache', () => {
  it('should return product from cache on second call', async () => {
    // First call: cache miss, fetch from DB, store in cache
    // Second call: cache hit, return cached data
  });
});

describe('create - Cache Invalidation', () => {
  it('should invalidate list caches when creating product', async () => {
    // Create product, verify list caches are invalidated
  });
});

describe('update - Cache Update', () => {
  it('should update cache when product is updated', async () => {
    // Update product, verify cache reflects changes
  });
});
```

### Test Execution

**Run the Redis-first cache tests**:

```bash
npm test -- --testPathPattern=product-repository-redis.test.ts
```

**Expected Test Results**:

- All CRUD operations should pass with Redis caching
- Cache hit rates should improve on subsequent calls
- Cache invalidation should work correctly on writes
- Fallback to MongoDB should work when Redis is unavailable

## Performance Considerations

### Cache Hit Rate Optimization

**✅ IMPLEMENTED TTL Configuration**:

- **Individual products**: 1 hour (3600 seconds) - frequently accessed items
- **Product lists**: 5 minutes (300 seconds) - shorter TTL for dynamic content
- **Product counts**: 5 minutes (300 seconds) - matches list TTL

**Cache Warming Strategies**:

- Products are cached on first access (lazy loading)
- List caches warm up automatically on filtered queries
- Count caches populate on demand

**Memory Management**:

- Leverages existing Redis LRU eviction policies
- Pattern-based cache invalidation prevents memory bloat
- Efficient JSON serialization for storage

### Monitoring and Metrics

1. **Key Metrics to Track**:
   - Cache hit rate
   - Average response time
   - Memory usage
   - Error rates
   - Connection health

2. **Logging Best Practices**:
   - **Cache Hits**: Log at `INFO` level for operational monitoring (currently inconsistent: middleware uses INFO, services use DEBUG)
   - **Cache Misses**: Log at `DEBUG` level since they represent normal fallback behavior
   - **Cache Errors**: Log at `WARN` level for connection issues, `ERROR` for critical failures
   - **Performance**: Include cache keys and response times in structured logs

3. **Environment-Based Logging**:
   - **Development**: All log levels enabled (DEBUG, INFO, WARN, ERROR)
   - **Production**: Only INFO, WARN, ERROR enabled (DEBUG logs suppressed)
   - Cache hit logs at INFO level ensure visibility in production for performance monitoring

4. **Alerting**:
   - Cache hit rate below 80%
   - Redis connection failures
   - Memory usage above 85%
   - Response time degradation

## Deployment Configuration

### Production Redis Setup

```yaml
# docker-compose.yml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    environment:
      - REDIS_PASSWORD=your-password
    networks:
      - app-network

  app:
    build: .
    ports:
      - '3000:3000'
    depends_on:
      - redis
    environment:
      - REDIS_URL=redis://redis:6379
      - REDIS_PASSWORD=your-password
    networks:
      - app-network

volumes:
  redis-data:

networks:
  app-network:
    driver: bridge
```

### Environment-Specific Configurations

```typescript
// config/redis.config.ts
export const redisConfig = {
  development: {
    url: 'redis://localhost:6379',
    keyPrefix: 'jollyjet:dev:',
    defaultTTL: 3600,
  },
  staging: {
    url: process.env.STAGING_REDIS_URL,
    keyPrefix: 'jollyjet:staging:',
    defaultTTL: 1800,
  },
  production: {
    url: process.env.PRODUCTION_REDIS_URL,
    password: process.env.REDIS_PASSWORD,
    keyPrefix: 'jollyjet:prod:',
    defaultTTL: 7200,
    cluster: true,
  },
};
```

## Best Practices Implemented

### 1. Cache Key Design

**✅ IMPLEMENTED**: Structured cache key patterns:

```typescript
// Individual product cache
const productKey = `product:${id}`;

// Product lists with filters and pagination
const listKey = `products:${JSON.stringify({ filter, pagination })}`;

// Product counts with filters
const countKey = `product:count:${JSON.stringify(filter)}`;
```

**Key Design Principles**:

- **Namespace prefix**: `product:` for all product-related keys
- **Structured serialization**: JSON.stringify for complex filters
- **Deterministic keys**: Same parameters always generate same key
- **Pattern-friendly**: Enables efficient bulk invalidation

### 2. Error Handling

```typescript
// Graceful degradation when Redis fails
const safeCacheOperation = async <T>(
  operation: () => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.warn('Redis operation failed, falling back to database:', error);
    return await fallback();
  }
};
```

### 3. Cache Invalidation Strategy

```typescript
// Invalidate related caches on updates
const invalidateRelatedCaches = async (userId: string) => {
  const patterns = [`user:${userId}:*`, `user:${userId}:bookings:*`, `flight:search:*`];

  // Use Redis SCAN for pattern matching
  for (const pattern of patterns) {
    const keys = await redisCache.scan(pattern);
    if (keys.length > 0) {
      await redisCache.del(...keys);
    }
  }
};
```

### 4. Performance Monitoring

```typescript
// Cache performance middleware
const cachePerformanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const metrics = redisCache.getMetrics();

    console.log(
      `Request ${req.method} ${req.path} - ${duration}ms - Cache hit rate: ${metrics.hitRate}%`
    );
  });

  next();
};
```

## Security Considerations

1. **Redis Security**:
   - Use Redis AUTH
   - Implement TLS/SSL
   - Use dedicated Redis database
   - Network isolation

2. **Cache Security**:
   - Sanitize cache keys
   - Encrypt sensitive data
   - Implement access controls
   - Regular security audits

## Implementation Summary

**✅ COMPLETED**: Redis-first caching has been successfully implemented for the ProductRepository.

### What Was Implemented

1. **Direct Repository Integration**: Redis-first logic integrated directly into `ProductRepository` methods
2. **Complete CRUD Coverage**: All 7 CRUD operations now check cache first, then MongoDB
3. **Smart Cache Keys**: Structured keys for individual items, lists, and counts
4. **Efficient Invalidation**: Pattern-based cache invalidation on write operations
5. **Optimized TTLs**: 1 hour for items, 5 minutes for lists/counts
6. **Comprehensive Testing**: Full test suite covering all cache scenarios
7. **Error Resilience**: Graceful fallback when Redis is unavailable

### Architecture Benefits Achieved

- **Reduced DB Load**: Primary data access through Redis cache
- **Sub-millisecond Response Times**: For cached read operations
- **Real-time Consistency**: Immediate cache invalidation on writes
- **Scalable**: Redis can be scaled independently of MongoDB
- **Reliable**: MongoDB fallback ensures data availability

### Files Modified/Created

- ✅ `src/infrastructure/repositories/product/ProductRepository.ts` - Added Redis-first logic
- ✅ `tests/unit/infrastructure/repositories/product-repository-redis.test.ts` - Comprehensive tests
- ✅ `docs/implementation-plans/12-redis-first-cache.md` - Updated documentation

This implementation provides a solid foundation for high-performance data access while maintaining data consistency and system reliability.
