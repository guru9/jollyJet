import { Product } from '@/domain/entities';
import { PaginationParams, QueryFilter } from '@/types';

/**
 * Product Filter Interface
 *
 * Extended filter interface for Product queries with additional product-specific filtering capabilities.
 * This interface extends the base QueryFilter to provide specialized filtering options for e-commerce products.
 */
export interface ProductFilter extends QueryFilter {
  /** Filter products by category */
  category?: string;

  /** Filter products by active/inactive status */
  isActive?: boolean;

  /** Filter products by wishlist status */
  isWishlistStatus?: boolean;

  /** Search products by name or description (supports partial matching) */
  search?: string;

  /** Filter products within a specific price range */
  priceRange?: { min: number; max: number };
}

/**
 * Product Repository Interface
 *
 * Defines the contract for product data access operations in the JollyJet e-commerce platform.
 * This interface follows the repository pattern to abstract data persistence details and provide
 * a consistent API for product-related operations.
 *
 * Key Responsibilities:
 * - CRUD operations for product management
 * - Advanced filtering and search capabilities
 * - Pagination support for large product catalogs
 * - Wishlist functionality for user preferences
 * - Product counting and analytics
 */
export interface IProductRepository {
  /**
   * Creates a new product in the system
   * @param product - The product entity to create
   * @returns The created product with generated ID
   */
  create(product: Product): Promise<Product>;

  /**
   * Updates an existing product
   * @param product - The product entity with updated values
   * @returns The updated product
   */
  update(product: Product): Promise<Product>;

  /**
   * Retrieves a product by its unique identifier
   * @param id - The product ID to find
   * @returns The product if found, null otherwise
   */
  findById(id: string): Promise<Product | null>;

  /**
   * Retrieves multiple products with optional filtering and pagination
   * @param filter - Optional filter criteria
   * @param pagination - Optional pagination parameters
   * @returns Array of products matching the criteria
   */
  findAll(filter?: ProductFilter, pagination?: PaginationParams): Promise<Product[]>;

  /**
   * Deletes a product from the system
   * @param id - The product ID to delete
   * @returns true if deletion was successful, false otherwise
   */
  delete(id: string): Promise<boolean>;

  /**
   * Counts products matching optional filter criteria
   * @param filter - Optional filter criteria
   * @returns Total count of matching products
   */
  count(filter?: ProductFilter): Promise<number>;

  /**
   * Toggles the wishlist status of a product
   * @param id - The product ID to update
   * @param isWishlistStatus - The new wishlist status
   * @returns The updated product
   */
  toggleWishlistStatus(id: string, isWishlistStatus: boolean): Promise<Product>;
}
