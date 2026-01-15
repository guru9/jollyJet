/**
 * Centralized Route Registry
 *
 * This module provides a centralized registry for all application routes,
 * enabling better organization, scalability, and maintainability as the
 * application grows with additional modules (products, orders, users, etc.).
 *
 * Benefits:
 * - Single source of truth for route registration
 * - Easy to add new modules without modifying app.ts
 * - Consistent route mounting pattern
 * - Better testability and modularity
 */

import { logger } from '@/shared';
import { Application, RequestHandler, Router } from 'express';

/**
 * Route Module Interface
 *
 * Defines the structure for route modules in the application.
 * Each module encapsulates its own routing logic and can include
 * optional middleware for cross-cutting concerns.
 */
export interface RouteModule {
  /** Base path for the route module (e.g., '/api/products') */
  path: string;
  /** Factory function that creates the configured Express router */
  routerFactory: () => Router | Promise<Router>;
  /** Optional middleware to apply to this route module */
  middleware?: RequestHandler[];
  /** Module name for logging and debugging */
  name: string;
}

/**
 * Application Route Module Factories
 *
 * Registry of all route module factories in the application.
 * Routes are created lazily when registerRoutes is called to ensure
 * DI container is initialized.
 *
 * Add new modules here as the application grows.
 */
export const routeModuleFactories: RouteModule[] = [
  {
    name: 'Health Check Routes',
    path: '/api/health',
    routerFactory: async () => {
      const { default: createHealthRoutes } = await import('./health/healthRoutes');
      return createHealthRoutes();
    },

    middleware: [], // Health endpoints should be publicly accessible
  },
  {
    name: 'Product Routes',
    path: '/api/products',
    routerFactory: async () => {
      const { default: createProductRoutes } = await import('./product/productRoutes');
      return createProductRoutes();
    },

    middleware: [], // Add module-specific middleware here (auth, rate limiting, etc.)
  },
  {
    name: 'Redis Cache Routes',
    path: '/api/cache',
    routerFactory: async () => {
      const { default: createRedisRoutes } = await import('./redis/redisRoutes');
      return createRedisRoutes();
    },

    middleware: [], // Add module-specific middleware here (auth, rate limiting, etc.)
  },
  // Future modules will be added here:
  // {
  //   name: 'Order Routes',
  //   path: '/api/orders',
  //   routerFactory: async () => {
  //     const { default: createOrderRoutes } = await import('./orderRoutes');
  //     return createOrderRoutes();
  //   },
  //   middleware: [authMiddleware],
  // },
  // {
  //   name: 'User Routes',
  //   path: '/api/users',
  //   routerFactory: async () => {
  //     const { default: createUserRoutes } = await import('./userRoutes');
  //     return createUserRoutes();
  //   },
  //   middleware: [authMiddleware, adminMiddleware],
  // },
];

/**
 * Registers all route modules with the Express application
 *
 * This function iterates through all route modules and mounts them
 * to the provided Express application instance. It applies any
 * module-specific middleware before mounting the router.
 *
 * @param app - Express application instance
 * @returns Promise<void>
 */
export const registerRoutes = async (app: Application): Promise<void> => {
  for (const module of routeModuleFactories) {
    // Create router using factory function (may be async)
    const router = await module.routerFactory();

    // Apply module-specific middleware if any
    if (module.middleware && module.middleware.length > 0) {
      app.use(module.path, ...module.middleware, router);
    } else {
      app.use(module.path, router);
    }

    // Log route registration for debugging
    logger.info({ moduleName: module.name, modulePath: module.path }, '📍 Registered route module');
  }
};

/**
 * Gets all registered route paths
 *
 * Useful for documentation, testing, and debugging purposes.
 *
 * @returns Array of route paths
 */
export const getRegisteredRoutes = (): string[] => {
  return routeModuleFactories.map((module) => module.path);
};

/**
 * Gets route module by name
 *
 * Useful for testing specific modules or conditional registration.
 *
 * @param name - Module name to find
 * @returns RouteModule or undefined if not found
 */
export const getRouteModule = (name: string): RouteModule | undefined => {
  return routeModuleFactories.find((module) => module.name === name);
};
