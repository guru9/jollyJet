/**
 * Data Transfer Object for updating existing products (all fields optional)
 *
 * @interface UpdateProductDTO
 * @property {string} [name] - Product name (optional, min 3 chars if provided)
 * @property {string} [description] - Product description (optional, min 10 chars if provided)
 * @property {number} [price] - Product price (optional, non-negative if provided)
 * @property {number} [stock] - Stock quantity (optional, non-negative integer if provided)
 * @property {string} [category] - Product category (optional, min 1 char if provided)
 * @property {string[]} [images] - Product image URLs (optional, validated as URLs if provided)
 * @property {boolean} [isActive] - Product active status (optional)
 * @property {boolean} [isWishlistStatus] - Product wishlist status (optional)
 */
export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  images?: string[];
  isActive?: boolean;
  isWishlistStatus?: boolean;
}
