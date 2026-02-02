/**
 * Server Bootstrap Module
 *
 * This module centralizes all server initialization and shutdown logic.
 * It provides a clean, modular approach to managing server lifecycle,
 * database connections, Pub/Sub system, and graceful shutdown.
 *
 * Responsibilities:
 * - Database connections (MongoDB, Redis)
 * - Pub/Sub system initialization
 * - Graceful shutdown handling
 * - Process signal management
 *
 * @example
 * ```typescript
 * const bootstrap = new ServerBootstrap();
 * await bootstrap.start();
 * // ... server running
 * await bootstrap.stop();
 * ```
 */

import { jollyJetApp } from '@/app';
import config from '@/config';
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
import mongoDBConnection from '@/infrastructure/database/mongodb';
import redisConnection from '@/infrastructure/database/redis';
import {
  CACHE_LOG_MESSAGES,
  DI_TOKENS,
  logger,
  MONGODB_LOG_MESSAGES,
  PUBSUB_CHANNELS,
  PUBSUB_EVENT_TYPES,
  SERVER_LOG_MESSAGES,
} from '@/shared';
import { Logger } from '@/shared/logger';
import { Application } from 'express';
import { container } from 'tsyringe';

export class ServerBootstrap {
  private app: Application | null = null;
  private subscriberService: ISubscriberService | null = null;
  private isShuttingDown = false;

  constructor(private logger: Logger) {
    this.setupProcessHandlers();
  }

  /**
   * Start the server and all required services
   */
  async start(): Promise<void> {
    this.logger.info(SERVER_LOG_MESSAGES.STARTUP);
    this.logger.info(SERVER_LOG_MESSAGES.SERVICES_REQUIRED);

    this.app = await jollyJetApp();

    // Initialize databases
    await this.initializeDatabases();

    // Start HTTP server
    this.app.listen(config.port, async () => {
      this.logServerReady();

      // Initialize Pub/Sub after server is ready
      await this.initializePubSub();
    });
  }

  /**
   * Stop the server and cleanup all resources
   */
  async stop(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    this.logger.info({ signal }, SERVER_LOG_MESSAGES.SHUTDOWN_RECEIVE(signal));

    try {
      // Cleanup in reverse order of initialization
      await this.shutdownPubSub();
      await this.shutdownDatabases();

      this.logger.info('Server stopped gracefully');
      process.exit(0);
    } catch (error) {
      this.logger.error(
        { error },
        SERVER_LOG_MESSAGES.SHUTDOWN_ERROR(error instanceof Error ? error.message : String(error))
      );
      process.exit(1);
    }
  }

  /**
   * Initialize all database connections
   */
  private async initializeDatabases(): Promise<void> {
    await this.initializeMongoDB();
    await this.initializeRedis();
  }

  /**
   * Initialize MongoDB connection
   */
  private async initializeMongoDB(): Promise<void> {
    this.logger.info(SERVER_LOG_MESSAGES.ESTABLISHING_MONGODB);

    try {
      await mongoDBConnection.connect();
      this.logger.info(MONGODB_LOG_MESSAGES.CONNECTION_SUCCESS);
    } catch (error) {
      this.logger.error(
        { error },
        MONGODB_LOG_MESSAGES.CONNECTION_ERROR(
          error instanceof Error ? error.message : String(error)
        )
      );

      if (config.env === 'development') {
        this.logger.warn('MongoDB connection failed, continuing startup in development mode.');
      } else {
        this.logger.error({ error }, MONGODB_LOG_MESSAGES.CONNECTION_FAILED);
        throw error;
      }
    }
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis(): Promise<void> {
    this.logger.info(SERVER_LOG_MESSAGES.ESTABLISHING_REDIS);

    try {
      await redisConnection.connect();
      // Connection success is logged by Redis connection event handler
    } catch (error) {
      this.logger.error(
        { error },
        CACHE_LOG_MESSAGES.CONNECTION_ERROR(error instanceof Error ? error.message : String(error))
      );

      if (config.env === 'development') {
        this.logger.warn('Redis connection failed, continuing startup in development mode.');
      } else {
        throw error;
      }
    }
  }

  /**
   * Initialize Pub/Sub system
   */
  private async initializePubSub(): Promise<void> {
    try {
      this.subscriberService = container.resolve<ISubscriberService>(DI_TOKENS.SUBSCRIBER_SERVICE);
      await this.subscriberService.initialize();
      this.logger.info('Subscriber service initialized successfully');

      // Register event handlers
      this.registerEventHandlers();

      this.logger.info('Pub/Sub system initialized successfully');
    } catch (error) {
      this.logger.error({ error }, 'Failed to initialize Pub/Sub system');
      // Don't throw - Pub/Sub is not critical for basic operation
    }
  }

  /**
   * Register all event handlers
   */
  private registerEventHandlers(): void {
    if (!this.subscriberService) return;

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
    this.subscriberService.subscribe(PUBSUB_CHANNELS.PRODUCT, (event: AppEvent) => {
      this.handleProductEvent(
        event,
        productCreatedHandler,
        productUpdatedHandler,
        productDeletedHandler
      );
    });
    this.logger.info(`Subscribed to channel: ${PUBSUB_CHANNELS.PRODUCT}`);

    // Subscribe to audit events
    this.subscriberService.subscribe(PUBSUB_CHANNELS.AUDIT, (event: AppEvent) => {
      auditEventHandler
        .handle(event as UserActivityEvent)
        .catch((error) => this.logger.error({ error }, 'Error handling USER_ACTIVITY event'));
    });
    this.logger.info(`Subscribed to channel: ${PUBSUB_CHANNELS.AUDIT}`);
  }

  /**
   * Handle product events by routing to appropriate handler
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
          .catch((error) => this.logger.error({ error }, 'Error handling PRODUCT_CREATED event'));
        break;
      case PUBSUB_EVENT_TYPES.PRODUCT_UPDATED:
        updatedHandler
          .handle(event as ProductUpdatedEvent)
          .catch((error) => this.logger.error({ error }, 'Error handling PRODUCT_UPDATED event'));
        break;
      case PUBSUB_EVENT_TYPES.PRODUCT_DELETED:
        deletedHandler
          .handle(event as ProductDeletedEvent)
          .catch((error) => this.logger.error({ error }, 'Error handling PRODUCT_DELETED event'));
        break;
      default:
        this.logger.warn({ eventType: event.eventType }, 'Unknown product event type received');
    }
  }

  /**
   * Shutdown Pub/Sub system
   */
  private async shutdownPubSub(): Promise<void> {
    if (this.subscriberService) {
      try {
        await this.subscriberService.disconnect();
        this.logger.info('Subscriber service disconnected');
      } catch (error) {
        this.logger.error({ error }, 'Error disconnecting subscriber service');
      }
    }
  }

  /**
   * Shutdown all database connections
   */
  private async shutdownDatabases(): Promise<void> {
    // Disconnect MongoDB
    try {
      await mongoDBConnection.disconnect();
      this.logger.info(MONGODB_LOG_MESSAGES.DISCONNECT_SUCCESS);
    } catch (error) {
      this.logger.error(
        { error },
        MONGODB_LOG_MESSAGES.DISCONNECT_ERROR(
          error instanceof Error ? error.message : String(error)
        )
      );
    }

    // Disconnect Redis
    try {
      await redisConnection.disconnect();
      this.logger.info(CACHE_LOG_MESSAGES.CONNECTION_CLOSED);
    } catch (error) {
      this.logger.error({ error }, 'Error disconnecting Redis');
    }
  }

  /**
   * Log server ready messages
   */
  private logServerReady(): void {
    this.logger.info(SERVER_LOG_MESSAGES.STATUS_READY);
    this.logger.info(SERVER_LOG_MESSAGES.LISTENING(config.port));
    this.logger.info(SERVER_LOG_MESSAGES.API_DOCS(config.port));
    this.logger.info(SERVER_LOG_MESSAGES.HEALTH_CHECK(config.port));
    this.logger.info(SERVER_LOG_MESSAGES.CACHE_STRATEGY);
    this.logger.info(SERVER_LOG_MESSAGES.SECURITY_ENABLED);
    this.logger.info(SERVER_LOG_MESSAGES.SERVICES_READY);
    this.logger.info(SERVER_LOG_MESSAGES.READY_PRODUCTION);
  }

  /**
   * Setup process signal handlers
   */
  private setupProcessHandlers(): void {
    process.on('SIGTERM', () => this.stop('SIGTERM'));
    process.on('SIGINT', () => this.stop('SIGINT'));

    process.on('uncaughtException', (error: Error) => {
      this.logger.error({ error }, SERVER_LOG_MESSAGES.UNCAUGHT_EXCEPTION);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: unknown) => {
      this.logger.error({ error: reason }, SERVER_LOG_MESSAGES.UNHANDLED_REJECTION);
      process.exit(1);
    });
  }
}

// Export singleton instance
export const serverBootstrap = new ServerBootstrap(logger);
