/**
 * Pub/Sub Bootstrap Module
 *
 * This module handles the initialization and cleanup of the Pub/Sub messaging system.
 * It encapsulates all Pub/Sub-related logic, keeping the server.ts file clean and focused.
 *
 * Responsibilities:
 * - Initialize subscriber service
 * - Register event handlers
 * - Route events to appropriate handlers
 * - Graceful shutdown and cleanup
 *
 * @example
 * ```typescript
 * const pubSubBootstrap = new PubSubBootstrap(container, logger);
 * await pubSubBootstrap.initialize();
 * // ... later during shutdown
 * await pubSubBootstrap.shutdown();
 * ```
 */

import {
  AppEvent,
  ProductCreatedEvent,
  ProductDeletedEvent,
  ProductUpdatedEvent,
  UserActivityEvent,
} from '@/domain/events';
import { ISubscriberService } from '@/domain/interfaces/redis/ISubscriberService';
import { AuditEventHandler } from '@/domain/services/events/AuditEventHandler';
import {
  ProductCreatedHandler,
  ProductDeletedHandler,
  ProductUpdatedHandler,
} from '@/domain/services/events/ProductEventHandlers';
import { DI_TOKENS, PUBSUB_CHANNELS, PUBSUB_EVENT_TYPES, PUBSUB_MESSAGES } from '@/shared';
import { Logger } from '@/shared/logger';
import { DependencyContainer } from 'tsyringe';

export class PubSubBootstrap {
  private subscriberService: ISubscriberService | null = null;
  private isInitialized = false;

  constructor(
    private container: DependencyContainer,
    private logger: Logger
  ) {}

  /**
   * Initialize the Pub/Sub system
   * Sets up subscriber service and registers all event handlers
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn(PUBSUB_MESSAGES.PUBSUB_ALREADY_INITIALIZED);
      return;
    }

    try {
      // Resolve subscriber service from DI container
      this.subscriberService = this.container.resolve<ISubscriberService>(
        DI_TOKENS.SUBSCRIBER_SERVICE
      );

      // Initialize subscriber (creates Redis client)
      await this.subscriberService.initialize();
      this.logger.info(PUBSUB_MESSAGES.SUBSCRIBER_INITIALIZED);

      // Register event handlers
      await this.registerEventHandlers();

      this.isInitialized = true;
      this.logger.info(PUBSUB_MESSAGES.PUBSUB_INITIALIZED);
    } catch (error) {
      this.logger.error({ error }, PUBSUB_MESSAGES.PUBSUB_INITIALIZE_FAILED);
      // Don't throw - Pub/Sub is not critical for basic operation
      // The server can continue without event handling
    }
  }

  /**
   * Register all event handlers with their respective channels
   */
  private async registerEventHandlers(): Promise<void> {
    if (!this.subscriberService) {
      throw new Error(PUBSUB_MESSAGES.SUBSCRIBER_NOT_INITIALIZED);
    }

    // Resolve event handlers from DI container
    const productCreatedHandler = this.container.resolve<ProductCreatedHandler>(
      DI_TOKENS.PRODUCT_CREATED_HANDLER
    );
    const productUpdatedHandler = this.container.resolve<ProductUpdatedHandler>(
      DI_TOKENS.PRODUCT_UPDATED_HANDLER
    );
    const productDeletedHandler = this.container.resolve<ProductDeletedHandler>(
      DI_TOKENS.PRODUCT_DELETED_HANDLER
    );
    const auditEventHandler = this.container.resolve<AuditEventHandler>(
      DI_TOKENS.AUDIT_EVENT_HANDLER
    );

    // Subscribe to product events channel with routing
    this.subscriberService.subscribe(PUBSUB_CHANNELS.PRODUCT, (event: AppEvent) => {
      this.handleProductEvent(
        event,
        productCreatedHandler,
        productUpdatedHandler,
        productDeletedHandler
      );
    });
    this.logger.info(PUBSUB_MESSAGES.SUBSCRIBE_SUCCESS(PUBSUB_CHANNELS.PRODUCT));

    // Subscribe to audit events channel
    this.subscriberService.subscribe(PUBSUB_CHANNELS.AUDIT, (event: AppEvent) => {
      this.handleAuditEvent(event, auditEventHandler);
    });
    this.logger.info(PUBSUB_MESSAGES.SUBSCRIBE_SUCCESS(PUBSUB_CHANNELS.AUDIT));
  }

  /**
   * Handle product-related events by routing to appropriate handler
   */
  private handleProductEvent(
    event: AppEvent,
    createdHandler: ProductCreatedHandler,
    updatedHandler: ProductUpdatedHandler,
    deletedHandler: ProductDeletedHandler
  ): void {
    switch (event.eventType) {
      case PUBSUB_EVENT_TYPES.PRODUCT_CREATED:
        createdHandler
          .handle(event as ProductCreatedEvent)
          .catch((error) =>
            this.logger.error({ error }, PUBSUB_MESSAGES.EVENT_HANDLING_ERROR('PRODUCT_CREATED'))
          );
        break;
      case PUBSUB_EVENT_TYPES.PRODUCT_UPDATED:
        updatedHandler
          .handle(event as ProductUpdatedEvent)
          .catch((error) =>
            this.logger.error({ error }, PUBSUB_MESSAGES.EVENT_HANDLING_ERROR('PRODUCT_UPDATED'))
          );
        break;
      case PUBSUB_EVENT_TYPES.PRODUCT_DELETED:
        deletedHandler
          .handle(event as ProductDeletedEvent)
          .catch((error) =>
            this.logger.error({ error }, PUBSUB_MESSAGES.EVENT_HANDLING_ERROR('PRODUCT_DELETED'))
          );
        break;
      default:
        this.logger.warn({ eventType: event.eventType }, PUBSUB_MESSAGES.UNKNOWN_EVENT_TYPE);
    }
  }

  /**
   * Handle audit-related events
   */
  private handleAuditEvent(event: AppEvent, handler: AuditEventHandler): void {
    handler
      .handle(event as UserActivityEvent)
      .catch((error) =>
        this.logger.error({ error }, PUBSUB_MESSAGES.EVENT_HANDLING_ERROR('USER_ACTIVITY'))
      );
  }

  /**
   * Shutdown the Pub/Sub system gracefully
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized || !this.subscriberService) {
      return;
    }

    try {
      await this.subscriberService.disconnect();
      this.logger.info(PUBSUB_MESSAGES.SUBSCRIBER_DISCONNECTED);
      this.isInitialized = false;
    } catch (error) {
      this.logger.error({ error }, PUBSUB_MESSAGES.PUBSUB_SHUTDOWN_ERROR);
    }
  }

  /**
   * Check if Pub/Sub system is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}
