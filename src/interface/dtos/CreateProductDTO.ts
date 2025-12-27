/**
 * Data Transfer Object for creating new products
 *
 * @interface CreateProductDTO
 * @property {string} name - Product name (required, min 3 chars)
 * @property {string} description - Product description (required, min 10 chars)
 * @property {number} price - Product price (required, non-negative)
 * @property {number} stock - Initial stock quantity (required, non-negative integer)
 * @property {string} category - Product category (required, min 1 char)
 * @property {string[]} [images] - Product image URLs (optional, validated as URLs)
 * @property {boolean} [isActive] - Product active status (optional, default: true)
 * @property {boolean} [isWishlistStatus] - Product wishlist status (optional, default: false)
 */
export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images?: string[];
  isActive?: boolean;
  isWishlistStatus?: boolean;
}
