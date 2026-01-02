# Redis Integration Task

**Task:** 03-redis-task  
**Related Plan:** [09-redis-implementation-plan](../implementation-plans/09-redis-implementation-plan.md)  
**Branch:** `feature/jollyjet-09-redis-integration`  
**Status:** 🚧 **In Progress (20%)**

---

## Overview

Implement a comprehensive Redis integration for JollyJet, covering caching, session management, rate limiting, and consistency monitoring. The implementation follows Clean Architecture and includes "nuclear" invalidation strategies for robust data consistency.

---

## Implementation Checklist

### 🟢 Phase 1: Foundation Setup

- ✅ **Step 1.1: Add Redis Configuration to Shared Layer (no dependencies)**
  - Update `src/shared/constants.ts` with `REDIS_CONFIG`, `REDIS_KEYS`,`CACHE_OPERATIONS`,`CACHE_LOG_MESSAGES`, etc.
- ❌ **Step 1.2: Create Redis Service Interface (no dependencies)**
  - Create `src/domain/interfaces/IRedisService.ts` defining `get`, `set`, `delete`, `acquireLock`, etc.
- ❌ **Step 1.3: Implement Redis Service (dependencies step 1.1, 1.2)**
  - Create `src/infrastructure/services/RedisService.ts` using `redis` client.
  - Implement connection handling, graceful error handling, and distributed locking.

### 🟡 Phase 2: Interface Layer & Decorators

- ❌ **Step 2.1: Create Cache Decorators (dependencies step 1.2)**
  - Create `src/shared/decorators/cache.decorator.ts` with `@Cacheable` and `@CacheEvict`.
  - Implement consistency checks and stampede protection in decorators.
- ❌ **Step 2.2: Add Redis Cache Middleware (dependencies step 1.2)**
  - Create `src/interface/middlewares/redisCache.ts` for response caching.
- ❌ **Step 2.3: Integrate Redis with Product Use Cases (dependencies step 1.3, 2.1, 2.2)**
  - `CreateProductUseCase`: Write-through + List Invalidation.
  - `GetProductUseCase`: Cache-aside + Consistency Check.
  - `ListProductsUseCase`: Query-based caching.
  - `UpdateProductUseCase`: Invalidate specific + related lists.
  - `DeleteProductUseCase`: Complete cleanup.
  - `ToggleWishlistProductUseCase`: Smart invalidation.

### 🟠 Phase 3: Advanced Features

- ❌ **Step 3.1: Implement Session Management (dependencies step 1.3)**
  - Create `src/infrastructure/services/SessionService.ts`.
- ❌ **Step 3.2: Add Rate Limiting Middleware (dependencies step 1.3)**
  - Create `src/interface/middlewares/rateLimiter.ts`.
- ❌ **Step 3.3: Create Rate Limiting Service (dependencies step 1.3)**
  - Create `src/infrastructure/services/RateLimitingService.ts` (if logic separation is needed).

### 🔵 Phase 4: Consistency & Monitoring

- ❌ **Step 4.1: Create Cache Consistency Service (dependencies step 1.3)**
  - Create `src/infrastructure/services/CacheConsistencyService.ts`.
  - Implement metrics (hit/miss), staleness checks, and background refresh.
- ❌ **Step 4.2: Update DI Container (dependencies step 1.3, 3.1, 3.3, 4.1)**
  - Register `RedisService`, `SessionService`, `CacheConsistencyService` in `src/config/di-container.ts`.
- ❌ **Step 4.3: Update Application Wiring (dependencies step 2.2, 3.2, 4.2)**
  - Apply middleware in `src/app.ts`.

### 🟣 Phase 5: Documentation & Verification

- ❌ **Step 5.1: Update Swagger Documentation (dependencies step 4.3)**
  - Document Redis-related headers and behavior in `src/config/swagger.ts`.
- ❌ **Step 5.2: Create Redis Integration Tests (dependencies step 2.3, 4.1)**
  - Unit tests for Services.
  - Integration tests for middleware and flow.
- ❌ **Step 5.3: Create Verification Scripts (dependencies step 4.3)**
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
| Foundation   | 3      | 1         | 🚧 Partial |
| Interface    | 3      | 0         | ❌ Pending |
| Advanced     | 3      | 0         | ❌ Pending |
| Consistency  | 3      | 0         | ❌ Pending |
| Verification | 3      | 0         | ❌ Pending |
| **Total**    | **15** | **1**     | **7%**     |
