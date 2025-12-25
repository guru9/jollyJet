import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';
import { Product } from '../domain/entities/Product';
import { IProductRepository, ProductFilter } from '../domain/interfaces/IProductRepository';
import { ProductService } from '../domain/services/ProductService';
import { DI_TOKENS } from '../shared/constants';

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
  isInWishlist?: boolean; // Active status filter (boolean, default: true)
  priceRange?: { min: number; max: number }; //Get the products by price range filter. Must be non-negative.
}

/**
 * Use case for listing products with pagination and filtering
 * 🔧 Depends on: DI_TOKENS.PRODUCT_REPOSITORY (Step 4.1)
 * 📋 Handles: Complex query processing and pagination
 * 🏗️ Implements: Efficient data retrieval with parallel queries
 */
@injectable()
export class ListProductsUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
    private productService: ProductService
    // 💡 Dependency Injection: Repository is injected via DI_TOKENS
    // 💡 This enables loose coupling and easy testing
  ) {}

  public async execute(query: ListProductsQuery): Promise<{ products: Product[]; total: number }> {
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
    if (query.category) filter.category = query.category; //Filter by category
    if (query.search) filter.search = query.search; //Filter by search
    if (query.isActive) filter.isActive = query.isActive; //Filter by active products
    if (query.isInWishlist) filter.isInWishlist = query.isInWishlist; //Filter by wishlist products
    if (this.productService.isValidPriceRange(query.priceRange))
      filter.priceRange = query.priceRange; //Get the products by price range filter. Must be non-negative.

    // Execute parallel queries for efficiency
    // 💡 Performance: Parallel execution reduces total response time
    // 💡 Benefits: Faster API responses for better user experience
    const [products, total] = await Promise.all([
      this.productRepository.findAll(filter, skip, limit), //Get paginated products
      this.productRepository.count(filter), //Get total count for pagination
    ]);

    return { products, total };
  }
}
