# Step 2.1: Event Handler Base Class - Analysis

## Overview

This document provides detailed analysis for implementing the Event Handler base class, which provides common functionality for all event handlers including retry logic, error handling, and structured logging.

## Dependencies

- **Depends on:**
  - Step 1.1: Event Definitions and Types (uses event types)
  - Step 1.5: Subscriber Service Implementation (receives events from subscriber)
- **Required by:**
  - Step 2.2: Product Event Handlers
  - Step 2.3: Audit Event Handler
  - Step 3.1: DI Container Registration
  - Step 3.2: Application Bootstrap

## Current State Analysis

### What Exists

- ✅ [`AppEvent`](../../src/domain/events/index.ts:86) union type for type-safe events
- ✅ [`BaseEvent`](../../src/domain/events/index.ts:9) interface with common fields
- ✅ [`PUBSUB_MESSAGES`](../../src/shared/constants.ts:497) constants for logging
- ✅ [`Logger`](../../src/shared/logger.ts) for structured logging

### What Needs to Be Created

- [`EventHandler<T>`](../../src/domain/services/events/EventHandler.ts) abstract base class

## Implementation Requirements

### 1. Generic Type Support

The base class should be generic to support different event types:

```typescript
abstract class EventHandler<T extends BaseEvent> {
  abstract handle(event: T): Promise<void>;
}
```

### 2. Retry Logic

Implement configurable retry logic with exponential backoff:

```typescript
protected async executeWithRetry(
  operation: () => Promise<void>,
  eventId: string,
  maxRetries: number = 3
): Promise<void> {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await operation();
      return;
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      await delay(Math.pow(2, attempt) * 1000);
    }
  }
}
```

### 3. Error Handling Strategy

| Error Type       | Handling                       |
| ---------------- | ------------------------------ |
| Transient Error  | Retry with exponential backoff |
| Permanent Error  | Log and move to DLQ            |
| Validation Error | Log and skip                   |

### 4. Logging Requirements

- Event received logging
- Retry attempt logging
- Success/failure logging
- Error details with context

## Code Structure

### Abstract Class Definition

```typescript
@injectable()
export abstract class EventHandler<T extends BaseEvent> {
  protected abstract readonly maxRetries: number;

  constructor(@inject(DI_TOKENS.LOGGER) protected logger: Logger) {}

  abstract handle(event: T): Promise<void>;

  protected async executeWithRetry(operation: () => Promise<void>, eventId: string): Promise<void> {
    // Implementation
  }

  protected logEventReceived(event: T): void {
    // Implementation
  }

  protected logEventSuccess(event: T): void {
    // Implementation
  }

  protected logEventError(event: T, error: Error): void {
    // Implementation
  }
}
```

## Usage Pattern

### Extending the Base Class

```typescript
@injectable()
export class ProductCreatedHandler extends EventHandler<ProductCreatedEvent> {
  protected readonly maxRetries = 3;

  async handle(event: ProductCreatedEvent): Promise<void> {
    this.logEventReceived(event);

    await this.executeWithRetry(async () => {
      // Business logic here
      await sendNotification(event.payload.productId);
    }, event.eventId);

    this.logEventSuccess(event);
  }
}
```

## Testing Considerations

### Unit Tests

1. Test retry logic with successful retry
2. Test retry exhaustion
3. Test error logging
4. Test success logging

### Integration Tests

1. Test with actual event processing
2. Test error recovery

## Dependencies

- `tsyringe` - Dependency injection
- `pino` - Logging (via Logger)

## Next Steps

After implementing EventHandler base class:

1. Create Product Event Handlers (Step 2.2)
2. Create Audit Event Handler (Step 2.3)
3. Register all handlers in DI container (Step 3.1)

## References

- [Implementation Plan](../../implementation-plans/14-pubsub-implementation-plan.md)
- [Task File](../../tasks/06-pubsub-task.md)
