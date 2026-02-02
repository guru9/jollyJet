# Test Analysis: Subscriber Service

## Component Information

- **Source File**: [`src/domain/services/redis/SubscriberService.ts`](../../../src/domain/services/redis/SubscriberService.ts:1)
- **Interface File**: [`src/domain/interfaces/redis/ISubscriberService.ts`](../../../src/domain/interfaces/redis/ISubscriberService.ts:1)
- **Analysis File**: [`docs/analysis/pubsub/step1.5-Subscriber-Service-Implementation.md`](../../analysis/pubsub/step1.5-Subscriber-Service-Implementation.md:1)

---

## Overview

This document provides comprehensive test cases for the Subscriber Service implementation. The Subscriber Service manages Redis Pub/Sub subscriptions, handles incoming messages, routes events to appropriate handlers, and provides connection management with automatic reconnection support.

---

## Test Cases

### TC-SUB-001: SubscriberService Instantiation

**Objective**: Verify SubscriberService can be instantiated with required dependencies.

**Test Type**: Unit Test

**Input**:

```typescript
const mockRedisService = {
  // Mock Redis service
};
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

const subscriberService = new SubscriberService(mockRedisService, mockLogger);
```

**Expected Output**:

- SubscriberService instance created successfully
- Dependencies properly injected
- Initial state: isConnected = false
- handlers Map is empty
- subscriberClient = null

---

### TC-SUB-002: Initialize with Redis Disabled

**Objective**: Verify initialization behavior when Redis is disabled.

**Test Type**: Unit Test

**Input**:

```typescript
// Mock config.redisConfig.disabled = true
await subscriberService.initialize();
```

**Expected Output**:

- Warning logged: "Redis is disabled. Subscriber service will not be initialized."
- isConnected remains false
- subscriberClient remains null
- No Redis connection attempted

---

### TC-SUB-003: Successful Initialization

**Objective**: Verify successful initialization creates Redis subscriber client.

**Test Type**: Unit Test

**Input**:

```typescript
// Mock config.redisConfig.disabled = false
// Mock Redis constructor
await subscriberService.initialize();
```

**Expected Output**:

- New Redis client created with correct configuration
- Event handlers set up (error, end, connect, ready)
- Client connects successfully
- isConnected set to true
- Success message logged

---

### TC-SUB-004: Double Initialization Prevention

**Objective**: Verify initialize() prevents double initialization.

**Test Type**: Unit Test

**Input**:

```typescript
await subscriberService.initialize();
await subscriberService.initialize(); // Second call
```

**Expected Output**:

- First initialization succeeds
- Second initialization logs warning: "Subscriber service already initialized"
- No duplicate Redis client created

---

### TC-SUB-005: Subscribe to Channel

**Objective**: Verify subscribe method registers handler and subscribes to Redis channel.

**Test Type**: Unit Test

**Input**:

```typescript
const handler = jest.fn();
await subscriberService.initialize();
subscriberService.subscribe('jollyjet:events:product', handler);
```

**Expected Output**:

- Handler stored in handlers Map
- Redis subscribe called with channel name
- Success message logged on subscription
- Message event listener set up

---

### TC-SUB-006: Subscribe Before Initialization

**Objective**: Verify subscribe throws error if called before initialize.

**Test Type**: Unit Test

**Input**:

```typescript
const handler = jest.fn();
subscriberService.subscribe('channel', handler); // No initialization
```

**Expected Output**:

- Error thrown: "Subscriber service not initialized. Call initialize() first."
- Error logged
- Handler not registered

---

### TC-SUB-007: Message Handling

**Objective**: Verify incoming messages are parsed and routed to correct handler.

**Test Type**: Unit Test

**Input**:

```typescript
const handler = jest.fn();
await subscriberService.initialize();
subscriberService.subscribe('channel', handler);

// Simulate message received
const message = JSON.stringify({
  eventId: 'evt_123',
  eventType: 'PRODUCT_CREATED',
  payload: { productId: 'prod_456' },
});

// Trigger message event
mockSubscriberClient.emit('message', 'channel', message);
```

**Expected Output**:

- Message parsed from JSON
- Handler called with parsed event
- Handler receives correct event object

---

### TC-SUB-008: Message Parse Error Handling

**Objective**: Verify invalid JSON messages are handled gracefully.

**Test Type**: Unit Test

**Input**:

```typescript
const handler = jest.fn();
await subscriberService.initialize();
subscriberService.subscribe('channel', handler);

// Simulate invalid message
mockSubscriberClient.emit('message', 'channel', 'invalid json{{');
```

**Expected Output**:

- Parse error caught
- Error logged: "Failed to parse message from channel"
- Handler not called
- Service continues running

---

### TC-SUB-009: Handler Error Handling

**Objective**: Verify errors in handlers don't crash the subscription.

**Test Type**: Unit Test

**Input**:

```typescript
const errorHandler = jest.fn().mockRejectedValue(new Error('Handler error'));
await subscriberService.initialize();
subscriberService.subscribe('channel', errorHandler);

const message = JSON.stringify({ eventId: 'evt_123', eventType: 'TEST' });
mockSubscriberClient.emit('message', 'channel', message);
```

**Expected Output**:

- Handler error caught
- Error logged
- Service continues running
- Other handlers unaffected

---

### TC-SUB-010: Unsubscribe from Channel

**Objective**: Verify unsubscribe removes handler and stops receiving messages.

**Test Type**: Unit Test

**Input**:

```typescript
const handler = jest.fn();
await subscriberService.initialize();
subscriberService.subscribe('channel', handler);
subscriberService.unsubscribe('channel');
```

**Expected Output**:

- Handler removed from handlers Map
- Redis unsubscribe called
- Success message logged
- No more messages received on channel

---

### TC-SUB-011: Unsubscribe Before Initialization

**Objective**: Verify unsubscribe handles uninitialized state gracefully.

**Test Type**: Unit Test

**Input**:

```typescript
subscriberService.unsubscribe('channel'); // Not initialized
```

**Expected Output**:

- Warning logged: "Cannot unsubscribe from channel: Subscriber not initialized"
- No error thrown
- Service continues running

---

### TC-SUB-012: Connection Error Handling

**Objective**: Verify connection errors are handled and logged.

**Test Type**: Unit Test

**Input**:

```typescript
await subscriberService.initialize();
mockSubscriberClient.emit('error', new Error('Connection lost'));
```

**Expected Output**:

- Error logged: "Subscriber client error"
- isConnected set to false
- Service attempts reconnection

---

### TC-SUB-013: Disconnection and Reconnection

**Objective**: Verify automatic reconnection on disconnection.

**Test Type**: Unit Test

**Input**:

```typescript
await subscriberService.initialize();
mockSubscriberClient.emit('end'); // Simulate disconnection
```

**Expected Output**:

- Disconnection logged
- isConnected set to false
- Reconnection scheduled with exponential backoff
- Reconnection attempt logged

---

### TC-SUB-014: Max Reconnection Attempts

**Objective**: Verify service stops reconnecting after max attempts.

**Test Type**: Unit Test

**Input**:

```typescript
await subscriberService.initialize();
// Simulate 5 disconnection events
for (let i = 0; i < 6; i++) {
  mockSubscriberClient.emit('end');
}
```

**Expected Output**:

- First 5 attempts trigger reconnection
- 6th attempt does not trigger reconnection
- Warning logged: "Redis subscriber reconnection attempts exhausted"

---

### TC-SUB-015: Resubscribe After Reconnection

**Objective**: Verify channels are resubscribed after successful reconnection.

**Test Type**: Unit Test

**Input**:

```typescript
const handler = jest.fn();
await subscriberService.initialize();
subscriberService.subscribe('channel1', handler);
subscriberService.subscribe('channel2', handler);

mockSubscriberClient.emit('end'); // Disconnect
mockSubscriberClient.emit('ready'); // Reconnect
```

**Expected Output**:

- All previous channels resubscribed
- Resubscription logged for each channel
- Handlers remain registered

---

### TC-SUB-016: Graceful Disconnect

**Objective**: Verify disconnect cleans up resources properly.

**Test Type**: Unit Test

**Input**:

```typescript
await subscriberService.initialize();
subscriberService.subscribe('channel1', jest.fn());
subscriberService.subscribe('channel2', jest.fn());
await subscriberService.disconnect();
```

**Expected Output**:

- All handlers cleared from Map
- Redis client quit called
- isConnected set to false
- Success message logged

---

### TC-SUB-017: Get Connection Status

**Objective**: Verify getConnectionStatus returns correct state.

**Test Type**: Unit Test

**Input**:

```typescript
// Before initialization
const status1 = subscriberService.getConnectionStatus();

await subscriberService.initialize();
const status2 = subscriberService.getConnectionStatus();

await subscriberService.disconnect();
const status3 = subscriberService.getConnectionStatus();
```

**Expected Output**:

- status1: false
- status2: true
- status3: false

---

### TC-SUB-018: Get Subscribed Channels

**Objective**: Verify getSubscribedChannels returns list of channels.

**Test Type**: Unit Test

**Input**:

```typescript
await subscriberService.initialize();
subscriberService.subscribe('channel1', jest.fn());
subscriberService.subscribe('channel2', jest.fn());
subscriberService.subscribe('channel3', jest.fn());

const channels = subscriberService.getSubscribedChannels();
```

**Expected Output**:

- Returns ['channel1', 'channel2', 'channel3']
- Array contains all subscribed channels
- Order matches subscription order

---

### TC-SUB-019: Multiple Handlers Same Channel

**Objective**: Verify only one handler per channel (last one wins).

**Test Type**: Unit Test

**Input**:

```typescript
const handler1 = jest.fn();
const handler2 = jest.fn();
await subscriberService.initialize();

subscriberService.subscribe('channel', handler1);
subscriberService.subscribe('channel', handler2);

const message = JSON.stringify({ eventId: 'evt_123', eventType: 'TEST' });
mockSubscriberClient.emit('message', 'channel', message);
```

**Expected Output**:

- Only handler2 called
- handler1 replaced by handler2
- Last subscription wins

---

### TC-SUB-020: Wrong Channel Message Filtering

**Objective**: Verify messages from wrong channels are ignored.

**Test Type**: Unit Test

**Input**:

```typescript
const handler = jest.fn();
await subscriberService.initialize();
subscriberService.subscribe('channel1', handler);

// Message from different channel
const message = JSON.stringify({ eventId: 'evt_123', eventType: 'TEST' });
mockSubscriberClient.emit('message', 'channel2', message);
```

**Expected Output**:

- Handler not called
- Message ignored
- No error thrown

---

## Integration Test Scenarios

### TC-SUB-INT-001: End-to-End Subscribe and Receive

**Objective**: Verify complete subscription and message receiving flow.

**Test Type**: Integration Test

**Prerequisites**:

- Redis server running
- Publisher available

**Steps**:

1. Initialize SubscriberService
2. Subscribe to channel with handler
3. Publish message from separate client
4. Verify handler receives message

**Expected Output**:

- Handler called with published message
- Message content matches
- Timing acceptable (< 100ms)

---

### TC-SUB-INT-002: Multiple Subscribers Same Channel

**Objective**: Verify multiple subscribers can receive same message.

**Test Type**: Integration Test

**Steps**:

1. Create two SubscriberService instances
2. Subscribe both to same channel
3. Publish message
4. Verify both handlers receive message

**Expected Output**:

- Both handlers called
- Same message received by both
- No interference between subscribers

---

## Performance Tests

### TC-SUB-PERF-001: High Volume Message Processing

**Objective**: Measure message processing performance.

**Test Type**: Performance Test

**Input**: Receive 10,000 messages

**Expected Output**:

- All messages processed
- Average latency < 10ms per message
- No message loss

---

### TC-SUB-PERF-002: Large Message Handling

**Objective**: Verify handling of large messages.

**Test Type**: Performance Test

**Input**:

```typescript
const largeMessage = JSON.stringify({
  eventId: 'evt_1',
  payload: { data: 'x'.repeat(100000) },
});
```

**Expected Output**:

- Message received and parsed successfully
- No performance degradation
- Memory usage acceptable

---

## Error Scenarios

### TC-SUB-ERR-001: Redis Connection Failure

**Objective**: Verify behavior when Redis connection fails.

**Test Type**: Integration Test

**Steps**:

1. Attempt to initialize with invalid Redis config
2. Verify error handling

**Expected Output**:

- Error thrown
- Error logged
- isConnected remains false

---

### TC-SUB-ERR-002: Handler Timeout

**Objective**: Verify handling of slow handlers.

**Test Type**: Unit Test

**Input**:

```typescript
const slowHandler = jest
  .fn()
  .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 5000)));
```

**Expected Output**:

- Handler executes (no timeout by default)
- Other messages can still be processed
- No blocking of message loop

---

## Test File Template

```typescript
// tests/unit/domain/services/redis/SubscriberService.test.ts
import { SubscriberService } from '@/domain/services/redis/SubscriberService';
import { PUBSUB_CHANNELS, PUBSUB_EVENT_TYPES } from '@/shared/constants';

describe('SubscriberService', () => {
  let subscriberService: SubscriberService;
  let mockRedisService: any;
  let mockSubscriberClient: any;
  let mockLogger: any;
  let RedisConstructor: any;

  beforeEach(() => {
    mockSubscriberClient = {
      subscribe: jest.fn((channel, cb) => cb && cb(null)),
      unsubscribe: jest.fn((channel, cb) => cb && cb(null)),
      on: jest.fn(),
      quit: jest.fn().mockResolvedValue(undefined),
      connect: jest.fn().mockResolvedValue(undefined),
    };

    RedisConstructor = jest.fn().mockReturnValue(mockSubscriberClient);
    jest.doMock('ioredis', () => RedisConstructor);

    mockRedisService = {};
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    subscriberService = new SubscriberService(mockRedisService, mockLogger);
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('TC-SUB-001: Instantiation', () => {
    it('should create instance with initial state', () => {
      expect(subscriberService).toBeDefined();
      expect(subscriberService.getConnectionStatus()).toBe(false);
      expect(subscriberService.getSubscribedChannels()).toEqual([]);
    });
  });

  describe('TC-SUB-003: Initialization', () => {
    it('should initialize successfully', async () => {
      await subscriberService.initialize();
      expect(mockSubscriberClient.connect).toHaveBeenCalled();
      expect(subscriberService.getConnectionStatus()).toBe(true);
    });
  });

  describe('TC-SUB-005: Subscribe', () => {
    it('should subscribe to channel', async () => {
      await subscriberService.initialize();
      const handler = jest.fn();

      subscriberService.subscribe('channel', handler);

      expect(mockSubscriberClient.subscribe).toHaveBeenCalledWith('channel', expect.any(Function));
      expect(subscriberService.getSubscribedChannels()).toContain('channel');
    });

    it('should throw if not initialized', () => {
      const handler = jest.fn();
      expect(() => subscriberService.subscribe('channel', handler)).toThrow(
        'Subscriber service not initialized'
      );
    });
  });

  describe('TC-SUB-007: Message Handling', () => {
    it('should route messages to handler', async () => {
      await subscriberService.initialize();
      const handler = jest.fn();
      subscriberService.subscribe('channel', handler);

      // Get message handler
      const messageHandler = mockSubscriberClient.on.mock.calls.find(
        (call) => call[0] === 'message'
      )[1];

      const event = { eventId: 'evt_123', eventType: 'TEST' };
      messageHandler('channel', JSON.stringify(event));

      expect(handler).toHaveBeenCalledWith(event);
    });
  });

  describe('TC-SUB-016: Disconnect', () => {
    it('should disconnect gracefully', async () => {
      await subscriberService.initialize();
      subscriberService.subscribe('channel', jest.fn());

      await subscriberService.disconnect();

      expect(mockSubscriberClient.quit).toHaveBeenCalled();
      expect(subscriberService.getConnectionStatus()).toBe(false);
      expect(subscriberService.getSubscribedChannels()).toEqual([]);
    });
  });
});
```

---

## Summary

| Test Case      | Description                      | Priority |
| -------------- | -------------------------------- | -------- |
| TC-SUB-001     | Service Instantiation            | High     |
| TC-SUB-002     | Redis Disabled Handling          | Medium   |
| TC-SUB-003     | Successful Initialization        | High     |
| TC-SUB-004     | Double Initialization Prevention | Medium   |
| TC-SUB-005     | Subscribe to Channel             | High     |
| TC-SUB-006     | Subscribe Before Initialization  | High     |
| TC-SUB-007     | Message Handling                 | High     |
| TC-SUB-008     | Message Parse Error              | High     |
| TC-SUB-009     | Handler Error Handling           | High     |
| TC-SUB-010     | Unsubscribe                      | High     |
| TC-SUB-012     | Connection Error Handling        | High     |
| TC-SUB-013     | Disconnection and Reconnection   | High     |
| TC-SUB-014     | Max Reconnection Attempts        | Medium   |
| TC-SUB-015     | Resubscribe After Reconnection   | Medium   |
| TC-SUB-016     | Graceful Disconnect              | High     |
| TC-SUB-017     | Get Connection Status            | Low      |
| TC-SUB-018     | Get Subscribed Channels          | Low      |
| TC-SUB-019     | Multiple Handlers Same Channel   | Medium   |
| TC-SUB-INT-001 | End-to-End Flow                  | High     |

---

## Related Documentation

- [Subscriber Service Interface Analysis](../../analysis/pubsub/step1.3-Subscriber-Service-Interface.md)
- [Subscriber Service Implementation Analysis](../../analysis/pubsub/step1.5-Subscriber-Service-Implementation.md)
- [Publisher Service Test](./step1.4-publisher-service-test.md)
