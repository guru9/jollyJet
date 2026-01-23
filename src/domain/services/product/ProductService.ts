import { Product, ProductProps } from '@/domain/entities';
import { BadRequestError, PRODUCT_VALIDATION_MESSAGES } from '@/shared';

export class ProductService {
  // Method to check product availability
  public isAvailable(product: Product): boolean {
    return product.getEffectiveStock() > 0;
  }

  // Method to check valid pricerange for the products
  public isValidPriceRange(priceRange?: { min: number; max: number }): boolean {
    return !!priceRange && priceRange.min >= 0 && priceRange.max >= 0;
  }

  // Method to update product stock with validation
  public updateStock(product: Product, quantity: number): Product {
    try {
      // Create updated product with all required properties preserved
      const currentStock = product.toProps().stock;
      const newStock = currentStock + quantity;

      if (newStock < 0) throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.INSUFFICIENT_STOCK); // Prevent negative stock

      // Use the toProps() method to get all properties as an object
      const updatedProductProps: ProductProps = {
        ...product.toProps(),
        stock: newStock,
        updatedAt: new Date(),
      };

      return Product.createProduct(updatedProductProps);
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.INVALID_STOCK_UPDATE);
    }
  }

  // Method to update product price with validation
  public updatePrice(product: Product, newPrice: number): Product {
    try {
      if (newPrice < 0) throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.PRICE_NEGATIVE);

      // Use the toProps() method to get all properties as an object
      const updatedProductProps: ProductProps = {
        ...product.toProps(),
        price: newPrice,
        updatedAt: new Date(),
      };

      return Product.createProduct(updatedProductProps);
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.INVALID_PRICE_UPDATE);
    }
  }

  //Method to Updates multiple product details at once
  public updateProductDetails(
    product: Product,
    details: Partial<Omit<ProductProps, 'createdAt' | 'updatedAt'>>
  ): Product {
    try {
      // Use the toProps() method to get all properties as an object
      const updatedProductProps: ProductProps = {
        ...product.toProps(),
        ...details,
        updatedAt: new Date(),
      };

      return Product.createProduct(updatedProductProps);
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.INVALID_DETAILS_UPDATE);
    }
  }

  // Updates product wishlist status with validation
  public updateWishlistStatus(product: Product, isWishlistStatus: boolean): Product {
    try {
      const currentWishlistCount = product.toProps().wishlistCount ?? 0;
      const newWishlistCount = isWishlistStatus
        ? currentWishlistCount + 1
        : Math.max(0, currentWishlistCount - 1); // Prevent negative wishlist count
      // Use the toProps() method to get all properties as an object
      const updatedProductProps: ProductProps = {
        ...product.toProps(),
        isWishlistStatus: isWishlistStatus,
        wishlistCount: newWishlistCount,
        updatedAt: new Date(),
      };

      return Product.createProduct(updatedProductProps);
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.INVALID_WISHLIST_UPDATE);
    }
  }
}
