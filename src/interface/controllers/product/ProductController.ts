import { ProductProps } from '@/domain/entities';
import { IRedisService } from '@/domain/interfaces/redis/IRedisService';
import { ToggleWishlistDTO, UpdateProductDTO } from '@/interface/dtos';
import { productFilterSchema } from '@/interface/validators';
import {
  BadRequestError,
  DI_TOKENS,
  HTTP_STATUS,
  Logger,
  PRODUCT_ERROR_MESSAGES,
  PRODUCT_SUCCESS_MESSAGES,
  RESPONSE_STATUS,
  safeParseString,
} from '@/shared';

interface ListProductsResponse {
  products: ProductProps[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

import { ApiResponse } from '@/types';
import {
  CountProductsQuery,
  CountProductsUseCase,
  CreateProductUseCase,
  DeleteProductUseCase,
  GetProductUseCase,
  ListProductsQuery,
  ListProductsUseCase,
  ToggleWishlistProductUseCase,
  UpdateProductUseCase,
} from '@/usecases';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';

/**
 * Product Controller - Handles HTTP requests for product operations
 *
 * This controller implements the REST API endpoints for product management,
 * following the dependency injection pattern with tsyringe for better
 * testability and maintainability.
 *
 * Endpoints provided:
 * - POST /products - Create a new product
 * - GET /products/:id - Retrieve a specific product by ID
 * - GET /products - List products with filtering and pagination
 * - GET /products/count - Count products with filtering
 * - PUT /products/:id - Update an existing product
 * - PATCH /products/:id/wishlist - Toggle product wishlist status
 * - DELETE /products/:id - Delete a product
 *
 * @controller ProductController
 * @since 1.0.0
 */
@injectable()
export class ProductController {
  /**
   * Creates an instance of ProductController
   *
   * @param createProductUseCase - Use case for creating products
   * @param getProductUseCase - Use case for retrieving single products
   * @param listProductsUseCase - Use case for listing products with filters
   * @param countProductsUseCase - Use case for counting products with filters
   * @param updateProductUseCase - Use case for updating products
   * @param deleteProductUseCase - Use case for deleting products
   * @param toggleWishlistUseCase - Use case for toggling wishlist status
   */
  constructor(
    private createProductUseCase: CreateProductUseCase,
    private getProductUseCase: GetProductUseCase,
    private listProductsUseCase: ListProductsUseCase,
    private countProductsUseCase: CountProductsUseCase,
    private updateProductUseCase: UpdateProductUseCase,
    private deleteProductUseCase: DeleteProductUseCase,
    private toggleWishlistUseCase: ToggleWishlistProductUseCase,
    @inject(DI_TOKENS.REDIS_SERVICE) private redisService: IRedisService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger
  ) {}

  /**
   * Creates a new product
   *
   * @route POST /products
   * @param req - Express request object containing product data in body
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Promise<void>
   *
   * @example
   * // Request body
   * {
   *   "name": "Product Name",
   *   "description": "Product description",
   *   "price": 99.99,
   *   "category": "electronics",
   *   "stock": 100
   * }
   *
   * @throws Will pass validation errors to error middleware
   */
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productData = req.body;
      const product = await this.createProductUseCase.execute(productData);

      // Invalidate product caches after creation
      const keys = await this.redisService.keys('products:*');
      await Promise.all(keys.map((key) => this.redisService.delete(key)));

      // Set data source header
      res.setHeader('X-Data-Source', 'mongo');

      const response: ApiResponse<ProductProps> = {
        status: RESPONSE_STATUS.SUCCESS,
        data: product.toProps(),
        message: PRODUCT_SUCCESS_MESSAGES.PRODUCT_CREATED,
      };
      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves a specific product by ID
   *
   * @route GET /products/:id
   * @param req - Express request object containing product ID in params
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Promise<void>
   *
   * @example
   * // Response for found product
   * {
   *   "status": "success",
   *   "data": {
   *     "id": "product-id",
   *     "name": "Product Name",
   *     "description": "Product description",
   *     "price": 99.99,
   *     "category": "electronics",
   *     "stock": 100,
   *     "isActive": true,
   *     "isWishlistStatus": false
   *   },
   *   "message": "Product retrieved successfully"
   * }
   *
   * @example
   * // Response for not found product
   * {
   *   "status": "error",
   *   "message": "Product not found",
   *   "errors": [
   *     {
   *       "field": "id",
   *       "message": "Product with specified ID does not exist"
   *     }
   *   ]
   * }
   *
   * @returns {ApiResponse} API response conforming to ApiResponse interface
   */
  async getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = req.params.id;
      // The controller calls the use case, the use case handles caching internally
      const product = await this.getProductUseCase.execute(productId); // This use case returns Product | null

      if (product) {
        // Set data source header
        res.setHeader('X-Data-Source', 'mongo');

        // Product found, return 200 OK
        const response: ApiResponse<ProductProps> = {
          status: RESPONSE_STATUS.SUCCESS,
          data: product.toResponseProps(),
          message: PRODUCT_SUCCESS_MESSAGES.PRODUCT_RETRIEVED,
        };
        res.status(HTTP_STATUS.OK).json(response);
      } else {
        // Product not found, return 404 NOT FOUND
        const response: ApiResponse<never> = {
          // Using `never` as there's no data for not found
          status: RESPONSE_STATUS.ERROR,
          message: PRODUCT_ERROR_MESSAGES.NOT_FOUND,
          errors: [{ field: 'id', message: PRODUCT_ERROR_MESSAGES.PRODUCT_NOT_FOUND_BY_ID }],
        };
        res.status(HTTP_STATUS.NOT_FOUND).json(response);
      }
    } catch (error) {
      // Catch any unexpected errors from use case or other middleware
      next(error);
    }
  }

  /**
   * Lists products with optional filtering and pagination
   *
   * @route GET /products
   * @param req - Express request object containing query parameters
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Promise<void>
   *
   * @queryParam {string} [page=1] - Page number for pagination
   * @queryParam {string} [limit=10] - Number of items per page
   * @queryParam {string} [category] - Filter by product category
   * @queryParam {string} [search] - Search term for product name/description
   * @queryParam {boolean} [isActive] - Filter by active status
   * @queryParam {boolean} [isWishlistStatus] - Filter by wishlist status
   * @queryParam {string} [priceRange] - JSON string with min/max price range
   *
   * @example
   * // Query parameters
   * ?page=1&limit=20&category=electronics&search=phone&isActive=true&priceRange={"min":100,"max":500}
   *
   * @example
   * // Response
   * {
   *   "status": "success",
   *   "data": {
   *     "products": [...],
   *     "total": 150,
   *     "page": 1,
   *     "limit": 20,
   *     "totalPages": 8
   *   },
   *   "message": "Products retrieved successfully"
   * }
   */
  async listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate query parameters using Zod schema
      const validationResult = productFilterSchema.safeParse({ query: req.query });
      if (!validationResult.success) {
        throw new BadRequestError(validationResult.error.issues[0].message);
      }
      const validatedQuery = validationResult.data.query;

      const queryParams: ListProductsQuery = {
        page: validatedQuery.page.toString(),
        limit: validatedQuery.limit.toString(),
        category: validatedQuery.category,
        search: validatedQuery.search,
        isActive: validatedQuery.isActive ?? false,
        isWishlistStatus: validatedQuery.isWishlistStatus ?? false,
        priceRange: validatedQuery.priceRange,
      };
      const result = await this.listProductsUseCase.execute(queryParams);

      // Set data source header
      res.setHeader('X-Data-Source', 'mongo');

      const response: ApiResponse<ListProductsResponse> = {
        status: RESPONSE_STATUS.SUCCESS,
        data: {
          ...result,
          products: result.products.map((p) => p.toResponseProps()),
        },
        message: PRODUCT_SUCCESS_MESSAGES.PRODUCTS_RETRIEVED,
      };
      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Counts products with optional filtering
   *
   * @route GET /products/count
   * @param req - Express request object containing query parameters
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Promise<void> JSON response with success message for successful deletion, error response for failures
   *
   * @queryParam {string} [category] - Filter by product category
   * @queryParam {string} [search] - Search term for product name/description
   * @queryParam {boolean} [isActive] - Filter by active status
   * @queryParam {boolean} [isWishlistStatus] - Filter by wishlist status
   * @queryParam {string} [priceRange] - JSON string with min/max price range
   *
   * @example
   * // Query parameters
   * ?category=electronics&search=phone&isActive=true&priceRange={"min":100,"max":500}
   *
   * @example
   * // Response
   * {
   *   "status": "success",
   *   "data": 42,
   *   "message": "Products count retrieved successfully"
   * }
   */
  async countProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate query parameters using Zod schema (ignoring page/limit for count)
      const validationResult = productFilterSchema.safeParse({ query: req.query });
      if (!validationResult.success) {
        throw new BadRequestError(validationResult.error.issues[0].message);
      }
      const validatedQuery = validationResult.data.query;

      const queryParams: CountProductsQuery = {
        category: validatedQuery.category,
        search: validatedQuery.search,
        isActive: validatedQuery.isActive, // Only filter if explicitly provided
        isWishlistStatus: validatedQuery.isWishlistStatus, // Only filter if explicitly provided
        priceRange: validatedQuery.priceRange,
      };

      const count = await this.countProductsUseCase.execute(queryParams);

      // Set data source header
      res.setHeader('X-Data-Source', 'mongo');

      const response: ApiResponse<number> = {
        status: RESPONSE_STATUS.SUCCESS,
        data: count,
        message: PRODUCT_SUCCESS_MESSAGES.PRODUCTS_COUNT_RETRIEVED,
      };
      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates an existing product by ID
   *
   * @route PUT /products/:id
   * @param req - Express request object containing product ID in params and update data in body
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Promise<void>
   *
   * @example
   * // Request body (partial updates allowed)
   * {
   *   "name": "Updated Product Name",
   *   "price": 129.99,
   *   "stock": 50
   * }
   *
   * @throws Will pass validation errors to error middleware
   */
  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = req.params.id;
      const productData: UpdateProductDTO = req.body;
      const product = await this.updateProductUseCase.execute(productId, productData);
      if (product) {
        // Invalidate product caches after update
        const keys = await this.redisService.keys('products:*');
        await Promise.all(keys.map((key) => this.redisService.delete(key)));

        // Set data source header
        res.setHeader('X-Data-Source', 'mongo');

        const response: ApiResponse<ProductProps> = {
          status: RESPONSE_STATUS.SUCCESS,
          data: product.toResponseProps(),
          message: PRODUCT_SUCCESS_MESSAGES.PRODUCT_UPDATED,
        };
        res.status(HTTP_STATUS.OK).json(response);
      } else {
        const response: ApiResponse<never> = {
          status: RESPONSE_STATUS.ERROR,
          message: PRODUCT_ERROR_MESSAGES.NOT_FOUND,
          errors: [{ field: 'id', message: PRODUCT_ERROR_MESSAGES.PRODUCT_NOT_FOUND_BY_ID }],
        };
        res.status(HTTP_STATUS.NOT_FOUND).json(response);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes a product by ID
   *
   * @route DELETE /products/:id
   * @param req - Express request object containing product ID in params
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Promise<void>
   *
   * @example
   * // Successful deletion
   * {
   *   "status": "success",
   *   "message": "Product deleted successfully"
   * }
   *
   * @example
   * // Product not found
   * {
   *   "status": "error",
   *   "message": "Product not found"
   * }
   */
  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      this.logger.info({ productId: req.params.id }, 'Delete product request received');
      const productId = req.params.id;
      const success = await this.deleteProductUseCase.execute(productId);
      if (success) {
        // Invalidate product caches after deletion (don't fail if cache operations fail)
        try {
          const keys = await this.redisService.keys('products:*');
          await Promise.all(keys.map((key) => this.redisService.delete(key)));
        } catch (cacheError) {
          this.logger.warn(
            { cacheError: cacheError instanceof Error ? cacheError.message : String(cacheError) },
            'Cache invalidation failed after delete'
          );
        }

        // Set data source header
        res.setHeader('X-Data-Source', 'mongo');

        this.logger.info({ productId }, 'Sending delete success response');
        const response = {
          status: RESPONSE_STATUS.SUCCESS,
          message: PRODUCT_SUCCESS_MESSAGES.PRODUCT_DELETED,
        };
        res.status(HTTP_STATUS.OK).json(response);
        return;
      } else {
        const response: ApiResponse<never> = {
          status: RESPONSE_STATUS.ERROR,
          message: PRODUCT_ERROR_MESSAGES.NOT_FOUND,
        };
        res.status(HTTP_STATUS.NOT_FOUND).json(response);
        return;
      }
    } catch (error) {
      this.logger.error(
        { error: error instanceof Error ? error.message : String(error), productId: req.params.id },
        'Delete product error'
      );
      next(error);
    }
  }

  /**
   * Retrieves all products in wishlist
   *
   * @route GET /products/wishlist
   * @param req - Express request object containing query parameters
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Promise<void>
   *
   * @queryParam {string} [page=1] - Page number for pagination
   * @queryParam {string} [limit=10] - Number of items per page
   *
   * @example
   * // Query parameters
   * ?page=1&limit=20
   *
   * @example
   * // Response
   * {
   *   "status": "success",
   *   "data": {
   *     "products": [...],
   *     "total": 15,
   *     "page": 1,
   *     "limit": 20,
   *     "totalPages": 1
   *   },
   *   "message": "Wishlist products retrieved successfully"
   * }
   */
  async getWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams: ListProductsQuery = {
        page: safeParseString(req.query.page),
        limit: safeParseString(req.query.limit),
        isWishlistStatus: true, // Filter specifically for wishlist products
      };
      const result = await this.listProductsUseCase.execute(queryParams);

      // Set data source header
      res.setHeader('X-Data-Source', 'mongo');

      const response: ApiResponse<ListProductsResponse> = {
        status: RESPONSE_STATUS.SUCCESS,
        data: {
          ...result,
          products: result.products.map((p) => p.toResponseProps()),
        },
        message: PRODUCT_SUCCESS_MESSAGES.WISHLIST_RETRIEVED,
      };
      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggles a product's wishlist status
   *
   * @route PATCH /products/:id/wishlist
   * @param req - Express request object containing product ID in params and wishlist status in body
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns Promise<void>
   *
   * @example
   * // Request body
   * {
   *   "isWishlistStatus": true
   * }
   *
   * @example
   * // Response for successful toggle
   * {
   *   "status": "success",
   *   "data": {
   *     "id": "product-id",
   *     "name": "Product Name",
   *     "description": "Product description",
   *     "price": 99.99,
   *     "category": "electronics",
   *     "stock": 100,
   *     "isActive": true,
   *     "isWishlistStatus": true,
   *     "wishlistCount": 1
   *   },
   *   "message": "Product wishlist status updated successfully"
   * }
   *
   * @example
   * // Product not found
   * {
   *   "status": "error",
   *   "message": "Product not found",
   *   "errors": [
   *     {
   *       "field": "id",
   *       "message": "Product with specified ID does not exist"
   *     }
   *   ]
   * }
   *
   * @throws Will pass validation errors to error middleware
   */
  async toggleWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = req.params.id;
      const wishlistData: ToggleWishlistDTO = req.body;
      const product = await this.toggleWishlistUseCase.execute(productId, wishlistData);

      // Invalidate product caches after wishlist toggle
      const keys = await this.redisService.keys('products:*');
      await Promise.all(keys.map((key) => this.redisService.delete(key)));

      // Set data source header
      res.setHeader('X-Data-Source', 'mongo');

      const response: ApiResponse<ProductProps> = {
        status: RESPONSE_STATUS.SUCCESS,
        data: product.toResponseProps(),
        message: PRODUCT_SUCCESS_MESSAGES.WISHLIST_TOGGLED,
      };
      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
