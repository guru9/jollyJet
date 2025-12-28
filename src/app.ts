/**
 * Express application configuration and setup for the JollyJet E-commerce API.
 * This file configures the main Express application with middleware, routes, and error handling.
 *
 * Features:
 * - CORS support for cross-origin requests
 * - JSON and URL-encoded body parsing
 * - Request logging middleware
 * - Swagger API documentation
 * - Health check endpoint
 * - Centralized error handling
 */

import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { initializeDIContainer } from './config/di-container';
import { swaggerSpec } from './config/swagger';
import { errorHandler, requestLogger } from './interface/middlewares';
import createProductRoutes from './interface/routes/productRoutes';

export const jollyJetApp = async () => {
  // Initialize DI container BEFORE importing app to ensure dependencies are registered
  // before any container resolutions occur during module loading
  initializeDIContainer();

  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  app.use('/api/products', createProductRoutes());

  // API Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Swagger JSON endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Health check route
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

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};
