/**
 * Global TypeScript type definitions for JollyJet
 */

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API response wrapper for all endpoints.
 * @template T - The type of data being returned
 */
export interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

/**
 * Represents a validation error for a specific field.
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * API response wrapper for paginated endpoints.
 * @template T - The type of items in the data array
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

// ============================================================================
// Pagination Types
// ============================================================================

/**
 * Parameters for pagination queries.
 */
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Metadata information for paginated responses.
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// Domain-Specific Enums
// ============================================================================

/**
 * Enumeration of possible user role values for authorization.
 */
export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
}

// ============================================================================
// Express Request Extensions
// ============================================================================

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

// ============================================================================
// Repository Base Types
// ============================================================================

/**
 * Base interface for all domain entities with common audit fields.
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Base repository interface providing standard CRUD operations.
 * @template T - The entity type this repository manages
 */
export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(params?: PaginationParams): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filter?: Record<string, unknown>): Promise<number>;
}

// ============================================================================
// Query Filter Types
// ============================================================================

/**
 * Generic query filter interface for database queries.
 */
export interface QueryFilter {
  [key: string]: unknown;
}

/**
 * Sorting options for query results.
 */
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}
