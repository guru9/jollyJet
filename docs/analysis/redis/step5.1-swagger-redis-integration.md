# Step 5.1 - Swagger Documentation with Redis

## Overview

This step integrates Redis caching documentation into the Swagger API documentation system. It provides comprehensive documentation for Redis cache management endpoints and enhances existing API endpoints with Redis caching information.

## Key Components

### 1. Redis Cache Management Endpoints

#### Cache Statistics Endpoint

```typescript
// GET /api/cache/stats
/**
 * Get Redis cache statistics
 *
 * @openapi
 * /api/cache/stats:
 *   get:
 *     tags: [Cache Management]
 *     summary: Get Redis cache statistics
 *     description: Retrieve comprehensive statistics about Redis cache performance
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CacheStatisticsResponse'
 *       500:
 *         description: Error retrieving cache statistics
 */
```

#### Cache Key Check Endpoint

```typescript
// GET /api/cache/check
/**
 * Check if a specific key exists in cache
 *
 * @openapi
 * /api/cache/check:
 *   get:
 *     tags: [Cache Management]
 *     summary: Check if key exists in cache
 *     description: Check if a specific key exists in Redis cache
 *     parameters:
 *       - in: query
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Cache key to check
 *     responses:
 *       200:
 *         description: Cache key status
 *       400:
 *         description: Missing key parameter
 */
```

#### Cache Invalidation Endpoint

```typescript
// DELETE /api/cache/invalidate
/**
 * Invalidate cache by key pattern
 *
 * @openapi
 * /api/cache/invalidate:
 *   delete:
 *     tags: [Cache Management]
 *     summary: Invalidate cache by pattern
 *     description: Remove cache entries matching a specific pattern
 *     parameters:
 *       - in: query
 *         name: pattern
 *         required: true
 *         schema:
 *           type: string
 *         description: Cache key pattern to invalidate (supports wildcards)
 *     responses:
 *       200:
 *         description: Cache invalidation result
 *       400:
 *         description: Missing pattern parameter
 */
```

#### Cache Status Endpoint

```typescript
// GET /api/cache/status
/**
 * Get Redis connection status
 *
 * @openapi
 * /api/cache/status:
 *   get:
 *     tags: [Cache Management]
 *     summary: Get Redis connection status
 *     description: Check if Redis connection is active and healthy
 *     responses:
 *       200:
 *         description: Redis connection status
 */
```

### 2. Swagger Configuration Updates

#### Redis Schemas

```typescript
// CacheInfo Schema
CacheInfo: {
  type: 'object',
  properties: {
    cacheStatus: {
      type: 'string',
      description: 'Cache status (hit/miss)',
      enum: ['hit', 'miss', 'bypass'],
      example: 'hit',
    },
    cacheKey: {
      type: 'string',
      description: 'Redis cache key used',
      example: 'products:page:1:limit:10',
    },
    ttl: {
      type: 'integer',
      description: 'Time-to-live in seconds',
      example: 86400,
    },
    cachedAt: {
      type: 'string',
      format: 'date-time',
      description: 'When the cache was created',
      example: '2023-12-01T10:00:00.000Z',
    },
  },
}

// CacheStatistics Schema
CacheStatistics: {
  type: 'object',
  properties: {
    hitRate: {
      type: 'number',
      description: 'Cache hit rate percentage',
      minimum: 0,
      maximum: 100,
      example: 95.5,
    },
    totalRequests: {
      type: 'integer',
      description: 'Total number of cache requests',
      minimum: 0,
      example: 1000,
    },
    cacheHits: {
      type: 'integer',
      description: 'Number of cache hits',
      minimum: 0,
      example: 955,
    },
    cacheMisses: {
      type: 'integer',
      description: 'Number of cache misses',
      minimum: 0,
      example: 45,
    },
    memoryUsage: {
      type: 'string',
      description: 'Redis memory usage',
      example: '10.5 MB',
    },
  },
}
```

#### Redis Responses

```typescript
// CacheResponse
CacheResponse: {
  description: 'Cached response with cache metadata',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'success',
          },
          data: {
            type: 'object',
            description: 'The actual response data',
          },
          cacheInfo: {
            $ref: '#/components/schemas/CacheInfo',
          },
        },
      },
    },
  },
}

// CacheStatisticsResponse
CacheStatisticsResponse: {
  description: 'Redis cache statistics',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'success',
          },
          data: {
            $ref: '#/components/schemas/CacheStatistics',
          },
        },
      },
    },
  },
}
```

### 3. Enhanced Product Endpoints with Redis Documentation

#### Products List Endpoint (Cached)

```typescript
/**
 * Get all products with optional filtering
 * Uses Redis cache middleware with background refresh for improved performance.
 * Caches results based on query parameters (page, limit, category, etc.)
 *
 * Caching Configuration:
 * - TTL: REDIS_CONFIG.TTL.PRODUCT (Standard 24-hour duration)
 * - Background Refresh: Enabled to update cache in background on hit
 * - Consistency Check: Enabled to detect potentially stale data
 *
 * @openapi
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products with optional filtering
 *     description: Retrieve paginated list of products with Redis caching for optimal performance
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CacheResponse'
 */
```

#### Product Count Endpoint (Cached)

```typescript
/**
 * Count products with optional filtering
 * Useful for pagination totals without fetching full data.
 *
 * Caching Configuration:
 * - TTL: REDIS_CONFIG.TTL.SHORT (Short-lived 1-hour duration)
 * - Background Refresh: Enabled to keeping count accurate in background
 *
 * @openapi
 * /api/products/count:
 *   get:
 *     tags: [Products]
 *     summary: Count products with optional filtering
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CacheResponse'
 */
```

## Implementation Details

### Files Modified/Created

1. **src/config/swagger.ts** - Enhanced with Redis schemas and responses
2. **src/interface/controllers/redis/RedisController.ts** - New Redis controller
3. **src/interface/routes/redis/redisRoutes.ts** - New Redis routes
4. **src/interface/routes/product/productRoutes.ts** - Enhanced with Redis documentation
5. **src/interface/controllers/index.ts** - Updated exports
6. **src/interface/routes/index.ts** - Updated route registry

### Redis Controller Implementation

```typescript
import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IRedisService } from '@/domain/interfaces/redis/IRedisService';
import { DI_TOKENS } from '@/shared/constants';
import { Logger } from '@/shared/logger';

@injectable()
export class RedisController {
  constructor(
    @inject(DI_TOKENS.REDIS_SERVICE) private redisService: IRedisService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger
  ) {}

  public async getCacheStats(req: Request, res: Response): Promise<void> {
    // Implementation for getting cache statistics
  }

  public async checkCacheKey(req: Request, res: Response): Promise<void> {
    // Implementation for checking cache keys
  }

  public async invalidateCache(req: Request, res: Response): Promise<void> {
    // Implementation for cache invalidation
  }

  public async getCacheStatus(req: Request, res: Response): Promise<void> {
    // Implementation for getting cache status
  }
}
```

### Redis Routes Implementation

```typescript
import { RedisController } from '@/interface/controllers';
import { Router } from 'express';
import { container } from 'tsyringe';

const createRedisRoutes = (): Router => {
  const router = Router();
  const redisController = container.resolve(RedisController);

  router.get('/stats', redisController.getCacheStats.bind(redisController));
  router.get('/check', redisController.checkCacheKey.bind(redisController));
  router.delete('/invalidate', redisController.invalidateCache.bind(redisController));
  router.get('/status', redisController.getCacheStatus.bind(redisController));

  return router;
};
```

## Benefits

1. **Comprehensive API Documentation**: All Redis-related endpoints are now fully documented in Swagger
2. **Cache Transparency**: API consumers can see which endpoints use caching and understand cache behavior
3. **Administrative Access**: Cache management endpoints allow monitoring and control of Redis cache
4. **Better Developer Experience**: Clear documentation of caching strategies and TTL values
5. **Performance Insights**: Cache statistics endpoint provides visibility into cache effectiveness

## Usage Examples

### Checking Cache Statistics

```bash
curl http://localhost:3000/api/cache/stats
```

### Checking Specific Cache Key

```bash
curl "http://localhost:3000/api/cache/check?key=products:page:1"
```

### Invalidating Cache by Pattern

```bash
curl -X DELETE "http://localhost:3000/api/cache/invalidate?pattern=products:*"
```

### Checking Cache Status

```bash
curl http://localhost:3000/api/cache/status
```

## Integration with Existing System

The Redis Swagger documentation integrates seamlessly with the existing Swagger setup:

1. **Unified Documentation**: All Redis endpoints appear alongside existing API endpoints
2. **Consistent Style**: Follows the same documentation patterns as other endpoints
3. **Automatic Discovery**: Swagger UI automatically discovers and displays Redis endpoints
4. **Interactive Testing**: All Redis endpoints can be tested directly from Swagger UI

## Testing

To test the Swagger Redis integration:

1. Start the application: `npm run dev`
2. Open Swagger UI: `http://localhost:3000/api-docs`
3. Verify the "Cache Management" tag appears with all Redis endpoints
4. Test each endpoint using the "Try it out" feature
5. Check that cached product endpoints show cache information in responses

## Conclusion

This implementation provides comprehensive Swagger documentation for Redis caching functionality, making the caching system transparent and accessible to API consumers while providing administrative tools for cache management and monitoring.
