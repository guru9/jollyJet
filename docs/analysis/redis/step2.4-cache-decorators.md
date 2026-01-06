# Step 2.4: Cache Decorators Analysis

## Overview

Cache Decorators provide a declarative way to implement caching without polluting business logic with cache-specific code. They leverage TypeScript's decorator metadata and the tsyringe DI container to interact with Redis and the Consistency Service.

## Architectural Decisions

### 1. Declarative Approach

By using `@Cacheable` and `@CacheEvict`, we shift the responsibility of caching from the method body to its signature. This adheres to the **Open/Closed Principle** and keeps Use Cases focused purely on business logic.

### 2. Dependency Injection in Decorators

Since decorators are instantiated before the class instances and are not easily compatible with constructor injection, we use `container.resolve()` from `tsyringe` to fetch:

- `IRedisService`: For raw cache operations.
- `CacheConsistencyService`: For tracking metrics and freshness logic.
- `Logger`: For structured logging.

### 3. Consistency Features

- **Stampede Protection**: Implemented via distributed locks (`acquireLock`). If multiple requests hit a cold cache simultaneously, only one fetches from the DB while others wait and retry.
- **Background Refresh**: If a read detect "stale" data (near expiration), it serves the stale data immediately (for performance) and triggers an asynchronous `refreshAhead` to update Redis.
- **Trackable Metrics**: Hit/Miss/Stale tracking are automatically called, feeding the `CacheConsistencyService` real-time data.

## Implementation Details

### `@Cacheable(options)`

- **Key Generation**: Uses `ClassName:MethodName:JSON.stringify(args)` as the default key. Can be overridden with `keyPrefix`.
- **Fail-Open**: If Redis fails, the decorator logs the error and executes the original method directly, ensuring the application remains functional.
- **Double-Check Lock**: After acquiring a stampede lock, it re-checks the cache in case another worker just filled it.

### `@CacheEvict(pattern)`

- **Execution Order**: Executes the original method first (ensuring success) and then invalidates the cache.
- **Dynamic Patterns**: Supports both string patterns and functions that generate patterns based on method arguments (e.g., `(id) => product:${id}`).

## Testing Strategy

Tests will verify:

1. Cache lookups and subsequent hits.
2. TTL enforcement.
3. Lock acquisition when two decorators call the same key simultaneously.
4. Correct invalidation of multiple keys during eviction.

## Future Plans

- **Tiered Caching**: Integration with local LRU memory cache before hitting Redis.
- **Metadata Storage**: Storing extra metadata (like compression status) in the cache key.
