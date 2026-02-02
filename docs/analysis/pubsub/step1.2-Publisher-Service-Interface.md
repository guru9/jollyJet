# Step 1.2: Publisher Service Interface

## Overview

This document analyzes the implementation of the Publisher Service Interface for the Redis Pub/Sub messaging system in the JollyJet e-commerce application. The interface defines the contract for publishing events to Redis channels, enabling decoupled communication between application components.

## Dependencies

- **Depends on:**
  - Step 1.1: Event Definitions and Types (uses event types)
- **Required by:**
  - Step 1.4: Publisher Service Implementation
  - Step 3.1: DI Container Registration
  - Step 3.3: Product Use Case Integration

## Implementation Details

### File Location

- **Source**: `src/domain/interfaces/redis/IPublisherService.ts`
- **Purpose**: Define contract for publishing events to channels

### Interface Definition

```typescript
export interface IPublisherService {
  /**
   * Publishes a message to a Redis channel
   * @param channel - The channel name to publish to
   * @param message - The message payload to publish
   */
  publish(channel: string, message: any): Promise<void>;
}
```

**Key Features:**

- Simple, single-method interface for publishing
- Async method for non-blocking operations
- Generic message type for flexibility
- JSDoc documentation for clarity

### Method Signature

**publish(channel: string, message: any): Promise<void>**

| Parameter | Type          | Description                                     |
| --------- | ------------- | ----------------------------------------------- |
| channel   | string        | The Redis channel name to publish to            |
| message   | any           | The message payload (typically an event object) |
| Returns   | Promise<void> | Resolves on success, rejects on failure         |

**Key Features:**

- **Channel-based routing:** Messages are routed to specific channels
- **Async operation:** Non-blocking publish operation
- **Generic payload:** Supports any serializable message type
- **Error handling:** Throws on Redis connection or serialization errors

## Design Decisions

### 1. Single Method Interface

**Decision:** Define a single `publish` method

**Rationale:**

- Simplicity: One method covers all publishing needs
- Flexibility: Channel name parameter allows routing to any channel
- Consistency: Follows Redis Pub/Sub API design

### 2. Generic Message Type

**Decision:** Use `any` for message parameter

**Rationale:**

- Flexibility: Supports any serializable object
- Type safety: Callers can use typed events
- Simplicity: No need for complex generic constraints

**Trade-off:**

- Less compile-time type safety
- Requires runtime validation for critical paths

### 3. Promise-based API

**Decision:** Return `Promise<void>`

**Rationale:**

- Async/await support: Modern JavaScript/TypeScript patterns
- Error handling: Rejected promises for errors
- Composability: Easy to chain with other async operations

## Usage Examples

### Basic Publishing

```typescript
import { IPublisherService } from '../interfaces/redis/IPublisherService';
import { EVENT_CHANNELS, generateEventId } from '../events';

class ProductService {
  constructor(private publisherService: IPublisherService) {}

  async createProduct(productData: CreateProductDTO): Promise<Product> {
    const product = await this.productRepository.create(productData);

    // Publish event
    await this.publisherService.publish(EVENT_CHANNELS.PRODUCT, {
      eventId: generateEventId(),
      eventType: 'PRODUCT_CREATED',
      timestamp: new Date(),
      payload: {
        productId: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
      },
    });

    return product;
  }
}
```

### With Error Handling

```typescript
async function publishWithRetry(
  publisherService: IPublisherService,
  channel: string,
  message: any,
  maxRetries: number = 3
): Promise<void> {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await publisherService.publish(channel, message);
      return;
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}
```

### With Correlation ID

```typescript
async function publishWithCorrelation(
  publisherService: IPublisherService,
  channel: string,
  message: any,
  correlationId: string
): Promise<void> {
  const eventMessage = {
    ...message,
    correlationId,
  };

  await publisherService.publish(channel, eventMessage);
}
```

## Implementation Considerations

### Message Serialization

The implementation should handle message serialization:

```typescript
// PublisherService implementation
async publish(channel: string, message: any): Promise<void> {
  try {
    const client = this.redisService.getClient();
    const messageString = JSON.stringify(message);
    await client.publish(channel, messageString);
  } catch (error) {
    this.logger.error(`Failed to publish to ${channel}`, error);
    throw error;
  }
}
```

### Error Scenarios

1. **Redis Connection Error**
   - Redis server unavailable
   - Network timeout
   - Authentication failure

2. **Serialization Error**
   - Circular references in message
   - Non-serializable objects
   - Large message size

3. **Channel Error**
   - Invalid channel name
   - Channel not found (Redis cluster)

### Performance Considerations

- **Message Size:** Keep messages under 1KB for optimal performance
- **Batch Publishing:** Consider batching multiple events for high throughput
- **Connection Pooling:** Reuse Redis connections
- **Async Processing:** Don't block business logic on publishing

## Testing Considerations

### Unit Testing

```typescript
describe('IPublisherService', () => {
  let publisherService: IPublisherService;
  let mockRedisService: jest.Mocked<IRedisService>;

  beforeEach(() => {
    mockRedisService = {
      getClient: jest.fn().mockReturnValue({
        publish: jest.fn().mockResolvedValue(1),
      }),
    } as any;

    publisherService = new PublisherService(mockRedisService, mockLogger);
  });

  it('should publish message successfully', async () => {
    const channel = 'test:channel';
    const message = { test: 'data' };

    await publisherService.publish(channel, message);

    expect(mockRedisService.getClient().publish).toHaveBeenCalledWith(
      channel,
      JSON.stringify(message)
    );
  });

  it('should handle publish errors', async () => {
    const error = new Error('Redis connection failed');
    mockRedisService.getClient().publish.mockRejectedValue(error);

    await expect(publisherService.publish('test:channel', {})).rejects.toThrow(
      'Redis connection failed'
    );
  });

  it('should serialize message to JSON', async () => {
    const message = { eventId: '123', data: 'test' };

    await publisherService.publish('test:channel', message);

    expect(mockRedisService.getClient().publish).toHaveBeenCalledWith(
      'test:channel',
      JSON.stringify(message)
    );
  });
});
```

### Integration Testing

```typescript
describe('PublisherService Integration', () => {
  let publisherService: PublisherService;
  let redisService: RedisService;

  beforeAll(async () => {
    redisService = new RedisService(config);
    await redisService.connect();
    publisherService = new PublisherService(redisService, logger);
  });

  afterAll(async () => {
    await redisService.disconnect();
  });

  it('should publish and receive message', async () => {
    const channel = 'test:integration';
    const message = { test: 'integration' };

    // Subscribe first
    const receivedMessages: any[] = [];
    const subscriber = redisService.getClient().duplicate();
    await subscriber.subscribe(channel);
    subscriber.on('message', (ch, msg) => {
      receivedMessages.push(JSON.parse(msg));
    });

    // Publish
    await publisherService.publish(channel, message);

    // Wait and verify
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(receivedMessages).toHaveLength(1);
    expect(receivedMessages[0]).toEqual(message);

    await subscriber.unsubscribe(channel);
    await subscriber.quit();
  });
});
```

## Related Interfaces

### ISubscriberService

The counterpart to IPublisherService:

```typescript
export interface ISubscriberService {
  subscribe(channel: string, handler: (message: any) => void): void;
  unsubscribe(channel: string): void;
}
```

### IRedisService

Dependency for publisher implementation:

```typescript
export interface IRedisService {
  getClient(): Redis;
  // ... other methods
}
```

## Future Enhancements

### 1. Batch Publishing

Add method for publishing multiple messages:

```typescript
export interface IPublisherService {
  publish(channel: string, message: any): Promise<void>;
  publishBatch(channel: string, messages: any[]): Promise<void>;
}
```

### 2. Message Priorities

Support priority levels for messages:

```typescript
export interface IPublisherService {
  publish(
    channel: string,
    message: any,
    options?: { priority?: 'high' | 'normal' | 'low' }
  ): Promise<void>;
}
```

### 3. Publish Confirmation

Return confirmation with message ID:

```typescript
export interface PublishResult {
  messageId: string;
  timestamp: Date;
  channel: string;
}

export interface IPublisherService {
  publish(channel: string, message: any): Promise<PublishResult>;
}
```

## Success Criteria

- ✅ Interface defined with clear method signature
- ✅ JSDoc documentation for all methods
- ✅ Async/Promise-based API
- ✅ Generic message type for flexibility
- ✅ Error handling strategy defined
- ✅ Usage examples provided
- ✅ Testing strategy documented

## Related Files

- **Interface**: `src/domain/interfaces/redis/IPublisherService.ts`
- **Implementation**: `src/domain/services/redis/PublisherService.ts`
- **Events**: `src/domain/events/index.ts`
- **Analysis**: `docs/analysis/pubsub/step1.1-Event-Definitions-and-Types.md`
- **Implementation Plan**: `docs/implementation-plans/14-pubsub-implementation-plan.md`
- **Task File**: `docs/tasks/06-pubsub-task.md`
