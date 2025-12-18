import { injectable } from 'tsyringe';
import { Product, ProductProps } from '../entities/Product';

@injectable()
export class ProductService {
  constructor(
    private product: Product,
    private stock: number
  ) {
    this.stock = this.product.toProps().stock; // Initialize stock from product props
  }

  // Method to update product stock with validation
  public updateStock(product: Product, quantity: number): Product {
    // Create updated product with all required properties preserved
    const newStock = quantity < 0 ? this.stock + 0 : this.stock + quantity;

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
  public updateWishlistStatus(product: Product, isInWishlist: boolean): Product {
    const currentWishlistCount = product.toProps().wishlistCount ?? 0;
    const newWishlistCount = isInWishlist
      ? currentWishlistCount + 1
      : Math.max(0, currentWishlistCount - 1); // Prevent negative wishlist count
    // Use the toProps() method to get all properties as an object
    const updatedProductProps: ProductProps = {
      ...product.toProps(),
      isInWishlist: isInWishlist,
      wishlistCount: newWishlistCount,
      updatedAt: new Date(),
    };

    return Product.createProduct(updatedProductProps);
  }

  //Method to Toggle activate a product
  public toggleProductActivation(product: Product): Product {
    // Use the toProps() method to get all properties as an object
    const updatedProductProps: ProductProps = {
      ...product.toProps(),
      isActive: !product.toProps().isActive,
      updatedAt: new Date(),
    };

    return Product.createProduct(updatedProductProps);
  }
}
