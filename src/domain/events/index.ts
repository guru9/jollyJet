/**
 * Domain Events Module
 *
 * This module defines all event types used in the Pub/Sub messaging system.
 * Events follow a consistent structure with type-safe payloads and are used
 * for asynchronous communication between different parts of the application.
 *
 * Architecture:
 * - BaseEvent: Common interface for all events
 * - Specific Events: Extend BaseEvent with typed payloads
 * - Event Union: AppEvent type for type-safe event handling
 * - Utilities: Helper functions for event generation
 *
 * Event Flow:
 * 1. Events are created by services/use cases
 * 2. Published via PublisherService to Redis channels
 * 3. Subscribers receive and process events via SubscriberService
 * 4. Handlers execute business logic based on event type
 *
 * @example
 * ```typescript
 * // Creating an event
 * const event: ProductCreatedEvent = {
 *   eventId: generateEventId(),
 *   eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
 *   timestamp: new Date(),
 *   correlationId: 'req-123',
 *   payload: { productId: '123', name: 'Product', price: 99.99, category: 'Electronics' }
 * };
 *
 * // Publishing an event
 * await publisherService.publish(PUBSUB_CHANNELS.PRODUCT, event);
 * ```
 *
 * @see IPublisherService
 * @see ISubscriberService
 * @see PUBSUB_CHANNELS
 * @see PUBSUB_EVENT_TYPES
 */

import { PUBSUB_CHANNELS, PUBSUB_EVENT_TYPES } from '../../shared/constants';

/**
 * Base Event Interface
 *
 * Defines the common structure for all events in the system.
 * All specific event types must extend this interface.
 *
 * Required Fields:
 * - eventId: Unique identifier for event tracking and deduplication
 * - eventType: Discriminator for event routing and handling
 * - timestamp: Event creation time for ordering and auditing
 *
 * Optional Fields:
 * - correlationId: For distributed tracing across services
 *
 * @example
 * ```typescript
 * interface MyCustomEvent extends BaseEvent {
 *   eventType: typeof PUBSUB_EVENT_TYPES.MY_EVENT;
 *   payload: { data: string };
 * }
 * ```
 */
export interface BaseEvent {
  /**
   * Unique identifier for the event
   * Format: evt_${timestamp}_${random} (see generateEventId)
   * Used for: Event tracking, deduplication, debugging
   */
  eventId: string;

  /**
   * Type of the event
   * Must be one of the values from PUBSUB_EVENT_TYPES
   * Used for: Event routing, handler selection, filtering
   */
  eventType: string;

  /**
   * Timestamp when the event was created
   * Should be set to new Date() when creating events
   * Used for: Event ordering, latency measurement, auditing
   */
  timestamp: Date;

  /**
   * Optional correlation ID for distributed tracing
   * Propagate from incoming requests for traceability
   * Used for: Request tracing, debugging, log correlation
   */
  correlationId?: string;
}

/**
 * Product Created Event
 *
 * Emitted when a new product is successfully created in the system.
 * Published to PUBSUB_CHANNELS.PRODUCT channel.
 *
 * Use Cases:
 * - Cache invalidation/refresh
 * - Search index updates
 * - Notification triggers
 * - Audit logging
 *
 * @example
 * ```typescript
 * const event: ProductCreatedEvent = {
 *   eventId: generateEventId(),
 *   eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
 *   timestamp: new Date(),
 *   payload: {
 *     productId: 'prod_123',
 *     name: 'Wireless Headphones',
 *     price: 199.99,
 *     category: 'Electronics'
 *   }
 * };
 * ```
 */
export interface ProductCreatedEvent extends BaseEvent {
  eventType: typeof PUBSUB_EVENT_TYPES.PRODUCT_CREATED;
  payload: {
    /** Unique identifier of the created product (MongoDB ObjectId as string) */
    productId: string;
    /** Name/title of the product */
    name: string;
    /** Price of the product in the system's currency */
    price: number;
    /** Category the product belongs to */
    category: string;
  };
}

/**
 * Product Updated Event
 *
 * Emitted when an existing product is modified in the system.
 * Published to PUBSUB_CHANNELS.PRODUCT channel.
 *
 * Use Cases:
 * - Cache updates
 * - Search index synchronization
 * - Change notifications
 * - Audit trail
 *
 * Note: The changes field contains only the fields that were modified,
 * not the entire product object.
 *
 * @example
 * ```typescript
 * const event: ProductUpdatedEvent = {
 *   eventId: generateEventId(),
 *   eventType: PUBSUB_EVENT_TYPES.PRODUCT_UPDATED,
 *   timestamp: new Date(),
 *   payload: {
 *     productId: 'prod_123',
 *     changes: { price: 149.99, stock: 50 }
 *   }
 * };
 * ```
 */
export interface ProductUpdatedEvent extends BaseEvent {
  eventType: typeof PUBSUB_EVENT_TYPES.PRODUCT_UPDATED;
  payload: {
    /** Unique identifier of the updated product */
    productId: string;
    /** Object containing only the fields that were changed (diff) */
    changes: Record<string, any>;
  };
}

/**
 * Product Deleted Event
 *
 * Emitted when a product is removed from the system.
 * Published to PUBSUB_CHANNELS.PRODUCT channel.
 *
 * Use Cases:
 * - Cache removal
 * - Search index cleanup
 * - Referential integrity checks
 * - Audit logging
 *
 * @example
 * ```typescript
 * const event: ProductDeletedEvent = {
 *   eventId: generateEventId(),
 *   eventType: PUBSUB_EVENT_TYPES.PRODUCT_DELETED,
 *   timestamp: new Date(),
 *   payload: {
 *     productId: 'prod_123'
 *   }
 * };
 * ```
 */
export interface ProductDeletedEvent extends BaseEvent {
  eventType: typeof PUBSUB_EVENT_TYPES.PRODUCT_DELETED;
  payload: {
    /** Unique identifier of the deleted product */
    productId: string;
  };
}

/**
 * User Activity Event
 *
 * Emitted for audit logging and monitoring of user actions.
 * Published to PUBSUB_CHANNELS.USER_ACTIVITY channel.
 *
 * Use Cases:
 * - Security audit trails
 * - User behavior analytics
 * - Compliance reporting
 * - Anomaly detection
 *
 * The metadata field can contain any additional context about the activity,
 * such as IP address, user agent, request details, etc.
 *
 * @example
 * ```typescript
 * const event: UserActivityEvent = {
 *   eventId: generateEventId(),
 *   eventType: PUBSUB_EVENT_TYPES.USER_ACTIVITY,
 *   timestamp: new Date(),
 *   correlationId: 'req-456',
 *   payload: {
 *     userId: 'user_789',
 *     action: 'LOGIN_SUCCESS',
 *     metadata: {
 *       ip: '192.168.1.1',
 *       userAgent: 'Mozilla/5.0...',
 *       method: 'POST',
 *       path: '/api/auth/login'
 *     }
 *   }
 * };
 * ```
 */
export interface UserActivityEvent extends BaseEvent {
  eventType: typeof PUBSUB_EVENT_TYPES.USER_ACTIVITY;
  payload: {
    /** Unique identifier of the user who performed the action */
    userId: string;
    /** Description of the action performed (e.g., 'LOGIN_SUCCESS', 'PRODUCT_CREATED') */
    action: string;
    /** Additional metadata about the activity (IP, user agent, etc.) */
    metadata: Record<string, any>;
  };
}

/**
 * Union type for all events in the system
 *
 * This type is used for type-safe event handling in subscribers and handlers.
 * It ensures that only valid event types can be processed.
 *
 * Usage:
 * ```typescript
 * function handleEvent(event: AppEvent): void {
 *   switch (event.eventType) {
 *     case PUBSUB_EVENT_TYPES.PRODUCT_CREATED:
 *       // TypeScript knows event is ProductCreatedEvent here
 *       handleProductCreated(event);
 *       break;
 *     // ... other cases
 *   }
 * }
 * ```
 */
export type AppEvent =
  | ProductCreatedEvent
  | ProductUpdatedEvent
  | ProductDeletedEvent
  | UserActivityEvent;

/**
 * Event Type Constants
 *
 * Re-export from shared constants for convenience.
 * Prefer importing directly from shared/constants for new code.
 *
 * @deprecated Use PUBSUB_EVENT_TYPES from shared/constants instead.
 * This export will be removed in a future version.
 */
export { PUBSUB_EVENT_TYPES as EVENT_TYPES };

/**
 * Event Channel Constants
 *
 * Re-export from shared constants for convenience.
 * Prefer importing directly from shared/constants for new code.
 *
 * @deprecated Use PUBSUB_CHANNELS from shared/constants instead.
 * This export will be removed in a future version.
 */
export { PUBSUB_CHANNELS as EVENT_CHANNELS };

/**
 * Generate a unique event ID
 *
 * Creates a unique identifier for events using timestamp and random components.
 * Format: evt_${timestamp}_${random}
 *
 * Characteristics:
 * - Chronologically sortable (timestamp prefix)
 * - Collision resistant (random suffix)
 * - Human readable
 * - URL safe
 *
 * @returns A unique identifier string for the event
 *
 * @example
 * ```typescript
 * const eventId = generateEventId();
 * // Returns: "evt_1706784000000_a1b2c3d4e5f6"
 * ```
 */
export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
