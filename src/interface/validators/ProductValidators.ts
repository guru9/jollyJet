import z from 'zod';

/**
 * Validation schema for createing a new product.
 * Ensures all required fields are present and correctly formatted.
 * @property {string} name  - Name of the product (3-30 characters).
 * @property {string} description - Description of the product (minimum 10 characters).
 * @property {number} price - Price of the product (non-negative integer).
 * @property {number} stock - Stock quantity (non-negative integer).
 * @property {string} category - Category of the product (required).
 * @property {string[]} images - Array of image URLs (optional).
 * @property {boolean} isActive - Product active status (optional).
 * @property {boolean} isWishlistStatus - Wishlist status (optional).
 */
export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters long')
      .max(30, 'Name must be at most 30 characters long'),
    description: z.string().min(10, 'Description must be at least 10 characters long'),
    price: z.number().int().min(0, 'Price must be a non-negative number'),
    stock: z.number().int().min(0, 'Stock must be non-negative number'),
    category: z.string().min(1, 'Category is required'),
    images: z.array(z.string().url()).optional(),
    isActive: z.boolean().optional(),
    isWishlistStatus: z.boolean().optional(),
  }),
});

/**
 * Validation schema for updating an existing product.
 * All fields are optional but must adhere to the same validation rules as creation.
 * @property {string} name  - Name of the product (3-30 characters).
 * @property {string} description - Description of the product (minimum 10 characters).
 *  @property {number} price - Price of the product (non-negative integer).
 * @property {number} stock - Stock quantity (non-negative integer).
 * @property {string} category - Category of the product.
 * @property {string[]} images - Array of image URLs (optional).
 * @property {boolean} isActive - Product active status (optional).
 * @property {boolean} isWishlistStatus - Wishlist status (optional).
 */
export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    price: z.number().int().min(0).optional(),
    stock: z.number().int().min(0).optional(),
    category: z.string().min(1).optional(),
    images: z.array(z.string().url()).optional(),
    isActive: z.boolean().optional(),
    isWishlistStatus: z.boolean().optional(),
  }),
});

/**
 * Validation schema for retrieving a product by ID.
 * Ensures the productId is a non-empty string.
 * @property {string} productId - ID of the product.
 */
export const productIdSchema = z.object({
  params: z.object({
    productId: z.string().min(1, 'Product ID is required'),
  }),
});

/**
 * Validation schema for filtering products.
 * Allows filtering by various optional criteria.
 * @property {string} category - Filter by product category (optional).
 * @property {boolean} isActive - Filter by active status (optional).
 * @property {boolean} isWishlistStatus - Filter by wishlist status (optional).
 * @property {string} search - Search by product name or description (optional).
 * @property {{ min: number; max: number }} priceRange - Filter by price range (optional).
 */
export const productFilterSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    isActive: z.boolean().optional(),
    isWishlistStatus: z.boolean().optional(),
    search: z.string().optional(),
    priceRange: z
      .object({
        min: z.number().int().min(0, 'Minimum price must be a non-negative number'),
        max: z.number().int().min(0, 'Maximum price must be a non-negative number'),
      })
      .optional(),
  }),
});

/**
 * Validation schema for toggling the wishlist status of a product.
 * Ensures the isWishlistStatus field is a boolean.
 * @property {boolean} isWishlistStatus - Wishlist status to be set.
 * @property {string} productId - ID of the product to update.
 */
export const toggleWishlistStatusSchema = z.object({
  body: z.object({
    isWishlistStatus: z.boolean(),
  }),
  params: z.object({
    productId: z.string().min(1, 'Product ID is required'),
  }),
});

/**
 * Validation schema for retrieving a products with pagination.
 * Ensures skip and limit are non-negative integers.
 * @property {number} skip - Number of records to skip (optional).
 * @property {number} limit - Maximum number of records to return (optional).
 */
export const paginationSchema = z.object({
  query: z.object({
    skip: z.number().int().min(0).optional(),
    limit: z.number().int().min(1).optional(),
  }),
});



