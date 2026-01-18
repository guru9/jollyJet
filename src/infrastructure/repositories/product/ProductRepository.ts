import { Product, ProductProps } from '@/domain/entities';
import { IProductRepository, ProductFilter } from '@/domain/interfaces';
import { CacheService } from '@/domain/services/cache/CacheService';
import { Productmodel } from '@/infrastructure/models';
import { CACHE_LOG_MESSAGES, DI_TOKENS, Logger, PRODUCT_ERROR_MESSAGES } from '@/shared';
import { BadRequestError } from '@/shared/errors';

import { PaginationParams } from '@/types';
import mongoose from 'mongoose';
import { inject, injectable } from 'tsyringe';

@injectable()
export class ProductRepository implements IProductRepository {
  /**
   * Creates an instance of ProductRepository
   * @param logger Injected logger service
   * @param cacheService Injected cache service
   */
  constructor(
    @inject(DI_TOKENS.LOGGER) private logger: Logger,
    @inject(DI_TOKENS.CACHE_SERVICE) private cacheService: CacheService
  ) {}

  /**
   * Creates a new product in the database.
   * @param product Product entity to create
   * @returns Promise with created Product entity
   */
  public async create(product: Product): Promise<Product> {
    const productData = product.toProps();

    // Create document in MongoDB and convert back to domain entity
    const createdProduct = await Productmodel.create(productData);
    const productObj = createdProduct.toObject();
    const productProps: ProductProps = {
      ...productObj,
      id: productObj._id.toString(), // Map _id to id
    };
    const productEntity = Product.createProduct(productProps);

    // Cache the new product
    const cacheKey = `product:${productEntity.toProps().id}`;
    await this.cacheService.set(cacheKey, productEntity.toProps());

    // Invalidate list caches
    await this.cacheService.deleteByPattern('products:*');
    await this.cacheService.deleteByPattern('product:count:*');

    return productEntity;
  }

  /**
   * Builds a filtered Mongoose query based on the provided filter criteria.
   * @param filter Optional filter criteria
   * @returns Mongoose query with applied filters
   */
  private buildFilteredQuery(filter?: ProductFilter) {
    const query = Productmodel.find();

    // Apply filters if provided
    if (filter) {
      if (filter.category) query.where('category', filter.category);
      if (filter.isActive !== undefined) query.where('isActive', filter.isActive);
      if (filter.isWishlistStatus !== undefined)
        query.where('isWishlistStatus', filter.isWishlistStatus);
      if (filter.search) query.where({ $text: { $search: filter.search } });
      if (filter.priceRange)
        query.where('price').gte(filter.priceRange.min).lte(filter.priceRange.max);
    }

    return query;
  }

  /**
   * Updates an existing product
   * @param product Product entity with updates
   * @returns Promise with updated Product entity
   * @throws Error if product ID is missing or product not found
   */
  public async update(product: Product): Promise<Product> {
    const productData = product.toProps();
    if (!productData.id) throw new BadRequestError(PRODUCT_ERROR_MESSAGES.PRODUCT_ID_REQ_UPDATE);
    if (!mongoose.isValidObjectId(productData.id)) {
      throw new BadRequestError(PRODUCT_ERROR_MESSAGES.PRODUCT_ID_INVALID);
    }

    //find the updated document, return the updated product
    const updatedProduct = await Productmodel.findByIdAndUpdate(productData.id, productData, {
      new: true,
    });
    if (!updatedProduct) throw new BadRequestError(PRODUCT_ERROR_MESSAGES.PRODUCT_NOT_FOUND_UPDATE);

    const productObj = updatedProduct.toObject();
    const productProps: ProductProps = {
      ...productObj,
      id: productObj._id.toString(), // Map _id to id
    };
    const productEntity = Product.createProduct(productProps);

    // Update cache with new data
    const cacheKey = `product:${productData.id}`;
    await this.cacheService.set(cacheKey, productEntity.toProps());

    // Invalidate list caches
    await this.cacheService.deleteByPattern('products:*');
    await this.cacheService.deleteByPattern('product:count:*');

    return productEntity;
  }

  /**
   * Retrieves a product by its ID
   * @param id Product ID to search for
   * @returns Promise with Product entity or null if not found
   */
  public async findById(id: string): Promise<Product | null> {
    if (!id) return null; // Return null for invalid IDs
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestError(PRODUCT_ERROR_MESSAGES.PRODUCT_ID_INVALID);

    const cacheKey = `product:${id}`;
    const cachedProductProps = await this.cacheService.get<ProductProps>(cacheKey);

    if (cachedProductProps) {
      this.logger.debug(CACHE_LOG_MESSAGES.CACHE_HIT(cacheKey));
      return Product.createProduct(cachedProductProps);
    }

    // Cache miss - fetch from MongoDB
    this.logger.debug(CACHE_LOG_MESSAGES.CACHE_MISS(cacheKey, 'database'));
    const productDocument = await Productmodel.findById(id);
    if (!productDocument) return null; // Return null if document not found

    const productObj = productDocument.toObject();
    const productProps: ProductProps = {
      ...productObj,
      id: productObj._id.toString(), // Map _id to id
    };
    const product = Product.createProduct(productProps); // Convert to Product entity
    await this.cacheService.set(cacheKey, product.toProps());

    return product;
  }

  /**
   * Retrieves all products with optional filtering and pagination
   * @param filter Optional filter criteria
   * @param pagination Optional pagination parameters
   * @returns Promise with array of Product entities
   */
  public async findAll(filter?: ProductFilter, pagination?: PaginationParams): Promise<Product[]> {
    // Generate cache key based on filter and pagination
    const cacheKey = `products:${JSON.stringify({ filter, pagination })}`;
    const cachedProductProps = await this.cacheService.get<ProductProps[]>(cacheKey);

    if (cachedProductProps) {
      this.logger.debug(CACHE_LOG_MESSAGES.CACHE_HIT(cacheKey));
      return cachedProductProps.map((props) => Product.createProduct(props));
    }

    // Cache miss - fetch from MongoDB
    this.logger.debug(CACHE_LOG_MESSAGES.CACHE_MISS(cacheKey, 'database'));
    const query = this.buildFilteredQuery(filter);

    // Apply pagination if provided
    if (pagination) {
      query.skip(pagination.skip);
      query.limit(pagination.limit);
    }

    // Execute the query and convert documents to Product entities
    const productDocuments = await query.exec();
    const products = productDocuments.map((doc) => {
      const docObj = doc.toObject();
      const productProps: ProductProps = {
        ...docObj,
        id: docObj._id.toString(), // Map _id to id
      };
      return Product.createProduct(productProps);
    });

    // Cache the result with shorter TTL for lists
    await this.cacheService.set(
      cacheKey,
      products.map((p) => p.toProps()),
      300
    ); // 5 minutes

    return products;
  }

  /**
   * Deletes a product by ID
   * @param id Product ID to delete
   * @returns Promise with boolean indicating success
   */
  public async delete(id: string): Promise<boolean> {
    if (!id) return false;
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new Error(PRODUCT_ERROR_MESSAGES.PRODUCT_ID_INVALID);

    const result = await Productmodel.findByIdAndDelete(id);

    if (result) {
      // Remove from cache
      const cacheKey = `product:${id}`;
      await this.cacheService.delete(cacheKey);

      // Invalidate list caches
      await this.cacheService.deleteByPattern('products:*');
      await this.cacheService.deleteByPattern('product:count:*');
    }

    return result !== null;
  }

  /**
   * Gets the count of products matching the filter
   * @param filter Optional filter criteria
   * @returns Promise with count of matching products
   */
  public async count(filter?: ProductFilter): Promise<number> {
    // Generate cache key based on filter
    const cacheKey = `product:count:${JSON.stringify(filter)}`;
    const cachedCount = await this.cacheService.get<number>(cacheKey);

    if (cachedCount !== null && cachedCount !== undefined) {
      this.logger.debug(CACHE_LOG_MESSAGES.CACHE_HIT(cacheKey));
      return cachedCount;
    }

    // Cache miss - fetch from MongoDB
    this.logger.debug(CACHE_LOG_MESSAGES.CACHE_MISS(cacheKey, 'database'));
    const countQuery = Productmodel.find();

    // Apply filters if provided (same logic as buildFilteredQuery)
    if (filter) {
      if (filter.category) countQuery.where('category', filter.category);
      if (filter.isActive !== undefined) countQuery.where('isActive', filter.isActive);
      if (filter.isWishlistStatus !== undefined)
        countQuery.where('isWishlistStatus', filter.isWishlistStatus);
      if (filter.search) countQuery.where({ $text: { $search: filter.search } });
      if (filter.priceRange)
        countQuery.where('price').gte(filter.priceRange.min).lte(filter.priceRange.max);
    }

    // Count documents matching the filters
    const count = await countQuery.countDocuments().exec();

    // Cache the count with shorter TTL
    await this.cacheService.set(cacheKey, count, 300); // 5 minutes

    return count;
  }

  /**
   * Toggles the wishlist status of a product
   * @param id Product ID to update
   * @param isWishlistStatus New wishlist status
   * @returns Promise<Product> with the updated product
   */
  public async toggleWishlistStatus(id: string, isWishlistStatus: boolean): Promise<Product> {
    if (!id || !mongoose.isValidObjectId(id))
      throw new Error(PRODUCT_ERROR_MESSAGES.PRODUCT_ID_INVALID);
    // Update the isWishlistStatus status and adjust wishlistCount accordingly
    const updatedProduct = await Productmodel.findByIdAndUpdate(
      id,
      { isWishlistStatus: isWishlistStatus, wishlistCount: isWishlistStatus ? 1 : 0 },
      { new: true }
    );

    //check if product doesn't exist
    if (!updatedProduct) {
      throw new Error(PRODUCT_ERROR_MESSAGES.NOT_FOUND);
    }

    const productEntity = Product.createProduct(updatedProduct.toObject()); // Convert to Product entity

    // Update cache with new data
    const cacheKey = `product:${id}`;
    await this.cacheService.set(cacheKey, productEntity);

    // Invalidate list caches
    await this.cacheService.deleteByPattern('products:*');
    await this.cacheService.deleteByPattern('product:count:*');

    return productEntity;
  }
}
