/**
 * Subscriber Service Implementation
 *
 * Implements ISubscriberService for receiving and processing events from Redis Pub/Sub channels.
 * This service manages subscriptions, message handling, and error recovery for the event-driven
 * architecture of the JollyJet e-commerce platform.
 *
 * Key Features:
 * - Separate Redis client for subscriptions (Redis requirement)
 * - Handler management per channel using Map data structure
 * - Automatic message parsing (JSON) with error handling
 * - Connection error handling and auto-reconnection support
 * - Graceful shutdown with cleanup
 *
 * Architecture Notes:
 * Redis Pub/Sub requires a dedicated client for subscriptions. Once a client enters
 * subscriber mode, it can only execute subscription-related commands. This is why
 * we create a separate client from the main RedisService.
 *
 * Usage:
 * ```typescript
 * // Initialize the subscriber service
 * await subscriberService.initialize();
 *
 * // Subscribe to a channel with a handler
 * subscriberService.subscribe(PUBSUB_CHANNELS.PRODUCT, async (event: AppEvent) => {
 *   if (event.eventType === PUBSUB_EVENT_TYPES.PRODUCT_CREATED) {
 *     // Handle product creation
 *   }
 * });
 *
 * // Unsubscribe when no longer needed
 * subscriberService.unsubscribe(PUBSUB_CHANNELS.PRODUCT);
 *
 * // Graceful shutdown
 * await subscriberService.disconnect();
 * ```
 *
 * Error Handling:
 * - Connection errors: Logged and trigger reconnection attempts
 * - Parse errors: Logged, message skipped, processing continues
 * - Handler errors: Logged, other handlers continue processing
 *
 * @see ISubscriberService
 * @see PUBSUB_CHANNELS
 * @see PUBSUB_MESSAGES
 * @see AppEvent
 */

import Redis from 'ioredis';
import { inject, injectable } from 'tsyringe';
import config from '../../../config';
import { DI_TOKENS, PUBSUB_MESSAGES } from '../../../shared/constants';
import { Logger } from '../../../shared/logger';
import { IRedisService } from '../../interfaces/redis/IRedisService';
import { ISubscriberService, MessageHandler } from '../../interfaces/redis/ISubscriberService';

@injectable()
export class SubscriberService implements ISubscriberService {
  /**
   * Dedicated Redis client for subscriptions.
   * Must be separate from the main Redis client because once a client
   * enters subscriber mode, it can only execute subscription commands.
   */
  private subscriberClient: Redis | null = null;

  /**
   * Map of channel names to their message handlers.
   * Each channel can have one handler function.
   */
  private handlers: Map<string, MessageHandler> = new Map();

  /**
   * Connection state tracking for graceful shutdown and error handling.
   */
  private isConnected: boolean = false;

  /**
   * Reconnection attempt counter for exponential backoff.
   */
  private reconnectAttempts: number = 0;

  /**
   * Maximum number of reconnection attempts before giving up.
   */
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  /**
   * Creates an instance of SubscriberService.
   *
   * @param redisService - The main Redis service (used for configuration, not client)
   * @param logger - Logger for operation tracking and debugging
   */
  constructor(
    @inject(DI_TOKENS.REDIS_SERVICE) private redisService: IRedisService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger
  ) {}

  /**
   * Initialize the subscriber service and create a dedicated Redis client.
   *
   * This method must be called before subscribing to any channels.
   * It creates a new Redis client with the same configuration as the main
   * Redis service but maintains a separate connection for pub/sub operations.
   *
   * @returns Promise that resolves when the subscriber client is ready
   * @throws Error if Redis is disabled or connection fails
   *
   * @example
   * ```typescript
   * try {
   *   await subscriberService.initialize();
   *   logger.info('Subscriber service ready');
   * } catch (error) {
   *   logger.error('Failed to initialize subscriber service', error);
   * }
   * ```
   */
  async initialize(): Promise<void> {
    // Check if Redis is disabled in configuration
    if (config.redisConfig.disabled) {
      this.logger.warn('Redis is disabled. Subscriber service will not be initialized.');
      return;
    }

    // Prevent double initialization
    if (this.isConnected) {
      this.logger.warn('Subscriber service already initialized');
      return;
    }

    try {
      // Create a new Redis client with the same configuration
      const protocol = config.redisConfig.tls ? 'rediss' : 'redis';
      const auth = config.redisConfig.password ? `:${config.redisConfig.password}@` : '';
      const uri = `${protocol}://${auth}${config.redisConfig.host}:${config.redisConfig.port}/${config.redisConfig.db}`;

      this.subscriberClient = new Redis(uri, {
        lazyConnect: true,
        retryStrategy: (times: number) => {
          if (times >= this.MAX_RECONNECT_ATTEMPTS) {
            this.logger.warn(
              `Redis subscriber reconnection attempts exhausted after ${times} retries`
            );
            return undefined; // Stop retrying
          }
          return Math.min(times * 100, 3000);
        },
      });

      // Setup event handlers for the subscriber client
      this.setupEventHandlers();

      // Connect to Redis
      await this.subscriberClient.connect();
      this.isConnected = true;
      this.reconnectAttempts = 0;

      this.logger.info(PUBSUB_MESSAGES.SUBSCRIBER_CLIENT_CONNECTED);
    } catch (error) {
      this.logger.error(error as Error, PUBSUB_MESSAGES.INITIALIZE_FAILED);
      throw error;
    }
  }

  /**
   * Subscribe to a Redis channel with a message handler.
   *
   * When a message is received on the channel, the handler will be called
   * with the parsed event object. Only one handler per channel is supported;
   * subscribing to the same channel again will replace the previous handler.
   *
   * @param channel - The Redis channel name to subscribe to (e.g., PUBSUB_CHANNELS.PRODUCT)
   * @param handler - The function to call when a message is received on this channel
   *
   * @example
   * ```typescript
   * subscriberService.subscribe(PUBSUB_CHANNELS.PRODUCT, async (event: AppEvent) => {
   *   this.logger.info({ eventType: event.eventType }, 'Received product event');
   *
   *   switch (event.eventType) {
   *     case PUBSUB_EVENT_TYPES.PRODUCT_CREATED:
   *       await handleProductCreated(event as ProductCreatedEvent);
   *       break;
   *     case PUBSUB_EVENT_TYPES.PRODUCT_UPDATED:
   *       await handleProductUpdated(event as ProductUpdatedEvent);
   *       break;
   *   }
   * });
   * ```
   */
  subscribe(channel: string, handler: MessageHandler): void {
    // Validate state
    if (!this.isConnected || !this.subscriberClient) {
      this.logger.error(PUBSUB_MESSAGES.SUBSCRIBE_FAILED(channel));
      throw new Error('Subscriber service not initialized. Call initialize() first.');
    }

    // Store the handler
    this.handlers.set(channel, handler);

    // Subscribe to the Redis channel
    this.subscriberClient.subscribe(channel, (err) => {
      if (err) {
        this.logger.error(err, PUBSUB_MESSAGES.SUBSCRIBE_FAILED(channel));
        this.handlers.delete(channel); // Rollback handler registration
      } else {
        this.logger.info(PUBSUB_MESSAGES.SUBSCRIBE_SUCCESS(channel));
      }
    });

    // Setup message handler for this channel
    this.subscriberClient.on('message', (receivedChannel: string, message: string) => {
      if (receivedChannel === channel) {
        this.handleMessage(channel, message);
      }
    });
  }

  /**
   * Unsubscribe from a Redis channel.
   *
   * Removes the handler and stops receiving messages from the channel.
   * If the channel was not previously subscribed, this method does nothing.
   *
   * @param channel - The Redis channel name to unsubscribe from
   *
   * @example
   * ```typescript
   * // When shutting down or no longer interested in product events
   * subscriberService.unsubscribe(PUBSUB_CHANNELS.PRODUCT);
   * ```
   */
  unsubscribe(channel: string): void {
    // Validate state
    if (!this.isConnected || !this.subscriberClient) {
      this.logger.warn(PUBSUB_MESSAGES.UNSUBSCRIBE_NOT_INITIALIZED(channel));
      return;
    }

    // Remove handler from map
    this.handlers.delete(channel);

    // Unsubscribe from Redis channel
    this.subscriberClient.unsubscribe(channel, (err) => {
      if (err) {
        this.logger.error(err, PUBSUB_MESSAGES.UNSUBSCRIBE_FAILED(channel));
      } else {
        this.logger.info(PUBSUB_MESSAGES.UNSUBSCRIBE_SUCCESS(channel));
      }
    });
  }

  /**
   * Handle an incoming message from a Redis channel.
   *
   * This method parses the message JSON and routes it to the appropriate
   * handler. Errors during parsing or handling are caught and logged
   * without stopping processing of other messages.
   *
   * @param channel - The channel the message was received on
   * @param message - The raw message string (JSON)
   *
   * @private
   */
  private handleMessage(channel: string, message: string): void {
    this.logger.info(PUBSUB_MESSAGES.MESSAGE_RECEIVED(channel));

    try {
      // Parse the JSON message
      const event = JSON.parse(message);

      // Get the handler for this channel
      const handler = this.handlers.get(channel);

      if (handler) {
        // Execute the handler
        // Wrap in Promise.resolve to handle both sync and async handlers
        Promise.resolve(handler(event)).catch((error) => {
          this.logger.error(error as Error, PUBSUB_MESSAGES.HANDLER_ERROR(channel));
        });
      } else {
        this.logger.warn(PUBSUB_MESSAGES.NO_HANDLER_FOUND(channel));
      }
    } catch (error) {
      // Log parse error but don't throw - we want to continue processing other messages
      this.logger.error(error as Error, PUBSUB_MESSAGES.MESSAGE_PARSE_FAILED(channel));
    }
  }

  /**
   * Setup event handlers for the subscriber Redis client.
   *
   * Handles connection events, errors, and automatic reconnection.
   *
   * @private
   */
  private setupEventHandlers(): void {
    if (!this.subscriberClient) return;

    // Handle connection errors
    this.subscriberClient.on('error', (err: Error) => {
      this.logger.error(err, PUBSUB_MESSAGES.SUBSCRIBER_CLIENT_ERROR);
      this.isConnected = false;
    });

    // Handle disconnection
    this.subscriberClient.on('end', () => {
      this.logger.warn(PUBSUB_MESSAGES.SUBSCRIBER_CLIENT_DISCONNECTED);
      this.isConnected = false;

      // Attempt reconnection if not at max attempts
      if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
        this.reconnectAttempts++;
        this.logger.info(
          PUBSUB_MESSAGES.RECONNECTING(this.reconnectAttempts, this.MAX_RECONNECT_ATTEMPTS)
        );
        setTimeout(() => this.initialize(), Math.pow(2, this.reconnectAttempts) * 1000);
      }
    });

    // Handle successful connection
    this.subscriberClient.on('connect', () => {
      this.logger.info(PUBSUB_MESSAGES.SUBSCRIBER_CLIENT_CONNECTION_ESTABLISHED);
    });

    // Handle ready state (connection + server reports ready)
    this.subscriberClient.on('ready', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.logger.info(PUBSUB_MESSAGES.SUBSCRIBER_CLIENT_READY);

      // Resubscribe to all channels after reconnection
      this.resubscribeAll();
    });
  }

  /**
   * Resubscribe to all channels after reconnection.
   *
   * When the Redis connection is restored, this method re-establishes
   * all previous subscriptions.
   *
   * @private
   */
  private resubscribeAll(): void {
    if (!this.subscriberClient) return;

    for (const [channel] of this.handlers) {
      this.subscriberClient.subscribe(channel, (err) => {
        if (err) {
          this.logger.error(err, PUBSUB_MESSAGES.RESUBSCRIBE_FAILED(channel));
        } else {
          this.logger.info(PUBSUB_MESSAGES.RESUBSCRIBE_SUCCESS(channel));
        }
      });
    }
  }

  /**
   * Disconnect the subscriber service and clean up resources.
   *
   * This method should be called during application shutdown to ensure
   * graceful cleanup of Redis connections and handlers.
   *
   * @returns Promise that resolves when disconnection is complete
   *
   * @example
   * ```typescript
   * // During application shutdown
   * process.on('SIGTERM', async () => {
   *   await subscriberService.disconnect();
   *   process.exit(0);
   * });
   * ```
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected || !this.subscriberClient) {
      return;
    }

    try {
      // Clear all handlers
      this.handlers.clear();

      // Disconnect from Redis
      await this.subscriberClient.quit();
      this.isConnected = false;

      this.logger.info(PUBSUB_MESSAGES.DISCONNECT_SUCCESS);
    } catch (error) {
      this.logger.error(error as Error, PUBSUB_MESSAGES.DISCONNECT_ERROR);
      throw error;
    }
  }

  /**
   * Get the current connection status.
   *
   * @returns True if the subscriber client is connected and ready
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get the list of subscribed channels.
   *
   * @returns Array of channel names currently subscribed
   */
  getSubscribedChannels(): string[] {
    return Array.from(this.handlers.keys());
  }
}
