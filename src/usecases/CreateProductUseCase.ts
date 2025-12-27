import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';
import { Product } from '../domain/entities/Product';
import { IProductRepository } from '../domain/interfaces/IProductRepository';
import { ProductService } from '../domain/services/ProductService';
import { CreateProductDTO } from '../interface/dtos';
import { DI_TOKENS, PRODUCT_ERROR_MESSAGES } from '../shared/constants';
import { BadRequestError } from '../shared/errors';

/**
 * Usecase for creating new products
 * Depends on: DI_TOKENS.PRODUCT_REPOSITORY (step 4.1)
 *             CreateProductDTO (step 4.1)
 * Implements: Business logic orchestration between layers
 */
@injectable()
export class CreateProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
    // 💡 Dependency Injection: Repository is injected via DI_TOKENS
    // 💡 This enables loose coupling and easy testing
    private productService: ProductService
  ) {}

  /**
   * Excecutes the use case to create a new product.
   * @param productData - CreateProductDTO containing product details
   * @return Promise<Product> - The created product entity
   * 🔧 Flow: DTO → Domain Entity → Repository → Persisted Entity
   * 📋 Business Rules: Enforced by domain entity validation
   */
  public async execute(productData: CreateProductDTO): Promise<Product> {
    // Transform DTO to Domain Entity
    const newProduct = new Product({
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      stock: productData.stock,
      isActive: productData.isActive ?? true,
    });

    if (!this.productService.isAvailable(newProduct)) {
      throw new BadRequestError(PRODUCT_ERROR_MESSAGES.NOT_AVAILABLE);
    }

    // Persist the new product using the repository
    // 💡 Dependency Inversion: Use Cases depend on abstractions (interfaces)
    // 💡 This enables switching database implementations without changing business logic
    return await this.productRepository.create(newProduct);
  }
}



