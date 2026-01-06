/**
 * Dependency Injection Container Configuration
 *
 * This module configures the application's dependency injection container using tsyringe.
 * The DI container enables loose coupling between application layers by managing
 * the creation and resolution of dependencies throughout the application lifecycle.
 *
 * Key Benefits:
 * - Inversion of Control (IoC): Dependencies are injected rather than created
 * - Testability: Easy to mock dependencies in unit tests
 * - Maintainability: Centralized dependency management
 * - Flexibility: Easy to swap implementations without changing consuming code
 */
import 'reflect-metadata'; // Required for tsyringe to work with decorators and reflection metadata

import { IProductRepository, IRedisService, ISessionService } from '@/domain/interfaces';
import { ProductService, RedisService } from '@/domain/services';
import { ProductRepository } from '@/infrastructure/repositories';
import { SessionService } from '@/infrastructure/services';
import { ProductController } from '@/interface/controllers';
import { DI_TOKENS, logger } from '@/shared';

import {
  CountProductsUseCase,
  CreateProductUseCase,
  DeleteProductUseCase,
  GetProductUseCase,
  ListProductsUseCase,
  ToggleWishlistProductUseCase,
  UpdateProductUseCase,
} from '@/usecases';
import { container } from 'tsyringe';

/**
 * Initializes the Dependency Injection container with all required service registrations.
 *
 * This function should be called during application startup to configure all
 * dependencies before they are needed by the application components.
 *
 * Currently registered services:
 * - ProductRepository: Handles product data persistence operations
 * - ProductService: Contains business logic for product operations
 * - All Product Use Cases: Business logic orchestrators for product operations
 * - ProductController: HTTP request handler for product endpoints
 *
 * @returns void
 */
export const initializeDIContainer = (): void => {
  // Register Infrastructure Layer - Data Access
  // Maps the IProductRepository interface to the concrete ProductRepository implementation
  // This allows controllers and services to depend on the interface rather than the concrete class
  container.register<IProductRepository>(DI_TOKENS.PRODUCT_REPOSITORY, {
    useClass: ProductRepository,
  });

  // Register Domain Services - Business Logic
  // ProductService contains reusable business logic methods
  container.register<ProductService>(ProductService, {
    useClass: ProductService,
  });

  // Register Use Cases - Application Logic
  // Each use case orchestrates business operations between domain and infrastructure layers
  container.register<CreateProductUseCase>(CreateProductUseCase, {
    useClass: CreateProductUseCase,
  });
  container.register<GetProductUseCase>(GetProductUseCase, {
    useClass: GetProductUseCase,
  });
  container.register<ListProductsUseCase>(ListProductsUseCase, {
    useClass: ListProductsUseCase,
  });
  container.register<CountProductsUseCase>(CountProductsUseCase, {
    useClass: CountProductsUseCase,
  });
  container.register<UpdateProductUseCase>(UpdateProductUseCase, {
    useClass: UpdateProductUseCase,
  });
  container.register<DeleteProductUseCase>(DeleteProductUseCase, {
    useClass: DeleteProductUseCase,
  });
  container.register<ToggleWishlistProductUseCase>(ToggleWishlistProductUseCase, {
    useClass: ToggleWishlistProductUseCase,
  });

  // Register Controllers - Interface Layer
  // Controllers handle HTTP requests and orchestrate use case execution
  container.register<ProductController>(ProductController, {
    useClass: ProductController,
  });

  // Register Global Services
  // Registering the logger allows other services to inject it rather than importing it directly
  container.register(DI_TOKENS.LOGGER, {
    useValue: logger,
  });

  // Register Redis Service
  container.register<IRedisService>(DI_TOKENS.REDIS_SERVICE, {
    useClass: RedisService,
  });

  // Register Session Service - Maps ISessionService interface to SessionService implementation
  // SessionService provides Redis-based session management for user authentication
  container.register<ISessionService>(DI_TOKENS.SESSION_SERVICE, {
    useClass: SessionService,
  });

  logger.info('DI container initialized successfully');
};

// Export the container instance for direct access if needed
// Most components should use constructor injection instead of direct container resolution
export default container;
