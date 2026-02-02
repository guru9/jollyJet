# Step 1.4: Publisher Service Implementation

## Overview

This document analyzes the implementation of the Publisher Service for the Redis Pub/Sub messaging system in the JollyJet e-commerce application. The PublisherService implements the IPublisherService interface and provides the concrete functionality for publishing events to Redis channels.

## Dependencies

- **Depends on:**
  - Step 1.1: Event Definitions and Types (uses event types)
  - Step 1.2: Publisher Service Interface (implements the interface)
- **Required by:**
  - Step 3.1: DI Container Registration
  - Step 3.3: Product Use Case Integration

## Implementation Details

### File Location

- **Source**: `src/domain/services/redis/PublisherService.ts`
- **Purpose**: Implement Redis-based event publishing
- **Dependencies**: Uses existing `IRedisService`

### Class Definition

```typescript
@injectable()
export class PublisherService implements IPublisherService {
  constructor(
    @inject(DI_TOKENS.REDIS_SERVICE) private redisService: IRedisService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger
  ) {}

  async publish(channel: string, message: any): Promise<void> {
    try {
      const client = this.redisService.getClient();
      const messageString = JSON.stringify(message);
      await client.publish(channel, messageString);
      this.logger.info(`Published message to channel ${channel}`, {
        messageSize: messageString.length,
      });
    } catch (error) {
      this.logger.error(`Failed to publish message to channel ${channel}`, error);
      throw error;
    }
  }
}
```

**Key Features:**

- Implements IPublisherService interface
- Uses dependency injection for Redis service and logger
- Serializes messages to JSON
- Comprehensive error handling and logging
- Message size tracking

### Dependencies

**IRedisService**

- Provides access to Redis client
- Manages connection lifecycle
- Handles connection pooling

**Logger**

- Logs successful publishes
- Logs errors with context
- Tracks message metrics

### Method Implementation

**publish(channel: string, message: any): Promise<void>**

Implementation flow:

1. **Get Redis Client**

   ```typescript
   const client = this.redisService.getClient();
   ```

   - Retrieves Redis client from service
   - Client is ready for operations

2. **Serialize Message**

   ```typescript
   const messageString = JSON.stringify(message);
   ```

   - Converts event object to JSON string
   - Ensures consistent message format

3. **Publish to Channel**

   ```typescript
   await client.publish(channel, messageString);
   ```

   - Sends message to Redis channel
   - Returns number of subscribers that received the message

4. **Log Success**

   ```typescript
   this.logger.info(`Published message to channel ${channel}`, {
     messageSize: messageString.length,
   });
   ```

   - Logs successful publish
   - Tracks message size for metrics

5. **Handle Errors**

   ```typescript
   } catch (error) {
     this.logger.error(`Failed to publish message to channel ${channel}`, error);
     throw error;
   }
   ```

   - Catches and logs errors
   - Re-throws for caller to handle

## Design Decisions

### 1. Dependency Injection

**Decision:** Use tsyringe for dependency injection

**Rationale:**

- Testability: Easy to mock dependencies
- Flexibility: Can swap implementations
- Consistency: Follows project conventions

**Implementation:**

```typescript
@injectable()
export class PublisherService implements IPublisherService {
  constructor(
    @inject(DI_TOKENS.REDIS_SERVICE) private redisService: IRedisService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger
  ) {}
}
```

### 2. JSON Serialization

**Decision:** Use JSON.stringify for message serialization

**Rationale:**

- Universal format: All languages support JSON
- Human readable: Easy to debug
- TypeScript native: No additional dependencies

**Trade-offs:**

- No type information at runtime
- Circular references cause errors
- Large objects may have performance impact

### 3. Error Handling Strategy

**Decision:** Log and re-throw errors

**Rationale:**

- Visibility: Errors are logged with context
- Flexibility: Caller decides how to handle errors
- Fail-fast: Errors don't go unnoticed

**Alternative Considered:**

- Return boolean success/failure (less informative)
- Swallow errors (risky, silent failures)

## Usage Examples

### Basic Publishing

```typescript
import { PublisherService } from '../services/redis/PublisherService';
import { EVENT_CHANNELS, generateEventId } from '../events';

const publisherService = container.resolve(PublisherService);

await publisherService.publish(EVENT_CHANNELS.PRODUCT, {
  eventId: generateEventId(),
  eventType: 'PRODUCT_CREATED',
  timestamp: new Date(),
  payload: {
    productId: '123',
    name: 'Test Product',
    price: 99.99,
    category: 'Electronics',
  },
});
```

### With Error Handling

```typescript
async function publishProductEvent(
  publisherService: PublisherService,
  product: Product
): Promise<void> {
  try {
    await publisherService.publish(EVENT_CHANNELS.PRODUCT, {
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
    console.log('Event published successfully');
  } catch (error) {
    console.error('Failed to publish event:', error);
    // Handle error - maybe retry, maybe log, maybe alert
    throw error;
  }
}
```

### In Use Case

```typescript
export class CreateProductUseCase {
  constructor(
    private productRepository: IProductRepository,
    private publisherService: PublisherService
  ) {}

  async execute(input: CreateProductDTO): Promise<Product> {
    // Create product
    const product = await this.productRepository.create(input);

    // Publish event
    await this.publisherService.publish(EVENT_CHANNELS.PRODUCT, {
      eventId: generateEventId(),
      eventType: 'PRODUCT_CREATED',
      timestamp: new Date(),
      correlationId: input.correlationId,
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

## Error Scenarios

### 1. Redis Connection Error

**Scenario:** Redis server is unavailable

**Behavior:**

- Error is caught and logged
- Error is re-thrown
- Caller must handle the error

**Handling:**

```typescript
try {
  await publisherService.publish(channel, message);
} catch (error) {
  if (error.message.includes('ECONNREFUSED')) {
    // Redis is down, queue message for later
    await queueMessageForLater(channel, message);
  } else {
    throw error;
  }
}
```

### 2. Serialization Error

**Scenario:** Message contains circular references

**Behavior:**

- JSON.stringify throws error
- Error is caught and logged
- Error is re-thrown

**Prevention:**

```typescript
// Validate message before publishing
function validateMessage(message: any): void {
  try {
    JSON.stringify(message);
  } catch (error) {
    throw new Error('Message contains circular references');
  }
}
```

### 3. Invalid Channel Name

**Scenario:** Channel name is empty or invalid

**Behavior:**

- Redis may accept or reject
- Log warning for empty channel

**Validation:**

```typescript
async publish(channel: string, message: any): Promise<void> {
  if (!channel || channel.trim() === '') {
    throw new Error('Channel name cannot be empty');
  }
  // ... rest of implementation
}
```

## Performance Considerations

### Message Size

**Recommendation:** Keep messages under 1KB

**Rationale:**

- Redis is optimized for small messages
- Large messages impact network performance
- Serialization/deserialization overhead

**Monitoring:**

```typescript
this.logger.info(`Published message to channel ${channel}`, {
  messageSize: messageString.length,
  // Alert if message is too large
  isLargeMessage: messageString.length > 1024,
});
```

### Connection Reuse

**Strategy:** Reuse Redis connection

**Implementation:**

- IRedisService manages connection pool
- PublisherService gets client from pool
- No connection per publish

### Batch Publishing

**Future Enhancement:** Support batch publishing

```typescript
async publishBatch(
  channel: string,
  messages: any[]
): Promise<void> {
  const pipeline = this.redisService.getClient().pipeline();

  for (const message of messages) {
    pipeline.publish(channel, JSON.stringify(message));
  }

  await pipeline.exec();
}
```

## Testing

### Unit Testing

```typescript
describe('PublisherService', () => {
  let publisherService: PublisherService;
  let mockRedisService: jest.Mocked<IRedisService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockRedisClient: any;

  beforeEach(() => {
    mockRedisClient = {
      publish: jest.fn().mockResolvedValue(1),
    };

    mockRedisService = {
      getClient: jest.fn().mockReturnValue(mockRedisClient),
    } as any;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    } as any;

    publisherService = new PublisherService(mockRedisService, mockLogger);
  });

  it('should publish message successfully', async () => {
    const channel = 'test:channel';
    const message = { test: 'data' };

    await publisherService.publish(channel, message);

    expect(mockRedisService.getClient).toHaveBeenCalled();
    expect(mockRedisClient.publish).toHaveBeenCalledWith(channel, JSON.stringify(message));
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Published message to channel ${channel}`,
      expect.any(Object)
    );
  });

  it('should handle publish errors', async () => {
    const error = new Error('Redis connection failed');
    mockRedisClient.publish.mockRejectedValue(error);

    await expect(publisherService.publish('test:channel', {})).rejects.toThrow(
      'Redis connection failed'
    );

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to publish'),
      error
    );
  });

  it('should serialize message to JSON', async () => {
    const message = { eventId: '123', data: 'test' };

    await publisherService.publish('test:channel', message);

    expect(mockRedisClient.publish).toHaveBeenCalledWith('test:channel', JSON.stringify(message));
  });

  it('should log message size', async () => {
    const message = { test: 'data' };

    await publisherService.publish('test:channel', message);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        messageSize: expect.any(Number),
      })
    );
  });
});
```

### Integration Testing

```typescript
describe('PublisherService Integration', () => {
  let publisherService: PublisherService;
  let subscriberService: SubscriberService;
  let redisService: RedisService;

  beforeAll(async () => {
    redisService = new RedisService(config);
    await redisService.connect();
    publisherService = new PublisherService(redisService, logger);
    subscriberService = new SubscriberService(redisService, logger);
  });

  afterAll(async () => {
    await redisService.disconnect();
  });

  it('should publish and receive message', async () => {
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

## Best Practices

### 1. Always Handle Errors

```typescript
try {
  await publisherService.publish(channel, message);
} catch (error) {
  // Log error
  // Maybe retry
  // Maybe queue for later
  // Maybe alert on-call
}
```

### 2. Use Event Constants

```typescript
// Good
await publisherService.publish(EVENT_CHANNELS.PRODUCT, event);

// Bad - hardcoded string
await publisherService.publish('product', event);
```

### 3. Include Correlation IDs

```typescript
await publisherService.publish(EVENT_CHANNELS.PRODUCT, {
  ...event,
  correlationId: request.correlationId, // For tracing
});
```

### 4. Validate Messages

```typescript
function validateEvent(event: any): void {
  if (!event.eventId) throw new Error('eventId is required');
  if (!event.eventType) throw new Error('eventType is required');
  if (!event.timestamp) throw new Error('timestamp is required');
}

// Before publishing
validateEvent(event);
await publisherService.publish(channel, event);
```

### 5. Monitor Performance

```typescript
const startTime = Date.now();
await publisherService.publish(channel, message);
const duration = Date.now() - startTime;

if (duration > 100) {
  logger.warn('Slow publish operation', { duration, channel });
}
```

## Related Files

- **Implementation**: `src/domain/services/redis/PublisherService.ts`
- **Interface**: `src/domain/interfaces/redis/IPublisherService.ts`
- **Redis Service**: `src/domain/services/redis/RedisService.ts`
- **Events**: `src/domain/events/index.ts`
- **Analysis**: `docs/analysis/pubsub/step1.3-Subscriber-Service-Interface.md`
- **Implementation Plan**: `docs/implementation-plans/14-pubsub-implementation-plan.md`
- **Task File**: `docs/tasks/06-pubsub-task.md`

## Success Criteria

- ✅ Implements IPublisherService interface
- ✅ Uses dependency injection for dependencies
- ✅ Serializes messages to JSON
- ✅ Comprehensive error handling
- ✅ Logging with message metrics
- ✅ Unit tests with high coverage
- ✅ Integration tests with Redis
- ✅ Follows Clean Architecture principles
