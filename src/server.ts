/**
 * Server Entry Point - JollyJet E-commerce API
 *
 * This file serves as the main entry point for the JollyJet application server.
 * It handles server initialization, database connections, error handling, and
 * graceful shutdown procedures. The server is configured to run with proper
 * logging, signal handling, and connection management.
 *
 * Key Features:
 * - MongoDB connection with fallback for database-less operation
 * - Graceful shutdown handling for SIGTERM and SIGINT signals
 * - Global error handling for uncaught exceptions and unhandled rejections
 * - Pino-based logging for monitoring and debugging
 * - Dependency injection initialization via reflect-metadata
 */

import 'reflect-metadata'; // Required for tsyringe to work with decorators and reflection metadata

import { jollyJetApp } from '@/app';
import config from '@/config';
import mongoDBConnection from '@/infrastructure/database/mongodb';
import redisConnection from '@/infrastructure/database/redis';
import { CACHE_LOG_MESSAGES, logger, MONGODB_LOG_MESSAGES, SERVER_LOG_MESSAGES } from '@/shared';

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info({ signal: signal }, SERVER_LOG_MESSAGES.SHUTDOWN_RECEIVE(signal));
  try {
    await mongoDBConnection.disconnect();
    logger.info(MONGODB_LOG_MESSAGES.DISCONNECT_SUCCESS);
    await redisConnection.disconnect();
    logger.info(CACHE_LOG_MESSAGES.CONNECTION_CLOSED);
    process.exit(0);
  } catch (error) {
    logger.error(
      { err: error },
      SERVER_LOG_MESSAGES.SHUTDOWN_ERROR(error instanceof Error ? error.message : String(error))
    );
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error: Error) => {
  logger.error({ err: error }, SERVER_LOG_MESSAGES.UNCAUGHT_EXCEPTION);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ err: reason }, SERVER_LOG_MESSAGES.UNHANDLED_REJECTION);
  process.exit(1);
});

//Start server
const startServer = async () => {
  const app = await jollyJetApp();

  try {
    // Connect to MongoDB first
    await mongoDBConnection.connect();
    logger.info(MONGODB_LOG_MESSAGES.CONNECTION_SUCCESS);
  } catch (error) {
    // In development we allow the server to start even if Mongo is unavailable.
    // This helps with local iteration when developers use remote DBs or prefer
    // to run services separately. In production we keep the existing behaviour
    // of failing fast to avoid running in a degraded state.
    logger.error(
      { error: error },
      MONGODB_LOG_MESSAGES.CONNECTION_ERROR(error instanceof Error ? error.message : String(error))
    );

    if (config.env === 'development') {
      logger.warn('MongoDB connection failed, continuing startup in development mode.');
    } else {
      logger.error({ error: error }, MONGODB_LOG_MESSAGES.CONNECTION_FAILED);
      process.exit(1);
    }
  }

  try {
    // Connect to Redis - required for server startup
    await redisConnection.connect();
    // Note: Connection success is already logged by the Redis connection event handler
  } catch (error) {
    logger.error(
      { err: error },
      CACHE_LOG_MESSAGES.CONNECTION_ERROR(error instanceof Error ? error.message : String(error))
    );

    if (config.env === 'development') {
      logger.warn('Redis connection failed, continuing startup in development mode.');
    } else {
      process.exit(1);
    }
  }

  // Start the server only after both MongoDB and Redis are connected
  app.listen(config.port, () => {
    logger.info(SERVER_LOG_MESSAGES.STATUS_READY);
    logger.info(SERVER_LOG_MESSAGES.LISTENING(config.port));
    logger.info(SERVER_LOG_MESSAGES.API_DOCS(config.port));
    logger.info(SERVER_LOG_MESSAGES.HEALTH_CHECK(config.port));
    logger.info(SERVER_LOG_MESSAGES.CACHE_STRATEGY);
    logger.info(SERVER_LOG_MESSAGES.SECURITY_ENABLED);
    logger.info(SERVER_LOG_MESSAGES.SERVICES_READY);
    logger.info(SERVER_LOG_MESSAGES.READY_PRODUCTION);
  });
};

startServer().catch((error) => {
  logger.error({ err: error }, SERVER_LOG_MESSAGES.STARTUP_ERROR);
  process.exit(1);
});
