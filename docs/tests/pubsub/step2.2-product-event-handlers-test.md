# Test Analysis: Product Event Handlers

## Component Information

- **Source File**: [`src/domain/services/events/ProductEventHandlers.ts`](../../../src/domain/services/events/ProductEventHandlers.ts:1)
- **Analysis File**: [`docs/analysis/pubsub/step2.2-Product-Event-Handlers.md`](../../analysis/pubsub/step2.2-Product-Event-Handlers.md:1)

---

## Overview

This document provides comprehensive test cases for the Product Event Handlers. These handlers process product-related events (PRODUCT_CREATED, PRODUCT_UPDATED, PRODUCT_DELETED) and extend the EventHandler base class to leverage retry logic and structured logging.

---

## Test Cases

### TC-PEH-001: ProductCreatedHandler Instantiation

**Objective**: Verify ProductCreatedHandler can be instantiated with logger.

**Test Type**: Unit Test

**Input**:

```typescript
const mockLogger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
const handler = new ProductCreatedHandler(mockLogger);
```

**Expected Output**:

- Handler instance created successfully
- maxRetries = 3 (as defined in class)
- Logger injected properly

---

### TC-PEH-002: ProductCreatedHandler Handle Success

**Objective**: Verify ProductCreatedHandler processes PRODUCT_CREATED events correctly.

**Test Type**: Unit Test

**Input**:

```typescript
const event: ProductCreatedEvent = {
  eventId: 'evt_123',
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
  timestamp: new Date(),
  correlationId: 'req-456',
  payload: {
    productId: 'prod_789',
    name: 'Wireless Headphones',
    price: 199.99,
    category: 'Electronics',
  },
};

await handler.handle(event);
```

**Expected Output**:

- logEventReceived called
- Product info logged with:
  - eventId
  - productId
  - name
  - price
  - category
  - correlationId
- logEventSuccess called

**Verification**:

```typescript
expect(mockLogger.info).toHaveBeenCalledWith(
  expect.objectContaining({
    eventId: 'evt_123',
    productId: 'prod_789',
    name: 'Wireless Headphones',
    price: 199.99,
    category: 'Electronics',
    correlationId: 'req-456',
  }),
  'Product created - processing event'
);
```

---

### TC-PEH-003: ProductCreatedHandler Retry Logic

**Objective**: Verify ProductCreatedHandler uses retry logic from base class.

**Test Type**: Unit Test

**Input**:

```typescript
// Mock logger to throw on first two calls
let callCount = 0;
mockLogger.info = jest.fn().mockImplementation(() => {
  callCount++;
  if (callCount <= 2) throw new Error('Temporary error');
});

await handler.handle(event);
```

**Expected Output**:

- Operation retried up to 3 times
- Success on final attempt
- Retry warnings logged

---

### TC-PEH-004: ProductUpdatedHandler Instantiation

**Objective**: Verify ProductUpdatedHandler can be instantiated.

**Test Type**: Unit Test

**Input**:

```typescript
const mockLogger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
const handler = new ProductUpdatedHandler(mockLogger);
```

**Expected Output**:

- Handler instance created successfully
- maxRetries = 3

---

### TC-PEH-005: ProductUpdatedHandler Handle Success

**Objective**: Verify ProductUpdatedHandler processes PRODUCT_UPDATED events correctly.

**Test Type**: Unit Test

**Input**:

```typescript
const event: ProductUpdatedEvent = {
  eventId: 'evt_123',
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_UPDATED,
  timestamp: new Date(),
  correlationId: 'req-456',
  payload: {
    productId: 'prod_789',
    changes: { price: 149.99, stock: 50 },
  },
};

await handler.handle(event);
```

**Expected Output**:

- Product update logged with:
  - eventId
  - productId
  - changes
  - changedFields (Object.keys(changes))
  - correlationId

**Verification**:

```typescript
expect(mockLogger.info).toHaveBeenCalledWith(
  expect.objectContaining({
    eventId: 'evt_123',
    productId: 'prod_789',
    changes: { price: 149.99, stock: 50 },
    changedFields: ['price', 'stock'],
    correlationId: 'req-456',
  }),
  'Product updated - processing event'
);
```

---

### TC-PEH-006: ProductUpdatedHandler Empty Changes

**Objective**: Verify ProductUpdatedHandler handles empty changes object.

**Test Type**: Unit Test

**Input**:

```typescript
const event: ProductUpdatedEvent = {
  eventId: 'evt_123',
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_UPDATED,
  timestamp: new Date(),
  payload: {
    productId: 'prod_789',
    changes: {},
  },
};

await handler.handle(event);
```

**Expected Output**:

- Handler executes successfully
- changedFields is empty array
- No errors thrown

---

### TC-PEH-007: ProductDeletedHandler Instantiation

**Objective**: Verify ProductDeletedHandler can be instantiated.

**Test Type**: Unit Test

**Input**:

```typescript
const mockLogger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
const handler = new ProductDeletedHandler(mockLogger);
```

**Expected Output**:

- Handler instance created successfully
- maxRetries = 3

---

### TC-PEH-008: ProductDeletedHandler Handle Success

**Objective**: Verify ProductDeletedHandler processes PRODUCT_DELETED events correctly.

**Test Type**: Unit Test

**Input**:

```typescript
const event: ProductDeletedEvent = {
  eventId: 'evt_123',
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_DELETED,
  timestamp: new Date(),
  correlationId: 'req-456',
  payload: {
    productId: 'prod_789',
  },
};

await handler.handle(event);
```

**Expected Output**:

- Product deletion logged with:
  - eventId
  - productId
  - correlationId

**Verification**:

```typescript
expect(mockLogger.info).toHaveBeenCalledWith(
  expect.objectContaining({
    eventId: 'evt_123',
    productId: 'prod_789',
    correlationId: 'req-456',
  }),
  'Product deleted - processing event'
);
```

---

### TC-PEH-009: Handler Error Recovery

**Objective**: Verify handlers recover from transient errors using retry.

**Test Type**: Unit Test

**Input**:

```typescript
let attempts = 0;
mockLogger.info = jest.fn().mockImplementation(() => {
  attempts++;
  if (attempts === 1) throw new Error('Transient error');
});

const handler = new ProductCreatedHandler(mockLogger);
await handler.handle(event);
```

**Expected Output**:

- First attempt fails
- Retry attempted
- Second attempt succeeds
- Warning logged for retry

---

### TC-PEH-010: Handler Permanent Failure

**Objective**: Verify handlers throw after max retries exhausted.

**Test Type**: Unit Test

**Input**:

```typescript
mockLogger.info = jest.fn().mockImplementation(() => {
  throw new Error('Permanent error');
});

const handler = new ProductCreatedHandler(mockLogger);
```

**Expected Output**:

- 3 attempts made (initial + 2 retries)
- Error thrown after all retries
- Error logged

---

### TC-PEH-011: Event Without CorrelationId

**Objective**: Verify handlers work with events missing correlationId.

**Test Type**: Unit Test

**Input**:

```typescript
const eventWithoutCorrelation: ProductCreatedEvent = {
  eventId: 'evt_123',
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
  timestamp: new Date(),
  // correlationId omitted
  payload: {
    productId: 'prod_789',
    name: 'Test Product',
    price: 99.99,
    category: 'Test',
  },
};

await handler.handle(eventWithoutCorrelation);
```

**Expected Output**:

- Handler executes successfully
- correlationId logged as undefined
- No errors

---

### TC-PEH-012: Handler Inheritance

**Objective**: Verify all handlers inherit from EventHandler correctly.

**Test Type**: Unit Test

**Input**:

```typescript
const createdHandler = new ProductCreatedHandler(mockLogger);
const updatedHandler = new ProductUpdatedHandler(mockLogger);
const deletedHandler = new ProductDeletedHandler(mockLogger);
```

**Expected Output**:

- All handlers are instances of EventHandler
- All have handle method
- All have maxRetries property
- All use executeWithRetry

---

### TC-PEH-013: ProductCreatedHandler Event Type Validation

**Objective**: Verify handler only processes PRODUCT_CREATED events.

**Test Type**: Unit Test

**Input**:

```typescript
// TypeScript ensures correct event type at compile time
const wrongEvent: ProductUpdatedEvent = {
  eventId: 'evt_123',
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_UPDATED,
  timestamp: new Date(),
  payload: { productId: 'prod_789', changes: {} },
};

// This should cause TypeScript error:
// await createdHandler.handle(wrongEvent);
```

**Expected Output**:

- TypeScript enforces correct event type
- Wrong event type causes compilation error

---

### TC-PEH-014: Handler Logging Sequence

**Objective**: Verify correct logging sequence in handlers.

**Test Type**: Unit Test

**Input**:

```typescript
await handler.handle(event);
```

**Expected Output**:

- Log sequence:
  1. "Received PRODUCT_CREATED event" (from logEventReceived)
  2. "Product created - processing event" (handler-specific)
  3. "Successfully processed PRODUCT_CREATED event" (from logEventSuccess)

---

### TC-PEH-015: Large Changes Object

**Objective**: Verify ProductUpdatedHandler handles large changes objects.

**Test Type**: Unit Test

**Input**:

```typescript
const event: ProductUpdatedEvent = {
  eventId: 'evt_123',
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_UPDATED,
  timestamp: new Date(),
  payload: {
    productId: 'prod_789',
    changes: {
      name: 'Updated Name',
      description: 'A'.repeat(1000),
      price: 99.99,
      stock: 100,
      category: 'Electronics',
      isActive: true,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    },
  },
};

await handler.handle(event);
```

**Expected Output**:

- Handler processes successfully
- All changed fields logged
- No truncation of data

---

### TC-PEH-016: Special Characters in Product Data

**Objective**: Verify handlers handle special characters in product data.

**Test Type**: Unit Test

**Input**:

```typescript
const event: ProductCreatedEvent = {
  eventId: 'evt_123',
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
  timestamp: new Date(),
  payload: {
    productId: 'prod_<>"&\'',
    name: 'Product with <special> "chars" & more\'',
    price: 99.99,
    category: 'Test & Demo',
  },
};

await handler.handle(event);
```

**Expected Output**:

- Handler processes successfully
- Special characters preserved in logs
- No encoding issues

---

### TC-PEH-017: Zero Price Handling

**Objective**: Verify ProductCreatedHandler handles zero price correctly.

**Test Type**: Unit Test

**Input**:

```typescript
const event: ProductCreatedEvent = {
  eventId: 'evt_123',
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
  timestamp: new Date(),
  payload: {
    productId: 'prod_free',
    name: 'Free Product',
    price: 0,
    category: 'Freebies',
  },
};

await handler.handle(event);
```

**Expected Output**:

- Handler processes successfully
- Price = 0 logged correctly
- No falsy value issues

---

### TC-PEH-018: Handler DI Registration

**Objective**: Verify handlers can be registered in DI container.

**Test Type**: Integration Test

**Input**:

```typescript
// Register in DI container
container.registerSingleton(DI_TOKENS.PRODUCT_CREATED_HANDLER, ProductCreatedHandler);

// Resolve from container
const handler = container.resolve<ProductCreatedHandler>(DI_TOKENS.PRODUCT_CREATED_HANDLER);
```

**Expected Output**:

- Handler registered successfully
- Logger auto-injected
- Handler functional after resolution

---

## Integration Test Scenarios

### TC-PEH-INT-001: Handler with PubSubBootstrap

**Objective**: Verify handlers work correctly when used by PubSubBootstrap.

**Test Type**: Integration Test

**Steps**:

1. Initialize PubSubBootstrap
2. Publish PRODUCT_CREATED event
3. Verify handler processes event

**Expected Output**:

- Handler receives event
- Event processed successfully
- Logs generated

---

### TC-PEH-INT-002: Multiple Events Processing

**Objective**: Verify handlers can process multiple events sequentially.

**Test Type**: Integration Test

**Input**:

```typescript
const events: ProductCreatedEvent[] = [
  {
    /* event 1 */
  },
  {
    /* event 2 */
  },
  {
    /* event 3 */
  },
];

for (const event of events) {
  await handler.handle(event);
}
```

**Expected Output**:

- All events processed
- Each event logged separately
- No state pollution between events

---

## Performance Tests

### TC-PEH-PERF-001: Handler Throughput

**Objective**: Measure handler processing throughput.

**Test Type**: Performance Test

**Input**: Process 1000 events

**Expected Output**:

- All events processed within acceptable time
- No memory leaks
- Consistent performance

---

## Test File Template

```typescript
// tests/unit/domain/services/events/ProductEventHandlers.test.ts
import {
  ProductCreatedHandler,
  ProductUpdatedHandler,
  ProductDeletedHandler,
} from '@/domain/services/events/ProductEventHandlers';
import {
  ProductCreatedEvent,
  ProductUpdatedEvent,
  ProductDeletedEvent,
  PUBSUB_EVENT_TYPES,
} from '@/domain/events';

describe('Product Event Handlers', () => {
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
  });

  describe('TC-PEH-001: ProductCreatedHandler', () => {
    it('should be instantiated with maxRetries = 3', () => {
      const handler = new ProductCreatedHandler(mockLogger);
      expect(handler).toBeDefined();
      expect(handler['maxRetries']).toBe(3);
    });

    it('TC-PEH-002: should handle PRODUCT_CREATED event', async () => {
      const handler = new ProductCreatedHandler(mockLogger);
      const event: ProductCreatedEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
        correlationId: 'req-456',
        payload: {
          productId: 'prod_789',
          name: 'Test Product',
          price: 99.99,
          category: 'Test',
        },
      };

      await handler.handle(event);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 'prod_789',
          name: 'Test Product',
          price: 99.99,
        }),
        'Product created - processing event'
      );
    });
  });

  describe('TC-PEH-004: ProductUpdatedHandler', () => {
    it('should handle PRODUCT_UPDATED event', async () => {
      const handler = new ProductUpdatedHandler(mockLogger);
      const event: ProductUpdatedEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_UPDATED,
        timestamp: new Date(),
        payload: {
          productId: 'prod_789',
          changes: { price: 149.99, stock: 50 },
        },
      };

      await handler.handle(event);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 'prod_789',
          changes: { price: 149.99, stock: 50 },
          changedFields: ['price', 'stock'],
        }),
        'Product updated - processing event'
      );
    });

    it('TC-PEH-006: should handle empty changes', async () => {
      const handler = new ProductUpdatedHandler(mockLogger);
      const event: ProductUpdatedEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_UPDATED,
        timestamp: new Date(),
        payload: {
          productId: 'prod_789',
          changes: {},
        },
      };

      await handler.handle(event);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          changedFields: [],
        }),
        expect.any(String)
      );
    });
  });

  describe('TC-PEH-007: ProductDeletedHandler', () => {
    it('should handle PRODUCT_DELETED event', async () => {
      const handler = new ProductDeletedHandler(mockLogger);
      const event: ProductDeletedEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_DELETED,
        timestamp: new Date(),
        payload: {
          productId: 'prod_789',
        },
      };

      await handler.handle(event);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 'prod_789',
        }),
        'Product deleted - processing event'
      );
    });
  });

  describe('TC-PEH-010: Error Handling', () => {
    it('should retry and throw after max attempts', async () => {
      mockLogger.info = jest.fn().mockImplementation(() => {
        throw new Error('Always fails');
      });

      const handler = new ProductCreatedHandler(mockLogger);
      const event: ProductCreatedEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
        payload: {
          productId: 'prod_789',
          name: 'Test',
          price: 99.99,
          category: 'Test',
        },
      };

      await expect(handler.handle(event)).rejects.toThrow('Always fails');
      expect(mockLogger.info).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });
});
```

---

## Summary

| Test Case  | Description                         | Priority |
| ---------- | ----------------------------------- | -------- |
| TC-PEH-001 | ProductCreatedHandler Instantiation | High     |
| TC-PEH-002 | ProductCreatedHandler Handle        | High     |
| TC-PEH-003 | ProductCreatedHandler Retry         | Medium   |
| TC-PEH-004 | ProductUpdatedHandler Instantiation | High     |
| TC-PEH-005 | ProductUpdatedHandler Handle        | High     |
| TC-PEH-006 | ProductUpdatedHandler Empty Changes | Medium   |
| TC-PEH-007 | ProductDeletedHandler Instantiation | High     |
| TC-PEH-008 | ProductDeletedHandler Handle        | High     |
| TC-PEH-009 | Handler Error Recovery              | High     |
| TC-PEH-010 | Handler Permanent Failure           | High     |
| TC-PEH-011 | Event Without CorrelationId         | Low      |
| TC-PEH-012 | Handler Inheritance                 | Medium   |
| TC-PEH-013 | Event Type Validation               | Medium   |
| TC-PEH-014 | Handler Logging Sequence            | Low      |
| TC-PEH-015 | Large Changes Object                | Low      |
| TC-PEH-016 | Special Characters                  | Low      |
| TC-PEH-017 | Zero Price Handling                 | Low      |
| TC-PEH-018 | DI Registration                     | Medium   |

---

## Related Documentation

- [Product Event Handlers Analysis](../../analysis/pubsub/step2.2-Product-Event-Handlers.md)
- [Event Handler Base Class Test](./step2.1-event-handler-test.md)
- [Audit Event Handler Test](./step2.3-audit-event-handler-test.md)
