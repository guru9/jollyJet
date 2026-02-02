import { Product } from '@/domain/entities';
import { generateEventId, ProductCreatedEvent } from '@/domain/events';
import { IProductRepository } from '@/domain/interfaces';
import { IPublisherService } from '@/domain/interfaces/redis/IPublisherService';
import { ProductService } from '@/domain/services';
import { CacheService } from '@/domain/services/cache/CacheService';
import { CreateProductDTO } from '@/interface/dtos';
import {
  BadRequestError,
  CACHE_LOG_MESSAGES,
  DI_TOKENS,
  Logger,
  PRODUCT_ERROR_MESSAGES,
  PUBSUB_CHANNELS,
  PUBSUB_EVENT_TYPES,
} from '@/shared';
import 'reflect-metadata'; // Required for tsyringe to work with decorators and reflection metadata

import { inject, injectable } from 'tsyringe';

/**
 * Usecase for creating new products with cache invalidation and event publishing
 * Depends on: DI_TOKENS.PRODUCT_REPOSITORY, CacheService, PublisherService
 *             CreateProductDTO
 * Implements: Business logic orchestration between layers with cache management and event-driven notifications
 */
@injectable()
export class CreateProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
    // 💡 Dependency Injection: Repository is injected via DI_TOKENS
    // 💡 This enables loose coupling and easy testing
    private productService: ProductService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger,
    @inject(DI_TOKENS.CACHE_SERVICE) private cacheService: CacheService,
    @inject(DI_TOKENS.PUBLISHER_SERVICE) private publisherService: IPublisherService
  ) {}

  /**
   * Excecutes use case to create a new product with cache invalidation and event publishing.
   * @param productData - CreateProductDTO containing product details
   * @return Promise<Product> - The created product entity
   * 🔧 Flow: DTO → Domain Entity → Repository → Persisted Entity → Cache Invalidation → Event Publish
   * 📋 Business Rules: Enforced by domain entity validation
   */
  public async execute(productData: CreateProductDTO): Promise<Product> {
    // Transform DTO to Domain Entity
    const newProduct = new Product({
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      stock: productData.stock,
      isActive: productData.isActive ?? true,
    });

    if (!this.productService.isAvailable(newProduct)) {
      throw new BadRequestError(PRODUCT_ERROR_MESSAGES.NOT_AVAILABLE);
    }

    // Persist to new product using repository
    // 💡 Dependency Inversion: Use Cases depend on abstractions (interfaces)
    // 💡 This enables switching database implementations without changing business logic
    const createdProduct = await this.productRepository.create(newProduct);

    // Invalidate product-related cache entries
    await this.invalidateProductCache();

    // Publish product created event
    await this.publishProductCreatedEvent(createdProduct);

    return createdProduct;
  }

  /**
   * Publishes a ProductCreatedEvent to notify subscribers of the new product.
   * @param product - The created product entity
   */
  private async publishProductCreatedEvent(product: Product): Promise<void> {
    try {
      const props = product.toProps();
      const event: ProductCreatedEvent = {
        eventId: generateEventId(),
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
        payload: {
          productId: props.id!,
          name: props.name,
          price: props.price,
          category: props.category,
        },
      };

      await this.publisherService.publish(PUBSUB_CHANNELS.PRODUCT, event);
      this.logger.info({ productId: props.id }, 'Product created event published successfully');
    } catch (error) {
      // Log error but don't throw - event publishing is non-blocking
      this.logger.error(
        { error, productId: product.toProps().id },
        'Failed to publish product created event'
      );
    }
  }

  /**
   * Invalidate all product-related cache entries after creation
   */
  private async invalidateProductCache(): Promise<void> {
    try {
      // Invalidate product list and count caches
      await Promise.all([
        this.cacheService.deleteByPattern('products:*'),
        this.cacheService.deleteByPattern('product:*'),
        this.cacheService.deleteByPattern('products:count:*'),
      ]);
      this.logger.info(CACHE_LOG_MESSAGES.CACHE_INVALIDATED('Product'));
    } catch (error) {
      this.logger.warn(
        { error },
        CACHE_LOG_MESSAGES.CACHE_PATTERN_DELETE_FAILED(
          'products:*',
          error instanceof Error ? error.message : String(error)
        )
      );
    }
  }
}
