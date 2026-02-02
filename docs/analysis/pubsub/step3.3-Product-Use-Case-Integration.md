# Step 3.3: Product Use Case Integration

## Overview

This document details the integration of Pub/Sub event publishing into the product use cases (Create, Update, Delete). The integration follows the event-driven architecture pattern where use cases publish events after successful operations, enabling loose coupling between different parts of the system.

## Dependencies

- **Depends on:**
  - Step 1.1: Event Definitions and Types (uses ProductCreatedEvent, ProductUpdatedEvent, ProductDeletedEvent)
  - Step 1.2: Publisher Service Interface (uses IPublisherService)
  - Step 1.4: Publisher Service Implementation (uses PublisherService)
  - Step 3.1: DI Container Registration (resolves PublisherService from DI container)
- **Required by:**
  - None (Integration endpoint)

## Implementation Summary

### Modified Files

1. `src/usecases/product/CreateProductUseCase.ts`
2. `src/usecases/product/UpdateProductUseCase.ts`
3. `src/usecases/product/DeleteProductUseCase.ts`

### Key Changes

#### 1. CreateProductUseCase

**Added:**

- Import of `IPublisherService`, `PUBSUB_CHANNELS`, `PUBSUB_EVENT_TYPES`, `generateEventId`, `ProductCreatedEvent`
- `publisherService` dependency injection
- `publishProductCreatedEvent()` private method
- Event publishing call after successful product creation

**Event Flow:**

```typescript
// After product creation and cache invalidation
await this.publishProductCreatedEvent(createdProduct);
```

**Event Payload:**

```typescript
{
  eventId: generateEventId(),
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
  timestamp: new Date(),
  payload: {
    productId: props.id!,
    name: props.name,
    price: props.price,
    category: props.category,
  },
}
```

#### 2. UpdateProductUseCase

**Added:**

- Import of Pub/Sub dependencies
- `publisherService` dependency injection
- `publishProductUpdatedEvent()` private method
- Event publishing call after successful product update

**Event Flow:**

```typescript
// After product update and cache invalidation
await this.publishProductUpdatedEvent(productId, productData);
```

**Event Payload:**

```typescript
{
  eventId: generateEventId(),
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_UPDATED,
  timestamp: new Date(),
  payload: {
    productId,
    changes: { ...changes },
  },
}
```

#### 3. DeleteProductUseCase

**Added:**

- Import of Pub/Sub dependencies
- `publisherService` dependency injection
- `publishProductDeletedEvent()` private method
- Event publishing call after successful product deletion

**Event Flow:**

```typescript
// After product deletion and cache invalidation
await this.publishProductDeletedEvent(productId);
```

**Event Payload:**

```typescript
{
  eventId: generateEventId(),
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_DELETED,
  timestamp: new Date(),
  payload: {
    productId,
  },
}
```

## Design Decisions

### 1. Non-Blocking Event Publishing

All event publishing is wrapped in try-catch blocks to ensure that event publishing failures don't break the main business logic. This follows the "fail-safe" principle where the core operation (create/update/delete) is more important than event notification.

```typescript
private async publishProductCreatedEvent(product: Product): Promise<void> {
  try {
    // ... event creation and publishing
  } catch (error) {
    // Log error but don't throw - event publishing is non-blocking
    this.logger.error({ error, productId: props.id }, 'Failed to publish product created event');
  }
}
```

### 2. Event Publishing Order

Events are published **after** cache invalidation to ensure:

1. Database is updated (primary operation)
2. Cache is invalidated (consistency)
3. Event is published (notification)

This order ensures that subscribers receiving the event will get fresh data if they query the database.

### 3. Event Payload Design

**ProductCreatedEvent:**

- Includes essential product information (id, name, price, category)
- Enables subscribers to act without additional database queries
- Keeps payload size reasonable

**ProductUpdatedEvent:**

- Includes only the changed fields (diff pattern)
- Reduces payload size for large products
- Subscribers can merge changes with existing data

**ProductDeletedEvent:**

- Minimal payload (only productId)
- Sufficient for cache invalidation and cleanup operations

### 4. Dependency Injection Pattern

All use cases follow the same DI pattern:

```typescript
constructor(
  @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
  private productService: ProductService,
  @inject(DI_TOKENS.LOGGER) private logger: Logger,
  @inject(DI_TOKENS.CACHE_SERVICE) private cacheService: CacheService,
  @inject(DI_TOKENS.PUBLISHER_SERVICE) private publisherService: IPublisherService
) {}
```

## Testing Considerations

### Unit Tests

1. **Mock PublisherService**: Use jest mocks to verify event publishing
2. **Verify Event Payload**: Ensure correct event structure
3. **Error Handling**: Test that publishing failures don't break operations
4. **Event Timing**: Verify events are published after cache invalidation

### Integration Tests

1. **End-to-End Flow**: Create product → Verify event published → Verify handler called
2. **Redis Connection**: Test with actual Redis instance
3. **Multiple Subscribers**: Verify all subscribers receive events

## Event Consumers

The following handlers will process these events:

1. **ProductCreatedHandler** (`src/domain/services/events/ProductEventHandlers.ts`)
   - Updates search index
   - Sends notifications
   - Updates analytics

2. **ProductUpdatedHandler** (`src/domain/services/events/ProductEventHandlers.ts`)
   - Refreshes search index
   - Invalidates CDN cache
   - Updates related products

3. **ProductDeletedHandler** (`src/domain/services/events/ProductEventHandlers.ts`)
   - Removes from search index
   - Cleans up related data
   - Updates analytics

## Monitoring and Observability

### Logging

All use cases log event publishing:

- Success: `"Product created event published successfully"`
- Failure: `"Failed to publish product created event"`

### Metrics

Consider tracking:

- Events published per operation type
- Event publishing latency
- Event publishing failure rate

## Future Enhancements

1. **Batch Events**: Support batch operations with single event
2. **Event Sourcing**: Store events for audit trail
3. **Retry Mechanism**: Implement retry with exponential backoff
4. **Dead Letter Queue**: Move failed events to DLQ for manual inspection
5. **Event Schema Validation**: Validate event structure before publishing

## References

- [Step 1.1: Event Definitions and Types](./step1.1-Event-Definitions-and-Types.md)
- [Step 1.4: Publisher Service Implementation](./step1.4-Publisher-Service-Implementation.md)
- [Step 2.2: Product Event Handlers](./step2.2-Product-Event-Handlers.md)
- [Step 3.1: DI Container Registration](./step3.1-DI-Container-Registration.md)
