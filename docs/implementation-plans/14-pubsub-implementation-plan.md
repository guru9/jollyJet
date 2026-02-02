# Implementation Plan #14 - Redis Pub/Sub for Event-Driven Architecture

**Plan:** 14-pubsub-implementation-plan  
**Related Task:** [06-pubsub-task](../tasks/06-pubsub-task.md)  
**Redis Pub/Sub Analysis:** [Redis Service Interface](../analysis/redis/step1.2-redis-service-interface.md)  
**Branch:** `feature/jollyjet-14-redis-based-pubsub`  
**Status:** 📝 **Planning Phase** - Event-driven messaging system design

## 🎯 Objective

Implement a Redis-based Publish/Subscribe (Pub/Sub) messaging system to enable event-driven architecture within the JollyJet e-commerce platform. This will facilitate decoupled communication between different parts of the application, supporting features like real-time notifications, inventory updates, and audit logging.

## 📁 Folder Structure with Step Numbers and Dependencies

```
src/
├── domain/
│   ├── events/
│   │   └── index.ts                          [Step 1.1]
│   │                                           Dependencies: None (Foundation)
│   │                                           Required By: 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.3
│   ├── interfaces/
│   │   └── redis/
│   │       ├── IPublisherService.ts          [Step 1.2]
│   │       │                                   Dependencies: 1.1
│   │       │                                   Required By: 1.4, 3.1, 3.3
│   │       └── ISubscriberService.ts         [Step 1.3]
│   │                                           Dependencies: 1.1
│   │                                           Required By: 1.5, 3.1, 3.2
│   └── services/
│       ├── redis/
│       │   ├── PublisherService.ts           [Step 1.4]
│       │   │                                   Dependencies: 1.1, 1.2
│       │   │                                   Required By: 3.1, 3.3
│       │   └── SubscriberService.ts          [Step 1.5]
│       │                                       Dependencies: 1.1, 1.3
│       │                                       Required By: 3.1, 3.2
│       └── events/
│           ├── EventHandler.ts               [Step 2.1]
│           │                                   Dependencies: 1.1
│           │                                   Required By: 2.2, 2.3
│           ├── ProductEventHandlers.ts       [Step 2.2]
│           │                                   Dependencies: 1.1, 2.1
│           │                                   Required By: 3.2
│           └── AuditEventHandler.ts          [Step 2.3]
│                                               Dependencies: 1.1, 2.1
│                                               Required By: 3.2
├── config/
│   └── di-container.ts                       [Step 3.1]
│                                               Dependencies: 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3
│                                               Required By: 3.2, 3.3
├── server.ts                                 [Step 3.2]
│                                               Dependencies: 1.3, 1.5, 2.2, 2.3, 3.1
│                                               Required By: None (Application Entry Point)
└── application/
    └── usecases/
        └── product/
            ├── CreateProductUseCase.ts       [Step 3.3]
            ├── UpdateProductUseCase.ts       [Step 3.3]
            └── DeleteProductUseCase.ts       [Step 3.3]
                                                Dependencies: 1.1, 1.2, 1.4, 3.1
                                                Required By: None (End of Chain)
```

## 📋 Implementation Steps

Legend:

1.1 - Event Definitions and Types (Foundation)
1.2 - Publisher Service Interface
1.3 - Subscriber Service Interface
1.4 - Publisher Service Implementation
1.5 - Subscriber Service Implementation
2.1 - Event Handler Base Class
2.2 - Product Event Handlers
2.3 - Audit Logging Handler
3.1 - DI Container Registration
3.2 - Application Bootstrap
3.3 - Product Use Case Integration

### Phase 1: Core Pub/Sub Infrastructure

#### Step 1.1: Event Definitions and Types

- **Step Number:** 1.1
- **File:** `src/domain/events/index.ts`
- **Purpose:** Define TypeScript interfaces and types for events
- **Dependencies:** None (Foundation step)
- **Required By:** Steps 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.3
- **Events to Implement:**
  - `ProductCreatedEvent`
  - `ProductUpdatedEvent`
  - `ProductDeletedEvent`
  - `UserActivityEvent` (for audit logging)
- **Implementation:** Create event DTOs with proper typing

**Code Snippet:**

```typescript
// src/domain/events/index.ts
export interface BaseEvent {
  eventId: string;
  eventType: string;
  timestamp: Date;
  correlationId?: string;
}

export interface ProductCreatedEvent extends BaseEvent {
  eventType: 'PRODUCT_CREATED';
  payload: {
    productId: string;
    name: string;
    price: number;
    category: string;
  };
}

export interface ProductUpdatedEvent extends BaseEvent {
  eventType: 'PRODUCT_UPDATED';
  payload: {
    productId: string;
    changes: Record<string, any>;
  };
}

export interface ProductDeletedEvent extends BaseEvent {
  eventType: 'PRODUCT_DELETED';
  payload: {
    productId: string;
  };
}

export interface UserActivityEvent extends BaseEvent {
  eventType: 'USER_ACTIVITY';
  payload: {
    userId: string;
    action: string;
    metadata: Record<string, any>;
  };
}
```

**Description:** These interfaces define the structure of events in the system. Each event extends a base event with common fields like eventId, timestamp, and optional correlationId for tracing.

#### Step 1.2: Publisher Service Interface

- **Step Number:** 1.2
- **File:** `src/domain/interfaces/redis/IPublisherService.ts`
- **Purpose:** Define contract for publishing events to channels
- **Dependencies:** Step 1.1 (uses event types)
- **Required By:** Steps 1.4, 3.1, 3.3
- **Methods:** `publish(channel: string, message: any): Promise<void>`

**Code Snippet:**

```typescript
// src/domain/interfaces/redis/IPublisherService.ts
export interface IPublisherService {
  /**
   * Publishes a message to a Redis channel
   * @param channel - The channel name to publish to
   * @param message - The message payload to publish
   */
  publish(channel: string, message: any): Promise<void>;
}
```

**Description:** The publisher service interface defines the contract for publishing events to Redis channels.

#### Step 1.3: Subscriber Service Interface

- **Step Number:** 1.3
- **File:** `src/domain/interfaces/redis/ISubscriberService.ts`
- **Purpose:** Define contract for subscribing to channels
- **Dependencies:** Step 1.1 (uses event types)
- **Required By:** Steps 1.5, 3.1, 3.2
- **Methods:** `subscribe(channel: string, handler: Function): void`

**Code Snippet:**

```typescript
// src/domain/interfaces/redis/ISubscriberService.ts
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

**Description:** The subscriber service interface defines methods for subscribing to and unsubscribing from Redis channels.

#### Step 1.4: Publisher Service Implementation

- **Step Number:** 1.4
- **File:** `src/domain/services/redis/PublisherService.ts`
- **Purpose:** Implement Redis-based event publishing
- **Dependencies:** Steps 1.1, 1.2 (uses interfaces and constants)
- **Required By:** Steps 3.1, 3.3
- **Features:** JSON serialization, error handling, logging

**Code Snippet:**

```typescript
// src/domain/services/redis/PublisherService.ts
import { inject, injectable } from 'tsyringe';
import { DI_TOKENS, PUBSUB_MESSAGES } from '../../../shared/constants';
import { Logger } from '../../../shared/logger';
import { IPublisherService } from '../../interfaces/redis/IPublisherService';
import { IRedisService } from '../../interfaces/redis/IRedisService';

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
      this.logger.info(
        { messageSize: messageString.length },
        PUBSUB_MESSAGES.PUBLISH_SUCCESS(channel)
      );
    } catch (error) {
      this.logger.error(error as Error, PUBSUB_MESSAGES.PUBLISH_FAILED(channel));
      throw error;
    }
  }
}
```

**Description:** The PublisherService implementation uses the existing IRedisService to access the Redis client and publish messages. It includes error handling and logging using the [`PUBSUB_MESSAGES`](src/shared/constants.ts) constants for consistent messaging.

#### Step 1.5: Subscriber Service Implementation

- **Step Number:** 1.5
- **File:** `src/domain/services/redis/SubscriberService.ts`
- **Purpose:** Implement Redis-based event subscription with message handling
- **Dependencies:** Steps 1.1, 1.3 (uses interfaces and constants)
- **Required By:** Steps 3.1, 3.2
- **Features:** Auto-reconnection, error handling, message parsing

**Code Snippet:**

```typescript
// src/domain/services/redis/SubscriberService.ts
import { inject, injectable } from 'tsyringe';
import Redis from 'ioredis';
import { DI_TOKENS, PUBSUB_MESSAGES } from '../../../shared/constants';
import { Logger } from '../../../shared/logger';
import { IRedisService } from '../../interfaces/redis/IRedisService';
import { ISubscriberService } from '../../interfaces/redis/ISubscriberService';

@injectable()
export class SubscriberService implements ISubscriberService {
  private subscribers: Map<string, (message: any) => void> = new Map();
  private subscriberClient: Redis;

  constructor(
    @inject(DI_TOKENS.REDIS_SERVICE) private redisService: IRedisService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger
  ) {
    // Create a separate client for subscriptions
    this.subscriberClient = this.redisService.getClient().duplicate();
    this.setupMessageHandler();
  }

  private setupMessageHandler(): void {
    this.subscriberClient.on('message', (channel: string, message: string) => {
      const handler = this.subscribers.get(channel);
      if (handler) {
        try {
          const parsedMessage = JSON.parse(message);
          handler(parsedMessage);
        } catch (error) {
          this.logger.error(error as Error, PUBSUB_MESSAGES.MESSAGE_PARSE_FAILED(channel));
        }
      }
    });

    this.subscriberClient.on('error', (error) => {
      this.logger.error(error as Error, PUBSUB_MESSAGES.SUBSCRIBER_CLIENT_ERROR);
    });
  }

  subscribe(channel: string, handler: (message: any) => void): void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, handler);
      this.subscriberClient.subscribe(channel);
      this.logger.info(PUBSUB_MESSAGES.SUBSCRIBE_SUCCESS(channel));
    }
  }

  unsubscribe(channel: string): void {
    if (this.subscribers.has(channel)) {
      this.subscribers.delete(channel);
      this.subscriberClient.unsubscribe(channel);
      this.logger.info(PUBSUB_MESSAGES.UNSUBSCRIBE_SUCCESS(channel));
    }
  }
}
```

**Description:** The SubscriberService creates a separate Redis client for subscriptions (as required by Redis pub/sub). It manages handlers for each channel and includes error handling for message parsing using the [`PUBSUB_MESSAGES`](src/shared/constants.ts) constants for consistent messaging.

### Phase 2: Event Handlers and Integration

#### Step 2.1: Event Handler Base Class

- **Step Number:** 2.1
- **File:** `src/domain/services/events/EventHandler.ts`
- **Purpose:** Base class for event handlers with common functionality
- **Dependencies:** Step 1.1 (uses event types)
- **Required By:** Steps 2.2, 2.3
- **Features:** Logging, error handling, retry logic

**Code Snippet:**

```typescript
// src/domain/services/events/EventHandler.ts
import { PUBSUB_MESSAGES } from '../../../shared/constants';
import { Logger } from '../../../shared/logger';

export abstract class EventHandler<T> {
  constructor(protected logger: Logger) {}

  abstract handle(event: T): Promise<void>;

  protected async executeWithRetry(event: T, maxRetries: number = 3): Promise<void> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        await this.handle(event);
        return;
      } catch (error) {
        attempt++;
        this.logger.warn(
          error as Error,
          PUBSUB_MESSAGES.EVENT_HANDLING_FAILED(attempt, maxRetries)
        );
        if (attempt >= maxRetries) {
          this.logger.error(error as Error, PUBSUB_MESSAGES.EVENT_HANDLING_FAILED_ALL_RETRIES);
          throw error;
        }
      }
    }
  }
}
```

**Description:** Base class for event handlers providing common functionality like retry logic and logging.

#### Step 2.2: Product Event Handlers

- **Step Number:** 2.2
- **File:** `src/domain/services/events/ProductEventHandlers.ts`
- **Purpose:** Handle product-related events (logging, notifications)
- **Dependencies:** Steps 1.1, 2.1 (uses event types and base class)
- **Required By:** Step 3.2
- **Handlers:**
  - `ProductCreatedHandler`: Log creation, send notifications
  - `ProductUpdatedHandler`: Log updates, invalidate caches if needed
  - `ProductDeletedHandler`: Log deletion, cleanup related data

**Code Snippet:**

```typescript
// src/domain/services/events/ProductEventHandlers.ts
import { inject, injectable } from 'tsyringe';
import { EventHandler } from './EventHandler';
import { ProductCreatedEvent, ProductUpdatedEvent, ProductDeletedEvent } from '../../events';
import { Logger } from '../../../shared/logger';
import { DI_TOKENS } from '../../../shared/constants';

@injectable()
export class ProductCreatedHandler extends EventHandler<ProductCreatedEvent> {
  constructor(@inject(DI_TOKENS.LOGGER) logger: Logger) {
    super(logger);
  }

  async handle(event: ProductCreatedEvent): Promise<void> {
    this.logger.info(`Product created: ${event.payload.productId}`, {
      productName: event.payload.name,
      category: event.payload.category,
    });
    // TODO: Send real-time notification to admin dashboard
    // TODO: Update search index
  }
}

@injectable()
export class ProductUpdatedHandler extends EventHandler<ProductUpdatedEvent> {
  constructor(@inject(DI_TOKENS.LOGGER) logger: Logger) {
    super(logger);
  }

  async handle(event: ProductUpdatedEvent): Promise<void> {
    this.logger.info(`Product updated: ${event.payload.productId}`, {
      changes: Object.keys(event.payload.changes),
    });
    // TODO: Invalidate relevant caches
    // TODO: Send update notifications
  }
}

@injectable()
export class ProductDeletedHandler extends EventHandler<ProductDeletedEvent> {
  constructor(@inject(DI_TOKENS.LOGGER) logger: Logger) {
    super(logger);
  }

  async handle(event: ProductDeletedEvent): Promise<void> {
    this.logger.info(`Product deleted: ${event.payload.productId}`);
    // TODO: Cleanup related data
    // TODO: Update inventory systems
  }
}
```

**Description:** Specific event handlers for product-related events. Each handler logs the event and includes TODOs for additional actions like notifications and cache invalidation.

#### Step 2.3: Audit Logging Handler

- **Step Number:** 2.3
- **File:** `src/domain/services/events/AuditEventHandler.ts`
- **Purpose:** Centralized audit logging for all events
- **Dependencies:** Steps 1.1, 2.1 (uses event types and base class)
- **Required By:** Step 3.2
- **Features:** Structured logging with event metadata

**Code Snippet:**

```typescript
// src/domain/services/events/AuditEventHandler.ts
import { inject, injectable } from 'tsyringe';
import { EventHandler } from './EventHandler';
import { UserActivityEvent } from '../../events';
import { Logger } from '../../../shared/logger';
import { DI_TOKENS } from '../../../shared/constants';

@injectable()
export class AuditEventHandler extends EventHandler<UserActivityEvent> {
  constructor(@inject(DI_TOKENS.LOGGER) logger: Logger) {
    super(logger);
  }

  async handle(event: UserActivityEvent): Promise<void> {
    this.logger.info('Audit Event', {
      userId: event.payload.userId,
      action: event.payload.action,
      timestamp: event.timestamp,
      correlationId: event.correlationId,
      metadata: event.payload.metadata,
    });
    // TODO: Store in audit database
    // TODO: Send to monitoring system
  }
}
```

**Description:** Centralized audit logging handler that captures all user activities with structured logging for compliance and monitoring.

### Phase 3: Application Integration

#### Step 3.1: DI Container Registration

- **Step Number:** 3.1
- **File:** `src/config/di-container.ts`
- **Purpose:** Register publisher, subscriber, and event handlers
- **Dependencies:** Steps 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3 (all services and handlers)
- **Required By:** Steps 3.2, 3.3
- **Scope:** Singleton registration for services

**Code Snippet:**

```typescript
// src/config/di-container.ts
// ... existing registrations ...

// Pub/Sub Services
container.register<IPublisherService>(DI_TOKENS.PUBLISHER_SERVICE, PublisherService);
container.register<ISubscriberService>(DI_TOKENS.SUBSCRIBER_SERVICE, SubscriberService);

// Event Handlers
container.register<ProductCreatedHandler>(DI_TOKENS.PRODUCT_CREATED_HANDLER, ProductCreatedHandler);
container.register<ProductUpdatedHandler>(DI_TOKENS.PRODUCT_UPDATED_HANDLER, ProductUpdatedHandler);
container.register<ProductDeletedHandler>(DI_TOKENS.PRODUCT_DELETED_HANDLER, ProductDeletedHandler);
container.register<AuditEventHandler>(DI_TOKENS.AUDIT_EVENT_HANDLER, AuditEventHandler);
```

**Description:** Registers all pub/sub services and event handlers as singletons in the dependency injection container.

#### Step 3.2: Application Bootstrap

- **Step Number:** 3.2
- **File:** `src/app.ts`
- **Purpose:** Initialize subscribers on application startup
- **Dependencies:** Steps 1.3, 1.5, 2.2, 2.3, 3.1 (subscriber service and handlers)
- **Required By:** None (application entry point)
- **Implementation:** Start subscriber connections after DI setup

**Code Snippet:**

```typescript
// src/app.ts
// ... existing imports ...
import { ISubscriberService } from './domain/interfaces/redis/ISubscriberService';
import {
  ProductCreatedHandler,
  ProductUpdatedHandler,
  ProductDeletedHandler,
  AuditEventHandler,
} from './domain/services/events';
import { DI_TOKENS } from './shared/constants';

// ... existing setup ...

// Initialize event subscribers
const subscriberService = container.resolve<ISubscriberService>(DI_TOKENS.SUBSCRIBER_SERVICE);
const productCreatedHandler = container.resolve<ProductCreatedHandler>(
  DI_TOKENS.PRODUCT_CREATED_HANDLER
);
const productUpdatedHandler = container.resolve<ProductUpdatedHandler>(
  DI_TOKENS.PRODUCT_UPDATED_HANDLER
);
const productDeletedHandler = container.resolve<ProductDeletedHandler>(
  DI_TOKENS.PRODUCT_DELETED_HANDLER
);
const auditEventHandler = container.resolve<AuditEventHandler>(DI_TOKENS.AUDIT_EVENT_HANDLER);

// Subscribe to product events
subscriberService.subscribe('jollyjet:events:product', async (event) => {
  switch (event.eventType) {
    case 'PRODUCT_CREATED':
      await productCreatedHandler.executeWithRetry(event);
      break;
    case 'PRODUCT_UPDATED':
      await productUpdatedHandler.executeWithRetry(event);
      break;
    case 'PRODUCT_DELETED':
      await productDeletedHandler.executeWithRetry(event);
      break;
  }
});

// Subscribe to audit events
subscriberService.subscribe('jollyjet:events:audit', async (event) => {
  await auditEventHandler.executeWithRetry(event);
});

// ... existing server start ...
```

**Description:** Initializes subscribers on application startup, setting up event routing to appropriate handlers with retry logic.

#### Step 3.3: Product Use Case Integration

- **Step Number:** 3.3
- **File:** `src/application/usecases/product/`
- **Purpose:** Publish events from product operations
- **Dependencies:** Steps 1.1, 1.2, 1.4, 3.1 (publisher service and event types)
- **Required By:** None (end of use case chain)
- **Integration Points:**
  - `CreateProductUseCase`: Publish `ProductCreatedEvent`
  - `UpdateProductUseCase`: Publish `ProductUpdatedEvent`
  - `DeleteProductUseCase`: Publish `ProductDeletedEvent`

**Code Snippet:**

```typescript
// src/application/usecases/product/CreateProductUseCase.ts
// ... existing code ...

export class CreateProductUseCase {
  constructor(
    // ... existing dependencies ...
    @inject(DI_TOKENS.PUBLISHER_SERVICE) private publisherService: IPublisherService
  ) {}

  async execute(input: CreateProductInput): Promise<ProductResponseDTO> {
    // ... existing product creation logic ...

    const product = await this.productRepository.create(productData);

    // Publish event
    await this.publisherService.publish('jollyjet:events:product', {
      eventId: generateId(),
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

**Description:** Integrates event publishing into the CreateProductUseCase to notify other parts of the system about product creation.

### Phase 4: Testing and Validation

#### Step 4.1: Unit Tests

- **Step Number:** 4.1
- **Files:** `src/tests/unit/services/redis/`
- **Dependencies:** Steps 1.4, 1.5 (services to test)
- **Coverage:** Publisher and Subscriber services
- **Mocking:** Redis client mocking for isolated testing

#### Step 4.2: Integration Tests

- **Step Number:** 4.2
- **Files:** `src/tests/integration/events/`
- **Dependencies:** Steps 1.1-3.3 (complete system)
- **Coverage:** End-to-end event publishing and handling
- **Validation:** Message delivery, handler execution

#### Step 4.3: Load Testing

- **Step Number:** 4.3
- **Purpose:** Validate performance under high event volume
- **Dependencies:** Steps 4.1, 4.2 (after unit and integration tests pass)
- **Tools:** Artillery.js or custom load test scripts

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Use Cases     │───▶│   Publisher      │───▶│    Redis        │
│                 │    │   Service        │    │   Pub/Sub       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌──────────────────┐             │
│ Event Handlers  │◀───│  Subscriber      │◀────────────┘
│                 │    │   Service        │
└─────────────────┘    └──────────────────┘
```

## 📋 Dependency Chain Summary

```
1.1 (Foundation)
  ├─→ 1.2 ──→ 1.4 ──→ 3.1 ──→ 3.3
  ├─→ 1.3 ──→ 1.5 ──→ 3.1 ──→ 3.2
  ├─→ 2.1 ──→ 2.2 ──→ 3.2
  └─→ 2.1 ──→ 2.3 ──→ 3.2
```

**Legend:**

- **1.1** - Event Definitions and Types (Foundation)
- **1.2** - Publisher Service Interface
- **1.3** - Subscriber Service Interface
- **1.4** - Publisher Service Implementation
- **1.5** - Subscriber Service Implementation
- **2.1** - Event Handler Base Class
- **2.2** - Product Event Handlers
- **2.3** - Audit Logging Handler
- **3.1** - DI Container Registration
- **3.2** - Application Bootstrap
- **3.3** - Product Use Case Integration

## 🔧 Technical Considerations

### Redis Pub/Sub Limitations

- **No Persistence:** Messages are fire-and-forget
- **No Acknowledgment:** No delivery guarantees
- **Memory Usage:** Subscribers hold messages in memory

### Best Practices

- **Channel Naming:** Use consistent naming convention (e.g., `jollyjet:events:product`)
- **Message Format:** JSON with event type and payload
- **Error Handling:** Implement dead letter queues for failed messages
- **Monitoring:** Add metrics for published/subscribed events

### Scalability

- **Multiple Subscribers:** Support multiple handlers per event
- **Load Balancing:** Distribute subscribers across instances
- **Backpressure:** Implement rate limiting for high-volume events

## 📊 Success Metrics

- ✅ All event types defined with proper TypeScript interfaces
- ✅ Publisher/Subscriber services implemented and tested
- ✅ Event handlers integrated with existing use cases
- ✅ End-to-end event flow verified
- ✅ Performance benchmarks meet requirements (< 10ms latency)
- ✅ Error handling and recovery mechanisms in place

## 🚀 Future Enhancements

- **Message Persistence:** Upgrade to Redis Streams for durability
- **Event Sourcing:** Store events for replay capabilities
- **Distributed Tracing:** Add correlation IDs for request tracking
- **External Integrations:** Webhook support for third-party services

## 🔒 Security Considerations

### Channel Access Control

- **Channel Naming Convention:** Use namespaced channels with environment prefixes
  - Development: `dev:jollyjet:events:product`
  - Production: `prod:jollyjet:events:product`
- **Authentication:** Implement Redis ACL (Access Control Lists) for channel-level permissions
- **Encryption:** Use TLS for Redis connections in production

### Message Security

- **Sensitive Data:** Never include PII (Personally Identifiable Information) in event payloads
- **Data Sanitization:** Sanitize event data before publishing
- **Message Signing:** Consider HMAC signatures for critical events

```typescript
// Example: Channel naming with environment using constants
import { PUBSUB_CHANNELS } from '../../../shared/constants';

const getChannelName = (channel: string): string => {
  return PUBSUB_CHANNELS.getEnvironmentChannel(channel);
};

// Usage examples:
// PUBSUB_CHANNELS.PRODUCT -> 'jollyjet:events:product'
// PUBSUB_CHANNELS.AUDIT -> 'jollyjet:events:audit'
// PUBSUB_CHANNELS.DLQ -> 'jollyjet:events:dlq'
```

## 📈 Monitoring and Observability

### Metrics to Track

- **Publisher Metrics:**
  - Messages published per channel
  - Publish latency (time to publish)
  - Publish failure rate
  - Message size distribution

- **Subscriber Metrics:**
  - Messages received per channel
  - Processing latency (time to handle)
  - Handler success/failure rates
  - Queue depth (if using buffering)

- **System Metrics:**
  - Redis connection health
  - Memory usage
  - Network latency

### Logging Strategy

```typescript
// Structured logging for events
interface EventLog {
  eventId: string;
  eventType: string;
  channel: string;
  timestamp: Date;
  status: 'PUBLISHED' | 'RECEIVED' | 'PROCESSED' | 'FAILED';
  latency?: number;
  error?: string;
  correlationId?: string;
}
```

### Monitoring Tools Integration

- **Prometheus:** Export metrics for Grafana dashboards
- **ELK Stack:** Centralized log aggregation
- **Datadog/New Relic:** APM integration for distributed tracing

## 🔄 Error Handling Strategies

### Dead Letter Queue (DLQ)

```typescript
// src/domain/services/events/DeadLetterQueue.ts
import { inject, injectable } from 'tsyringe';
import { DI_TOKENS, PUBSUB_CHANNELS, PUBSUB_MESSAGES } from '../../../shared/constants';
import { Logger } from '../../../shared/logger';
import { IRedisService } from '../../interfaces/redis/IRedisService';

@injectable()
export class DeadLetterQueue {
  private readonly DLQ_CHANNEL = PUBSUB_CHANNELS.DLQ;

  constructor(
    @inject(DI_TOKENS.REDIS_SERVICE) private redisService: IRedisService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger
  ) {}

  async push(event: any, error: Error, retryCount: number): Promise<void> {
    const dlqEntry = {
      originalEvent: event,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      retryCount,
      timestamp: new Date(),
    };

    await this.redisService.getClient().lpush(this.DLQ_CHANNEL, JSON.stringify(dlqEntry));

    this.logger.warn(error, PUBSUB_MESSAGES.DLQ_PUSHED(event.eventId, event.eventType));
  }

  async get(count: number = 10): Promise<any[]> {
    const entries = await this.redisService.getClient().lrange(this.DLQ_CHANNEL, 0, count - 1);
    return entries.map((entry) => JSON.parse(entry));
  }

  async remove(eventId: string): Promise<void> {
    // Implementation to remove specific event from DLQ
  }
}
```

### Retry Strategies

- **Exponential Backoff:** Increase delay between retries
- **Circuit Breaker:** Stop retrying after consecutive failures
- **Max Retries:** Limit retry attempts to prevent infinite loops

```typescript
// Enhanced retry logic with exponential backoff
protected async executeWithRetry(
  event: T,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<void> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      await this.handle(event);
      return;
    } catch (error) {
      attempt++;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      this.logger.warn(
        error as Error,
        `${PUBSUB_MESSAGES.EVENT_HANDLING_FAILED(attempt, maxRetries)}, retrying in ${delay}ms`
      );

      if (attempt >= maxRetries) {
        this.logger.error(error as Error, PUBSUB_MESSAGES.EVENT_HANDLING_FAILED_ALL_RETRIES);
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
```

## 🧪 Testing Strategies

### Unit Testing

```typescript
// src/tests/unit/services/redis/PublisherService.test.ts
import { PublisherService } from '../../../../domain/services/redis/PublisherService';
import { IRedisService } from '../../../../domain/interfaces/redis/IRedisService';
import { Logger } from '../../../../shared/logger';

describe('PublisherService', () => {
  let publisherService: PublisherService;
  let mockRedisService: jest.Mocked<IRedisService>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRedisService = {
      getClient: jest.fn(),
    } as any;
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    } as any;

    publisherService = new PublisherService(mockRedisService, mockLogger);
  });

  it('should publish message to channel', async () => {
    const mockClient = {
      publish: jest.fn().mockResolvedValue(1),
    };
    mockRedisService.getClient.mockReturnValue(mockClient as any);

    await publisherService.publish('test-channel', { test: 'data' });

    expect(mockClient.publish).toHaveBeenCalledWith(
      'test-channel',
      JSON.stringify({ test: 'data' })
    );
    expect(mockLogger.info).toHaveBeenCalled();
  });

  it('should handle publish errors', async () => {
    const mockClient = {
      publish: jest.fn().mockRejectedValue(new Error('Redis error')),
    };
    mockRedisService.getClient.mockReturnValue(mockClient as any);

    await expect(publisherService.publish('test-channel', { test: 'data' })).rejects.toThrow(
      'Redis error'
    );
    expect(mockLogger.error).toHaveBeenCalled();
  });
});
```

### Integration Testing

```typescript
// src/tests/integration/events/PubSubIntegration.test.ts
import { PublisherService } from '../../../domain/services/redis/PublisherService';
import { SubscriberService } from '../../../domain/services/redis/SubscriberService';
import { IRedisService } from '../../../domain/interfaces/redis/IRedisService';

describe('Pub/Sub Integration', () => {
  let publisherService: PublisherService;
  let subscriberService: SubscriberService;
  let redisService: IRedisService;

  beforeAll(async () => {
    // Setup real Redis connection for integration tests
    redisService = await setupTestRedis();
    publisherService = new PublisherService(redisService, mockLogger);
    subscriberService = new SubscriberService(redisService, mockLogger);
  });

  afterAll(async () => {
    await cleanupTestRedis(redisService);
  });

  it('should publish and receive message', (done) => {
    const testChannel = 'test:integration';
    const testMessage = { eventId: '123', data: 'test' };

    subscriberService.subscribe(testChannel, (message) => {
      expect(message).toEqual(testMessage);
      done();
    });

    setTimeout(() => {
      publisherService.publish(testChannel, testMessage);
    }, 100);
  });
});
```

### Load Testing

```typescript
// scripts/load-test-pubsub.js
const { PublisherService } = require('../dist/domain/services/redis/PublisherService');
const { performance } = require('perf_hooks');

async function loadTest() {
  const publisher = new PublisherService(redisService, logger);
  const messageCount = 10000;
  const startTime = performance.now();

  for (let i = 0; i < messageCount; i++) {
    await publisher.publish('load-test', {
      eventId: `test-${i}`,
      timestamp: new Date(),
    });
  }

  const endTime = performance.now();
  const duration = endTime - startTime;
  const messagesPerSecond = (messageCount / duration) * 1000;

  console.log(`Published ${messageCount} messages in ${duration}ms`);
  console.log(`Throughput: ${messagesPerSecond.toFixed(2)} messages/second`);
}

loadTest();
```

## 🎯 Event Versioning Strategy

### Versioning Approach

```typescript
// src/domain/events/EventVersion.ts
export interface EventVersion {
  version: string;
  schema: any;
  migration?: (oldEvent: any) => any;
}

export const EVENT_VERSIONS: Record<string, EventVersion> = {
  PRODUCT_CREATED: {
    version: '1.0.0',
    schema: {
      eventId: 'string',
      eventType: 'string',
      timestamp: 'date',
      payload: {
        productId: 'string',
        name: 'string',
        price: 'number',
        category: 'string',
      },
    },
  },
};

// Version-aware event handler
export class VersionAwareEventHandler {
  handle(event: any): void {
    const version = EVENT_VERSIONS[event.eventType];
    if (!version) {
      throw new Error(`Unknown event type: ${event.eventType}`);
    }

    // Validate against schema
    this.validateSchema(event, version.schema);

    // Handle event
    this.processEvent(event);
  }

  private validateSchema(event: any, schema: any): void {
    // Schema validation implementation
  }

  private processEvent(event: any): void {
    // Event processing implementation
  }
}
```

## 🚦 Circuit Breaker Pattern

```typescript
// src/domain/services/events/CircuitBreaker.ts
export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime: Date | null = null;
  private successCount = 0;

  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000, // 1 minute
    private readonly halfOpenMaxCalls: number = 3
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.halfOpenMaxCalls) {
        this.state = CircuitState.CLOSED;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;
    const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime();
    return timeSinceLastFailure >= this.timeout;
  }

  getState(): CircuitState {
    return this.state;
  }
}
```

## 📊 Performance Optimization

### Batching Strategy

```typescript
// src/domain/services/events/BatchPublisher.ts
export class BatchPublisher {
  private batch: any[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly publisherService: IPublisherService,
    private readonly batchSize: number = 100,
    private readonly batchTimeout: number = 1000 // 1 second
  ) {}

  async publish(channel: string, message: any): Promise<void> {
    this.batch.push({ channel, message });

    if (this.batch.length >= this.batchSize) {
      await this.flush();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flush(), this.batchTimeout);
    }
  }

  private async flush(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.batch.length === 0) return;

    // Group by channel
    const grouped = this.batch.reduce(
      (acc, item) => {
        if (!acc[item.channel]) {
          acc[item.channel] = [];
        }
        acc[item.channel].push(item.message);
        return acc;
      },
      {} as Record<string, any[]>
    );

    // Publish batches
    for (const [channel, messages] of Object.entries(grouped)) {
      await this.publisherService.publish(channel, {
        type: 'BATCH',
        messages,
        timestamp: new Date(),
      });
    }

    this.batch = [];
  }
}
```

### Connection Pooling

```typescript
// src/infrastructure/database/redis-pool.ts
import Redis from 'ioredis';

export class RedisConnectionPool {
  private pool: Redis[] = [];
  private readonly maxPoolSize: number;
  private currentIndex = 0;

  constructor(
    private readonly config: Redis.RedisOptions,
    maxPoolSize: number = 10
  ) {
    this.maxPoolSize = maxPoolSize;
    this.initializePool();
  }

  private initializePool(): void {
    for (let i = 0; i < this.maxPoolSize; i++) {
      const client = new Redis(this.config);
      this.pool.push(client);
    }
  }

  getClient(): Redis {
    const client = this.pool[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.maxPoolSize;
    return client;
  }

  async closeAll(): Promise<void> {
    await Promise.all(this.pool.map((client) => client.quit()));
  }
}
```

## 🛠️ Deployment Considerations

### Environment Configuration

```typescript
// src/config/pubsub.config.ts
export interface PubSubConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    tls?: boolean;
  };
  channels: {
    product: string;
    audit: string;
    notifications: string;
  };
  circuitBreaker: {
    threshold: number;
    timeout: number;
  };
  retry: {
    maxRetries: number;
    baseDelay: number;
  };
}

export const pubSubConfig: PubSubConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls: process.env.NODE_ENV === 'production',
  },
  channels: {
    product: PUBSUB_CHANNELS.getEnvironmentChannel(PUBSUB_CHANNELS.PRODUCT),
    audit: PUBSUB_CHANNELS.getEnvironmentChannel(PUBSUB_CHANNELS.AUDIT),
    notifications: PUBSUB_CHANNELS.getEnvironmentChannel(PUBSUB_CHANNELS.NOTIFICATIONS),
  },
  circuitBreaker: {
    threshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD || '5'),
    timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '60000'),
  },
  retry: {
    maxRetries: parseInt(process.env.RETRY_MAX_ATTEMPTS || '3'),
    baseDelay: parseInt(process.env.RETRY_BASE_DELAY || '1000'),
  },
};
```

### Health Checks

```typescript
// src/interface/controllers/health/PubSubHealthController.ts
import { Controller, Get } from 'express-ts-decorators';
import { ISubscriberService } from '../../../domain/interfaces/redis/ISubscriberService';
import { IPublisherService } from '../../../domain/interfaces/redis/IPublisherService';

@Controller('/health')
export class PubSubHealthController {
  constructor(
    private readonly publisherService: IPublisherService,
    private readonly subscriberService: ISubscriberService
  ) {}

  @Get('/pubsub')
  async checkPubSubHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: any;
  }> {
    try {
      // Test publish
      const testChannel = 'health:check';
      const testMessage = { test: true, timestamp: new Date() };

      await this.publisherService.publish(testChannel, testMessage);

      return {
        status: 'healthy',
        details: {
          publisher: 'connected',
          subscriber: 'connected',
          timestamp: new Date(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          timestamp: new Date(),
        },
      };
    }
  }
}
```

## 🔍 Troubleshooting Guide

### Common Issues

#### 1. Messages Not Received

**Symptoms:** Publisher publishes successfully but subscribers don't receive messages.

**Possible Causes:**

- Subscriber client disconnected
- Channel name mismatch
- Network connectivity issues

**Solutions:**

```typescript
// Add connection monitoring
subscriberClient.on('connect', () => {
  logger.info(PUBSUB_MESSAGES.SUBSCRIBER_CLIENT_CONNECTED);
});

subscriberClient.on('disconnect', () => {
  logger.warn(PUBSUB_MESSAGES.SUBSCRIBER_CLIENT_DISCONNECTED);
  // Implement reconnection logic
});
```

#### 2. High Memory Usage

**Symptoms:** Redis memory usage grows continuously.

**Possible Causes:**

- Unbounded message queues
- Large message payloads
- Memory leaks in handlers

**Solutions:**

- Implement message size limits
- Use Redis Streams instead of pub/sub for persistence
- Add memory monitoring and alerts

#### 3. Event Processing Delays

**Symptoms:** Events take too long to process.

**Possible Causes:**

- Blocking handlers
- Insufficient worker threads
- Database bottlenecks

**Solutions:**

- Implement async processing with worker queues
- Add timeout handlers
- Optimize database queries

### Debugging Tools

```typescript
// src/shared/utils/EventDebugger.ts
export class EventDebugger {
  private static enabled = process.env.DEBUG_EVENTS === 'true';

  static log(event: any, stage: string): void {
    if (!this.enabled) return;

    console.log(`[Event Debug] ${stage}:`, {
      eventId: event.eventId,
      eventType: event.eventType,
      timestamp: event.timestamp,
      payload: event.payload,
      stackTrace: new Error().stack,
    });
  }
}

// Usage in handlers
async handle(event: ProductCreatedEvent): Promise<void> {
  EventDebugger.log(event, 'START');
  // ... handler logic
  EventDebugger.log(event, 'END');
}
```

## 📚 Additional Resources

### Redis Pub/Sub Documentation

- [Redis Pub/Sub Official Documentation](https://redis.io/topics/pubsub)
- [ioredis Pub/Sub Guide](https://github.com/luin/ioredis#pubsub)

### Event-Driven Architecture

- [Microservices Patterns: Event-Driven Architecture](https://microservices.io/patterns/data/event-driven-architecture.html)
- [Domain-Driven Design: Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)

### Best Practices

- [CloudEvents Specification](https://cloudevents.io/)
- [AsyncAPI Specification](https://www.asyncapi.com/)

---

**Note:** This implementation provides a foundation for event-driven architecture while maintaining compatibility with the existing Clean Architecture patterns. Future microservices migration can leverage this pub/sub system for inter-service communication.
