import { IProductRepository, ProductFilter } from '@/domain/interfaces';
import { ProductService } from '@/domain/services';
import { CacheService } from '@/domain/services/cache/CacheService';
import { DI_TOKENS, Logger, CACHE_KEYS_PATTERNS } from '@/shared';

import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';

/**
 * Query parameters for counting products with filtering
 * 📋 Defines the contract for API query parameters
 * 💡 Includes validation and type conversion logic
 */
export interface CountProductsQuery {
  category?: string; // Category filter for product categorization
  search?: string; // Full-text search query for name/description
  isActive?: boolean; // Active status filter (boolean, default: true)
  isWishlistStatus?: boolean; // Wishlist status filter (boolean, default: true)
  priceRange?: { min: number; max: number }; // Price range filter. Must be non-negative.
}

/**
 * Use case for counting products matching filter criteria using Redis-first caching
 * 🔧 Depends on: DI_TOKENS.PRODUCT_REPOSITORY, CacheService
 * 📋 Handles: Filter processing and count retrieval with caching
 * 🏗️ Implements: Efficient count queries with validation and cache-aside pattern
 */
@injectable()
export class CountProductsUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
    private productService: ProductService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger,
    @inject(DI_TOKENS.CACHE_SERVICE) private cacheService: CacheService
    // 💡 Dependency Injection: Repository and CacheService are injected via DI_TOKENS
    // 💡 This enables loose coupling and easy testing with caching
  ) {}

  public async execute(query: CountProductsQuery): Promise<number> {
    // Build filter object from query parameters
    // 💡 Business Rule: Convert string parameters to proper types
    // 💡 Type Safety: Ensure proper typing for repository operations
    const filter: ProductFilter = {};
    if (query.category) filter.category = query.category; // Filter by category
    if (query.search) filter.search = query.search; // Filter by search
    if (query.isActive !== undefined) filter.isActive = query.isActive; // Filter by active products
    if (query.isWishlistStatus !== undefined) filter.isWishlistStatus = query.isWishlistStatus; // Filter by wishlist products
    if (this.productService.isValidPriceRange(query.priceRange))
      filter.priceRange = query.priceRange; // Filter by price range. Must be non-negative.

    // Create cache key based on query parameters
    const cacheKey = CACHE_KEYS_PATTERNS.PRODUCT_COUNT(JSON.stringify(filter));

    // Redis-first: Try to get from cache first
    const cachedCount = await this.cacheService.get<number>(cacheKey);
    if (cachedCount !== null) {
      this.logger.debug({ query, cacheKey }, 'Product count retrieved from cache');
      return cachedCount;
    }

    // Cache miss: Fetch from database
    this.logger.debug(
      { query, cacheKey },
      'Product count not found in cache, fetching from database'
    );

    // Execute count query
    // 💡 Performance: Direct count query without pagination overhead
    // 💡 Efficiency: Optimized for count-only operations
    const count = await this.productRepository.count(filter);

    // Cache the result for 30 minutes
    await this.cacheService.set(cacheKey, count, 1800);

    return count;
  }
}
