import { generateEventId, ProductDeletedEvent } from '@/domain/events';
import { IProductRepository } from '@/domain/interfaces';
import { IPublisherService } from '@/domain/interfaces/redis/IPublisherService';
import { CacheService } from '@/domain/services/cache/CacheService';
import {
  CACHE_KEYS_PATTERNS,
  DI_TOKENS,
  Logger,
  PRODUCT_ERROR_MESSAGES,
  PUBSUB_CHANNELS,
  PUBSUB_EVENT_TYPES,
} from '@/shared';
import { validateProductId } from '@/shared/utils';

import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';

/**
 * Use case for deleting existing products with cache invalidation and event publishing
 * Depends on: DI_TOKENS.PRODUCT_REPOSITORY, CacheService, PublisherService
 * Implements: Business logic orchestration between layers with cache management and event-driven notifications
 */
@injectable()
export class DeleteProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
    // 💡 Dependency Injection: Repository is injected via DI_TOKENS
    // 💡 This enables loose coupling and easy testing
    @inject(DI_TOKENS.LOGGER) private logger: Logger,
    @inject(DI_TOKENS.CACHE_SERVICE) private cacheService: CacheService,
    @inject(DI_TOKENS.PUBLISHER_SERVICE) private publisherService: IPublisherService
  ) {}

  /**
   * Executes the use case to delete a product by ID.
   * @param productId - The ID of the product to delete
   * @return Promise<boolean> - True if product was deleted, false if not found
   * 🔧 Flow: ID → Repository → Delete Operation
   * 📋 Business Rules: Validates product exists before deletion
   */
  public async execute(productId: string): Promise<boolean> {
    // Validate product ID
    validateProductId(productId, PRODUCT_ERROR_MESSAGES.PRODUCT_ID_REQ_DELETE);

    this.logger.info({ productId }, 'Product deletion initiated');

    // Check if product exists before attempting deletion
    const existingProduct = await this.productRepository.findById(productId);
    if (!existingProduct) {
      this.logger.warn({ productId }, 'Product deletion failed - product not found');
      return false; // Product not found
    }

    // Perform the deletion
    // 💡 Repository handles the actual database deletion
    // 💡 Returns boolean indicating success/failure
    const deleted = await this.productRepository.delete(productId);

    // Invalidate product-related cache entries after successful deletion
    if (deleted) {
      this.logger.info({ productId }, 'Product deleted successfully');
      await this.invalidateProductCache(productId);
      await this.publishProductDeletedEvent(productId);
    }

    return deleted;
  }

  /**
   * Invalidate product-specific and product list cache entries after deletion
   */
  private async invalidateProductCache(productId: string): Promise<void> {
    try {
      // Invalidate specific product cache and all product lists/count caches
      await Promise.all([
        this.cacheService.delete(CACHE_KEYS_PATTERNS.PRODUCT_SINGLE(productId)),
        this.cacheService.deleteByPattern('products:*'),
        this.cacheService.deleteByPattern('product:count:*'),
      ]);
      this.logger.info({ productId }, 'Product cache invalidated after deletion');
    } catch (error) {
      this.logger.warn({ error, productId }, 'Failed to invalidate product cache after deletion');
    }
  }

  /**
   * Publishes a ProductDeletedEvent to notify subscribers of the product deletion.
   * @param productId - The ID of the deleted product
   */
  private async publishProductDeletedEvent(productId: string): Promise<void> {
    try {
      const event: ProductDeletedEvent = {
        eventId: generateEventId(),
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_DELETED,
        timestamp: new Date(),
        payload: {
          productId,
        },
      };

      await this.publisherService.publish(PUBSUB_CHANNELS.PRODUCT, event);
      this.logger.info({ productId }, 'Product deleted event published successfully');
    } catch (error) {
      // Log error but don't throw - event publishing is non-blocking
      this.logger.error({ error, productId }, 'Failed to publish product deleted event');
    }
  }
}
