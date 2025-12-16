import { Product } from '../../../domain/entities/Product';

describe('Product', () => {
  describe('isInWishlist property', () => {
    it('should be accessible via getter', () => {
      const productProps = {
        name: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        stock: 100,
        category: 'Test Category',
        isInWishlist: true,
      };

      const product = new Product(productProps);

      // Test that the getter works
      expect(product.isInWishlist).toBe(true);
    });

    it('should return the correct value from props', () => {
      const productProps = {
        name: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        stock: 100,
        category: 'Test Category',
        isInWishlist: false,
      };

      const product = new Product(productProps);

      // Test that the getter returns the correct value
      expect(product.isInWishlist).toBe(false);
      expect(product.isInWishlist).toBe(false);
    });

    it('should work with createWithWishlistStatus factory method', () => {
      const productProps = {
        name: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        stock: 100,
        category: 'Test Category',
        isInWishlist: false,
      };

      const product = Product.createWithWishlistStatus(productProps, true);

      // Test that the factory method works with the getter
      expect(product.isInWishlist).toBe(true);
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
        isInWishlist: false,
        wishlistCount: 5,
      };

      const product = new Product(productProps);

      // Test that the getter works
      expect(product.wishlistCount).toBe(5);
    });

    it('should return default value if not provided', () => {
      const productProps = {
        name: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        stock: 100,
        category: 'Test Category',
        isInWishlist: false,
      };

      const product = new Product(productProps);

      // Test that the getter returns default value (0) if not provided
      expect(product.wishlistCount).toBe(0);
    });
  });
});
