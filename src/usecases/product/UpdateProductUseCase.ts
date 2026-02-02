import { Product } from '@/domain/entities';
import { generateEventId, ProductUpdatedEvent } from '@/domain/events';
import { IProductRepository } from '@/domain/interfaces';
import { IPublisherService } from '@/domain/interfaces/redis/IPublisherService';
import { ProductService } from '@/domain/services';
import { CacheService } from '@/domain/services/cache/CacheService';
import { UpdateProductDTO } from '@/interface/dtos';
import {
  CACHE_KEYS_PATTERNS,
  DI_TOKENS,
  Logger,
  NotFoundError,
  PRODUCT_ERROR_MESSAGES,
  PUBSUB_CHANNELS,
  PUBSUB_EVENT_TYPES,
} from '@/shared';
import { validateProductId } from '@/shared/utils';

import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';

/**
 * Usecase for updating existing products with cache invalidation and event publishing
 * Depends on: DI_TOKENS.PRODUCT_REPOSITORY, CacheService, PublisherService
 *             UpdateProductDTO
 * Implements: Business logic orchestration between layers with cache management and event-driven notifications
 */
@injectable()
export class UpdateProductUseCase {
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
   * Executes the use case to update a product.
   * @param productId - The ID of the product to update
   * @param productData - UpdateProductDTO containing product details to update
   * @return Promise<Product> - The updated product entity
   * 🔧 Flow: ID → Repository → Domain Entity → Service → Updated Entity → Repository
   * 📋 Business Rules: Enforced by domain entity validation
   */
  public async execute(productId: string, productData: UpdateProductDTO): Promise<Product> {
    try {
      // Validate product ID
      validateProductId(productId, PRODUCT_ERROR_MESSAGES.PRODUCT_ID_REQ_UPDATE);

      // Log update operation (without sensitive data)
      const updatedFields = Object.keys(productData).filter(
        (key) => productData[key as keyof UpdateProductDTO] !== undefined
      );
      this.logger.info({ productId, updatedFields }, 'Product update initiated');

      // Retrieve the existing product using the repository
      this.logger.debug({ productId }, 'Fetching existing product');
      let existingProduct = await this.productRepository.findById(productId);

      if (!existingProduct) {
        this.logger.warn({ productId }, 'Product not found for update');
        throw new NotFoundError(PRODUCT_ERROR_MESSAGES.NOT_FOUND);
      }

      this.logger.debug({ productId }, 'Applying product updates');
      // Apply all updates to the product
      existingProduct = this.applyProductUpdates(existingProduct, productData);

      this.logger.debug({ productId }, 'Persisting updated product');
      // Persist the updated product using the repository
      // 💡 Dependency Inversion: Use Cases depend on abstractions (interfaces)
      // 💡 This enables switching database implementations without changing business logic
      const updatedProduct = await this.productRepository.update(existingProduct);

      // Log successful update
      this.logger.info({ productId, updatedFields }, 'Product updated successfully');

      // Invalidate product-related cache entries
      await this.invalidateProductCache(productId);

      // Publish product updated event
      await this.publishProductUpdatedEvent(productId, productData);

      return updatedProduct;
    } catch (error) {
      this.logger.error(
        { productId, error: error instanceof Error ? error.message : String(error) },
        'Product update failed'
      );
      throw error;
    }
  }

  /**
   * Applies all product updates based on the provided data.
   * @param product - The existing product to update
   * @param updates - The update data from DTO
   * @return Product - The updated product
   */
  private applyProductUpdates(product: Product, updates: UpdateProductDTO): Product {
    let updatedProduct = product;

    // Apply price update if provided
    if (updates.price !== undefined) {
      updatedProduct = this.productService.updatePrice(updatedProduct, updates.price);
    }

    // Apply stock update if provided
    if (updates.stock !== undefined) {
      updatedProduct = this.productService.updateStock(updatedProduct, updates.stock);
    }

    // Apply wishlist status update if provided
    if (updates.isWishlistStatus !== undefined) {
      updatedProduct = this.productService.updateWishlistStatus(
        updatedProduct,
        updates.isWishlistStatus
      );
    }

    // Apply basic product details updates
    updatedProduct = this.applyProductDetailsUpdates(updatedProduct, updates);

    return updatedProduct;
  }

  /**
   * Applies product details updates (name, description, category, isActive).
   * @param product - The product to update
   * @param updates - The update data from DTO
   * @return Product - The updated product
   */
  private applyProductDetailsUpdates(product: Product, updates: UpdateProductDTO): Product {
    const detailsUpdates: Partial<
      Pick<UpdateProductDTO, 'name' | 'description' | 'category' | 'isActive' | 'images'>
    > = {};

    // Collect all product details updates
    if (updates.name !== undefined) detailsUpdates.name = updates.name;
    if (updates.description !== undefined) detailsUpdates.description = updates.description;
    if (updates.category !== undefined) detailsUpdates.category = updates.category;
    if (updates.isActive !== undefined) detailsUpdates.isActive = updates.isActive;
    if (updates.images !== undefined) detailsUpdates.images = updates.images;

    // Apply updates only if there are any details to update
    if (Object.keys(detailsUpdates).length > 0) {
      return this.productService.updateProductDetails(product, detailsUpdates);
    }

    return product;
  }

  /**
   * Invalidate product-specific and product list cache entries after update
   */
  private async invalidateProductCache(productId: string): Promise<void> {
    try {
      // Invalidate specific product cache and all product lists/count caches
      await Promise.all([
        this.cacheService.delete(CACHE_KEYS_PATTERNS.PRODUCT_SINGLE(productId)),
        this.cacheService.deleteByPattern('products:*'),
        this.cacheService.deleteByPattern('product:count:*'),
      ]);
      this.logger.info({ productId }, 'Product cache invalidated after update');
    } catch (error) {
      this.logger.warn({ error, productId }, 'Failed to invalidate product cache after update');
    }
  }

  /**
   * Publishes a ProductUpdatedEvent to notify subscribers of the product update.
   * @param productId - The ID of the updated product
   * @param changes - The changes made to the product
   */
  private async publishProductUpdatedEvent(
    productId: string,
    changes: UpdateProductDTO
  ): Promise<void> {
    try {
      const event: ProductUpdatedEvent = {
        eventId: generateEventId(),
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_UPDATED,
        timestamp: new Date(),
        payload: {
          productId,
          changes: { ...changes },
        },
      };

      await this.publisherService.publish(PUBSUB_CHANNELS.PRODUCT, event);
      this.logger.info({ productId }, 'Product updated event published successfully');
    } catch (error) {
      // Log error but don't throw - event publishing is non-blocking
      this.logger.error({ error, productId }, 'Failed to publish product updated event');
    }
  }
}
