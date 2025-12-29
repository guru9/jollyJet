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

import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { initializeDIContainer } from './config/di-container';
import { swaggerSpec } from './config/swagger';
import { errorHandler, requestLogger } from './interface/middlewares';
import { registerRoutes } from './interface/routes';

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
  app.use(cors());

  // Body parsing middleware - Parse JSON and URL-encoded request bodies
  app.use(express.json()); // Parse application/json
  app.use(express.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded

  // Request logging middleware - Log all incoming requests for monitoring
  app.use(requestLogger);

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
   *     summary: Health check endpoint
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
   *                   format: date-time
   */
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
