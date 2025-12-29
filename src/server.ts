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

import 'reflect-metadata';
import { jollyJetApp } from './app';
import config from './config';
import mongoDBConnection from './infrastructure/database/mongodb';
import logger from './shared/logger';

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info({ signal: signal }, 'signal: received. Closing gracefully...');
  try {
    await mongoDBConnection.disconnect();
    logger.info('MongoDB disconnected');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Error during shutdown');
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error: Error) => {
  logger.error({ err: error }, 'Uncaught Exception:');
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ err: reason }, 'Unhandled Rejection:');
  process.exit(1);
});

//Start server
const startServer = async () => {
  const app = await jollyJetApp();

  try {
    // Try to connect to MongoDB first
    await mongoDBConnection.connect();
    logger.info('MongoDB connected successfully.');
  } catch (error) {
    logger.warn({ error: error }, 'MongoDB connection failed. Starting server without database.');
    // Continue without database connection
  }

  // Start the server regardless of MongoDB connection status
  app.listen(config.port, () => {
    logger.info(`🛫 jollyJet Server listening on port ${config.port}.`);
  });
};

startServer();
