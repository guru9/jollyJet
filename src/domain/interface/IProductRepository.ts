import { Product } from '../entities/Product';

// Filter Interface for Product queries
export interface ProductFilter {
  category?: string; // Filter by product category
  isActive?: boolean; // Filter by active status
  isInWishlist?: boolean; // Filter by wishlist status
  search?: string; // Search by product name or description
  priceRange?: { min: number; max: number }; // Filter by price range
}

// Repository Interface for Product entity
export interface IProductRepository {
  create(product: Product): Promise<void>; // Create a new product
  update(product: Product): Promise<void>; // Update an existing product
  findById(id: string): Promise<Product | null>; // Find a product by its ID
  findAll(filter?: ProductFilter, skip?: number, limit?: number): Promise<Product[]>; // Retrieve all products with optional filtering and pagination
  delete(id: string): Promise<void>; // Delete a product by its ID
  count(filter?: ProductFilter): Promise<number>; // Get the total count of products matching a filter
}
