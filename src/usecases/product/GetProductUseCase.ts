import { Product } from '@/domain/entities';
import { IProductRepository } from '@/domain/interfaces';
import { CacheService } from '@/domain/services/cache/CacheService';
import {
  CACHE_KEYS_PATTERNS,
  CACHE_LOG_MESSAGES,
  DI_TOKENS,
  Logger,
  PRODUCT_ERROR_MESSAGES,
} from '@/shared';
import { validateProductId } from '@/shared/utils';

import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';

/**
 * Usecase for get product by ID with Redis-first caching strategy
 * Depends on: DI_TOKENS.PRODUCT_REPOSITORY, CacheService
 * Implements: Business logic orchestration between layers with caching
 *
 * Caching Strategy:
 * 1. Check Redis first for cached product data
 * 2. If cache miss, fetch from MongoDB and cache the result
 * 3. Return cached or fresh data
 */
@injectable()
export class GetProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
    @inject(DI_TOKENS.LOGGER) private logger: Logger,
    @inject(DI_TOKENS.CACHE_SERVICE) private cacheService: CacheService
  ) {}

  /**
   * Executes the use case to retrieve a product by ID using Redis-first caching.
   * @param productId - The ID of the product to retrieve
   * @return Promise<Product | null> - The retrieved product entity or null if not found
   * 🔧 Flow: ID → Redis Check → MongoDB Fallback → Cache Storage → Response
   * 📋 Business Rules: Enforced by domain entity validation
   */
  public async execute(productId: string): Promise<Product | null> {
    // Validate product ID
    validateProductId(productId, PRODUCT_ERROR_MESSAGES.PRODUCT_ID_REQ_RETRIEVE);

    const cacheKey = CACHE_KEYS_PATTERNS.PRODUCT_SINGLE(productId);

    // Redis-first: Try to get from cache first
    const cachedProduct = await this.cacheService.get<Product>(cacheKey);
    if (cachedProduct !== null) {
      this.logger.debug({ productId, cacheKey }, CACHE_LOG_MESSAGES.CACHE_HIT(cacheKey));
      return cachedProduct;
    }

    // Cache miss: Fetch from MongoDB
    this.logger.debug({ productId, cacheKey }, CACHE_LOG_MESSAGES.CACHE_MISS(cacheKey, 'database'));
    const product = await this.productRepository.findById(productId);

    // Cache the result (even if null to prevent repeated database queries)
    await this.cacheService.set(cacheKey, product, 3600); // 1 hour TTL

    return product;
  }
}
