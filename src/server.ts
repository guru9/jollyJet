/**
 * Server Entry Point - JollyJet E-commerce API
 *
 * This file serves as the main entry point for the JollyJet application server.
 * It delegates all initialization and lifecycle management to the ServerBootstrap
 * class, keeping this file clean and focused on its single responsibility:
 * starting the server.
 *
 * Key Features:
 * - MongoDB connection with fallback for database-less operation
 * - Graceful shutdown handling for SIGTERM and SIGINT signals
 * - Global error handling for uncaught exceptions and unhandled rejections
 * - Pino-based logging for monitoring and debugging
 * - Dependency injection initialization via reflect-metadata
 * - Redis Pub/Sub event-driven architecture
 */

import 'reflect-metadata'; // Required for tsyringe to work with decorators and reflection metadata

import { serverBootstrap } from '@/infrastructure/bootstrap/ServerBootstrap';
import { SERVER_LOG_MESSAGES } from '@/shared';
import { logger } from '@/shared/logger';

/**
 * Main entry point
 * Starts the server with all required services
 */
const main = async (): Promise<void> => {
  try {
    await serverBootstrap.start();
  } catch (error) {
    logger.error({ error }, SERVER_LOG_MESSAGES.STARTUP_ERROR);
    process.exit(1);
  }
};

// Start the application
main();
