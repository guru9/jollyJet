import { Product } from '@/domain/entities';

describe('Product', () => {
  describe('isWishlistStatus property', () => {
    it('should be accessible via getter', () => {
      const productProps = {
        name: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        stock: 100,
        category: 'Test Category',
        isWishlistStatus: true,
        isActive: true,
      };

      const product = new Product(productProps);

      // Test that the getter works
      const productData = product.toProps();
      expect(productData.isWishlistStatus).toBe(true);
    });

    it('should return the correct value from props', () => {
      const productProps = {
        name: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        stock: 100,
        category: 'Test Category',
        isWishlistStatus: false,
        isActive: true,
      };

      const product = new Product(productProps);

      // Test that the getter returns the correct value
      const productData = product.toProps();
      expect(productData.isWishlistStatus).toBe(false);
    });

    it('should default to false when not provided', () => {
      const productProps = {
        name: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        stock: 100,
        category: 'Test Category',
        isActive: true,
      };

      const product = new Product(productProps);

      // Test that the default value is false
      const productData = product.toProps();
      expect(productData.isWishlistStatus).toBe(false);
    });
  });

  describe('wishlistCount property', () => {
    it('should be accessible via getter', () => {
      const productProps = {
        name: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        stock: 100,
        category: 'Test Category',
        isWishlistStatus: false,
        wishlistCount: 5,
        isActive: true,
      };

      const product = new Product(productProps);

      // Test that the getter works
      const productData = product.toProps();
      expect(productData.wishlistCount).toBe(5);
    });

    it('should return default value if not provided', () => {
      const productProps = {
        name: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        stock: 100,
        category: 'Test Category',
        isWishlistStatus: false,
        isActive: true,
      };

      const product = new Product(productProps);

      // Test that the getter returns default value (0) if not provided
      const productData = product.toProps();
      expect(productData.wishlistCount).toBe(0);
    });
  });
});
