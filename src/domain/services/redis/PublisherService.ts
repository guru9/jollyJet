/**
 * Publisher Service Implementation
 *
 * Implements IPublisherService for publishing events to Redis channels.
 * This service handles message serialization, publishing, and error handling.
 *
 * Features:
 * - JSON message serialization
 * - Automatic error handling and logging
 * - Message size tracking for monitoring
 * - Integration with IRedisService for connection management
 *
 * Usage:
 * ```typescript
 * const publisherService = container.resolve(PublisherService);
 * await publisherService.publish(PUBSUB_CHANNELS.PRODUCT, {
 *   eventId: generateEventId(),
 *   eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
 *   timestamp: new Date(),
 *   payload: { productId: '123', name: 'Test Product' }
 * });
 * ```
 *
 * @see IPublisherService
 * @see PUBSUB_CHANNELS
 * @see PUBSUB_EVENT_TYPES
 * @see PUBSUB_MESSAGES
 */

import { inject, injectable } from 'tsyringe';
import { DI_TOKENS, PUBSUB_MESSAGES } from '../../../shared/constants';
import { Logger } from '../../../shared/logger';
import { IPublisherService } from '../../interfaces/redis/IPublisherService';
import { IRedisService } from '../../interfaces/redis/IRedisService';

@injectable()
export class PublisherService implements IPublisherService {
  /**
   * Creates an instance of PublisherService
   * @param redisService - Service for Redis client access
   * @param logger - Logger for operation tracking
   */
  constructor(
    @inject(DI_TOKENS.REDIS_SERVICE) private redisService: IRedisService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger
  ) {}

  /**
   * Publishes a message to a Redis channel
   *
   * Process:
   * 1. Retrieves Redis client from IRedisService
   * 2. Serializes message to JSON string
   * 3. Publishes to specified channel
   * 4. Logs success with message size
   * 5. On error: logs failure and re-throws
   *
   * @param channel - The Redis channel name to publish to (e.g., PUBSUB_CHANNELS.PRODUCT)
   * @param message - The message payload to publish (typically an event object)
   * @returns Promise that resolves when message is successfully published
   * @throws Error if Redis connection fails or publishing encounters an error
   *
   * @example
   * ```typescript
   * await publisherService.publish(PUBSUB_CHANNELS.PRODUCT, {
   *   eventId: generateEventId(),
   *   eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
   *   timestamp: new Date(),
   *   payload: { productId: '123', name: 'Test Product' }
   * });
   * ```
   */
  async publish(channel: string, message: any): Promise<void> {
    try {
      // Get Redis client from the Redis service
      const client = this.redisService.getClient();

      // Serialize message to JSON string for transmission
      const messageString = JSON.stringify(message);

      // Publish message to the specified Redis channel
      await client.publish(channel, messageString);

      // Log successful publish with message size for monitoring
      this.logger.info(
        { messageSize: messageString.length },
        PUBSUB_MESSAGES.PUBLISH_SUCCESS(channel)
      );
    } catch (error) {
      // Log the error with context before re-throwing
      this.logger.error(error as Error, PUBSUB_MESSAGES.PUBLISH_FAILED(channel));
      throw error;
    }
  }
}
