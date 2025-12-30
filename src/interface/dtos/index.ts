/**
 * Product Module DTOs - Centralized export for all Data Transfer Objects
 *
 * This file serves as the main entry point for all Data Transfer Objects (DTOs)
 * used in the product module. DTOs define the shape of data that flows between
 * different layers of the application, ensuring type safety and clear contracts.
 *
 * Current DTOs Available:
 * - CreateProductDTO: Interface for creating new products
 * - UpdateProductDTO: Interface for updating existing products
 * - ProductResponseDTO: Interface for product response data
 * - ToggleWishlistDTO: Interface for wishlist toggle operations
 *
 * Import Patterns:
 * 1. Named imports for specific DTOs:
 *    import { CreateProductDTO, UpdateProductDTO } from '@/interface/dtos';
 *
 * 2. Bulk import for multiple DTOs:
 *    import { CreateProductDTO, ProductResponseDTO, ToggleWishlistDTO } from '@/interface/dtos';
 *
 * Benefits:
 * - Centralized management of all DTO exports
 * - Improved code organization and maintainability
 * - Consistent import paths across the application
 * - Easy discovery of available DTOs for developers
 *
 * @module ProductDTOs
 * @since 1.0.0
 */

// Product creation and management DTOs
export { CreateProductDTO } from './product/CreateProductDTO';
export { UpdateProductDTO } from './product/UpdateProductDTO';

// Product response and interaction DTOs
export { ProductResponseDTO } from './product/ProductResponseDTO';
export { ToggleWishlistDTO } from './product/ToggleWishlistDTO';

/**
 * Important Notes:
 * - All exports are TypeScript interfaces, not runtime values
 * - DTOs provide type safety for data transfer between application layers
 * - Use these interfaces for request validation and response formatting
 * - Keep DTOs focused on their specific use cases for better maintainability
 */
