/**
 * Product Validators Unit Tests
 * Tests for Zod-based validation schemas in ProductValidators.ts
 */

import {
  createProductSchema,
  paginationSchema,
  productFilterSchema,
  productIdSchema,
  toggleWishlistStatusSchema,
  updateProductSchema,
} from '../../../interface/validators/ProductValidators';

describe('Product Validators - Unit Tests', () => {
  describe('createProductSchema', () => {
    it('should validate valid product creation data', () => {
      const validData = {
        body: {
          name: 'Test Product',
          description: 'Test description with more than 10 characters',
          price: 99,
          stock: 10,
          category: 'Test',
        },
      };

      const result = createProductSchema.safeParse(validData);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject product with name too short', () => {
      const invalidData = {
        body: {
          name: 'Te', // Too short (min 3 chars)
          description: 'Test description with more than 10 characters',
          price: 99,
          stock: 10,
          category: 'Test',
        },
      };

      const result = createProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject product with description too short', () => {
      const invalidData = {
        body: {
          name: 'Test Product',
          description: 'Short', // Too short (min 10 chars)
          price: 99,
          stock: 10,
          category: 'Test',
        },
      };

      const result = createProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject product with negative price', () => {
      const invalidData = {
        body: {
          name: 'Test Product',
          description: 'Test description with more than 10 characters',
          price: -1, // Negative
          stock: 10,
          category: 'Test',
        },
      };

      const result = createProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject product with negative stock', () => {
      const invalidData = {
        body: {
          name: 'Test Product',
          description: 'Test description with more than 10 characters',
          price: 99,
          stock: -1, // Negative
          category: 'Test',
        },
      };

      const result = createProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject product with empty category', () => {
      const invalidData = {
        body: {
          name: 'Test Product',
          description: 'Test description with more than 10 characters',
          price: 99,
          stock: 10,
          category: '', // Empty
        },
      };

      const result = createProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should accept optional fields when provided', () => {
      const validDataWithOptionals = {
        body: {
          name: 'Test Product',
          description: 'Test description with more than 10 characters',
          price: 99,
          stock: 10,
          category: 'Test',
          images: ['https://example.com/image.jpg'],
          isActive: true,
          isWishlistStatus: false,
        },
      };

      const result = createProductSchema.safeParse(validDataWithOptionals);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject invalid image URLs', () => {
      const invalidData = {
        body: {
          name: 'Test Product',
          description: 'Test description with more than 10 characters',
          price: 99,
          stock: 10,
          category: 'Test',
          images: ['not-a-valid-url'], // Invalid URL
        },
      };

      const result = createProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateProductSchema', () => {
    it('should allow partial updates with valid data', () => {
      const partialData = {
        body: {
          price: 89,
        },
      };

      const result = updateProductSchema.safeParse(partialData);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should allow updating multiple fields', () => {
      const multiFieldData = {
        body: {
          name: 'Updated Product',
          price: 79,
          stock: 5,
        },
      };

      const result = updateProductSchema.safeParse(multiFieldData);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject invalid field values when provided', () => {
      const invalidData = {
        body: {
          name: 'Te', // Too short
          price: -1, // Negative
        },
      };

      const result = updateProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should accept empty body for no updates', () => {
      const emptyData = {
        body: {},
      };

      const result = updateProductSchema.safeParse(emptyData);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('productIdSchema', () => {
    it('should validate valid product ID', () => {
      const validId = {
        params: {
          id: '507f1f77bcf86cd799439011',
        },
      };

      const result = productIdSchema.safeParse(validId);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject empty product ID', () => {
      const invalidId = {
        params: {
          id: '',
        },
      };

      const result = productIdSchema.safeParse(invalidId);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject missing product ID', () => {
      const invalidId = {
        params: {},
      };

      const result = productIdSchema.safeParse(invalidId);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('productFilterSchema', () => {
    it('should validate filter with all optional fields', () => {
      const validFilter = {
        query: {
          category: 'Electronics',
          isActive: true,
          isWishlistStatus: true,
          search: 'wireless',
          priceRange: '{"min":0,"max":1000}',
        },
      };

      const result = productFilterSchema.safeParse(validFilter);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should validate filter with only some fields', () => {
      const partialFilter = {
        query: {
          category: 'Electronics',
          isWishlistStatus: true,
        },
      };

      const result = productFilterSchema.safeParse(partialFilter);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should validate empty filter', () => {
      const emptyFilter = {
        query: {},
      };

      const result = productFilterSchema.safeParse(emptyFilter);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject invalid price range', () => {
      const invalidFilter = {
        query: {
          priceRange: {
            min: -1, // Negative
            max: 1000,
          },
        },
      };

      const result = productFilterSchema.safeParse(invalidFilter);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('toggleWishlistStatusSchema', () => {
    it('should validate wishlist status update with valid data', () => {
      const validWishlist = {
        body: {
          isWishlistStatus: true,
        },
        params: {
          id: '507f1f77bcf86cd799439011',
        },
      };

      const result = toggleWishlistStatusSchema.safeParse(validWishlist);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject missing product ID in wishlist update', () => {
      const invalidWishlist = {
        body: {
          isWishlistStatus: true,
        },
        params: {},
      };

      const result = toggleWishlistStatusSchema.safeParse(invalidWishlist);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject missing isWishlistStatus field', () => {
      const invalidWishlist = {
        body: {},
        params: {
          id: '507f1f77bcf86cd799439011',
        },
      };

      const result = toggleWishlistStatusSchema.safeParse(invalidWishlist);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('paginationSchema', () => {
    it('should validate pagination parameters', () => {
      const validPagination = {
        query: {
          skip: 10,
          limit: 20,
        },
      };

      const result = paginationSchema.safeParse(validPagination);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should validate pagination with only skip', () => {
      const partialPagination = {
        query: {
          skip: 5,
        },
      };

      const result = paginationSchema.safeParse(partialPagination);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should validate pagination with only limit', () => {
      const partialPagination = {
        query: {
          limit: 10,
        },
      };

      const result = paginationSchema.safeParse(partialPagination);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should validate empty pagination', () => {
      const emptyPagination = {
        query: {},
      };

      const result = paginationSchema.safeParse(emptyPagination);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject negative skip value', () => {
      const invalidPagination = {
        query: {
          skip: -1, // Negative
          limit: 10,
        },
      };

      const result = paginationSchema.safeParse(invalidPagination);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject zero limit value', () => {
      const invalidPagination = {
        query: {
          skip: 0,
          limit: 0, // Zero
        },
      };

      const result = paginationSchema.safeParse(invalidPagination);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
