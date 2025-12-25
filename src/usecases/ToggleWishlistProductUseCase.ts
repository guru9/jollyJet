import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';
import { Product } from '../domain/entities/Product';
import { IProductRepository } from '../domain/interfaces/IProductRepository';
import { ToggleWishlistDTO } from '../interface/dtos/ToggleWishlistDTO';
import { DI_TOKENS } from '../shared/constants';

/**
 * Use case for toggling a product's wishlist status
 * Depends on: DI_TOKENS.PRODUCT_REPOSITORY
 * Implements: Business logic orchestration between layers
 */
@injectable()
export class ToggleWishlistProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository
    // 💡 Dependency Injection: Repository is injected via DI_TOKENS
    // 💡 This enables loose coupling and easy testing
  ) {}

  /**
   * Executes the use case to toggle a product's wishlist status.
   * @param productId - The ID of the product to toggle wishlist status for
   * @param wishlistData - ToggleWishlistDTO containing the desired wishlist state
   * @return Promise<Product> - The updated product entity with new wishlist status
   * 🔧 Flow: ID → Repository → Toggle Operation → Updated Entity
   * 📋 Business Rules: Validates product exists before toggling
   */
  public async execute(productId: string, wishlistData: ToggleWishlistDTO): Promise<Product> {
    // Validate input
    if (!productId?.trim()) {
      throw new Error('Product ID is required for wishlist toggle.');
    }

    // Check if product exists before attempting to toggle
    const existingProduct = await this.productRepository.findById(productId);
    if (!existingProduct) {
      throw new Error('Product not found.');
    }

    // Toggle the wishlist status using the repository
    // 💡 Repository handles the actual database update
    // 💡 Returns the updated product with new wishlist status
    return await this.productRepository.toggleWishlistStatus(productId, wishlistData.isInWishlist);
  }
}
