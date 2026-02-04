/**
 * Subscriber Service Interface
 *
 * Defines the contract for subscribing to Redis Pub/Sub channels and handling
 * incoming messages. This interface abstracts the subscription mechanism,
 * allowing for different implementations (Redis, in-memory, etc.).
 *
 * Key Concepts:
 * - Channels: Named message queues in Redis (e.g., 'jollyjet:events:product')
 * - Handlers: Functions that process received messages
 * - Messages: JSON-serialized event objects
 *
 * Implementation Notes:
 * - Subscriptions are persistent until explicitly unsubscribed
 * - Handlers should be idempotent as messages may be redelivered
 * - Errors in handlers should not crash the subscription
 *
 * @example
 * ```typescript
 * // Subscribe to product events
 * subscriberService.subscribe(PUBSUB_CHANNELS.PRODUCT, (event: AppEvent) => {
 *   console.log(`Received ${event.eventType} event`);
 * });
 *
 * // Unsubscribe when done
 * subscriberService.unsubscribe(PUBSUB_CHANNELS.PRODUCT);
 * ```
 *
 * @see SubscriberService
 * @see PUBSUB_CHANNELS
 * @see AppEvent
 */

/**
 * Type definition for message handler functions.
 *
 * Handlers receive parsed event objects and can be either synchronous or asynchronous.
 * Errors thrown by handlers should be caught and logged by the implementation.
 *
 * @param message - The parsed event object (typically an AppEvent)
 * @returns void or Promise<void> for async handlers
 *
 * @example
 * ```typescript
 * const handler: MessageHandler = async (event: ProductCreatedEvent) => {
 *   await sendNotification(event.payload.productId);
 * };
 * ```
 */
export type MessageHandler = (message: unknown) => void | Promise<void>;

/**
 * Subscriber Service Interface
 *
 * Contract for services that manage Redis Pub/Sub subscriptions.
 */
export interface ISubscriberService {
  /**
   * Initialize the subscriber service.
   * Must be called before subscribing to any channels.
   */
  initialize(): Promise<void>;

  /**
   * Subscribes to a Redis channel with a message handler.
   *
   * When a message is published to the specified channel, the handler
   * will be invoked with the parsed message content.
   *
   * @param channel - The Redis channel name to subscribe to (e.g., PUBSUB_CHANNELS.PRODUCT)
   * @param handler - The function to call when messages are received on this channel
   *
   * @example
   * ```typescript
   * subscriberService.subscribe(PUBSUB_CHANNELS.PRODUCT, (event: AppEvent) => {
   *   if (event.eventType === PUBSUB_EVENT_TYPES.PRODUCT_CREATED) {
   *     // Handle product creation
   *   }
   * });
   * ```
   */
  subscribe(channel: string, handler: MessageHandler): void;

  /**
   * Unsubscribes from a Redis channel.
   *
   * Stops receiving messages from the specified channel and removes
   * the associated handler. If the channel was not subscribed, this
   * method typically does nothing.
   *
   * @param channel - The Redis channel name to unsubscribe from
   *
   * @example
   * ```typescript
   * subscriberService.unsubscribe(PUBSUB_CHANNELS.PRODUCT);
   * ```
   */
  unsubscribe(channel: string): void;

  /**
   * Disconnect the subscriber service and clean up resources.
   * Should be called during application shutdown.
   */
  disconnect(): Promise<void>;
}
