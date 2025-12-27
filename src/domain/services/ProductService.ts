import { Product, ProductProps } from '../entities/Product';

export class ProductService {
  // Method to check product availability
  public isAvailable(product: Product): boolean {
    return product.toProps().isActive && product.toProps().stock > 0;
  }

  // Method to check valid pricerange for the products
  public isValidPriceRange(priceRange?: { min: number; max: number }): boolean {
    return !!priceRange && priceRange.min >= 0 && priceRange.max >= 0;
  }

  // Method to update product stock with validation
  public updateStock(product: Product, quantity: number): Product {
    // Create updated product with all required properties preserved
    const currentStock = product.toProps().stock;
    const newStock = currentStock + quantity;

    if (newStock < 0) throw new Error('Insufficient stock.'); // Prevent negative stock

    // Use the toProps() method to get all properties as an object
    const updatedProductProps: ProductProps = {
      ...product.toProps(),
      stock: newStock,
      updatedAt: new Date(),
    };

    return Product.createProduct(updatedProductProps);
  }

  // Method to update product price with validation
  public updatePrice(product: Product, newPrice: number): Product {
    if (newPrice < 0) throw new Error('Price cannot be negative.');

    // Use the toProps() method to get all properties as an object
    const updatedProductProps: ProductProps = {
      ...product.toProps(),
      price: newPrice,
      updatedAt: new Date(),
    };

    return Product.createProduct(updatedProductProps);
  }

  //Method to Updates multiple product details at once
  public updateProductDetails(
    product: Product,
    details: Partial<Omit<ProductProps, 'createdAt' | 'updatedAt'>>
  ): Product {
    // Use the toProps() method to get all properties as an object
    const updatedProductProps: ProductProps = {
      ...product.toProps(),
      ...details,
      updatedAt: new Date(),
    };

    return Product.createProduct(updatedProductProps);
  }

  // Updates product wishlist status with validation
  public updateWishlistStatus(product: Product, isWishlistStatus: boolean): Product {
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
  }
}



