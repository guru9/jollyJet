import { PaginationParams, QueryFilter } from '../../types';
import { Product } from '../entities/Product';

// Extended filter interface for Product queries with additional product-specific filters
export interface ProductFilter extends QueryFilter {
  category?: string; // Filter by product category
  isActive?: boolean; // Filter by active status
  isInWishlist?: boolean; // Filter by wishlist status
  search?: string; // Search by product name or description
  priceRange?: { min: number; max: number }; // Filter by price range
}

// Repository Interface for Product entity following base repository patterns
export interface IProductRepository {
  create(product: Product): Promise<Product>; // Create a new product
  update(product: Product): Promise<Product>; // Update an existing product
  findById(id: string): Promise<Product | null>; // Find a product by its ID
  findAll(filter?: ProductFilter, pagination?: PaginationParams): Promise<Product[]>; // Retrieve all products with optional filtering and pagination
  delete(id: string): Promise<boolean>; // Delete a product by its ID
  count(filter?: ProductFilter): Promise<number>; // Get the total count of products matching a filter
  toggleWishlistStatus(id: string, isInWishlist: boolean): Promise<Product>; // Toggle the wishlist status of a product
}
