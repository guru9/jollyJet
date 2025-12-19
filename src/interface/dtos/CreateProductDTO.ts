// Data Transfer Object for creating new products
export interface CreateProductDTO {
  name: string; // Product name (required, min 3 chars)
  description: string; // Product description (required, min 10 chars)
  price: number; // Product price (required, non-negative)
  stock: number; // Initial stock quantity (required, non-negative integer)
  category: string; // Product category (required, min 1 char)
  images?: string[]; // Product image URLs (optional, validated as URLs)
  isActive?: boolean; // Product active status (optional, default: true)
  iswishliststatus?: boolean; // Product wishlist status (optional, default: false)
}
