import { Product } from '@/domain/entities';
import { IProductRepository } from '@/domain/interfaces';
import { CacheService } from '@/domain/services/cache/CacheService';
import { ToggleWishlistDTO } from '@/interface/dtos';
import {
  BadRequestError,
  DI_TOKENS,
  Logger,
  NotFoundError,
  PRODUCT_ERROR_MESSAGES,
  CACHE_KEYS_PATTERNS,
} from '@/shared';

import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';

/**
 * Use case for toggling a product's wishlist status with cache invalidation
 * Depends on: DI_TOKENS.PRODUCT_REPOSITORY, CacheService
 * Implements: Business logic orchestration between layers with cache management
 */
@injectable()
export class ToggleWishlistProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
    // 💡 Dependency Injection: Repository is injected via DI_TOKENS
    // 💡 This enables loose coupling and easy testing
    @inject(DI_TOKENS.LOGGER) private logger: Logger,
    @inject(DI_TOKENS.CACHE_SERVICE) private cacheService: CacheService
  ) {}

  /**
   * Executes the use case to toggle a product's wishlist status.
   * @param productId - The ID of the product to toggle wishlist status for
   * @param wishlistData - ToggleWishlistDTO containing the desired wishlist state
   * @return Promise<Product> - The updated product entity with new wishlist status
   * 🔧 Flow: ID → Repository → Toggle Operation → Updated Entity
   * 📋 Business Rules: Validates product exists before toggling
   */
  public async execute(productId: string, wishlistData: ToggleWishlistDTO): Promise<Product> {
    // Validate input
    if (!productId?.trim()) {
      throw new BadRequestError(PRODUCT_ERROR_MESSAGES.PRODUCT_ID_REQ_WISHLIST);
    }

    // Check if product exists before attempting to toggle
    const existingProduct = await this.productRepository.findById(productId);
    if (!existingProduct) {
      throw new NotFoundError(PRODUCT_ERROR_MESSAGES.NOT_FOUND);
    }

    // Toggle the wishlist status using the repository
    // 💡 Repository handles the actual database update
    // 💡 Returns the updated product with new wishlist status
    const updatedProduct = await this.productRepository.toggleWishlistStatus(
      productId,
      wishlistData.isWishlistStatus
    );

    // Invalidate product-related cache entries after successful update
    await this.invalidateProductCache(productId);

    return updatedProduct;
  }

  /**
   * Invalidate product-specific and product list cache entries after wishlist toggle
   */
  private async invalidateProductCache(productId: string): Promise<void> {
    try {
      // Invalidate specific product cache and all product lists/count caches
      await Promise.all([
        this.cacheService.delete(CACHE_KEYS_PATTERNS.PRODUCT_SINGLE(productId)),
        this.cacheService.deleteByPattern('products:*'),
        this.cacheService.deleteByPattern('product:count:*'),
      ]);
      this.logger.info({ productId }, 'Product cache invalidated after wishlist toggle');
    } catch (error) {
      this.logger.warn(
        { error, productId },
        'Failed to invalidate product cache after wishlist toggle'
      );
    }
  }
}
