/**
 * Express Application Configuration - JollyJet E-commerce API
 *
 * This file configures the main Express application using Clean Architecture principles.
 * It orchestrates the composition of all architectural layers into a cohesive REST API.
 *
 * Architecture Overview:
 * - Interface Layer: HTTP adapters, middleware, and route handling
 * - Application Layer: Use cases orchestrating business operations
 * - Domain Layer: Business entities and core business logic
 * - Infrastructure Layer: External concerns (database, external APIs)
 *
 * Key Features:
 * - Dependency Injection: tsyringe container for loose coupling
 * - Centralized Route Registry: Modular route management
 * - Middleware Pipeline: Request processing, validation, and error handling
 * - API Documentation: Interactive Swagger UI documentation
 * - Health Monitoring: Application health checks
 * - Error Boundaries: Comprehensive error handling and logging
 */
import 'reflect-metadata'; // Required for tsyringe to work with decorators and reflection metadata

import { initializeDIContainer, swaggerSpec } from '@/config';

import { IRedisService } from '@/domain/interfaces/redis/IRedisService';
import {
  corsSecurityHandler,
  errorHandler,
  requestLogger,
  responseTimingHandler,
} from '@/interface/middlewares';
import { registerRoutes } from '@/interface/routes';
import { DI_TOKENS } from '@/shared/constants';
import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import { container } from 'tsyringe';

/**
 * Application Factory Function
 *
 * Creates and configures the Express application instance with all necessary
 * middleware, routes, and error handling. This factory function ensures proper
 * initialization order and dependency injection setup.
 *
 * @returns Promise<Express.Application> - Configured Express application ready for server startup
 */
export const jollyJetApp = async (): Promise<express.Application> => {
  // ============================================================================
  // DEPENDENCY INJECTION INITIALIZATION
  // ============================================================================
  // Initialize DI container BEFORE any module loading to ensure all dependencies
  // are registered before any container resolutions occur. This prevents runtime
  // errors during application startup and ensures proper service wiring.
  initializeDIContainer();

  // ============================================================================
  // EXPRESS APPLICATION SETUP
  // ============================================================================
  // Create the main Express application instance that will handle all HTTP requests
  const app = express();

  // ============================================================================
  // MIDDLEWARE PIPELINE
  // ============================================================================
  // Configure the request processing pipeline in the correct order

  // CORS middleware - Enable cross-origin resource sharing for web clients
  // Essential security middleware includes basic CORS functionality
  app.use(
    corsSecurityHandler({
      geographicBlocking: false, // Can be enabled via environment variable
      allowedCountries: [],
      blockedCountries: ['CN', 'RU', 'KP', 'IR'],
    })
  );

  // Body parsing middleware - Parse JSON and URL-encoded request bodies
  app.use(express.json()); // Parse application/json
  app.use(express.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded

  // Request logging middleware - Log all incoming requests for monitoring
  app.use(requestLogger);

  // Response timing middleware - Measure response time and add to headers
  app.use(responseTimingHandler);

  // ============================================================================
  // API DOCUMENTATION
  // ============================================================================
  // Mount Swagger UI for interactive API documentation
  // Provides a web interface for testing and exploring all API endpoints
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Raw OpenAPI JSON specification endpoint for external tools and integrations
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // ============================================================================
  // HEALTH MONITORING
  // ============================================================================
  // Application health check endpoint for load balancers and monitoring systems
  // Returns server status and timestamp for uptime verification

  /**
   * @openapi
   * /health:
   *   get:
   *     summary: Enhanced health check endpoint
   *     description: Returns the health status of the application including database and cache connectivity.
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Server is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: ok
   *                 timestamp:
   *                   type: string
   *                 uptime:
   *                   type: number
   *                 services:
   *                   type: object
   *                   properties:
   *                     database:
   *                       type: string
   *                       example: connected
   *                     cache:
   *                       type: string
   *                       example: connected
   */
  app.get('/health', async (req, res) => {
    // Check MongoDB status
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Check Redis status
    let redisStatus = 'disconnected';
    try {
      const redisService = container.resolve<IRedisService>(DI_TOKENS.REDIS_SERVICE);
      redisStatus = redisService.isConnected() ? 'connected' : 'disconnected';
    } catch {
      redisStatus = 'error';
    }

    const isHealthy = dbStatus === 'connected' && redisStatus === 'connected';

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbStatus,
        cache: redisStatus,
        server: 'online',
      },
    });
  });

  // ============================================================================
  // ROUTE REGISTRATION
  // ============================================================================
  // Register all application routes with the Express application
  // This must be done after DI container initialization
  await registerRoutes(app);

  // ============================================================================
  // ERROR HANDLING BOUNDARY
  // ============================================================================
  // Global error handler - MUST be registered last to catch all unhandled errors
  // Provides consistent error responses and logging across the entire application
  app.use(errorHandler);

  // ============================================================================
  // APPLICATION READY
  // ============================================================================
  // Return the fully configured Express application ready for server startup
  return app;
};
