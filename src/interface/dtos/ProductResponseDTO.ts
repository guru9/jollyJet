// Data Transfer Object for product API responses
export interface ProductResponseDTO {
  id: string; // Product unique identifier
  name: string; // Product name
  description: string; // Product description
  price: number; // Product price
  stock: number; // Available stock quantity
  category: string; // Product category
  images: string[]; // Product image URLs
  isActive: boolean; // Product active status
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
  isInWishlist: boolean; // Wishlist status
  wishlistCount: number; // Number of users who added this to wishlist
}
