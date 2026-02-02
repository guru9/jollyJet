# Step 1.5: Subscriber Service Implementation - Analysis

## Overview

This document provides detailed analysis for implementing the Subscriber Service, which handles receiving and processing events from Redis Pub/Sub channels.

## Dependencies

- **Depends on:**
  - Step 1.1: Event Definitions and Types (uses event types)
  - Step 1.3: Subscriber Service Interface (implements the interface)
- **Required by:**
  - Step 2.1: Event Handler Base Class
  - Step 3.1: DI Container Registration
  - Step 3.2: Application Bootstrap

## Current State Analysis

### What Exists

- ✅ [`IRedisService`](../../src/domain/interfaces/redis/IRedisService.ts) interface with `getClient()` method
- ✅ [`ISubscriberService`](../../src/domain/interfaces/redis/ISubscriberService.ts) interface defining the contract
- ✅ [`PUBSUB_MESSAGES`](../../src/shared/constants.ts:497) constants for logging
- ✅ [`PUBSUB_CHANNELS`](../../src/shared/constants.ts:573) constants for channel names
- ✅ [`AppEvent`](../../src/domain/events/index.ts:86) union type for type-safe events

### What Needs to Be Created

- [`SubscriberService`](../../src/domain/services/redis/SubscriberService.ts) implementation class

## Implementation Requirements

### 1. Redis Client Separation

Redis Pub/Sub requires separate clients for publishing and subscribing:

```typescript
// Publisher uses standard client
const publisherClient = redisService.getClient();

// Subscriber needs a dedicated client
const subscriberClient = createClient({
  /* same config */
});
```

**Why?** Once a Redis client enters subscriber mode, it can only execute subscription-related commands.

### 2. Handler Management

Use a Map to manage handlers per channel:

```typescript
private handlers: Map<string, Function> = new Map();
```

### 3. Message Flow

```
Redis Channel → Subscriber Client → message event → JSON.parse → Handler Execution
```

### 4. Error Handling Strategy

| Error Type       | Handling                       |
| ---------------- | ------------------------------ |
| Connection Error | Log and attempt reconnection   |
| Parse Error      | Log error, skip message        |
| Handler Error    | Log error, continue processing |

## Code Structure

### Class Definition

```typescript
@injectable()
export class SubscriberService implements ISubscriberService {
  private subscriberClient: RedisClientType | null = null;
  private handlers: Map<string, MessageHandler> = new Map();
  private isConnected: boolean = false;

  constructor(
    @inject(DI_TOKENS.REDIS_SERVICE) private redisService: IRedisService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger
  ) {}
}
```

### Key Methods

1. **`initialize()`** - Create subscriber client and connect
2. **`subscribe(channel, handler)`** - Subscribe to channel with handler
3. **`unsubscribe(channel)`** - Unsubscribe from channel
4. **`handleMessage(channel, message)`** - Process incoming messages
5. **`disconnect()`** - Clean shutdown

## Error Scenarios

### Scenario 1: Redis Connection Failure

```typescript
// Attempt reconnection with exponential backoff
private async reconnect(): Promise<void> {
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await this.initialize();
      break;
    } catch (error) {
      attempt++;
      await delay(Math.pow(2, attempt) * 1000);
    }
  }
}
```

### Scenario 2: Invalid Message Format

```typescript
private handleMessage(channel: string, message: string): void {
  try {
    const event = JSON.parse(message);
    const handler = this.handlers.get(channel);
    if (handler) {
      handler(event);
    }
  } catch (error) {
    this.logger.error(PUBSUB_MESSAGES.MESSAGE_PARSE_FAILED(channel));
  }
}
```

## Testing Considerations

### Unit Tests

1. Test subscription to single channel
2. Test multiple channel subscriptions
3. Test message handling
4. Test error scenarios
5. Test reconnection logic

### Integration Tests

1. End-to-end publish/subscribe flow
2. Multiple subscribers to same channel
3. Error recovery

## Dependencies

- `tsyringe` - Dependency injection
- `redis` - Redis client
- `pino` - Logging (via Logger)

## Next Steps

After implementing SubscriberService:

1. Create Event Handler base class (Step 2.1)
2. Implement Product Event Handlers (Step 2.2)
3. Implement Audit Event Handler (Step 2.3)
4. Register all services in DI container (Step 3.1)

## References

- [Redis Pub/Sub Documentation](https://redis.io/docs/manual/pubsub/)
- [Implementation Plan](../../implementation-plans/14-pubsub-implementation-plan.md)
- [Task File](../../tasks/06-pubsub-task.md)
