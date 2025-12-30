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
export { CountProductsQuery, CountProductsUseCase } from './product/CountProductsUseCase';
export { CreateProductUseCase } from './product/CreateProductUseCase';
export { DeleteProductUseCase } from './product/DeleteProductUseCase';
export { GetProductUseCase } from './product/GetProductUseCase';
export { ListProductsQuery, ListProductsUseCase } from './product/ListProductsUseCase';
export { ToggleWishlistProductUseCase } from './product/ToggleWishlistProductUseCase';
export { UpdateProductUseCase } from './product/UpdateProductUseCase';

// Note: Use Cases are TypeScript classes and cannot be used as runtime values.
// Use individual imports for type checking and documentation purposes.
