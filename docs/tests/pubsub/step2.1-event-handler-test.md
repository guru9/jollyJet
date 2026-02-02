# Test Analysis: Event Handler Base Class

## Component Information

- **Source File**: [`src/domain/services/events/EventHandler.ts`](../../../src/domain/services/events/EventHandler.ts:1)
- **Analysis File**: [`docs/analysis/pubsub/step2.1-Event-Handler-Base-Class.md`](../../analysis/pubsub/step2.1-Event-Handler-Base-Class.md:1)

---

## Overview

This document provides comprehensive test cases for the Event Handler Base Class. The EventHandler abstract class provides common functionality for all event handlers including retry logic with exponential backoff, structured logging, error handling, and Dead Letter Queue (DLQ) support.

---

## Test Cases

### TC-EH-001: EventHandler Instantiation

**Objective**: Verify EventHandler cannot be instantiated directly (abstract class).

**Test Type**: Unit Test

**Input**:

```typescript
const mockLogger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };

// Attempt to instantiate abstract class
const handler = new EventHandler(mockLogger);
```

**Expected Output**:

- TypeScript compilation error OR
- Runtime error when attempting instantiation
- Abstract class behavior enforced

---

### TC-EH-002: Concrete Handler Implementation

**Objective**: Verify concrete handler can extend EventHandler.

**Test Type**: Unit Test

**Input**:

```typescript
class TestHandler extends EventHandler<BaseEvent> {
  protected readonly maxRetries = 3;

  async handle(event: BaseEvent): Promise<void> {
    this.logEventReceived(event);
    // Handler logic
    this.logEventSuccess(event);
  }
}

const mockLogger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
const handler = new TestHandler(mockLogger);
```

**Expected Output**:

- Concrete handler created successfully
- maxRetries property set correctly
- Logger injected properly

---

### TC-EH-003: Execute With Retry - Success on First Attempt

**Objective**: Verify operation succeeds without retry on first attempt.

**Test Type**: Unit Test

**Input**:

```typescript
class TestHandler extends EventHandler<BaseEvent> {
  protected readonly maxRetries = 3;

  async handle(event: BaseEvent): Promise<void> {
    await this.executeWithRetry(async () => {
      // Success on first try
    }, event.eventId);
  }
}

const handler = new TestHandler(mockLogger);
const event = { eventId: 'evt_123', eventType: 'TEST', timestamp: new Date() };
await handler.handle(event);
```

**Expected Output**:

- Operation executed once
- No retry attempts
- Success logged

---

### TC-EH-004: Execute With Retry - Success on Retry

**Objective**: Verify retry mechanism works when operation fails then succeeds.

**Test Type**: Unit Test

**Input**:

```typescript
let attempts = 0;
class TestHandler extends EventHandler<BaseEvent> {
  protected readonly maxRetries = 3;

  async handle(event: BaseEvent): Promise<void> {
    await this.executeWithRetry(async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error(`Attempt ${attempts} failed`);
      }
    }, event.eventId);
  }
}

const handler = new TestHandler(mockLogger);
await handler.handle({ eventId: 'evt_123', eventType: 'TEST', timestamp: new Date() });
```

**Expected Output**:

- Operation executed 3 times
- Retry warnings logged for first 2 failures
- Success on 3rd attempt
- Exponential backoff between retries

---

### TC-EH-005: Execute With Retry - All Retries Exhausted

**Objective**: Verify error thrown when all retries fail.

**Test Type**: Unit Test

**Input**:

```typescript
class TestHandler extends EventHandler<BaseEvent> {
  protected readonly maxRetries = 3;

  async handle(event: BaseEvent): Promise<void> {
    await this.executeWithRetry(async () => {
      throw new Error('Persistent failure');
    }, event.eventId);
  }
}

const handler = new TestHandler(mockLogger);
```

**Expected Output**:

- Operation executed 3 times (initial + 2 retries)
- Retry warnings logged for each attempt
- Final error logged
- Error thrown to caller

**Verification**:

```typescript
await expect(handler.handle(event)).rejects.toThrow('Persistent failure');
expect(mockLogger.error).toHaveBeenCalledWith(
  expect.objectContaining({ attempts: 3 }),
  'Event handling failed after all retries'
);
```

---

### TC-EH-006: Exponential Backoff Timing

**Objective**: Verify retry delays follow exponential backoff pattern.

**Test Type**: Unit Test

**Input**:

```typescript
class TestHandler extends EventHandler<BaseEvent> {
  protected readonly maxRetries = 4;
  protected readonly retryDelayMs = 1000; // 1 second base

  async handle(event: BaseEvent): Promise<void> {
    await this.executeWithRetry(async () => {
      throw new Error('Always fails');
    }, event.eventId);
  }
}
```

**Expected Output**:

- Retry 1: 1000ms delay (1000 \* 2^0)
- Retry 2: 2000ms delay (1000 \* 2^1)
- Retry 3: 4000ms delay (1000 \* 2^2)
- Total delay: ~7000ms

---

### TC-EH-007: Log Event Received

**Objective**: Verify logEventReceived logs correct information.

**Test Type**: Unit Test

**Input**:

```typescript
const event: BaseEvent = {
  eventId: 'evt_123',
  eventType: 'PRODUCT_CREATED',
  timestamp: new Date('2024-01-01T00:00:00Z'),
  correlationId: 'req-456',
};

handler.logEventReceived(event);
```

**Expected Output**:

```typescript
expect(mockLogger.info).toHaveBeenCalledWith(
  {
    eventId: 'evt_123',
    eventType: 'PRODUCT_CREATED',
    correlationId: 'req-456',
    timestamp: event.timestamp,
  },
  'Received PRODUCT_CREATED event'
);
```

---

### TC-EH-008: Log Event Success

**Objective**: Verify logEventSuccess logs correct information.

**Test Type**: Unit Test

**Input**:

```typescript
const event: BaseEvent = {
  eventId: 'evt_123',
  eventType: 'PRODUCT_CREATED',
  timestamp: new Date(),
  correlationId: 'req-456',
};

handler.logEventSuccess(event);
```

**Expected Output**:

```typescript
expect(mockLogger.info).toHaveBeenCalledWith(
  {
    eventId: 'evt_123',
    eventType: 'PRODUCT_CREATED',
    correlationId: 'req-456',
  },
  'Successfully processed PRODUCT_CREATED event'
);
```

---

### TC-EH-009: Log Event Error

**Objective**: Verify logEventError logs correct information.

**Test Type**: Unit Test

**Input**:

```typescript
const event: BaseEvent = {
  eventId: 'evt_123',
  eventType: 'PRODUCT_CREATED',
  timestamp: new Date(),
  correlationId: 'req-456',
};
const error = new Error('Processing failed');

handler.logEventError(event, error);
```

**Expected Output**:

```typescript
expect(mockLogger.error).toHaveBeenCalledWith(
  {
    eventId: 'evt_123',
    eventType: 'PRODUCT_CREATED',
    correlationId: 'req-456',
    error: 'Processing failed',
    stack: error.stack,
  },
  'Error processing PRODUCT_CREATED event'
);
```

---

### TC-EH-010: Send to DLQ

**Objective**: Verify sendToDLQ creates correct DLQ event structure.

**Test Type**: Unit Test

**Input**:

```typescript
const event: BaseEvent = {
  eventId: 'evt_123',
  eventType: 'PRODUCT_CREATED',
  timestamp: new Date(),
  correlationId: 'req-456',
};
const error = new Error('Processing failed');
const mockPublisher = { publish: jest.fn().mockResolvedValue(undefined) };

await handler.sendToDLQ(event, error, mockPublisher);
```

**Expected Output**:

- DLQ event published to PUBSUB_CHANNELS.DLQ
- DLQ event contains:
  - originalEvent: full original event
  - error: { message, stack, timestamp }
  - failedAt: Date
- Error logged with event details

---

### TC-EH-011: Send to DLQ Without Publisher

**Objective**: Verify sendToDLQ works without publisher service.

**Test Type**: Unit Test

**Input**:

```typescript
await handler.sendToDLQ(event, error); // No publisher provided
```

**Expected Output**:

- Error logged
- No publish attempted
- No error thrown

---

### TC-EH-012: Send to DLQ Publish Failure

**Objective**: Verify DLQ publish failure is handled gracefully.

**Test Type**: Unit Test

**Input**:

```typescript
const mockPublisher = {
  publish: jest.fn().mockRejectedValue(new Error('Publish failed')),
};

await handler.sendToDLQ(event, error, mockPublisher);
```

**Expected Output**:

- Publish error caught
- Error logged: "Failed to publish event to DLQ"
- No error thrown to caller

---

### TC-EH-013: Validate Event - Valid

**Objective**: Verify validateEvent returns true for valid events.

**Test Type**: Unit Test

**Input**:

```typescript
const validEvent = {
  eventId: 'evt_123',
  eventType: 'TEST',
  timestamp: new Date(),
};

const result = handler.validateEvent(validEvent);
```

**Expected Output**:

- result: true

---

### TC-EH-014: Validate Event - Invalid

**Objective**: Verify validateEvent returns false for invalid events.

**Test Type**: Unit Test

**Input**:

```typescript
const invalidEvents = [
  null,
  undefined,
  {},
  { eventId: 'evt_123' }, // missing eventType and timestamp
  { eventId: 'evt_123', eventType: 'TEST' }, // missing timestamp
  { eventId: 123, eventType: 'TEST', timestamp: new Date() }, // wrong type
  { eventId: 'evt_123', eventType: 123, timestamp: new Date() }, // wrong type
  { eventId: 'evt_123', eventType: 'TEST', timestamp: '2024-01-01' }, // wrong type
];
```

**Expected Output**:

- All invalid events return false

---

### TC-EH-015: Custom Retry Delay

**Objective**: Verify custom retryDelayMs is respected.

**Test Type**: Unit Test

**Input**:

```typescript
class CustomDelayHandler extends EventHandler<BaseEvent> {
  protected readonly maxRetries = 2;
  protected readonly retryDelayMs = 500; // 500ms base

  async handle(event: BaseEvent): Promise<void> {
    await this.executeWithRetry(async () => {
      throw new Error('Fail');
    }, event.eventId);
  }
}
```

**Expected Output**:

- First retry after 500ms
- Second retry after 1000ms

---

### TC-EH-016: Zero Max Retries

**Objective**: Verify behavior when maxRetries is 0.

**Test Type**: Unit Test

**Input**:

```typescript
class NoRetryHandler extends EventHandler<BaseEvent> {
  protected readonly maxRetries = 0;

  async handle(event: BaseEvent): Promise<void> {
    await this.executeWithRetry(async () => {
      throw new Error('Fail');
    }, event.eventId);
  }
}
```

**Expected Output**:

- Operation executed once
- No retries attempted
- Error thrown immediately

---

### TC-EH-017: Async Operation in Retry

**Objective**: Verify async operations work correctly in retry loop.

**Test Type**: Unit Test

**Input**:

```typescript
class AsyncHandler extends EventHandler<BaseEvent> {
  protected readonly maxRetries = 3;

  async handle(event: BaseEvent): Promise<void> {
    await this.executeWithRetry(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      if (Math.random() > 0.5) throw new Error('Random failure');
    }, event.eventId);
  }
}
```

**Expected Output**:

- Async operation awaited properly
- Retry loop waits for completion
- No race conditions

---

### TC-EH-018: Event Without CorrelationId

**Objective**: Verify handler works with events missing optional correlationId.

**Test Type**: Unit Test

**Input**:

```typescript
const eventWithoutCorrelation: BaseEvent = {
  eventId: 'evt_123',
  eventType: 'TEST',
  timestamp: new Date(),
  // correlationId omitted
};

await handler.handle(eventWithoutCorrelation);
```

**Expected Output**:

- Handler executes successfully
- Logging works with undefined correlationId
- No errors

---

## Integration Test Scenarios

### TC-EH-INT-001: Full Handler Flow

**Objective**: Verify complete handler execution flow.

**Test Type**: Integration Test

**Steps**:

1. Create handler
2. Call handle with event
3. Verify all logging calls
4. Verify operation execution

**Expected Output**:

- logEventReceived called
- Operation executed
- logEventSuccess called
- Correct sequence maintained

---

### TC-EH-INT-002: Handler with Retry and DLQ

**Objective**: Verify retry exhaustion leads to DLQ.

**Test Type**: Integration Test

**Steps**:

1. Create handler with maxRetries = 2
2. Configure handler to always fail
3. Provide mock publisher
4. Call handle

**Expected Output**:

- 2 retry attempts made
- All retries fail
- Event sent to DLQ
- Error thrown

---

## Performance Tests

### TC-EH-PERF-001: Retry Performance

**Objective**: Measure retry loop performance.

**Test Type**: Performance Test

**Input**: Handler with maxRetries = 3, immediate failure

**Expected Output**:

- Total execution time ~7 seconds (with default 1000ms base delay)
- No memory leaks
- Consistent timing

---

## Test File Template

```typescript
// tests/unit/domain/services/events/EventHandler.test.ts
import { EventHandler } from '@/domain/services/events/EventHandler';
import { BaseEvent } from '@/domain/events';
import { PUBSUB_CHANNELS } from '@/shared/constants';

// Concrete implementation for testing
class TestHandler extends EventHandler<BaseEvent> {
  protected readonly maxRetries = 3;
  public operation = jest.fn();

  async handle(event: BaseEvent): Promise<void> {
    this.logEventReceived(event);
    await this.executeWithRetry(async () => {
      await this.operation();
    }, event.eventId);
    this.logEventSuccess(event);
  }
}

describe('EventHandler', () => {
  let handler: TestHandler;
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
    handler = new TestHandler(mockLogger);
  });

  describe('TC-EH-002: Concrete Implementation', () => {
    it('should create concrete handler', () => {
      expect(handler).toBeDefined();
      expect(handler.maxRetries).toBe(3);
    });
  });

  describe('TC-EH-003: Success on First Attempt', () => {
    it('should execute without retry on success', async () => {
      handler.operation.mockResolvedValue(undefined);
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: 'TEST',
        timestamp: new Date(),
      };

      await handler.handle(event);

      expect(handler.operation).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({ eventId: 'evt_123' }),
        expect.stringContaining('Received')
      );
    });
  });

  describe('TC-EH-005: All Retries Exhausted', () => {
    it('should throw after all retries fail', async () => {
      handler.operation.mockRejectedValue(new Error('Persistent failure'));
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: 'TEST',
        timestamp: new Date(),
      };

      await expect(handler.handle(event)).rejects.toThrow('Persistent failure');
      expect(handler.operation).toHaveBeenCalledTimes(3);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({ attempts: 3 }),
        'Event handling failed after all retries'
      );
    });
  });

  describe('TC-EH-010: Send to DLQ', () => {
    it('should publish to DLQ with correct structure', async () => {
      const mockPublisher = { publish: jest.fn().mockResolvedValue(undefined) };
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: 'TEST',
        timestamp: new Date(),
      };
      const error = new Error('Failed');

      await handler.sendToDLQ(event, error, mockPublisher);

      expect(mockPublisher.publish).toHaveBeenCalledWith(
        PUBSUB_CHANNELS.DLQ,
        expect.objectContaining({
          originalEvent: event,
          error: expect.objectContaining({
            message: 'Failed',
            stack: expect.any(String),
            timestamp: expect.any(Date),
          }),
          failedAt: expect.any(Date),
        })
      );
    });
  });

  describe('TC-EH-013: Validate Event', () => {
    it('should return true for valid events', () => {
      const validEvent = {
        eventId: 'evt_123',
        eventType: 'TEST',
        timestamp: new Date(),
      };
      expect(handler.validateEvent(validEvent)).toBe(true);
    });

    it('should return false for invalid events', () => {
      expect(handler.validateEvent(null)).toBe(false);
      expect(handler.validateEvent({})).toBe(false);
      expect(handler.validateEvent({ eventId: '123' })).toBe(false);
    });
  });
});
```

---

## Summary

| Test Case | Description                | Priority |
| --------- | -------------------------- | -------- |
| TC-EH-001 | Abstract Class Enforcement | Medium   |
| TC-EH-002 | Concrete Implementation    | High     |
| TC-EH-003 | Success Without Retry      | High     |
| TC-EH-004 | Success on Retry           | High     |
| TC-EH-005 | All Retries Exhausted      | High     |
| TC-EH-006 | Exponential Backoff        | Medium   |
| TC-EH-007 | Log Event Received         | Medium   |
| TC-EH-008 | Log Event Success          | Medium   |
| TC-EH-009 | Log Event Error            | Medium   |
| TC-EH-010 | Send to DLQ                | High     |
| TC-EH-011 | DLQ Without Publisher      | Low      |
| TC-EH-012 | DLQ Publish Failure        | Medium   |
| TC-EH-013 | Validate Event - Valid     | Medium   |
| TC-EH-014 | Validate Event - Invalid   | Medium   |
| TC-EH-015 | Custom Retry Delay         | Low      |
| TC-EH-016 | Zero Max Retries           | Low      |
| TC-EH-017 | Async Operation            | Medium   |
| TC-EH-018 | Missing CorrelationId      | Low      |

---

## Related Documentation

- [Event Handler Base Class Analysis](../../analysis/pubsub/step2.1-Event-Handler-Base-Class.md)
- [Product Event Handlers Test](./step2.2-product-event-handlers-test.md)
- [Audit Event Handler Test](./step2.3-audit-event-handler-test.md)
