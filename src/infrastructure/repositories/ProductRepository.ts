import { Product } from '../../domain/entities/Product';
import { IProductRepository, ProductFilter } from '../../domain/interfaces/IProductRepository';
import { Productmodel } from '../models/ProductModel';

export class ProductRepository implements IProductRepository {
  /**
   * Creates a new product in the database.
   * @param product Product entity to create
   * @returns Promise with created Product entity
   */
  public async create(product: Product): Promise<Product> {
    const productData = product.toProps();

    // Create document in MongoDB and convert back to domain entity
    const createdProduct = await Productmodel.create(productData);
    return Product.createProduct(createdProduct.toObject());
  }

  /**
   * Updates an existing product
   * @param product Product entity with updates
   * @returns Promise with updated Product entity
   * @throws Error if product ID is missing or product not found
   */
  public async update(product: Product): Promise<Product> {
    const productData = product.toProps();
    if (!productData.id) throw new Error('Product ID is required for update.');

    //find the updated document, return the updated product
    const updatedProduct = await Productmodel.findByIdAndUpdate(productData.id, productData, {
      new: true,
    });
    if (!updatedProduct) throw new Error('Product not found for update.');
    return Product.createProduct(updatedProduct.toObject());
  }

  /**
   * Retrieves a product by its ID
   * @param id Product ID to search for
   * @returns Promise with Product entity or null if not found
   */
  public async findById(id: string): Promise<Product | null> {
    if (!id) return null; // Return null for invalid IDs

    const productDocument = await Productmodel.findById(id);
    if (!productDocument) return null; // Return null if document not found

    return Product.createProduct(productDocument.toObject()); // Convert to Product entity
  }

  /**
   * Retrieves all products with optional filtering and pagination
   * @param filter Optional filter criteria
   * @param skip Number of records to skip (for pagination)
   * @param limit Maximum number of records to return
   * @returns Promise with array of Product entities
   */
  public async findAll(filter?: ProductFilter, skip?: number, limit?: number): Promise<Product[]> {
    // Build the query
    const query = Productmodel.find();

    // Apply filters if provided
    if (filter) {
      if (filter.category) query.where('category', filter.category);
      if (filter.isActive) query.where('isActive', filter.isActive);
      if (filter.isInWishlist) query.where('isInWishlist', filter.isInWishlist);
      if (filter.search) query.where({ $text: { $search: filter.search } });
      if (filter.priceRange)
        query.where('price').gte(filter.priceRange.min).lte(filter.priceRange.max);
    }

    // Apply pagination if provided
    if (skip !== undefined) query.skip(skip);
    if (limit !== undefined) query.limit(limit);

    // Execute the query and convert documents to Product entities
    const productDocuments = await query.exec();
    return productDocuments.map((doc) => Product.createProduct(doc.toObject()));
  }

  /**
   * Deletes a product by ID
   * @param id Product ID to delete
   * @returns Promise with boolean indicating success
   */
  public async delete(id: string): Promise<boolean> {
    const result = await Productmodel.findByIdAndDelete(id);
    return result !== null;
  }

  /**
   * Gets the count of products matching the filter
   * @param filter Optional filter criteria
   * @returns Promise with count of matching products
   */
  public async count(filter?: ProductFilter): Promise<number> {
    const query = Productmodel.countDocuments();

    // Apply filters if provided
    if (filter) {
      if (filter.category) query.where('category', filter.category);
      if (filter.isActive) query.where('isActive', filter.isActive);
      if (filter.isInWishlist) query.where('isInWishlist', filter.isInWishlist);
      if (filter.search) query.where({ $text: { $search: filter.search } });
      if (filter.priceRange)
        query.where('price').gte(filter.priceRange.min).lte(filter.priceRange.max);
    }
    // Return the count of matching products
    return await query.exec();
  }

  /**
   * Toggles the wishlist status of a product
   * @param id Product ID to update
   * @param isInWishlist New wishlist status
   * @returns Promise<Product> with the updated product
   */
  public async toggleWishlistStatus(id: string, isInWishlist: boolean): Promise<Product> {
    // Update the isInWishlist status and adjust wishlistCount accordingly
    const updatedProduct = await Productmodel.findByIdAndUpdate(
      id,
      { isInWishlist: isInWishlist, wishlistCount: isInWishlist ? 1 : 0 },
      { new: true }
    );

    //check if product doesn't exist
    if (!updatedProduct) {
      throw new Error('Product not found');
    }

    return Product.createProduct(updatedProduct.toObject()); // Convert to Product entity
  }
}
