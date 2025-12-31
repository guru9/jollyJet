# Redis Integration Task

**Task:** 03-redis-task  
**Related Plan:** [09-redis-implementation-plan](../implementation-plans/09-redis-implementation-plan.md)  
**Branch:** `feature/jollyjet-09-redis-integration`  
**Status:** 🚧 **Pending**

---

## Overview

Implement a comprehensive Redis integration for JollyJet, covering caching, session management, rate limiting, and consistency monitoring. The implementation follows Clean Architecture and includes "nuclear" invalidation strategies for robust data consistency.

---

## Implementation Checklist

### 🟢 Phase 1: Foundation Setup

- ❌ **Step 1.1: Add Redis Configuration to Shared Layer**
  - Update `src/shared/constants.ts` with `REDIS_CONFIG`, `REDIS_KEYS`, `CACHE_LOG_MESSAGES`, etc.
- ❌ **Step 1.2: Create Redis Service Interface**
  - Create `src/domain/interfaces/IRedisService.ts` defining `get`, `set`, `delete`, `acquireLock`, etc.
- ❌ **Step 1.3: Implement Redis Service**
  - Create `src/infrastructure/services/RedisService.ts` using `redis` client.
  - Implement connection handling, graceful error handling, and distributed locking.

### 🟡 Phase 2: Interface Layer & Decorators

- ❌ **Step 2.1: Create Cache Decorators**
  - Create `src/shared/decorators/cache.decorator.ts` with `@Cacheable` and `@CacheEvict`.
  - Implement consistency checks and stampede protection in decorators.
- ❌ **Step 2.2: Add Redis Cache Middleware**
  - Create `src/interface/middlewares/redisCache.ts` for response caching.
- ❌ **Step 2.3: Integrate Redis with Product Use Cases**
  - `CreateProductUseCase`: Write-through + List Invalidation.
  - `GetProductUseCase`: Cache-aside + Consistency Check.
  - `ListProductsUseCase`: Query-based caching.
  - `UpdateProductUseCase`: Invalidate specific + related lists.
  - `DeleteProductUseCase`: Complete cleanup.
  - `ToggleWishlistProductUseCase`: Smart invalidation.

### 🟠 Phase 3: Advanced Features

- ❌ **Step 3.1: Implement Session Management**
  - Create `src/infrastructure/services/SessionService.ts`.
- ❌ **Step 3.2: Add Rate Limiting Middleware**
  - Create `src/interface/middlewares/rateLimiter.ts`.
- ❌ **Step 3.3: Create Rate Limiting Service**
  - Create `src/infrastructure/services/RateLimitingService.ts` (if logic separation is needed).

### 🔵 Phase 4: Consistency & Monitoring

- ❌ **Step 4.1: Create Cache Consistency Service**
  - Create `src/infrastructure/services/CacheConsistencyService.ts`.
  - Implement metrics (hit/miss), staleness checks, and background refresh.
- ❌ **Step 4.2: Update DI Container**
  - Register `RedisService`, `SessionService`, `CacheConsistencyService` in `src/config/di-container.ts`.
- ❌ **Step 4.3: Update Application Wiring**
  - Apply middleware in `src/app.ts`.

### 🟣 Phase 5: Documentation & Verification

- ❌ **Step 5.1: Update Swagger Documentation**
  - Document Redis-related headers and behavior in `src/config/swagger.ts`.
- ❌ **Step 5.2: Create Redis Integration Tests**
  - Unit tests for Services.
  - Integration tests for middleware and flow.
- ❌ **Step 5.3: Create Verification Scripts**
  - `scripts/verify-redis.sh`.

---

## Technical Considerations

### Cache Strategy Recap

- **Get/List**: Cache-Aside with TTL.
- **Create/Update/Delete**: Write-Through or Immediate Invalidation ("Delete-on-Write").
- **Lists**: "Nuclear" invalidation (delete all list keys) on any product modification to guarantee consistency.

### Key Commandments

1.  **Never Crash**: If Redis is down, log error and fall back to DB.
2.  **Strict Typing**: No `any`. Use interfaces.
3.  **Atomic Operations**: Use locks (`set NX EX`) for stampede protection.

---

## Progress Summary

| Phase        | Tasks  | Completed | Status     |
| :----------- | :----- | :-------- | :--------- |
| Foundation   | 3      | 0         | ❌ Pending |
| Interface    | 3      | 0         | ❌ Pending |
| Advanced     | 3      | 0         | ❌ Pending |
| Consistency  | 3      | 0         | ❌ Pending |
| Verification | 3      | 0         | ❌ Pending |
| **Total**    | **15** | **0**     | **0%**     |
