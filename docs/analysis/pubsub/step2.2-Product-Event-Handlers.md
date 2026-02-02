# Step 2.2: Product Event Handlers - Analysis

## Overview

This document provides detailed analysis for implementing Product Event Handlers that process product-related events (created, updated, deleted).

## Dependencies

- **Depends on:**
  - Step 1.1: Event Definitions and Types (uses ProductCreatedEvent, ProductUpdatedEvent, ProductDeletedEvent)
  - Step 2.1: Event Handler Base Class (extends base class for retry logic)
- **Required by:**
  - Step 3.1: DI Container Registration
  - Step 3.2: Application Bootstrap

## Current State Analysis

### What Exists

- ✅ [`EventHandler<T>`](../../src/domain/services/events/EventHandler.ts) base class with retry logic
- ✅ [`ProductCreatedEvent`](../../src/domain/events/index.ts:27), [`ProductUpdatedEvent`](../../src/domain/events/index.ts:45), [`ProductDeletedEvent`](../../src/domain/events/index.ts:59) interfaces
- ✅ [`PUBSUB_EVENT_TYPES`](../../src/shared/constants.ts:609) constants
- ✅ [`PUBSUB_CHANNELS`](../../src/shared/constants.ts:573) constants
- ✅ [`Logger`](../../src/shared/logger.ts) for structured logging

### What Needs to Be Created

- [`ProductCreatedHandler`](../../src/domain/services/events/ProductEventHandlers.ts) class
- [`ProductUpdatedHandler`](../../src/domain/services/events/ProductEventHandlers.ts) class
- [`ProductDeletedHandler`](../../src/domain/services/events/ProductEventHandlers.ts) class

## Implementation Requirements

### 1. Handler Responsibilities

| Handler               | Responsibilities                                             |
| --------------------- | ------------------------------------------------------------ |
| ProductCreatedHandler | Log creation, send notifications, update search index        |
| ProductUpdatedHandler | Log updates, invalidate caches, sync with external systems   |
| ProductDeletedHandler | Log deletion, cleanup related data, remove from search index |

### 2. Extensibility Points

Each handler should include TODO comments for future enhancements:

```typescript
// TODO: Send notification to interested users
// TODO: Update search index (Elasticsearch, Algolia)
// TODO: Trigger webhook notifications
// TODO: Update analytics/metrics
```

### 3. Error Handling

All handlers extend EventHandler, so they get:

- Automatic retry logic
- Error logging
- DLQ support

## Code Structure

### ProductCreatedHandler

```typescript
@injectable()
export class ProductCreatedHandler extends EventHandler<ProductCreatedEvent> {
  protected readonly maxRetries = 3;

  async handle(event: ProductCreatedEvent): Promise<void> {
    this.logEventReceived(event);

    await this.executeWithRetry(async () => {
      // Log product creation
      this.logger.info(
        {
          productId: event.payload.productId,
          name: event.payload.name,
          category: event.payload.category,
        },
        'Product created'
      );

      // TODO: Send notification to admin/moderators
      // TODO: Add to search index
      // TODO: Update product count metrics
    }, event.eventId);

    this.logEventSuccess(event);
  }
}
```

### ProductUpdatedHandler

```typescript
@injectable()
export class ProductUpdatedHandler extends EventHandler<ProductUpdatedEvent> {
  protected readonly maxRetries = 3;

  async handle(event: ProductUpdatedEvent): Promise<void> {
    this.logEventReceived(event);

    await this.executeWithRetry(async () => {
      // Log product update
      this.logger.info(
        {
          productId: event.payload.productId,
          changes: event.payload.changes,
        },
        'Product updated'
      );

      // TODO: Invalidate product cache
      // TODO: Update search index
      // TODO: Notify users who have this product in wishlist
    }, event.eventId);

    this.logEventSuccess(event);
  }
}
```

### ProductDeletedHandler

```typescript
@injectable()
export class ProductDeletedHandler extends EventHandler<ProductDeletedEvent> {
  protected readonly maxRetries = 3;

  async handle(event: ProductDeletedEvent): Promise<void> {
    this.logEventReceived(event);

    await this.executeWithRetry(async () => {
      // Log product deletion
      this.logger.info(
        {
          productId: event.payload.productId,
        },
        'Product deleted'
      );

      // TODO: Remove from search index
      // TODO: Invalidate product cache
      // TODO: Remove from user wishlists
      // TODO: Update product count metrics
    }, event.eventId);

    this.logEventSuccess(event);
  }
}
```

## Testing Considerations

### Unit Tests

1. Test each handler with valid events
2. Test error handling and retry logic
3. Test logging output

### Integration Tests

1. Test with actual event flow
2. Test handler registration with subscriber

## Dependencies

- `tsyringe` - Dependency injection
- `pino` - Logging (via Logger)

## Next Steps

After implementing Product Event Handlers:

1. Create Audit Event Handler (Step 2.3)
2. Register all handlers in DI container (Step 3.1)
3. Subscribe handlers to channels in app bootstrap (Step 3.2)

## References

- [Implementation Plan](../../implementation-plans/14-pubsub-implementation-plan.md)
- [Task File](../../tasks/06-pubsub-task.md)
