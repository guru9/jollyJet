import { IProductRepository } from '@/domain/interfaces';
import { CacheService } from '@/domain/services/cache/CacheService';
import {
  BadRequestError,
  DI_TOKENS,
  Logger,
  PRODUCT_ERROR_MESSAGES,
  CACHE_KEYS_PATTERNS,
} from '@/shared';

import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';

/**
 * Use case for deleting existing products with cache invalidation
 * Depends on: DI_TOKENS.PRODUCT_REPOSITORY, CacheService
 * Implements: Business logic orchestration between layers with cache management
 */
@injectable()
export class DeleteProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
    // 💡 Dependency Injection: Repository is injected via DI_TOKENS
    // 💡 This enables loose coupling and easy testing
    @inject(DI_TOKENS.LOGGER) private logger: Logger,
    @inject(DI_TOKENS.CACHE_SERVICE) private cacheService: CacheService
  ) {}

  /**
   * Executes the use case to delete a product by ID.
   * @param productId - The ID of the product to delete
   * @return Promise<boolean> - True if product was deleted, false if not found
   * 🔧 Flow: ID → Repository → Delete Operation
   * 📋 Business Rules: Validates product exists before deletion
   */
  public async execute(productId: string): Promise<boolean> {
    // Validate input
    if (!productId?.trim()) {
      throw new BadRequestError(PRODUCT_ERROR_MESSAGES.PRODUCT_ID_REQ_DELETE);
    }

    // Check if product exists before attempting deletion
    const existingProduct = await this.productRepository.findById(productId);
    if (!existingProduct) {
      return false; // Product not found
    }

    // Perform the deletion
    // 💡 Repository handles the actual database deletion
    // 💡 Returns boolean indicating success/failure
    const deleted = await this.productRepository.delete(productId);

    // Invalidate product-related cache entries after successful deletion
    if (deleted) {
      await this.invalidateProductCache(productId);
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
}
