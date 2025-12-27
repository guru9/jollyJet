import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';
import { IProductRepository } from '../domain/interfaces/IProductRepository';
import { DI_TOKENS, PRODUCT_ERROR_MESSAGES } from '../shared/constants';
import { BadRequestError } from '../shared/errors';

/**
 * Use case for deleting existing products
 * Depends on: DI_TOKENS.PRODUCT_REPOSITORY
 * Implements: Business logic orchestration between layers
 */
@injectable()
export class DeleteProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository
    // 💡 Dependency Injection: Repository is injected via DI_TOKENS
    // 💡 This enables loose coupling and easy testing
  ) {}

  /**
   * Executes the use case to delete a product by ID.
   * @param productId - The ID of the product to delete
   * @return Promise<boolean> - True if product was deleted, false if not found
   * 🔧 Flow: ID → Repository → Delete Operation
   * 📋 Business Rules: Validates product exists before deletion
   */
  public async execute(productId: string): Promise<boolean> {
    // Validate input
    if (!productId?.trim()) {
      throw new BadRequestError(PRODUCT_ERROR_MESSAGES.PRODUCT_ID_REQ_DELETE);
    }

    // Check if product exists before attempting deletion
    const existingProduct = await this.productRepository.findById(productId);
    if (!existingProduct) {
      return false; // Product not found
    }

    // Perform the deletion
    // 💡 Repository handles the actual database deletion
    // 💡 Returns boolean indicating success/failure
    return await this.productRepository.delete(productId);
  }
}



