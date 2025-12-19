// Data Transfer Object for updating existing products (all fields optional)
export interface UpdateProductDTO {
  name?: string; // Product name (optional, min 3 chars if provided)
  description?: string; // Product description (optional, min 10 chars if provided)
  price?: number; // Product price (optional, non-negative if provided)
  stock?: number; // Stock quantity (optional, non-negative integer if provided)
  category?: string; // Product category (optional, min 1 char if provided)
  images?: string[]; // Product image URLs (optional, validated as URLs if provided)
  isActive?: boolean; // Product active status (optional)
  iswishliststatus?: boolean; // Product wishlist status (optional)
}
