# Step 3.1: Redis Cache Middleware Analysis

## Overview

The Redis Cache Middleware provides intelligent caching for Express.js routes using Redis. This middleware intercepts GET requests and attempts to serve cached responses, falling back to the next middleware if the cache is unavailable or stale. It integrates seamlessly with the existing Redis service and Cache Consistency Service to provide robust caching capabilities.

## Architectural Decisions

### 1. Middleware-Based Caching

By implementing caching as Express middleware, we centralize cache logic at the route level without modifying individual controllers or use cases. This approach:

- Keeps business logic clean and focused
- Allows for easy enablement/disablement per route
- Provides a consistent caching strategy across the application

### 2. Dependency Injection Integration

```typescript
// Resolve dependencies from DI container
const redisService = container.resolve<IRedisService>(DI_TOKENS.REDIS_SERVICE);
const cacheConsistencyService = container.resolve(CacheConsistencyService);
const logger = container.resolve(DI_TOKENS.LOGGER) as any;
```

The middleware resolves dependencies from the tsyringe DI container:

- `IRedisService`: For core cache operations (get/set)
- `CacheConsistencyService`: For metrics tracking and stale data detection
- `Logger`: For structured logging of cache events

This ensures loose coupling and testability.

### 3. Response Interception

Instead of caching at the controller level, the middleware overrides `res.json` to automatically cache successful (200) responses. This:

- Requires no changes to existing route handlers
- Ensures only successful responses are cached
- Provides transparent caching behavior

### 4. Fail-Open Strategy

Cache failures (Redis connection issues, parsing errors) are logged but don't interrupt the request flow. The middleware continues to `next()`, ensuring the application remains functional even if caching is unavailable.

## Implementation Details

### Middleware Function Signature

```typescript
export const redisCacheHandler = (
  ttl?: number, // Time-to-live for cached responses in seconds (optional)
  options?: {
    consistencyCheck?: boolean; // Enable consistency check
    stampedeProtection?: boolean; // Enable stampede protection
    backgroundRefresh?: boolean; // Enable background refresh
  }
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Implementation
  };
};
```

### Cache Key Generation

```typescript
// Generate cache key based on request method and URL
const cacheKey = CACHE_KEYS_PATTERNS.PRODUCT_LIST(`${req.method}:${req.originalUrl}`);
```

- Uses `CACHE_KEYS_PATTERNS.PRODUCT_LIST` with `${req.method}:${req.originalUrl}` as the key
- Currently hardcoded for product routes but designed to be extensible

### GET-Only Caching

- Only caches GET requests to avoid caching mutations
- Non-GET requests bypass the middleware entirely

### Cache Hit Handling

```typescript
// Attempt to retrieve cached response from Redis
const cachedResponse = await redisService.get(cacheKey);
if (cachedResponse) {
  // Cache hit - log and track metrics
  logger.info(CACHE_LOG_MESSAGES.CACHE_HIT, { key: cacheKey });
  cacheConsistencyService.trackCacheHit();

  // Return cached response directly
  return res.status(200).json(JSON.parse(cachedResponse));
}
```

- Parses and returns cached JSON response directly
- Tracks cache hits via `CacheConsistencyService`
- Optional consistency check for stale data detection
- Background refresh for stale data if enabled

### Cache Miss Handling

```typescript
// Cache miss - track metrics and prepare for caching
cacheConsistencyService.trackCacheMiss();
logger.info(CACHE_LOG_MESSAGES.CACHE_MISS, { key: cacheKey, source: 'database' });

// Override res.json to cache the response
const originalJson = res.json;
res.json = (body: any) => {
  if (res.statusCode === 200) {
    redisService.set(cacheKey, JSON.stringify(body), ttl || Number(REDIS_CONFIG.TTL.DEFAULT));
  }
  return originalJson.call(res, body);
};

next();
```

- Tracks cache misses
- Overrides `res.json` to cache the response after the next middleware completes
- Only caches 200 status responses

### Consistency Features

- **Stale Data Detection**: Checks if cached data is stale using `CacheConsistencyService`
- **Background Refresh**: Triggers asynchronous cache refresh for stale data
- **Metrics Tracking**: Tracks hits, misses, and stale reads

### Error Handling

```typescript
} catch (error) {
  // Log cache middleware errors and continue with request processing
  logger.error(CACHE_LOG_MESSAGES.CACHE_OPERATION_FAILED, {
    operation: 'CACHE_MIDDLEWARE',
    key: cacheKey,
    error: error instanceof Error ? error.message : String(error),
  });
  next();
}
```

- Catches all cache-related errors
- Logs detailed error information
- Continues request processing without caching

## Testing Strategy

Tests will verify:

1. Cache hits return cached responses without calling next middleware
2. Cache misses proceed to next middleware and cache the response
3. Only GET requests are cached
4. TTL is respected for cached responses
5. Consistency checks detect and handle stale data
6. Background refresh is triggered for stale data
7. Error scenarios don't break request flow
8. Proper metrics tracking for hits/misses/stale reads

## Usage Example

```typescript
// Apply caching to product routes with 5-minute TTL
app.get(
  '/api/products',
  redisCacheHandler(300, { consistencyCheck: true, backgroundRefresh: true }),
  productController.listProducts
);

// Apply caching to individual product route
app.get(
  '/api/products/:id',
  redisCacheHandler(600), // 10-minute TTL
  productController.getProduct
);
```

## Future Plans

- **Configurable Key Generation**: Support for custom key generation functions
- **Route-Specific Options**: Per-route caching configurations
- **Cache Compression**: Automatic compression for large responses
- **Cache Warming**: Proactive cache population for frequently accessed routes
- **Integration with Cache Decorators**: Unified caching strategy across middleware and decorators
