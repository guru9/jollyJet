// Product properties interface defining all product attributes
import { PRODUCT_VALIDATION_MESSAGES } from '@/shared';
import { BadRequestError } from '@/shared/errors';

export interface ProductProps {
  id?: string; //  unique product identifier (Optional)
  name: string; // Name of the product(required)
  description: string; // Product description(required)
  price: number; // Price of the product. Must be non-negative (required)
  stock: number; // Available stock quantity. Must be non-negative (required)
  category: string; // Category to which the product belongs (required)
  images?: string[]; //  array of image URLs (Optional)
  isActive: boolean; // Current status of the product (Optional, default: true)
  createdAt?: Date; // Timestamp of product creation (Optional)
  updatedAt?: Date; // Timestamp of last update (Optional)
  wishlistCount?: number; // Number of times the product has been added to wishlists (Optional)
  isWishlistStatus?: boolean; // Indicates if the product is in the user's wishlist (optional)
}

export class Product {
  constructor(private props: ProductProps) {
    this.props = {
      ...props,
      isWishlistStatus: props.isWishlistStatus ?? false,
      wishlistCount: props.wishlistCount ?? 0,
      isActive: props.isActive ?? true,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
    this.validate(); // Enforce business rules
  }

  // Validate the product properties and business rules
  validate(): void {
    if (!this.props.name)
      throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.PRODUCT_NAME_REQUIRED);

    if (!this.props.description)
      throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.PRODUCT_DESCRIPTION_REQUIRED);

    if (typeof this.props.price !== 'number' || this.props.price < 0)
      throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.PRODUCT_PRICE_INVALID);

    if (typeof this.props.stock !== 'number' || this.props.stock < 0)
      throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.PRODUCT_STOCK_INVALID);

    if (!this.props.category)
      throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.PRODUCT_CATEGORY_REQUIRED);

    if (this.props.wishlistCount !== undefined && this.props.wishlistCount < 0)
      throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.WISHLIST_COUNT_INVALID);
  }

  // Method to get all props as an object for external use
  public toProps(): ProductProps {
    return { ...this.props };
  }

  // Factory method for creating validated Product instances
  public static createProduct(props: ProductProps): Product {
    return new Product(props);
  }
}

/**
 * Example usage:
 *
 * @example
 * ```typescript
 * const productProps = {
 *   name: 'Sample Product',
 *   description: 'This is a sample product.',
 *   price: 29.99,
 *   stock: 50,
 *   category: 'Electronics',
 *   isWishlistStatus: false,
 * };
 *
 * const product = Product.createProduct(productProps);
 * // product.toProps().isWishlistStatus === false
 * ```
 */
