# Test Analysis: PubSub Bootstrap

## Component Information

- **Source File**: [`src/infrastructure/pubsub/PubSubBootstrap.ts`](../../../src/infrastructure/pubsub/PubSubBootstrap.ts:1)
- **Analysis File**: [`docs/analysis/pubsub/step3.2-Application-Bootstrap.md`](../../analysis/pubsub/step3.2-Application-Bootstrap.md:1)

---

## Overview

This document provides comprehensive test cases for the PubSub Bootstrap module. The PubSubBootstrap class handles initialization and cleanup of the Pub/Sub messaging system, including subscriber service initialization, event handler registration, event routing, and graceful shutdown.

---

## Test Cases

### TC-PSB-001: PubSubBootstrap Instantiation

**Objective**: Verify PubSubBootstrap can be instantiated with container and logger.

**Test Type**: Unit Test

**Input**:

```typescript
const mockContainer = {
  resolve: jest.fn(),
};
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

const pubSubBootstrap = new PubSubBootstrap(mockContainer, mockLogger);
```

**Expected Output**:

- PubSubBootstrap instance created successfully
- Container and logger stored
- isInitialized = false
- subscriberService = null

---

### TC-PSB-002: Initialize Success

**Objective**: Verify successful initialization sequence.

**Test Type**: Unit Test

**Input**:

```typescript
const mockSubscriberService = {
  initialize: jest.fn().mockResolvedValue(undefined),
  subscribe: jest.fn(),
};

mockContainer.resolve.mockImplementation((token: string) => {
  switch (token) {
    case DI_TOKENS.SUBSCRIBER_SERVICE:
      return mockSubscriberService;
    case DI_TOKENS.PRODUCT_CREATED_HANDLER:
      return { handle: jest.fn() };
    case DI_TOKENS.PRODUCT_UPDATED_HANDLER:
      return { handle: jest.fn() };
    case DI_TOKENS.PRODUCT_DELETED_HANDLER:
      return { handle: jest.fn() };
    case DI_TOKENS.AUDIT_EVENT_HANDLER:
      return { handle: jest.fn() };
  }
});

await pubSubBootstrap.initialize();
```

**Expected Output**:

- Subscriber service resolved from container
- Subscriber service initialized
- Event handlers resolved
- Subscriptions created for PRODUCT and AUDIT channels
- isInitialized = true
- Success messages logged

---

### TC-PSB-003: Double Initialization Prevention

**Objective**: Verify initialize() prevents double initialization.

**Test Type**: Unit Test

**Input**:

```typescript
await pubSubBootstrap.initialize();
await pubSubBootstrap.initialize(); // Second call
```

**Expected Output**:

- First initialization succeeds
- Second initialization logs warning: "Pub/Sub system already initialized"
- No duplicate subscriptions

---

### TC-PSB-004: Initialization Failure Handling

**Objective**: Verify initialization errors are caught and logged.

**Test Type**: Unit Test

**Input**:

```typescript
const mockSubscriberService = {
  initialize: jest.fn().mockRejectedValue(new Error('Redis connection failed')),
};

mockContainer.resolve.mockReturnValue(mockSubscriberService);

await pubSubBootstrap.initialize();
```

**Expected Output**:

- Error caught
- Error logged: "Failed to initialize Pub/Sub system"
- isInitialized remains false
- Error not re-thrown (Pub/Sub is not critical)

---

### TC-PSB-005: Product Event Routing

**Objective**: Verify product events are routed to correct handlers.

**Test Type**: Unit Test

**Input**:

```typescript
const mockCreatedHandler = { handle: jest.fn().mockResolvedValue(undefined) };
const mockUpdatedHandler = { handle: jest.fn().mockResolvedValue(undefined) };
const mockDeletedHandler = { handle: jest.fn().mockResolvedValue(undefined) };

// Setup container to return mocks
// Initialize pubSubBootstrap

// Simulate PRODUCT channel message
const productChannelHandler = mockSubscriberService.subscribe.mock.calls.find(
  (call) => call[0] === PUBSUB_CHANNELS.PRODUCT
)[1];

// Test PRODUCT_CREATED
productChannelHandler({
  eventId: 'evt_1',
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
  payload: { productId: '1', name: 'Test', price: 10, category: 'Test' },
});

// Test PRODUCT_UPDATED
productChannelHandler({
  eventId: 'evt_2',
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_UPDATED,
  payload: { productId: '1', changes: {} },
});

// Test PRODUCT_DELETED
productChannelHandler({
  eventId: 'evt_3',
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_DELETED,
  payload: { productId: '1' },
});
```

**Expected Output**:

- PRODUCT_CREATED routed to ProductCreatedHandler
- PRODUCT_UPDATED routed to ProductUpdatedHandler
- PRODUCT_DELETED routed to ProductDeletedHandler

---

### TC-PSB-006: Audit Event Routing

**Objective**: Verify audit events are routed to AuditEventHandler.

**Test Type**: Unit Test

**Input**:

```typescript
const mockAuditHandler = { handle: jest.fn().mockResolvedValue(undefined) };

// Setup and initialize

// Simulate AUDIT channel message
const auditChannelHandler = mockSubscriberService.subscribe.mock.calls.find(
  (call) => call[0] === PUBSUB_CHANNELS.AUDIT
)[1];

auditChannelHandler({
  eventId: 'evt_1',
  eventType: PUBSUB_EVENT_TYPES.USER_ACTIVITY,
  payload: { userId: 'user_1', action: 'LOGIN_SUCCESS', metadata: {} },
});
```

**Expected Output**:

- USER_ACTIVITY routed to AuditEventHandler
- Handler called with correct event

---

### TC-PSB-007: Unknown Product Event Type

**Objective**: Verify unknown product event types are logged as warnings.

**Test Type**: Unit Test

**Input**:

```typescript
const productChannelHandler = mockSubscriberService.subscribe.mock.calls.find(
  (call) => call[0] === PUBSUB_CHANNELS.PRODUCT
)[1];

productChannelHandler({
  eventId: 'evt_1',
  eventType: 'UNKNOWN_EVENT',
  payload: {},
});
```

**Expected Output**:

- Warning logged: "Unknown product event type received"
- No handler called
- No error thrown

---

### TC-PSB-008: Handler Error Handling

**Objective**: Verify handler errors are caught and logged.

**Test Type**: Unit Test

**Input**:

```typescript
const mockCreatedHandler = {
  handle: jest.fn().mockRejectedValue(new Error('Handler error')),
};

// Setup and initialize

const productChannelHandler = mockSubscriberService.subscribe.mock.calls.find(
  (call) => call[0] === PUBSUB_CHANNELS.PRODUCT
)[1];

productChannelHandler({
  eventId: 'evt_1',
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
  payload: { productId: '1', name: 'Test', price: 10, category: 'Test' },
});
```

**Expected Output**:

- Error caught
- Error logged: "Error handling PRODUCT_CREATED event"
- Subscription continues working

---

### TC-PSB-009: Graceful Shutdown

**Objective**: Verify shutdown disconnects subscriber service.

**Test Type**: Unit Test

**Input**:

```typescript
await pubSubBootstrap.initialize();
await pubSubBootstrap.shutdown();
```

**Expected Output**:

- Subscriber service disconnect called
- isInitialized set to false
- Success message logged

---

### TC-PSB-010: Shutdown Without Initialization

**Objective**: Verify shutdown handles uninitialized state gracefully.

**Test Type**: Unit Test

**Input**:

```typescript
// Don't initialize
await pubSubBootstrap.shutdown();
```

**Expected Output**:

- No error thrown
- No disconnect attempted
- Method returns immediately

---

### TC-PSB-011: isReady Status Check

**Objective**: Verify isReady returns correct initialization status.

**Test Type**: Unit Test

**Input**:

```typescript
const status1 = pubSubBootstrap.isReady();
await pubSubBootstrap.initialize();
const status2 = pubSubBootstrap.isReady();
await pubSubBootstrap.shutdown();
const status3 = pubSubBootstrap.isReady();
```

**Expected Output**:

- status1: false
- status2: true
- status3: false

---

### TC-PSB-012: Shutdown Error Handling

**Objective**: Verify shutdown errors are caught and logged.

**Test Type**: Unit Test

**Input**:

```typescript
const mockSubscriberService = {
  initialize: jest.fn().mockResolvedValue(undefined),
  subscribe: jest.fn(),
  disconnect: jest.fn().mockRejectedValue(new Error('Disconnect failed')),
};

await pubSubBootstrap.initialize();
await pubSubBootstrap.shutdown();
```

**Expected Output**:

- Error caught
- Error logged: "Error during Pub/Sub shutdown"
- No error thrown to caller

---

### TC-PSB-013: DI Token Resolution

**Objective**: Verify all required DI tokens are resolved.

**Test Type**: Unit Test

**Input**:

```typescript
await pubSubBootstrap.initialize();
```

**Expected Output**:

- DI_TOKENS.SUBSCRIBER_SERVICE resolved
- DI_TOKENS.PRODUCT_CREATED_HANDLER resolved
- DI_TOKENS.PRODUCT_UPDATED_HANDLER resolved
- DI_TOKENS.PRODUCT_DELETED_HANDLER resolved
- DI_TOKENS.AUDIT_EVENT_HANDLER resolved

---

### TC-PSB-014: Channel Subscription Verification

**Objective**: Verify subscriptions are created for correct channels.

**Test Type**: Unit Test

**Input**:

```typescript
await pubSubBootstrap.initialize();
```

**Expected Output**:

- subscribe called with PUBSUB_CHANNELS.PRODUCT
- subscribe called with PUBSUB_CHANNELS.AUDIT
- Channel names logged

---

### TC-PSB-015: Event Handler Type Safety

**Objective**: Verify event handlers receive correctly typed events.

**Test Type**: Unit Test

**Input**:

```typescript
// ProductCreatedHandler should receive ProductCreatedEvent
const createdEvent = {
  eventId: 'evt_1',
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
  payload: { productId: '1', name: 'Test', price: 10, category: 'Test' },
};

productChannelHandler(createdEvent);
```

**Expected Output**:

- Handler called with event
- Event has correct type structure
- TypeScript compilation succeeds

---

### TC-PSB-016: Multiple Events Sequential Processing

**Objective**: Verify multiple events can be processed sequentially.

**Test Type**: Unit Test

**Input**:

```typescript
const events = [
  { eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED, payload: {} },
  { eventType: PUBSUB_EVENT_TYPES.PRODUCT_UPDATED, payload: {} },
  { eventType: PUBSUB_EVENT_TYPES.PRODUCT_DELETED, payload: {} },
];

events.forEach((event) => productChannelHandler(event));
```

**Expected Output**:

- All events processed
- Correct handler called for each
- No interference between events

---

### TC-PSB-017: Handler Promise Handling

**Objective**: Verify handler promises are handled correctly.

**Test Type**: Unit Test

**Input**:

```typescript
// Handler returns promise
mockCreatedHandler.handle.mockReturnValue(Promise.resolve());

productChannelHandler(createdEvent);
```

**Expected Output**:

- Promise handled with .catch()
- No unhandled promise rejections

---

## Integration Test Scenarios

### TC-PSB-INT-001: Full Bootstrap Flow

**Objective**: Verify complete bootstrap initialization and shutdown flow.

**Test Type**: Integration Test

**Steps**:

1. Create PubSubBootstrap with real DI container
2. Initialize
3. Verify all handlers registered
4. Shutdown
5. Verify cleanup

**Expected Output**:

- Initialization succeeds
- All handlers resolved
- Subscriptions active
- Shutdown cleans up properly

---

### TC-PSB-INT-002: End-to-End Event Flow

**Objective**: Verify complete event flow through bootstrap.

**Test Type**: Integration Test

**Steps**:

1. Initialize PubSubBootstrap
2. Publish event to Redis
3. Verify handler receives and processes event

**Expected Output**:

- Event published
- Subscriber receives event
- Correct handler called
- Event processed successfully

---

### TC-PSB-INT-003: Container Integration

**Objective**: Verify PubSubBootstrap works with actual DI container.

**Test Type**: Integration Test

**Input**:

```typescript
import { container } from 'tsyringe';

const bootstrap = new PubSubBootstrap(container, logger);
await bootstrap.initialize();
```

**Expected Output**:

- Container resolves all dependencies
- Services properly injected
- Bootstrap functional

---

## Performance Tests

### TC-PSB-PERF-001: Initialization Performance

**Objective**: Measure initialization time.

**Test Type**: Performance Test

**Input**: Initialize PubSubBootstrap

**Expected Output**:

- Initialization completes within 1 second
- No timeout issues

---

### TC-PSB-PERF-002: Event Routing Performance

**Objective**: Measure event routing latency.

**Test Type**: Performance Test

**Input**: Route 1000 events

**Expected Output**:

- Average latency < 10ms per event
- No event loss

---

## Error Scenarios

### TC-PSB-ERR-001: Missing Handler Registration

**Objective**: Verify behavior when handler not registered in container.

**Test Type**: Integration Test

**Steps**:

1. Don't register PRODUCT_CREATED_HANDLER
2. Attempt to initialize

**Expected Output**:

- Error thrown during resolution
- Error logged
- Initialization fails

---

### TC-PSB-ERR-002: Subscriber Service Failure

**Objective**: Verify behavior when subscriber service fails.

**Test Type**: Integration Test

**Steps**:

1. Mock subscriber service to fail on initialize
2. Attempt to initialize

**Expected Output**:

- Error caught
- Error logged
- System continues (Pub/Sub not critical)

---

## Test File Template

```typescript
// tests/unit/infrastructure/pubsub/PubSubBootstrap.test.ts
import { PubSubBootstrap } from '@/infrastructure/pubsub/PubSubBootstrap';
import { DI_TOKENS, PUBSUB_CHANNELS, PUBSUB_EVENT_TYPES } from '@/shared/constants';
import { DependencyContainer } from 'tsyringe';

describe('PubSubBootstrap', () => {
  let bootstrap: PubSubBootstrap;
  let mockContainer: any;
  let mockLogger: any;
  let mockSubscriberService: any;
  let mockHandlers: any;

  beforeEach(() => {
    mockHandlers = {
      created: { handle: jest.fn().mockResolvedValue(undefined) },
      updated: { handle: jest.fn().mockResolvedValue(undefined) },
      deleted: { handle: jest.fn().mockResolvedValue(undefined) },
      audit: { handle: jest.fn().mockResolvedValue(undefined) },
    };

    mockSubscriberService = {
      initialize: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn(),
      disconnect: jest.fn().mockResolvedValue(undefined),
    };

    mockContainer = {
      resolve: jest.fn((token: string) => {
        switch (token) {
          case DI_TOKENS.SUBSCRIBER_SERVICE:
            return mockSubscriberService;
          case DI_TOKENS.PRODUCT_CREATED_HANDLER:
            return mockHandlers.created;
          case DI_TOKENS.PRODUCT_UPDATED_HANDLER:
            return mockHandlers.updated;
          case DI_TOKENS.PRODUCT_DELETED_HANDLER:
            return mockHandlers.deleted;
          case DI_TOKENS.AUDIT_EVENT_HANDLER:
            return mockHandlers.audit;
          default:
            throw new Error(`Unknown token: ${token}`);
        }
      }),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    bootstrap = new PubSubBootstrap(mockContainer, mockLogger);
  });

  describe('TC-PSB-001: Instantiation', () => {
    it('should create instance with initial state', () => {
      expect(bootstrap).toBeDefined();
      expect(bootstrap.isReady()).toBe(false);
    });
  });

  describe('TC-PSB-002: Initialize Success', () => {
    it('should initialize successfully', async () => {
      await bootstrap.initialize();

      expect(mockContainer.resolve).toHaveBeenCalledWith(DI_TOKENS.SUBSCRIBER_SERVICE);
      expect(mockSubscriberService.initialize).toHaveBeenCalled();
      expect(bootstrap.isReady()).toBe(true);
    });

    it('should subscribe to correct channels', async () => {
      await bootstrap.initialize();

      expect(mockSubscriberService.subscribe).toHaveBeenCalledWith(
        PUBSUB_CHANNELS.PRODUCT,
        expect.any(Function)
      );
      expect(mockSubscriberService.subscribe).toHaveBeenCalledWith(
        PUBSUB_CHANNELS.AUDIT,
        expect.any(Function)
      );
    });
  });

  describe('TC-PSB-003: Double Initialization', () => {
    it('should prevent double initialization', async () => {
      await bootstrap.initialize();
      await bootstrap.initialize();

      expect(mockLogger.warn).toHaveBeenCalledWith('Pub/Sub system already initialized');
    });
  });

  describe('TC-PSB-005: Product Event Routing', () => {
    it('should route PRODUCT_CREATED to correct handler', async () => {
      await bootstrap.initialize();

      const productHandler = mockSubscriberService.subscribe.mock.calls.find(
        (call) => call[0] === PUBSUB_CHANNELS.PRODUCT
      )[1];

      const event = {
        eventId: 'evt_1',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        payload: { productId: '1', name: 'Test', price: 10, category: 'Test' },
      };

      productHandler(event);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockHandlers.created.handle).toHaveBeenCalledWith(event);
    });

    it('should route PRODUCT_UPDATED to correct handler', async () => {
      await bootstrap.initialize();

      const productHandler = mockSubscriberService.subscribe.mock.calls.find(
        (call) => call[0] === PUBSUB_CHANNELS.PRODUCT
      )[1];

      const event = {
        eventId: 'evt_1',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_UPDATED,
        payload: { productId: '1', changes: {} },
      };

      productHandler(event);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockHandlers.updated.handle).toHaveBeenCalledWith(event);
    });

    it('should route PRODUCT_DELETED to correct handler', async () => {
      await bootstrap.initialize();

      const productHandler = mockSubscriberService.subscribe.mock.calls.find(
        (call) => call[0] === PUBSUB_CHANNELS.PRODUCT
      )[1];

      const event = {
        eventId: 'evt_1',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_DELETED,
        payload: { productId: '1' },
      };

      productHandler(event);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockHandlers.deleted.handle).toHaveBeenCalledWith(event);
    });
  });

  describe('TC-PSB-006: Audit Event Routing', () => {
    it('should route USER_ACTIVITY to audit handler', async () => {
      await bootstrap.initialize();

      const auditHandler = mockSubscriberService.subscribe.mock.calls.find(
        (call) => call[0] === PUBSUB_CHANNELS.AUDIT
      )[1];

      const event = {
        eventId: 'evt_1',
        eventType: PUBSUB_EVENT_TYPES.USER_ACTIVITY,
        payload: { userId: 'user_1', action: 'LOGIN_SUCCESS', metadata: {} },
      };

      auditHandler(event);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockHandlers.audit.handle).toHaveBeenCalledWith(event);
    });
  });

  describe('TC-PSB-007: Unknown Event Type', () => {
    it('should log warning for unknown event types', async () => {
      await bootstrap.initialize();

      const productHandler = mockSubscriberService.subscribe.mock.calls.find(
        (call) => call[0] === PUBSUB_CHANNELS.PRODUCT
      )[1];

      productHandler({
        eventId: 'evt_1',
        eventType: 'UNKNOWN_EVENT',
        payload: {},
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'UNKNOWN_EVENT' }),
        'Unknown product event type received'
      );
    });
  });

  describe('TC-PSB-009: Graceful Shutdown', () => {
    it('should disconnect subscriber on shutdown', async () => {
      await bootstrap.initialize();
      await bootstrap.shutdown();

      expect(mockSubscriberService.disconnect).toHaveBeenCalled();
      expect(bootstrap.isReady()).toBe(false);
    });
  });

  describe('TC-PSB-011: isReady Status', () => {
    it('should return correct initialization status', async () => {
      expect(bootstrap.isReady()).toBe(false);

      await bootstrap.initialize();
      expect(bootstrap.isReady()).toBe(true);

      await bootstrap.shutdown();
      expect(bootstrap.isReady()).toBe(false);
    });
  });
});
```

---

## Summary

| Test Case  | Description                       | Priority |
| ---------- | --------------------------------- | -------- |
| TC-PSB-001 | Instantiation                     | High     |
| TC-PSB-002 | Initialize Success                | High     |
| TC-PSB-003 | Double Initialization Prevention  | Medium   |
| TC-PSB-004 | Initialization Failure Handling   | High     |
| TC-PSB-005 | Product Event Routing             | High     |
| TC-PSB-006 | Audit Event Routing               | High     |
| TC-PSB-007 | Unknown Event Type                | Medium   |
| TC-PSB-008 | Handler Error Handling            | High     |
| TC-PSB-009 | Graceful Shutdown                 | High     |
| TC-PSB-010 | Shutdown Without Initialization   | Medium   |
| TC-PSB-011 | isReady Status Check              | Low      |
| TC-PSB-012 | Shutdown Error Handling           | Medium   |
| TC-PSB-013 | DI Token Resolution               | High     |
| TC-PSB-014 | Channel Subscription Verification | Medium   |
| TC-PSB-015 | Event Handler Type Safety         | Medium   |
| TC-PSB-016 | Multiple Events Processing        | Medium   |
| TC-PSB-017 | Handler Promise Handling          | Medium   |

---

## Related Documentation

- [Application Bootstrap Analysis](../../analysis/pubsub/step3.2-Application-Bootstrap.md)
- [DI Container Registration Analysis](../../analysis/pubsub/step3.1-DI-Container-Registration.md)
- [Publisher Service Test](./step1.4-publisher-service-test.md)
- [Subscriber Service Test](./step1.5-subscriber-service-test.md)
