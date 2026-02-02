# Step 3.2: Application Bootstrap - Analysis

## Overview

This document provides detailed analysis for bootstrapping the Pub/Sub system in the application startup sequence.

## Dependencies

- **Depends on:**
  - Step 1.3: Subscriber Service Interface (uses ISubscriberService)
  - Step 1.5: Subscriber Service Implementation (initializes subscriber)
  - Step 2.1: Event Handler Base Class (uses handlers)
  - Step 2.2: Product Event Handlers (uses ProductCreatedHandler, ProductUpdatedHandler, ProductDeletedHandler)
  - Step 2.3: Audit Event Handler (uses AuditEventHandler)
  - Step 3.1: DI Container Registration (resolves services from DI container)
- **Required by:**
  - None (Final integration step)

## Current State Analysis

### What Exists

- ✅ [`SubscriberService`](../../src/domain/services/redis/SubscriberService.ts) with `initialize()` method
- ✅ [`ProductCreatedHandler`](../../src/domain/services/events/ProductEventHandlers.ts), [`ProductUpdatedHandler`](../../src/domain/services/events/ProductEventHandlers.ts), [`ProductDeletedHandler`](../../src/domain/services/events/ProductEventHandlers.ts)
- ✅ [`AuditEventHandler`](../../src/domain/services/events/AuditEventHandler.ts)
- ✅ [`PUBSUB_CHANNELS`](../../src/shared/constants.ts:573) constants
- ✅ [`PUBSUB_EVENT_TYPES`](../../src/shared/constants.ts:609) constants
- ✅ [`AppEvent`](../../src/domain/events/index.ts:86) union type
- ✅ DI container registrations

### What Needs to Be Created

- Application bootstrap logic in [`app.ts`](../../src/app.ts)
- Event routing function
- Channel subscription setup

## Implementation Requirements

### 1. Bootstrap Sequence

```typescript
// In app.ts after server starts
async function bootstrapPubSub(): Promise<void> {
  // 1. Resolve subscriber service
  const subscriberService = container.resolve<ISubscriberService>(DI_TOKENS.SUBSCRIBER_SERVICE);

  // 2. Initialize subscriber (create Redis client)
  await subscriberService.initialize();

  // 3. Resolve handlers
  const productCreatedHandler = container.resolve<ProductCreatedHandler>(
    DI_TOKENS.PRODUCT_CREATED_HANDLER
  );
  const productUpdatedHandler = container.resolve<ProductUpdatedHandler>(
    DI_TOKENS.PRODUCT_UPDATED_HANDLER
  );
  const productDeletedHandler = container.resolve<ProductDeletedHandler>(
    DI_TOKENS.PRODUCT_DELETED_HANDLER
  );
  const auditEventHandler = container.resolve<AuditEventHandler>(DI_TOKENS.AUDIT_EVENT_HANDLER);

  // 4. Subscribe to channels with routing
  subscriberService.subscribe(PUBSUB_CHANNELS.PRODUCT, (event: AppEvent) => {
    routeProductEvent(event, {
      productCreatedHandler,
      productUpdatedHandler,
      productDeletedHandler,
    });
  });

  subscriberService.subscribe(PUBSUB_CHANNELS.AUDIT, (event: AppEvent) => {
    auditEventHandler.handle(event as UserActivityEvent);
  });
}
```

### 2. Event Routing Function

```typescript
function routeProductEvent(
  event: AppEvent,
  handlers: {
    productCreatedHandler: ProductCreatedHandler;
    productUpdatedHandler: ProductUpdatedHandler;
    productDeletedHandler: ProductDeletedHandler;
  }
): void {
  switch (event.eventType) {
    case PUBSUB_EVENT_TYPES.PRODUCT_CREATED:
      handlers.productCreatedHandler.handle(event as ProductCreatedEvent);
      break;
    case PUBSUB_EVENT_TYPES.PRODUCT_UPDATED:
      handlers.productUpdatedHandler.handle(event as ProductUpdatedEvent);
      break;
    case PUBSUB_EVENT_TYPES.PRODUCT_DELETED:
      handlers.productDeletedHandler.handle(event as ProductDeletedEvent);
      break;
    default:
      logger.warn(`Unknown event type: ${event.eventType}`);
  }
}
```

### 3. Error Handling

- Log bootstrap errors
- Continue server startup even if Pub/Sub fails (graceful degradation)
- Retry subscription on failure

### 4. Shutdown Handling

```typescript
process.on('SIGTERM', async () => {
  await subscriberService.disconnect();
  process.exit(0);
});
```

## Code Structure

### app.ts Modifications

```typescript
// After server starts listening
server.listen(port, async () => {
  logger.info(SERVER_LOG_MESSAGES.LISTENING(port));

  // Initialize Pub/Sub
  try {
    await bootstrapPubSub();
    logger.info('Pub/Sub system initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Pub/Sub system', error);
    // Continue - Pub/Sub is not critical for basic operation
  }
});
```

## Testing Considerations

### Integration Tests

1. Test bootstrap sequence
2. Test event routing
3. Test handler invocation
4. Test error scenarios

## Dependencies

- `tsyringe` - DI container
- All Pub/Sub services and handlers

## Next Steps

After application bootstrap:

1. Integrate event publishing in use cases (Step 3.3)
2. Test end-to-end flow

## References

- [Implementation Plan](../../implementation-plans/14-pubsub-implementation-plan.md)
- [Task File](../../tasks/06-pubsub-task.md)
