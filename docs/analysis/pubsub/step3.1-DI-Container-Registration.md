# Step 3.1: DI Container Registration - Analysis

## Overview

This document provides detailed analysis for registering all Pub/Sub services and handlers in the DI container.

## Dependencies

- **Depends on:**
  - Step 1.2: Publisher Service Interface (registers IPublisherService)
  - Step 1.3: Subscriber Service Interface (registers ISubscriberService)
  - Step 1.4: Publisher Service Implementation (registers PublisherService)
  - Step 1.5: Subscriber Service Implementation (registers SubscriberService)
  - Step 2.1: Event Handler Base Class (registers handlers)
  - Step 2.2: Product Event Handlers (registers ProductCreatedHandler, ProductUpdatedHandler, ProductDeletedHandler)
  - Step 2.3: Audit Event Handler (registers AuditEventHandler)
- **Required by:**
  - Step 3.2: Application Bootstrap (resolves services from DI container)
  - Step 3.3: Product Use Case Integration (resolves PublisherService)

## Current State Analysis

### What Exists

- ✅ [`di-container.ts`](../../src/config/di-container.ts) with existing registrations
- ✅ [`DI_TOKENS`](../../src/shared/constants.ts:281) constants
- ✅ [`PublisherService`](../../src/domain/services/redis/PublisherService.ts)
- ✅ [`SubscriberService`](../../src/domain/services/redis/SubscriberService.ts)
- ✅ [`ProductCreatedHandler`](../../src/domain/services/events/ProductEventHandlers.ts), [`ProductUpdatedHandler`](../../src/domain/services/events/ProductEventHandlers.ts), [`ProductDeletedHandler`](../../src/domain/services/events/ProductEventHandlers.ts)
- ✅ [`AuditEventHandler`](../../src/domain/services/events/AuditEventHandler.ts)

### What Needs to Be Updated

- Add new DI tokens for Pub/Sub services
- Register all services and handlers in DI container

## Implementation Requirements

### 1. New DI Tokens

Add to [`DI_TOKENS`](../../src/shared/constants.ts:281):

```typescript
export const DI_TOKENS = {
  // ... existing tokens
  PUBLISHER_SERVICE: 'PublisherService',
  SUBSCRIBER_SERVICE: 'SubscriberService',
  PRODUCT_CREATED_HANDLER: 'ProductCreatedHandler',
  PRODUCT_UPDATED_HANDLER: 'ProductUpdatedHandler',
  PRODUCT_DELETED_HANDLER: 'ProductDeletedHandler',
  AUDIT_EVENT_HANDLER: 'AuditEventHandler',
} as const;
```

### 2. Service Registrations

Register in [`di-container.ts`](../../src/config/di-container.ts):

```typescript
// Pub/Sub Services
container.registerSingleton<IPublisherService>(DI_TOKENS.PUBLISHER_SERVICE, PublisherService);

container.registerSingleton<ISubscriberService>(DI_TOKENS.SUBSCRIBER_SERVICE, SubscriberService);

// Event Handlers
container.registerSingleton(DI_TOKENS.PRODUCT_CREATED_HANDLER, ProductCreatedHandler);

container.registerSingleton(DI_TOKENS.PRODUCT_UPDATED_HANDLER, ProductUpdatedHandler);

container.registerSingleton(DI_TOKENS.PRODUCT_DELETED_HANDLER, ProductDeletedHandler);

container.registerSingleton(DI_TOKENS.AUDIT_EVENT_HANDLER, AuditEventHandler);
```

## Registration Strategy

| Service/Handler   | Lifetime  | Reason                                           |
| ----------------- | --------- | ------------------------------------------------ |
| PublisherService  | Singleton | Single Redis client, shared across app           |
| SubscriberService | Singleton | Single subscription client, manages all handlers |
| Product\*Handler  | Singleton | Stateless, can be reused                         |
| AuditEventHandler | Singleton | Stateless, can be reused                         |

## Dependencies

- `tsyringe` - DI container
- All service/handler classes

## Next Steps

After DI registration:

1. Bootstrap application with subscribers (Step 3.2)
2. Integrate event publishing in use cases (Step 3.3)

## References

- [Implementation Plan](../../implementation-plans/14-pubsub-implementation-plan.md)
- [Task File](../../tasks/06-pubsub-task.md)
