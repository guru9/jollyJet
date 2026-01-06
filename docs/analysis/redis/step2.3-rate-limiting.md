# Step 2.3: Rate Limiting Service Analysis

## Overview

The Rate Limiting Service provides protection for the JollyJet API against abuse, spam, and denial-of-service attacks. It implements a **Sliding Window Log** algorithm using Redis Sorted Sets (`ZSET`), which offers high precision compared to simple fixed-window counters.

## Architectural Decisions

### 1. Sliding Window Algorithm (Sorted Sets)

We chose the Sliding Window Log algorithm implemented via Redis Sorted Sets because:

- **Precision**: It prevents "bursts" at window boundaries (unlike Fixed Window).
- **Flexibility**: Easily supports different window sizes and limits per client/endpoint.
- **Atomic Operations**: Uses Redis Pipelines to ensure efficiency and data integrity.

### 2. Implementation Strategy

- **Key Pattern**: `rate_limit:{key}` where key is typically an IP address or User ID.
- **Member Uniqueness**: Uses `timestamp-random` as members in the Sorted Set to ensure multiple requests at the exact same millisecond are all counted.
- **Score**: Uses the current timestamp (`Date.now()`) as the score for efficient range-based removal.

### 3. Pipeline efficiency

Each check performs 4 operations in a single round-trip:

1. `ZREMRANGEBYSCORE`: Remove entries outside the current window.
2. `ZADD`: Add the current request.
3. `ZCARD`: Count remaining entries in the window.
4. `EXPIRE`: Update TTL to ensure the key eventually cleans itself up.

## Implementation Details

### Interface (`IRateLimitingService`)

Located in `src/domain/interfaces/ratelimit/IRateLimitingService.ts`.

- `checkRateLimit(key, config)`: Main entry point for counting and checking.
- `resetRateLimit(key)`: Explicit cleanup if needed.
- `getRateLimitStatus(key)`: Read-only check (useful for headers without consuming a slot).

### Service (`RateLimitingService`)

Located in `src/infrastructure/services/ratelimit/RateLimitingService.ts`.

- Injected with `IRedisService` and `Logger`.
- Uses `REDIS_CONFIG.RATE_LIMIT` for default values.
- Implements `tsyringe` `@injectable()`.

## Metric Tracking

The service returns:

- `allowed`: Boolean status.
- `remaining`: Requests left in the window.
- `resetAt`: Estimated time when the window will fully reset.
- `totalRequests`: Current count in the window.

## Testing Strategy

- **Unit Tests**: Mocked Redis Pipeline to verify the logic of `ZADD/ZCARD` results.
- **Scenarios covered**:
  - Under limit success.
  - Exactly at limit handling.
  - Over limit blocking.
  - Custom window/limit configuration.
  - Pipeline failure resilience.
  - Status check without increment.

## Future Plans

- **Middleware Integration**: Create `rateLimiter` middleware to apply this service to Express routes.
- **Dynamic Configuration**: Support per-endpoint or per-tier limits (e.g., Premium vs. Basic users).
- **IP White-listing**: Bypassing rate limits for internal services.
