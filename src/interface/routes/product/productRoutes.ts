import { ProductController } from '@/interface/controllers';
import { redisCacheHandler } from '@/interface/middlewares';
import {
  createProductSchema,
  productIdSchema,
  toggleWishlistStatusSchema,
  updateProductSchema,
} from '@/interface/validators';
import { REDIS_CONFIG, validateRequest } from '@/shared';
import { Router } from 'express';
import { container } from 'tsyringe';

/**
 * Product Routes Factory
 *
 * This factory creates and configures the Express router for product-related endpoints.
 * It integrates validation middleware, caching layers, and controller logic.
 *
 * Caching Strategy:
 * - List/Count: Short-to-medium TTL with background refresh to ensure high availability.
 * - Single Product: Longer TTL as details change less frequently.
 * - Wishlist: Short TTL as it's more dynamic.
 *
 * @returns {Router} Configured Express Router
 */
const createProductRoutes = (): Router => {
  const router = Router();
  const productController = container.resolve(ProductController);

  /**
   * @openapi
   * tags:
   *   name: Products
   *   description: Product management endpoints including CRUD and wishlist operations
   */

  // ==========================================
  // READ OPERATIONS (Cached)
  // ==========================================

  /**
   * Get all products with optional filtering
   * Uses Redis cache middleware with background refresh for improved performance.
   * Caches results based on query parameters (page, limit, category, etc.)
   *
   * Caching Configuration:
   * - TTL: REDIS_CONFIG.TTL.PRODUCT (Standard 24-hour duration)
   * - Background Refresh: Enabled to update cache in background on hit
   * - Consistency Check: Enabled to detect potentially stale data
   *
   * @openapi
   * /api/products:
   *   get:
   *     tags: [Products]
   *     summary: Get all products with optional filtering
   *     description: Retrieve paginated list of products with Redis caching for optimal performance
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Number of products per page
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by category
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search in product name and description
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *         description: Filter by active status
   *       - in: query
   *         name: isWishlistStatus
   *         schema:
   *           type: boolean
   *         description: Filter by wishlist status
   *     responses:
   *       200:
   *         $ref: '#/components/responses/CacheResponse'
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 results:
   *                   type: integer
   *                   example: 10
   *                 total:
   *                   type: integer
   *                   example: 25
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Product'
   *                 cacheInfo:
   *                   $ref: '#/components/schemas/CacheInfo'
   */
  router.get(
    '/',
    redisCacheHandler(Number(REDIS_CONFIG.TTL.PRODUCT), {
      backgroundRefresh: true,
      consistencyCheck: true,
    }),
    productController.listProducts.bind(productController)
  );

  /**
   * Count products with optional filtering
   * Useful for pagination totals without fetching full data.
   *
   * Caching Configuration:
   * - TTL: REDIS_CONFIG.TTL.SHORT (Short-lived 1-hour duration)
   * - Background Refresh: Enabled to keeping count accurate in background
   *
   * @openapi
   * /api/products/count:
   *   get:
   *     tags: [Products]
   *     summary: Count products with optional filtering
   *     parameters:
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by category
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search in product name and description
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *         description: Filter by active status
   *       - in: query
   *         name: isWishlistStatus
   *         schema:
   *           type: boolean
   *         description: Filter by wishlist status
   *       - in: query
   *         name: priceRange
   *         schema:
   *           type: string
   *         description: JSON string with min/max price range
   *     responses:
   *       200:
   *         $ref: '#/components/responses/CacheResponse'
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   type: integer
   *                   example: 42
   *                 message:
   *                   type: string
   *                   example: "Products count retrieved successfully"
   *                 cacheInfo:
   *                   $ref: '#/components/schemas/CacheInfo'
   */
  router.get(
    '/count',
    redisCacheHandler(Number(REDIS_CONFIG.TTL.SHORT), {
      backgroundRefresh: true,
    }),
    productController.countProducts.bind(productController)
  );

  /**
   * Get all products currently in the wishlist
   * Highly dynamic, so uses a shorter TTL.
   *
   * Caching Configuration:
   * - TTL: REDIS_CONFIG.TTL.SHORT (Short-lived 1-hour duration)
   * - Background Refresh: Enabled for responsive wishlist retrieval
   *
   * @openapi
   * /api/products/wishlist:
   *   get:
   *     tags: [Products]
   *     summary: Get all products in wishlist
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Number of products per page
   *     responses:
   *       200:
   *         $ref: '#/components/responses/ProductListResponse'
   */
  router.get(
    '/wishlist',
    redisCacheHandler(Number(REDIS_CONFIG.TTL.SHORT), {
      backgroundRefresh: true,
    }),
    productController.getWishlist.bind(productController)
  );

  /**
   * Get a single product detail by its ID
   * Includes validation of the ID parameter and ID-specific caching.
   *
   * Caching Configuration:
   * - TTL: REDIS_CONFIG.TTL.PRODUCT (Standard 24-hour duration)
   * - Background Refresh: Enabled for fast single product lookups
   * - Consistency Check: Enabled to ensure product details are up to date
   *
   * @openapi
   * /api/products/{id}:
   *   get:
   *     tags: [Products]
   *     summary: Get a product by ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Product ID (UUID or MongoDB ObjectId depending on implementation)
   *     responses:
   *       200:
   *         $ref: '#/components/responses/CacheResponse'
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   $ref: '#/components/schemas/Product'
   *                 cacheInfo:
   *                   $ref: '#/components/schemas/CacheInfo'
   *       404:
   *         description: Product not found
   */
  router.get(
    '/:id',
    validateRequest(productIdSchema),
    redisCacheHandler(Number(REDIS_CONFIG.TTL.PRODUCT), {
      backgroundRefresh: true,
      consistencyCheck: true,
    }),
    productController.getProduct.bind(productController)
  );

  // ==========================================
  // WRITE OPERATIONS
  // ==========================================

  /**
   * Create a new product entry
   * Validates the request body against the createProductSchema.
   *
   * @openapi
   * /api/products:
   *   post:
   *     tags: [Products]
   *     summary: Create a new product
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - description
   *               - price
   *               - stock
   *               - category
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 3
   *                 example: "Wireless Headphones"
   *               description:
   *                 type: string
   *                 minLength: 10
   *                 example: "High-quality wireless headphones with noise cancellation"
   *               price:
   *                 type: number
   *                 minimum: 0
   *                 example: 199.99
   *               stock:
   *                 type: integer
   *                 minimum: 0
   *                 example: 50
   *               category:
   *                 type: string
   *                 example: "Electronics"
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: uri
   *                 example: ["https://example.com/image1.jpg"]
   *               isActive:
   *                 type: boolean
   *                 example: true
   *     responses:
   *       201:
   *         description: Product created successfully
   *       400:
   *         description: Validation error
   */
  router.post(
    '/',
    validateRequest(createProductSchema),
    productController.createProduct.bind(productController)
  );

  /**
   * Update an existing product
   * Supports partial updates based on the updateProductSchema.
   *
   * @openapi
   * /api/products/{id}:
   *   put:
   *     tags: [Products]
   *     summary: Update a product
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Product ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               price:
   *                 type: number
   *               stock:
   *                 type: integer
   *               category:
   *                 type: string
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *               isActive:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Product updated successfully
   *       404:
   *         description: Product not found
   */
  router.put(
    '/:id',
    validateRequest(updateProductSchema),
    productController.updateProduct.bind(productController)
  );

  /**
   * Toggle the wishlist status of a product
   * PATCH preferred for partial updates of state.
   *
   * @openapi
   * /api/products/{id}/wishlist:
   *   patch:
   *     tags: [Products]
   *     summary: Toggle product wishlist status
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Product ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - isWishlistStatus
   *             properties:
   *               isWishlistStatus:
   *                 type: boolean
   *                 example: true
   *     responses:
   *       200:
   *         description: Product wishlist status updated successfully
   *       404:
   *         description: Product not found
   */
  router.patch(
    '/:id/wishlist',
    validateRequest(toggleWishlistStatusSchema),
    productController.toggleWishlist.bind(productController)
  );

  /**
   * Delete a product record
   * Permanent deletion of the specified product.
   *
   * @openapi
   * /api/products/{id}:
   *   delete:
   *     tags: [Products]
   *     summary: Delete a product
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Product ID
   *     responses:
   *       200:
   *         description: Product deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   type: null
   *                   example: null
   *                 message:
   *                   type: string
   *                   example: "Product deleted successfully"
   *       404:
   *         description: Product not found
   */
  router.delete(
    '/:id',
    validateRequest(productIdSchema),
    productController.deleteProduct.bind(productController)
  );

  return router;
};

export default createProductRoutes;
