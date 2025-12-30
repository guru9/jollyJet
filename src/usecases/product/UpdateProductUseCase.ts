import { Product } from '@/domain/entities';
import { IProductRepository } from '@/domain/interfaces';
import { ProductService } from '@/domain/services';
import { UpdateProductDTO } from '@/interface/dtos';
import { BadRequestError, DI_TOKENS, NotFoundError, PRODUCT_ERROR_MESSAGES } from '@/shared';

import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';

/**
 * Usecase for updating existing products
 * Depends on: DI_TOKENS.PRODUCT_REPOSITORY
 *             UpdateProductDTO
 * Implements: Business logic orchestration between layers
 */
@injectable()
export class UpdateProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
    // 💡 Dependency Injection: Repository is injected via DI_TOKENS
    // 💡 This enables loose coupling and easy testing
    private productService: ProductService
  ) {}

  /**
   * Executes the use case to update a product.
   * @param productId - The ID of the product to update
   * @param productData - UpdateProductDTO containing product details to update
   * @return Promise<Product> - The updated product entity
   * 🔧 Flow: ID → Repository → Domain Entity → Service → Updated Entity → Repository
   * 📋 Business Rules: Enforced by domain entity validation
   */
  public async execute(productId: string, productData: UpdateProductDTO): Promise<Product> {
    // Validate input
    if (!productId?.trim()) {
      throw new BadRequestError(PRODUCT_ERROR_MESSAGES.PRODUCT_ID_REQ_UPDATE);
    }

    // Retrieve the existing product using the repository
    let existingProduct = await this.productRepository.findById(productId);

    if (!existingProduct) {
      throw new NotFoundError(PRODUCT_ERROR_MESSAGES.NOT_FOUND);
    }

    // Apply all updates to the product
    existingProduct = this.applyProductUpdates(existingProduct, productData);

    // Persist the updated product using the repository
    // 💡 Dependency Inversion: Use Cases depend on abstractions (interfaces)
    // 💡 This enables switching database implementations without changing business logic
    return await this.productRepository.update(existingProduct);
  }

  /**
   * Applies all product updates based on the provided data.
   * @param product - The existing product to update
   * @param updates - The update data from DTO
   * @return Product - The updated product
   */
  private applyProductUpdates(product: Product, updates: UpdateProductDTO): Product {
    let updatedProduct = product;

    // Apply price update if provided
    if (updates.price !== undefined) {
      updatedProduct = this.productService.updatePrice(updatedProduct, updates.price);
    }

    // Apply stock update if provided
    if (updates.stock !== undefined) {
      updatedProduct = this.productService.updateStock(updatedProduct, updates.stock);
    }

    // Apply wishlist status update if provided
    if (updates.isWishlistStatus !== undefined) {
      updatedProduct = this.productService.updateWishlistStatus(
        updatedProduct,
        updates.isWishlistStatus
      );
    }

    // Apply basic product details updates
    updatedProduct = this.applyProductDetailsUpdates(updatedProduct, updates);

    return updatedProduct;
  }

  /**
   * Applies product details updates (name, description, category, isActive).
   * @param product - The product to update
   * @param updates - The update data from DTO
   * @return Product - The updated product
   */
  private applyProductDetailsUpdates(product: Product, updates: UpdateProductDTO): Product {
    const detailsUpdates: Partial<
      Pick<UpdateProductDTO, 'name' | 'description' | 'category' | 'isActive'>
    > = {};

    // Collect all product details updates
    if (updates.name !== undefined) detailsUpdates.name = updates.name;
    if (updates.description !== undefined) detailsUpdates.description = updates.description;
    if (updates.category !== undefined) detailsUpdates.category = updates.category;
    if (updates.isActive !== undefined) detailsUpdates.isActive = updates.isActive;

    // Apply updates only if there are any details to update
    if (Object.keys(detailsUpdates).length > 0) {
      return this.productService.updateProductDetails(product, detailsUpdates);
    }

    return product;
  }
}
