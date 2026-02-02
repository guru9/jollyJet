/**
 * Database Bootstrap Module
 *
 * This module handles the initialization and cleanup of all database connections.
 * It manages MongoDB and Redis connections with proper error handling and logging.
 *
 * Responsibilities:
 * - Initialize MongoDB connection
 * - Initialize Redis connection
 * - Handle connection errors gracefully
 * - Provide graceful shutdown for all databases
 *
 * @example
 * ```typescript
 * const dbBootstrap = new DatabaseBootstrap(config, logger);
 * await dbBootstrap.initialize();
 * // ... later during shutdown
 * await dbBootstrap.shutdown();
 * ```
 */

import config from '@/config';
import mongoDBConnection from '@/infrastructure/database/mongodb';
import redisConnection from '@/infrastructure/database/redis';
import { CACHE_LOG_MESSAGES, logger, MONGODB_LOG_MESSAGES } from '@/shared';
import { Logger } from '@/shared/logger';

export class DatabaseBootstrap {
  private mongoConnected = false;
  private redisConnected = false;

  constructor(private logger: Logger) {}

  /**
   * Initialize all database connections
   * Connects to MongoDB and Redis with proper error handling
   */
  async initialize(): Promise<void> {
    await this.initializeMongoDB();
    await this.initializeRedis();
  }

  /**
   * Initialize MongoDB connection
   */
  private async initializeMongoDB(): Promise<void> {
    try {
      await mongoDBConnection.connect();
      this.logger.info(MONGODB_LOG_MESSAGES.CONNECTION_SUCCESS);
      this.mongoConnected = true;
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
    try {
      await redisConnection.connect();
      // Note: Connection success is already logged by the Redis connection event handler
      this.redisConnected = true;
    } catch (error) {
      this.logger.error(
        { error },
        `Redis connection error: ${error instanceof Error ? error.message : String(error)}`
      );

      if (config.env === 'development') {
        this.logger.warn('Redis connection failed, continuing startup in development mode.');
      } else {
        throw error;
      }
    }
  }

  /**
   * Shutdown all database connections gracefully
   */
  async shutdown(): Promise<void> {
    // Disconnect MongoDB
    if (this.mongoConnected) {
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
    }

    // Disconnect Redis
    if (this.redisConnected) {
      try {
        await redisConnection.disconnect();
        this.logger.info(CACHE_LOG_MESSAGES.CONNECTION_CLOSED);
      } catch (error) {
        this.logger.error(
          { error },
          `Error closing Redis connection: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  /**
   * Check if MongoDB is connected
   */
  isMongoDBConnected(): boolean {
    return this.mongoConnected;
  }

  /**
   * Check if Redis is connected
   */
  getRedisConnected(): boolean {
    return this.redisConnected;
  }

  /**
   * Check if all databases are connected
   */
  isFullyConnected(): boolean {
    return this.mongoConnected && this.redisConnected;
  }
}

// Export singleton instance for use in server.ts
export const databaseBootstrap = new DatabaseBootstrap(logger);
