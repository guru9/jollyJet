import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';
import { Product } from '../domain/entities/Product';
import { IProductRepository } from '../domain/interfaces/IProductRepository';
import { ToggleWishlistDTO } from '../interface/dtos';
import { DI_TOKENS, PRODUCT_ERROR_MESSAGES } from '../shared/constants';
import { BadRequestError, NotFoundError } from '../shared/errors';

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
      throw new BadRequestError(PRODUCT_ERROR_MESSAGES.PRODUCT_ID_REQ_WISHLIST);
    }

    // Check if product exists before attempting to toggle
    const existingProduct = await this.productRepository.findById(productId);
    if (!existingProduct) {
      throw new NotFoundError(PRODUCT_ERROR_MESSAGES.NOT_FOUND);
    }

    // Toggle the wishlist status using the repository
    // 💡 Repository handles the actual database update
    // 💡 Returns the updated product with new wishlist status
    return await this.productRepository.toggleWishlistStatus(productId, wishlistData.isWishlistStatus);
  }
}



