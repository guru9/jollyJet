import { Product } from '@/domain/entities';
import { IProductRepository } from '@/domain/interfaces';
import { ProductService } from '@/domain/services';
import { CacheService } from '@/domain/services/cache/CacheService';
import { CreateProductDTO } from '@/interface/dtos';
import {
  BadRequestError,
  CACHE_LOG_MESSAGES,
  DI_TOKENS,
  Logger,
  PRODUCT_ERROR_MESSAGES,
} from '@/shared';
import 'reflect-metadata'; // Required for tsyringe to work with decorators and reflection metadata

import { inject, injectable } from 'tsyringe';

/**
 * Usecase for creating new products with cache invalidation
 * Depends on: DI_TOKENS.PRODUCT_REPOSITORY, CacheService
 *             CreateProductDTO
 * Implements: Business logic orchestration between layers with cache management
 */
@injectable()
export class CreateProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
    // 💡 Dependency Injection: Repository is injected via DI_TOKENS
    // 💡 This enables loose coupling and easy testing
    private productService: ProductService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger,
    @inject(DI_TOKENS.CACHE_SERVICE) private cacheService: CacheService
  ) {}

  /**
   * Excecutes use case to create a new product with cache invalidation.
   * @param productData - CreateProductDTO containing product details
   * @return Promise<Product> - The created product entity
   * 🔧 Flow: DTO → Domain Entity → Repository → Persisted Entity → Cache Invalidation
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

    return createdProduct;
  }

  /**
   * Invalidate all product-related cache entries after creation
   */
  private async invalidateProductCache(): Promise<void> {
    try {
      // Invalidate product list and count caches
      await Promise.all([
        this.cacheService.deleteByPattern('products:*'),
        this.cacheService.deleteByPattern('product:count:*'),
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
