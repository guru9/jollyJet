import { Product } from '@/domain/entities';
import { IProductRepository, ProductFilter } from '@/domain/interfaces';
import { ProductService } from '@/domain/services';
import { CacheService } from '@/domain/services/cache/CacheService';
import { DI_TOKENS, Logger, CACHE_KEYS_PATTERNS } from '@/shared';

import { PaginationParams } from '@/types';
import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';

/**
 * Query parameters for listing products with filtering
 * 📋 Defines the contract for API query parameters
 * 💡 Includes validation and type conversion logic
 */
export interface ListProductsQuery {
  page?: string; //Page number for pagination (default: 1)
  limit?: string; // Items per page (max 100, default: 10)
  category?: string; // Category filter for product categorization
  search?: string; // Full-text search query for name/description
  isActive?: boolean; // Active status filter (boolean, default: true)
  isWishlistStatus?: boolean; // Active status filter (boolean, default: true)
  priceRange?: { min: number; max: number }; //Get the products by price range filter. Must be non-negative.
}

/**
 * Use case for listing products with pagination and filtering using Redis-first caching
 * 🔧 Depends on: DI_TOKENS.PRODUCT_REPOSITORY, CacheService
 * 📋 Handles: Complex query processing and pagination with caching
 * 🏗️ Implements: Efficient data retrieval with parallel queries and cache-aside pattern
 */
@injectable()
export class ListProductsUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
    private productService: ProductService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger,
    @inject(DI_TOKENS.CACHE_SERVICE) private cacheService: CacheService
    // 💡 Dependency Injection: Repository and CacheService are injected via DI_TOKENS
    // 💡 This enables loose coupling and easy testing with caching
  ) {}

  public async execute(query: ListProductsQuery): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Parse and validate pagination parameters with safe defaults
    // 💡 Business Rule: Prevent excessive page sizes (max 100)
    // 💡 Security: Protect against potential DoS attacks with large limits
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    // Build filter object from query parameters
    // 💡 Business Rule: Convert string parameters to proper types
    // 💡 Type Safety: Ensure proper typing for repository operations
    const filter: ProductFilter = {};
    this.logger.info({ query }, 'ListProductsUseCase query');
    if (query.category) filter.category = query.category; //Filter by category
    if (query.search) filter.search = query.search; //Filter by search
    if (query.isActive) filter.isActive = query.isActive; //Filter by active products
    if (query.isWishlistStatus) filter.isWishlistStatus = query.isWishlistStatus; //Filter by wishlist products
    if (this.productService.isValidPriceRange(query.priceRange))
      filter.priceRange = query.priceRange; //Get the products by price range filter. Must be non-negative.

    // Create cache key based on query parameters
    const cacheKey = CACHE_KEYS_PATTERNS.PRODUCT_LIST(JSON.stringify({ filter, page, limit }));

    // Redis-first: Try to get from cache first
    const cachedResult = await this.cacheService.get<{
      products: Product[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(cacheKey);

    if (cachedResult !== null) {
      this.logger.debug({ query, cacheKey }, 'Product list retrieved from cache');
      return cachedResult;
    }

    // Cache miss: Fetch from database
    this.logger.debug(
      { query, cacheKey },
      'Product list not found in cache, fetching from database'
    );

    // Create pagination parameters object
    const pagination: PaginationParams = { page, limit, skip };

    // Execute parallel queries for efficiency
    // 💡 Performance: Parallel execution reduces total response time
    // 💡 Benefits: Faster API responses for better user experience
    const [products, total] = await Promise.all([
      this.productRepository.findAll(filter, pagination), //Get paginated products
      this.productRepository.count(filter), //Get total count for pagination
    ]);

    const totalPages = Math.ceil(total / limit);
    const result = { products, total, page, limit, totalPages };

    // Cache the result for 30 minutes
    await this.cacheService.set(cacheKey, result, 1800);

    return result;
  }
}
