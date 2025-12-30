import { PRODUCT_VALIDATION_MESSAGES } from '@/shared';
import z from 'zod';

/**
 * Validation schema for createing a new product.
 * Ensures all required fields are present and correctly formatted.
 * @property {string} name  - Name of the product (3-30 characters).
 * @property {string} description - Description of the product (minimum 10 characters).
 *  @property {number} price - Price of the product (non-negative number).
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
      .min(3, PRODUCT_VALIDATION_MESSAGES.NAME_MIN_LENGTH)
      .max(30, PRODUCT_VALIDATION_MESSAGES.NAME_MAX_LENGTH),
    description: z.string().min(10, PRODUCT_VALIDATION_MESSAGES.DESCRIPTION_MIN_LENGTH),
    price: z.number().min(0, PRODUCT_VALIDATION_MESSAGES.PRICE_MIN),
    stock: z.number().int().min(0, PRODUCT_VALIDATION_MESSAGES.STOCK_MIN),
    category: z.string().min(1, PRODUCT_VALIDATION_MESSAGES.CATEGORY_REQUIRED),
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
 * @property {number} price - Price of the product (non-negative number).
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
    price: z.number().min(0).optional(),
    stock: z.number().int().min(0).optional(),
    category: z.string().min(1).optional(),
    images: z.array(z.string().url()).optional(),
    isActive: z.boolean().optional(),
    isWishlistStatus: z.boolean().optional(),
  }),
});

/**
 * Validation schema for retrieving a product by ID.
 * Ensures the id is a non-empty string.
 * @property {string} id - ID of the product.
 */
export const productIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, PRODUCT_VALIDATION_MESSAGES.PRODUCT_ID_REQUIRED),
  }),
});

/**
 * Validation schema for filtering products.
 * Allows filtering by various optional criteria.
 * @property {string} category - Filter by product category (optional).
 * @property {boolean} isActive - Filter by active status (optional).
 * @property {boolean} isWishlistStatus - Filter by wishlist status (optional).
 * @property {string} search - Search by product name or description (optional).
 * @property {string} priceRange - JSON string for price range filter (optional).
 * @property {string} page - Page number for pagination (optional).
 * @property {string} limit - Number of items per page (optional).
 */
export const productFilterSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    isActive: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((val) => {
        if (typeof val === 'string') return val === 'true';
        return val;
      }),
    isWishlistStatus: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((val) => {
        if (typeof val === 'string') return val === 'true';
        return val;
      }),
    search: z.string().optional(),
    priceRange: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          try {
            const parsed = JSON.parse(val);
            return (
              typeof parsed === 'object' &&
              parsed !== null &&
              typeof parsed.min === 'number' &&
              typeof parsed.max === 'number' &&
              parsed.min >= 0 &&
              parsed.max >= 0 &&
              parsed.min <= parsed.max
            );
          } catch {
            return false;
          }
        },
        {
          message: PRODUCT_VALIDATION_MESSAGES.PRICE_RANGE_INVALID,
        }
      )
      .transform((val) => (val ? JSON.parse(val) : undefined)),
    page: z
      .string()
      .optional()
      .refine((val) => !val || (!isNaN(parseInt(val)) && parseInt(val) > 0), {
        message: PRODUCT_VALIDATION_MESSAGES.PAGE_INVALID,
      })
      .transform((val) => (val ? parseInt(val) : 1)),
    limit: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(parseInt(val)) && parseInt(val) > 0 && parseInt(val) <= 100),
        {
          message: 'Limit must be a positive integer between 1 and 100',
        }
      )
      .transform((val) => (val ? parseInt(val) : 10)),
  }),
});

/**
 * Validation schema for toggling the wishlist status of a product.
 * Ensures the isWishlistStatus field is a boolean.
 * @property {boolean} isWishlistStatus - Wishlist status to be set.
 * @property {string} id - ID of the product to update.
 */
export const toggleWishlistStatusSchema = z.object({
  body: z.object({
    isWishlistStatus: z.boolean(),
  }),
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
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
