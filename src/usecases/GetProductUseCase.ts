import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';
import { Product } from '../domain/entities/Product';
import { IProductRepository } from '../domain/interfaces/IProductRepository';
import { DI_TOKENS, PRODUCT_ERROR_MESSAGES } from '../shared/constants';
import { BadRequestError } from '../shared/errors';

/**
 * Usecase for get product by ID
 * Depends on: DI_TOKENS.PRODUCT_REPOSITORY (step 4.1)
 * Implements: Business logic orchestration between layers
 */
@injectable()
export class GetProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository
    // 💡 Dependency Injection: Repository is injected via DI_TOKENS
    // 💡 This enables loose coupling and easy testing
  ) {}

  /**
   * Executes the use case to retrieve a product by ID.
   * @param productId - The ID of the product to retrieve
   * @return Promise<Product | null> - The retrieved product entity or null if not found
   * 🔧 Flow: ID → Repository → Domain Entity
   * 📋 Business Rules: Enforced by domain entity validation
   */
  public async execute(productId: string): Promise<Product | null> {
    // Validate input
    if (!productId?.trim()) {
      throw new BadRequestError(PRODUCT_ERROR_MESSAGES.PRODUCT_ID_REQ_RETRIEVE);
    }
    // Retrieve the product using the repository
    // 💡 Dependency Inversion: Use Cases depend on abstractions (interfaces)
    // 💡 This enables switching database implementations without changing business logic
    return await this.productRepository.findById(productId);
  }
}



