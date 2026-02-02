# Step 1.1: Event Definitions and Types

## Overview

This document analyzes the implementation of event definitions and types for the Redis Pub/Sub messaging system in the JollyJet e-commerce application. The event definitions provide the foundation for all event-driven communication and ensure consistent event structure across the application.

## Dependencies

- **Depends on:** None (Foundation step)
- **Required by:**
  - Step 1.4: Publisher Service Implementation
  - Step 1.5: Subscriber Service Implementation
  - Step 2.1: Event Handler Base Class
  - Step 2.2: Product Event Handlers
  - Step 2.3: Audit Event Handler
  - Step 3.3: Product Use Case Integration

## Implementation Details

### File Location

- **Source**: `src/domain/events/index.ts`
- **Purpose**: Define TypeScript interfaces and types for events

### Event Structure

All events follow a consistent structure defined in `BaseEvent`:

```typescript
export interface BaseEvent {
  eventId: string; // Unique identifier for the event
  eventType: string; // Type of the event
  timestamp: Date; // Timestamp when the event was created
  correlationId?: string; // Optional correlation ID for distributed tracing
}
```

**Key Features:**

- Unique event ID for traceability
- Event type discriminator for routing
- Timestamp for chronological ordering
- Optional correlation ID for distributed tracing

### Event Types

#### 1. Product Events

**ProductCreatedEvent**

```typescript
export interface ProductCreatedEvent extends BaseEvent {
  eventType: 'PRODUCT_CREATED';
  payload: {
    productId: string;
    name: string;
    price: number;
    category: string;
  };
}
```

**Key Features:**

- Emitted when a new product is created
- Contains product identification and basic information
- Used for search index updates and notifications

**ProductUpdatedEvent**

```typescript
export interface ProductUpdatedEvent extends BaseEvent {
  eventType: 'PRODUCT_UPDATED';
  payload: {
    productId: string;
    changes: Record<string, any>;
  };
}
```

**Key Features:**

- Emitted when an existing product is modified
- Contains only changed fields to minimize payload size
- Used for cache invalidation and audit logging

**ProductDeletedEvent**

```typescript
export interface ProductDeletedEvent extends BaseEvent {
  eventType: 'PRODUCT_DELETED';
  payload: {
    productId: string;
  };
}
```

**Key Features:**

- Emitted when a product is removed
- Minimal payload with only product ID
- Used for cleanup operations and compliance logging

#### 2. Audit Events

**UserActivityEvent**

```typescript
export interface UserActivityEvent extends BaseEvent {
  eventType: 'USER_ACTIVITY';
  payload: {
    userId: string;
    action: string;
    metadata: Record<string, any>;
  };
}
```

**Key Features:**

- Emitted for user actions requiring audit trail
- Contains user identification and action details
- Used for compliance, security, and analytics

### Event Type Constants

Centralized event type strings for type safety:

```typescript
export const EVENT_TYPES = {
  PRODUCT_CREATED: 'PRODUCT_CREATED',
  PRODUCT_UPDATED: 'PRODUCT_UPDATED',
  PRODUCT_DELETED: 'PRODUCT_DELETED',
  USER_ACTIVITY: 'USER_ACTIVITY',
} as const;
```

**Benefits:**

- Prevents typos in event type strings
- Enables IDE autocomplete
- Centralizes event type management
- Supports refactoring

### Event Channel Constants

Centralized channel names for pub/sub:

```typescript
export const EVENT_CHANNELS = {
  PRODUCT: 'jollyjet:events:product',
  AUDIT: 'jollyjet:events:audit',
} as const;
```

**Benefits:**

- Consistent channel naming
- Easy to add new channels
- Prevents channel name collisions
- Supports environment-specific prefixes

### Event ID Generation

Utility function for generating unique event IDs:

```typescript
export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
```

**Format:** `evt_{timestamp}_{random_13_chars}`

**Benefits:**

- **Uniqueness:** Timestamp + random ensures no collisions
- **Sortability:** Timestamp prefix enables chronological sorting
- **Traceability:** Can be used in logs and distributed tracing

## Design Decisions

### 1. Interface vs Class

**Decision:** Use TypeScript interfaces instead of classes

**Rationale:**

- Interfaces are compile-time only, reducing runtime overhead
- Better support for structural typing
- Easier to extend and compose
- No instantiation required

### 2. Union Type for Events

**Decision:** Define `AppEvent` union type

```typescript
export type AppEvent =
  | ProductCreatedEvent
  | ProductUpdatedEvent
  | ProductDeletedEvent
  | UserActivityEvent;
```

**Rationale:**

- Enables exhaustive type checking in switch statements
- Improves type safety in event handlers
- Supports IDE autocomplete for event types

### 3. Payload Structure

**Decision:** Use nested payload objects

**Rationale:**

- Separates event metadata from business data
- Consistent structure across all events
- Easier to validate and transform

## Usage Examples

### Creating an Event

```typescript
import { generateEventId, EVENT_TYPES, EVENT_CHANNELS } from '../events';

const event = {
  eventId: generateEventId(),
  eventType: EVENT_TYPES.PRODUCT_CREATED,
  timestamp: new Date(),
  correlationId: request.correlationId,
  payload: {
    productId: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
  },
};
```

### Type Guard for Events

```typescript
function isProductCreatedEvent(event: AppEvent): event is ProductCreatedEvent {
  return event.eventType === EVENT_TYPES.PRODUCT_CREATED;
}
```

### Event Routing

```typescript
subscriberService.subscribe(EVENT_CHANNELS.PRODUCT, (event: AppEvent) => {
  switch (event.eventType) {
    case EVENT_TYPES.PRODUCT_CREATED:
      // TypeScript knows event is ProductCreatedEvent
      handleProductCreated(event);
      break;
    case EVENT_TYPES.PRODUCT_UPDATED:
      handleProductUpdated(event);
      break;
    case EVENT_TYPES.PRODUCT_DELETED:
      handleProductDeleted(event);
      break;
  }
});
```

## Testing Considerations

### Unit Testing

```typescript
describe('Event Definitions', () => {
  it('should generate unique event IDs', () => {
    const id1 = generateEventId();
    const id2 = generateEventId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^evt_\d+_[a-z0-9]+$/);
  });

  it('should have correct event type constants', () => {
    expect(EVENT_TYPES.PRODUCT_CREATED).toBe('PRODUCT_CREATED');
    expect(EVENT_TYPES.PRODUCT_UPDATED).toBe('PRODUCT_UPDATED');
    expect(EVENT_TYPES.PRODUCT_DELETED).toBe('PRODUCT_DELETED');
    expect(EVENT_TYPES.USER_ACTIVITY).toBe('USER_ACTIVITY');
  });
});
```

## Future Enhancements

### 1. Schema Validation

Add runtime validation using libraries like Zod or Joi:

```typescript
const ProductCreatedEventSchema = z.object({
  eventId: z.string(),
  eventType: z.literal('PRODUCT_CREATED'),
  timestamp: z.date(),
  payload: z.object({
    productId: z.string().uuid(),
    name: z.string().min(1),
    price: z.number().positive(),
    category: z.string(),
  }),
});
```

### 2. Event Versioning

Add version field for backward compatibility:

```typescript
interface BaseEvent {
  eventId: string;
  eventType: string;
  timestamp: Date;
  correlationId?: string;
  version: number; // New field
}
```

### 3. Event Metadata

Add optional metadata for tracking:

```typescript
interface BaseEvent {
  eventId: string;
  eventType: string;
  timestamp: Date;
  correlationId?: string;
  metadata?: {
    source: string;
    userAgent?: string;
    ipAddress?: string;
  };
}
```

## Success Criteria

- ✅ All event types defined with TypeScript interfaces
- ✅ BaseEvent interface with common fields
- ✅ Event type constants for type safety
- ✅ Event channel constants for pub/sub
- ✅ Event ID generation utility
- ✅ Union type for all events
- ✅ JSDoc comments for all interfaces
- ✅ Follows Clean Architecture principles

## Related Files

- **Implementation**: `src/domain/events/index.ts`
- **Publisher Interface**: `src/domain/interfaces/redis/IPublisherService.ts`
- **Subscriber Interface**: `src/domain/interfaces/redis/ISubscriberService.ts`
- **Implementation Plan**: `docs/implementation-plans/14-pubsub-implementation-plan.md`
- **Task File**: `docs/tasks/06-pubsub-task.md`
