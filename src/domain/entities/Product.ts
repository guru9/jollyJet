// Product properties interface defining all product attributes
export interface ProductProps {
  id?: string; //  unique product identifier (Optional)
  name: string; // Name of the product(required)
  description: string; // Product description(required)
  price: number; // Price of the product.Must be non-negative (required)
  stock: number; // Available stock quantity. Must be non-negative (required)
  category: string; // Category to which the product belongs (required)
  images?: string[]; //  array of image URLs (Optional)
  isActive?: boolean; // Current status of the product (Optional, default: true)
  createdAt?: Date; // Timestamp of product creation (Optional)
  updatedAt?: Date; // Timestamp of last update (Optional)
  wishlistCount?: number; // Number of times the product has been added to wishlists (Optional)
  isInWishlist?: boolean; // Indicates if the product is in the user's wishlist (optional)
}

export class Product {
  constructor(private props: ProductProps) {
    this.props = {
      ...props,
      isInWishlist: props.isInWishlist ?? false,
      wishlistCount: props.wishlistCount ?? 0,
      isActive: props.isActive ?? true,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
    this.validate(); // Enforce business rules
  }

  // Getter for isInWishlist property
  get isInWishlist(): boolean {
    return this.props.isInWishlist ?? false;
  }

  // Getter for wishlistCount property
  get wishlistCount(): number {
    return this.props.wishlistCount ?? 0;
  }

  // Validate the product properties and business rules
  validate(): void {
    if (!this.props.name) throw new Error('Product name is required.');

    if (!this.props.description) throw new Error('Product description is required.');

    if (typeof this.props.price !== 'number' || this.props.price < 0)
      throw new Error('Product price must be a non-negative number.');

    if (typeof this.props.stock !== 'number' || this.props.stock < 0)
      throw new Error('Product stock must be a non-negative number.');

    if (!this.props.category) throw new Error('Product category is required.');

    if (this.props.wishlistCount !== undefined && this.props.wishlistCount < 0)
      throw new Error('wishlistCount must be a non-negative number if provided.');
  }

  // Factory method for creating validated Product instances
  public static create(props: ProductProps): Product {
    return new Product(props);
  }

  // Factory method for creating a product with wishlist status
  public static createWithWishlistStatus(props: ProductProps, isInWishlist: boolean): Product {
    return new Product({ ...props, isInWishlist: isInWishlist });
  }

  // Method to add to wishlist
  public addToWishlist(): Product {
    if (this.isInWishlist) {
      return this; // Already in wishlist
    }
    return Product.create({
      ...this.props,
      isInWishlist: true,
      wishlistCount: (this.wishlistCount ?? 0) + 1, //wishlistCount is marked as optional (wishlistCount?: number), so it might be undefined
      updatedAt: new Date(),
    });
  }

  // Method to toggle wishlist status
  public toggleWishlist(): Product {
    const newWishlistCount = this.isInWishlist
      ? (this.wishlistCount ?? 0) - 1
      : (this.wishlistCount ?? 0) + 1;
    return Product.create({
      ...this.props,
      isInWishlist: !this.isInWishlist,
      wishlistCount: newWishlistCount,
      updatedAt: new Date(),
    });
  }

  // Method to remove from wishlist
  public removeFromWishlist(): Product {
    if (!this.isInWishlist) {
      return this; // Already not in wishlist
    }
    return Product.create({
      ...this.props,
      isInWishlist: false,
      wishlistCount: (this.wishlistCount ?? 0) - 1,
      updatedAt: new Date(),
    });
  }
}

// Example usage:
// const productProps = {
//   name: 'Sample Product',
//   description: 'This is a sample product.',
//   price: 29.99,
//   stock: 50,
//   category: 'Electronics',
//   isInWishlist: false,
// };

// const product = Product.create(productProps);
// console.log(product.isInWishlist); // false
