/**
 * Data Transfer Object for product API responses
 *
 * @interface ProductResponseDTO
 * @property {string} id - Product unique identifier
 * @property {string} name - Product name
 * @property {string} description - Product description
 * @property {number} price - Product price
 * @property {number} stock - Available stock quantity
 * @property {string} category - Product category
 * @property {string[]} images - Product image URLs
 * @property {boolean} isActive - Product active status
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @property {boolean} isInWishlist - Wishlist status
 * @property {number} wishlistCount - Number of users who added this to wishlist
 */
export interface ProductResponseDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isInWishlist: boolean;
  wishlistCount: number;
}
