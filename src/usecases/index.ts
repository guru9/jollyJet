/**
 * Use Cases Index - Centralized export for all Use Cases
 *
 * This file provides a single import point for all use cases,
 * making it easier to import multiple use cases and improving code organization.
 *
 * Usage Examples:
 * 1. Import individual use cases:
 *    import { CreateProductUseCase, UpdateProductUseCase } from '@/usecases';
 *
 * 2. Import all use cases as an object:
 *    import { UseCases } from '@/usecases';
 *    // Access via UseCases.CreateProductUseCase, UseCases.UpdateProductUseCase, etc.
 */

// Individual use case exports for direct import
export { CountProductsQuery, CountProductsUseCase } from './CountProductsUseCase';
export { CreateProductUseCase } from './CreateProductUseCase';
export { DeleteProductUseCase } from './DeleteProductUseCase';
export { GetProductUseCase } from './GetProductUseCase';
export { ListProductsQuery, ListProductsUseCase } from './ListProductsUseCase';
export { ToggleWishlistProductUseCase } from './ToggleWishlistProductUseCase';
export { UpdateProductUseCase } from './UpdateProductUseCase';
// Note: Use Cases are TypeScript classes and cannot be used as runtime values.
// Use individual imports for type checking and documentation purposes.



