import { Router } from 'express';
import { container } from 'tsyringe';
import { validateRequest } from '../../shared/utils';
import { ProductController } from '../controllers/ProductController';
import {
  createProductSchema,
  productIdSchema,
  toggleWishlistStatusSchema,
  updateProductSchema,
} from '../validators/ProductValidators';

const createProductRoutes = (): Router => {
  const router = Router();
  const productController = container.resolve(ProductController);

  /**
   * @openapi
   * tags:
   *   name: Products
   *   description: Product management endpoints
   */

  /**
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
   *       400:
   *         description: Validation error
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/',
    validateRequest(createProductSchema),
    productController.createProduct.bind(productController)
  );

  /**
   * @openapi
   * /api/products:
   *   get:
   *     tags: [Products]
   *     summary: Get all products with optional filtering
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
   *         description: List of products
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
   */
  router.get('/', productController.listProducts.bind(productController));

  /**
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
   *         description: Product count retrieved successfully
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
   */
  router.get('/count', productController.countProducts.bind(productController));

  /**
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
   *         description: Product ID
   *     responses:
   *       200:
   *         description: Product found
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
   *       404:
   *         description: Product not found
   */
  router.get(
    '/:id',
    validateRequest(productIdSchema),
    productController.getProduct.bind(productController)
  );

  /**
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
   *                 minLength: 3
   *                 example: "Updated Product Name"
   *               description:
   *                 type: string
   *                 minLength: 10
   *                 example: "Updated product description"
   *               price:
   *                 type: number
   *                 minimum: 0
   *                 example: 149.99
   *               stock:
   *                 type: integer
   *                 minimum: 0
   *                 example: 75
   *               category:
   *                 type: string
   *                 example: "Electronics"
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: uri
   *                 example: ["https://example.com/updated-image.jpg"]
   *               isActive:
   *                 type: boolean
   *                 example: true
   *     responses:
   *       200:
   *         description: Product updated successfully
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
   *       404:
   *         description: Product not found
   *       400:
   *         description: Validation error
   */
  router.put(
    '/:id',
    validateRequest(updateProductSchema),
    productController.updateProduct.bind(productController)
  );

  /**
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
   *       204:
   *         description: Product deleted successfully
   *       404:
   *         description: Product not found
   */
  router.delete(
    '/:id',
    validateRequest(productIdSchema),
    productController.deleteProduct.bind(productController)
  );

  /**
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
   *         description: List of wishlist products
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
   */
  router.get('/wishlist', productController.getWishlist.bind(productController));

  /**
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
   *       404:
   *         description: Product not found
   *       400:
   *         description: Validation error
   */
  router.patch(
    '/:id/wishlist',
    validateRequest(toggleWishlistStatusSchema),
    productController.toggleWishlist.bind(productController)
  );

  return router;
};

export default createProductRoutes;
