# Step 1.3: Subscriber Service Interface

## Overview

This document analyzes the implementation of the Subscriber Service Interface for the Redis Pub/Sub messaging system in the JollyJet e-commerce application. The interface defines the contract for subscribing to Redis channels and handling incoming messages, enabling event-driven communication.

## Dependencies

- **Depends on:**
  - Step 1.1: Event Definitions and Types (uses event types)
- **Required by:**
  - Step 1.5: Subscriber Service Implementation
  - Step 2.1: Event Handler Base Class
  - Step 3.1: DI Container Registration
  - Step 3.2: Application Bootstrap

## Implementation Details

### File Location

- **Source**: `src/domain/interfaces/redis/ISubscriberService.ts`
- **Purpose**: Define contract for subscribing to channels

### Interface Definition

```typescript
export interface ISubscriberService {
  /**
   * Subscribes to a Redis channel with a message handler
   * @param channel - The channel name to subscribe to
   * @param handler - The function to handle incoming messages
   */
  subscribe(channel: string, handler: (message: any) => void): void;

  /**
   * Unsubscribes from a Redis channel
   * @param channel - The channel name to unsubscribe from
   */
  unsubscribe(channel: string): void;
}
```

**Key Features:**

- Simple interface for subscription management
- Handler-based message processing
- Support for multiple channels
- Unsubscription capability

### Method Signatures

**subscribe(channel: string, handler: (message: any) => void): void**

| Parameter | Type                   | Description                             |
| --------- | ---------------------- | --------------------------------------- |
| channel   | string                 | The Redis channel name to subscribe to  |
| handler   | (message: any) => void | Callback function for received messages |
| Returns   | void                   | No return value                         |

**Key Features:**

- **Channel subscription:** Subscribe to specific Redis channels
- **Handler registration:** Register callback for message processing
- **Multiple subscriptions:** Support subscribing to multiple channels
- **Synchronous:** Returns immediately, doesn't wait for messages

**unsubscribe(channel: string): void**

| Parameter | Type   | Description                                |
| --------- | ------ | ------------------------------------------ |
| channel   | string | The Redis channel name to unsubscribe from |
| Returns   | void   | No return value                            |

**Key Features:**

- **Cleanup:** Remove subscription and free resources
- **Memory management:** Prevent memory leaks from unused handlers
- **Graceful shutdown:** Unsubscribe before application termination

## Design Decisions

### 1. Synchronous Subscription

**Decision:** `subscribe` method returns `void` (synchronous)

**Rationale:**

- Simplicity: No need to wait for subscription confirmation
- Performance: Non-blocking subscription setup
- Flexibility: Handler is called asynchronously when messages arrive

**Trade-off:**

- No confirmation that subscription succeeded
- Errors may only surface when first message arrives

### 2. Handler-based API

**Decision:** Use callback handler for message processing

**Rationale:**

- Event-driven: Natural fit for pub/sub pattern
- Decoupling: Separates subscription from message processing
- Flexibility: Different handlers for different channels

**Alternative Considered:**

- EventEmitter pattern (more complex, less explicit)
- Observable pattern (requires RxJS dependency)

### 3. No Return Value for Unsubscribe

**Decision:** `unsubscribe` returns `void`

**Rationale:**

- Simplicity: Unsubscription is typically fire-and-forget
- Performance: No need to wait for confirmation
- Error handling: Errors logged by implementation, not thrown

## Usage Examples

### Basic Subscription

```typescript
import { ISubscriberService } from '../interfaces/redis/ISubscriberService';
import { EVENT_CHANNELS } from '../events';

class ProductEventListener {
  constructor(private subscriberService: ISubscriberService) {}

  startListening(): void {
    this.subscriberService.subscribe(EVENT_CHANNELS.PRODUCT, (message) => {
      console.log('Received product event:', message);
      // Handle the event
    });
  }

  stopListening(): void {
    this.subscriberService.unsubscribe(EVENT_CHANNELS.PRODUCT);
  }
}
```

### With Event Routing

```typescript
class EventRouter {
  constructor(private subscriberService: ISubscriberService) {}

  setupRoutes(): void {
    // Subscribe to product events
    this.subscriberService.subscribe(EVENT_CHANNELS.PRODUCT, (event) =>
      this.handleProductEvent(event)
    );

    // Subscribe to audit events
    this.subscriberService.subscribe(EVENT_CHANNELS.AUDIT, (event) => this.handleAuditEvent(event));
  }

  private handleProductEvent(event: any): void {
    switch (event.eventType) {
      case 'PRODUCT_CREATED':
        this.handleProductCreated(event);
        break;
      case 'PRODUCT_UPDATED':
        this.handleProductUpdated(event);
        break;
      case 'PRODUCT_DELETED':
        this.handleProductDeleted(event);
        break;
    }
  }

  private handleAuditEvent(event: any): void {
    // Process audit event
    console.log('Audit:', event);
  }

  private handleProductCreated(event: any): void {
    console.log('Product created:', event.payload.productId);
  }

  private handleProductUpdated(event: any): void {
    console.log('Product updated:', event.payload.productId);
  }

  private handleProductDeleted(event: any): void {
    console.log('Product deleted:', event.payload.productId);
  }
}
```

### With Async Handler

```typescript
class AsyncEventHandler {
  constructor(private subscriberService: ISubscriberService) {}

  start(): void {
    this.subscriberService.subscribe(EVENT_CHANNELS.PRODUCT, async (event) => {
      try {
        await this.processEvent(event);
      } catch (error) {
        console.error('Failed to process event:', error);
      }
    });
  }

  private async processEvent(event: any): Promise<void> {
    // Async processing
    await this.saveToDatabase(event);
    await this.sendNotification(event);
  }

  private async saveToDatabase(event: any): Promise<void> {
    // Database operation
  }

  private async sendNotification(event: any): Promise<void> {
    // Notification logic
  }
}
```

### Graceful Shutdown

```typescript
class Application {
  private subscribedChannels: string[] = [];

  constructor(private subscriberService: ISubscriberService) {}

  subscribeToChannel(channel: string, handler: (msg: any) => void): void {
    this.subscriberService.subscribe(channel, handler);
    this.subscribedChannels.push(channel);
  }

  async shutdown(): Promise<void> {
    // Unsubscribe from all channels
    for (const channel of this.subscribedChannels) {
      this.subscriberService.unsubscribe(channel);
    }
    this.subscribedChannels = [];
  }
}
```

## Implementation Considerations

### Separate Redis Client

Redis requires a separate client for subscriptions:

```typescript
// Implementation note
constructor(redisService: IRedisService) {
  // Create separate client for subscriptions
  this.subscriberClient = redisService.getClient().duplicate();
}
```

### Handler Management

Implementation should maintain a map of handlers:

```typescript
private handlers: Map<string, (message: any) => void> = new Map();

subscribe(channel: string, handler: (message: any) => void): void {
  if (!this.handlers.has(channel)) {
    this.handlers.set(channel, handler);
    this.subscriberClient.subscribe(channel);
  }
}

unsubscribe(channel: string): void {
  if (this.handlers.has(channel)) {
    this.handlers.delete(channel);
    this.subscriberClient.unsubscribe(channel);
  }
}
```

### Message Parsing

Implementation should handle JSON parsing:

```typescript
this.subscriberClient.on('message', (channel: string, message: string) => {
  const handler = this.handlers.get(channel);
  if (handler) {
    try {
      const parsedMessage = JSON.parse(message);
      handler(parsedMessage);
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }
});
```

## Error Handling

### Common Error Scenarios

1. **Redis Connection Error**
   - Connection lost during subscription
   - Redis server unavailable
   - Network issues

2. **Handler Errors**
   - Exceptions in message handler
   - Async handler rejections
   - Timeout in handler execution

3. **Message Parsing Errors**
   - Invalid JSON format
   - Malformed messages
   - Encoding issues

### Error Handling Strategy

```typescript
// Implementation should handle errors gracefully
subscribe(channel: string, handler: (message: any) => void): void {
  const wrappedHandler = (message: string) => {
    try {
      const parsed = JSON.parse(message);
      handler(parsed);
    } catch (error) {
      this.logger.error(`Handler error for channel ${channel}`, error);
    }
  };

  this.subscriberClient.on('message', (ch, msg) => {
    if (ch === channel) {
      wrappedHandler(msg);
    }
  });
}
```

## Testing Considerations

### Unit Testing

```typescript
describe('ISubscriberService', () => {
  let subscriberService: ISubscriberService;
  let mockRedisClient: any;

  beforeEach(() => {
    mockRedisClient = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      on: jest.fn(),
      duplicate: jest.fn().mockReturnThis(),
    };

    const mockRedisService = {
      getClient: jest.fn().mockReturnValue(mockRedisClient),
    };

    subscriberService = new SubscriberService(mockRedisService as IRedisService, mockLogger);
  });

  it('should subscribe to channel', () => {
    const handler = jest.fn();
    subscriberService.subscribe('test:channel', handler);

    expect(mockRedisClient.subscribe).toHaveBeenCalledWith('test:channel');
  });

  it('should unsubscribe from channel', () => {
    subscriberService.subscribe('test:channel', jest.fn());
    subscriberService.unsubscribe('test:channel');

    expect(mockRedisClient.unsubscribe).toHaveBeenCalledWith('test:channel');
  });

  it('should call handler when message received', () => {
    const handler = jest.fn();
    subscriberService.subscribe('test:channel', handler);

    // Simulate message
    const messageHandler = mockRedisClient.on.mock.calls.find((call) => call[0] === 'message')[1];

    messageHandler('test:channel', JSON.stringify({ test: 'data' }));

    expect(handler).toHaveBeenCalledWith({ test: 'data' });
  });

  it('should handle parse errors gracefully', () => {
    const handler = jest.fn();
    subscriberService.subscribe('test:channel', handler);

    const messageHandler = mockRedisClient.on.mock.calls.find((call) => call[0] === 'message')[1];

    // Invalid JSON
    messageHandler('test:channel', 'invalid json');

    expect(handler).not.toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalled();
  });
});
```

### Integration Testing

```typescript
describe('SubscriberService Integration', () => {
  let subscriberService: SubscriberService;
  let publisherService: PublisherService;
  let redisService: RedisService;

  beforeAll(async () => {
    redisService = new RedisService(config);
    await redisService.connect();
    subscriberService = new SubscriberService(redisService, logger);
    publisherService = new PublisherService(redisService, logger);
  });

  afterAll(async () => {
    await redisService.disconnect();
  });

  it('should receive published message', async () => {
    const channel = 'test:integration';
    const message = { test: 'integration' };
    const receivedMessages: any[] = [];

    // Subscribe
    subscriberService.subscribe(channel, (msg) => {
      receivedMessages.push(msg);
    });

    // Publish
    await publisherService.publish(channel, message);

    // Wait for message
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(receivedMessages).toHaveLength(1);
    expect(receivedMessages[0]).toEqual(message);

    // Cleanup
    subscriberService.unsubscribe(channel);
  });
});
```

## Related Interfaces

### IPublisherService

The counterpart to ISubscriberService:

```typescript
export interface IPublisherService {
  publish(channel: string, message: any): Promise<void>;
}
```

### IRedisService

Dependency for subscriber implementation:

```typescript
export interface IRedisService {
  getClient(): Redis;
  // ... other methods
}
```

## Future Enhancements

### 1. Pattern-based Subscriptions

Support for pattern matching (PSUBSCRIBE):

```typescript
export interface ISubscriberService {
  subscribe(channel: string, handler: (message: any) => void): void;
  subscribePattern(pattern: string, handler: (message: any) => void): void;
  unsubscribe(channel: string): void;
  unsubscribePattern(pattern: string): void;
}
```

### 2. Subscription Options

Add options for subscription behavior:

```typescript
export interface SubscribeOptions {
  autoParse?: boolean;      // Auto-parse JSON (default: true)
  bufferMessages?: boolean; // Buffer messages if handler is busy
  timeout?: number;         // Handler timeout
}

subscribe(
  channel: string,
  handler: (message: any) => void,
  options?: SubscribeOptions
): void;
```

### 3. Subscription Status

Query subscription status:

```typescript
export interface ISubscriberService {
  subscribe(channel: string, handler: (message: any) => void): void;
  unsubscribe(channel: string): void;
  isSubscribed(channel: string): boolean;
  getSubscribedChannels(): string[];
}
```

## Success Criteria

- ✅ Interface defined with subscribe and unsubscribe methods
- ✅ JSDoc documentation for all methods
- ✅ Handler-based message processing
- ✅ Support for multiple channel subscriptions
- ✅ Error handling strategy defined
- ✅ Usage examples provided
- ✅ Testing strategy documented

## Related Files

- **Interface**: `src/domain/interfaces/redis/ISubscriberService.ts`
- **Implementation**: `src/domain/services/redis/SubscriberService.ts`
- **Publisher Interface**: `src/domain/interfaces/redis/IPublisherService.ts`
- **Events**: `src/domain/events/index.ts`
- **Analysis**: `docs/analysis/pubsub/step1.2-Publisher-Service-Interface.md`
- **Implementation Plan**: `docs/implementation-plans/14-pubsub-implementation-plan.md`
- **Task File**: `docs/tasks/06-pubsub-task.md`
