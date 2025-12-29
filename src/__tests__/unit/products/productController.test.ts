import { NextFunction, Request, Response } from 'express';
import { Product } from '../../../domain/entities/Product';
import { ProductController } from '../../../interface/controllers/ProductController';
import { CreateProductDTO, ToggleWishlistDTO, UpdateProductDTO } from '../../../interface/dtos';
import {
  HTTP_STATUS,
  PRODUCT_ERROR_MESSAGES,
  PRODUCT_SUCCESS_MESSAGES,
  RESPONSE_STATUS,
} from '../../../shared/constants';
import {
  CountProductsUseCase,
  CreateProductUseCase,
  DeleteProductUseCase,
  GetProductUseCase,
  ListProductsUseCase,
  ToggleWishlistProductUseCase,
  UpdateProductUseCase,
} from '../../../usecases';

// Mock the use cases
jest.mock('../../../usecases/CountProductsUseCase');
jest.mock('../../../usecases/CreateProductUseCase');
jest.mock('../../../usecases/GetProductUseCase');
jest.mock('../../../usecases/ListProductsUseCase');
jest.mock('../../../usecases/UpdateProductUseCase');
jest.mock('../../../usecases/DeleteProductUseCase');
jest.mock('../../../usecases/ToggleWishlistProductUseCase');

describe('ProductController', () => {
  let productController: ProductController;
  let mockCountProductsUseCase: jest.Mocked<CountProductsUseCase>;
  let mockCreateProductUseCase: jest.Mocked<CreateProductUseCase>;
  let mockGetProductUseCase: jest.Mocked<GetProductUseCase>;
  let mockListProductsUseCase: jest.Mocked<ListProductsUseCase>;
  let mockUpdateProductUseCase: jest.Mocked<UpdateProductUseCase>;
  let mockDeleteProductUseCase: jest.Mocked<DeleteProductUseCase>;
  let mockToggleWishlistUseCase: jest.Mocked<ToggleWishlistProductUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    // Create mock instances

    mockCountProductsUseCase = {
      execute: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    mockCreateProductUseCase = {
      execute: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    mockGetProductUseCase = {
      execute: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    mockListProductsUseCase = {
      execute: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    mockUpdateProductUseCase = {
      execute: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    mockDeleteProductUseCase = {
      execute: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    mockToggleWishlistUseCase = {
      execute: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    // Create controller instance with mocked dependencies
    productController = new ProductController(
      mockCreateProductUseCase,
      mockGetProductUseCase,
      mockListProductsUseCase,
      mockCountProductsUseCase,
      mockUpdateProductUseCase,
      mockDeleteProductUseCase,
      mockToggleWishlistUseCase
    );

    // Setup mocks
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      // Arrange
      const productData: CreateProductDTO = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        category: 'electronics',
        stock: 50,
      };

      const createdProduct = Product.createProduct({
        ...productData,
        id: 'product-id',
        isActive: true,
        isWishlistStatus: false,
        wishlistCount: 0,
      });

      mockRequest.body = productData;
      mockCreateProductUseCase.execute.mockResolvedValue(createdProduct);

      // Act
      await productController.createProduct(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockCreateProductUseCase.execute).toHaveBeenCalledWith(productData);
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.SUCCESS,
        data: createdProduct,
        message: PRODUCT_SUCCESS_MESSAGES.PRODUCT_CREATED,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors and pass them to next middleware', async () => {
      // Arrange
      const error = new Error('Validation failed');
      mockRequest.body = {};
      mockCreateProductUseCase.execute.mockRejectedValue(error);

      // Act
      await productController.createProduct(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('getProduct', () => {
    it('should retrieve a product successfully', async () => {
      // Arrange
      const productId = 'product-id';
      const product = Product.createProduct({
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        category: 'electronics',
        stock: 50,
        id: productId,
        isActive: true,
        isWishlistStatus: false,
        wishlistCount: 0,
      });

      mockRequest.params = { id: productId };
      mockGetProductUseCase.execute.mockResolvedValue(product);

      // Act
      await productController.getProduct(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockGetProductUseCase.execute).toHaveBeenCalledWith(productId);
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.SUCCESS,
        data: product,
        message: PRODUCT_SUCCESS_MESSAGES.PRODUCT_RETRIEVED,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 when product is not found', async () => {
      // Arrange
      const productId = 'non-existent-id';
      mockRequest.params = { id: productId };
      mockGetProductUseCase.execute.mockResolvedValue(null);

      // Act
      await productController.getProduct(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.ERROR,
        message: PRODUCT_ERROR_MESSAGES.NOT_FOUND,
        errors: [{ field: 'id', message: 'Product with specified ID does not exist' }],
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors and pass them to next middleware', async () => {
      // Arrange
      const error = new Error('Database error');
      mockRequest.params = { id: 'product-id' };
      mockGetProductUseCase.execute.mockRejectedValue(error);

      // Act
      await productController.getProduct(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('listProducts', () => {
    it('should list products with default parameters', async () => {
      // Arrange
      const mockResult = {
        products: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockRequest.query = {};
      mockListProductsUseCase.execute.mockResolvedValue(mockResult);

      // Act
      await productController.listProducts(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockListProductsUseCase.execute).toHaveBeenCalledWith({
        page: '1',
        limit: '10',
        category: undefined,
        search: undefined,
        isActive: false,
        isWishlistStatus: false,
        priceRange: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.SUCCESS,
        data: mockResult,
        message: PRODUCT_SUCCESS_MESSAGES.PRODUCTS_RETRIEVED,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should list products with all query parameters', async () => {
      // Arrange
      const mockResult = {
        products: [],
        total: 5,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      const queryParams = {
        page: '1',
        limit: '10',
        category: 'electronics',
        search: 'phone',
        isActive: 'true',
        isWishlistStatus: 'false',
        priceRange: '{"min":100,"max":500}',
      };

      mockRequest.query = queryParams;
      mockListProductsUseCase.execute.mockResolvedValue(mockResult);

      // Act
      await productController.listProducts(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockListProductsUseCase.execute).toHaveBeenCalledWith({
        page: '1',
        limit: '10',
        category: 'electronics',
        search: 'phone',
        isActive: true,
        isWishlistStatus: false,
        priceRange: { min: 100, max: 500 },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.SUCCESS,
        data: mockResult,
        message: PRODUCT_SUCCESS_MESSAGES.PRODUCTS_RETRIEVED,
      });
    });

    it('should handle errors and pass them to next middleware', async () => {
      // Arrange
      const error = new Error('Database error');
      mockRequest.query = {};
      mockListProductsUseCase.execute.mockRejectedValue(error);

      // Act
      await productController.listProducts(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('countProducts', () => {
    it('should count products with default parameters', async () => {
      // Arrange
      const count = 42;
      mockRequest.query = {};
      mockCountProductsUseCase.execute.mockResolvedValue(count);

      // Act
      await productController.countProducts(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockCountProductsUseCase.execute).toHaveBeenCalledWith({
        category: undefined,
        search: undefined,
        isActive: false,
        isWishlistStatus: false,
        priceRange: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.SUCCESS,
        data: count,
        message: PRODUCT_SUCCESS_MESSAGES.PRODUCTS_COUNT_RETRIEVED,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should count products with all query parameters', async () => {
      // Arrange
      const count = 15;
      const queryParams = {
        category: 'electronics',
        search: 'phone',
        isActive: 'true',
        isWishlistStatus: 'false',
        priceRange: '{"min":100,"max":500}',
      };

      mockRequest.query = queryParams;
      mockCountProductsUseCase.execute.mockResolvedValue(count);

      // Act
      await productController.countProducts(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockCountProductsUseCase.execute).toHaveBeenCalledWith({
        category: 'electronics',
        search: 'phone',
        isActive: true,
        isWishlistStatus: false,
        priceRange: { min: 100, max: 500 },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.SUCCESS,
        data: count,
        message: PRODUCT_SUCCESS_MESSAGES.PRODUCTS_COUNT_RETRIEVED,
      });
    });

    it('should handle errors and pass them to next middleware', async () => {
      // Arrange
      const error = new Error('Database error');
      mockRequest.query = {};
      mockCountProductsUseCase.execute.mockRejectedValue(error);

      // Act
      await productController.countProducts(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('updateProduct', () => {
    it('should update a product successfully', async () => {
      // Arrange
      const productId = 'product-id';
      const updateData: UpdateProductDTO = {
        name: 'Updated Product',
        price: 150,
      };

      const updatedProduct = Product.createProduct({
        name: 'Updated Product',
        description: 'Test Description',
        price: 150,
        category: 'electronics',
        stock: 50,
        id: productId,
        isActive: true,
        isWishlistStatus: false,
        wishlistCount: 0,
      });

      mockRequest.params = { id: productId };
      mockRequest.body = updateData;
      mockUpdateProductUseCase.execute.mockResolvedValue(updatedProduct);

      // Act
      await productController.updateProduct(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockUpdateProductUseCase.execute).toHaveBeenCalledWith(productId, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.SUCCESS,
        data: updatedProduct,
        message: PRODUCT_SUCCESS_MESSAGES.PRODUCT_UPDATED,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 when product is not found', async () => {
      // Arrange
      const productId = 'non-existent-id';
      const updateData: UpdateProductDTO = { name: 'Updated Product' };

      mockRequest.params = { id: productId };
      mockRequest.body = updateData;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockUpdateProductUseCase.execute.mockResolvedValue(null as any);

      // Act
      await productController.updateProduct(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.ERROR,
        message: PRODUCT_ERROR_MESSAGES.NOT_FOUND,
        errors: [{ field: 'id', message: 'Product with specified ID does not exist' }],
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors and pass them to next middleware', async () => {
      // Arrange
      const error = new Error('Validation failed');
      mockRequest.params = { id: 'product-id' };
      mockRequest.body = {};
      mockUpdateProductUseCase.execute.mockRejectedValue(error);

      // Act
      await productController.updateProduct(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('toggleWishlist', () => {
    it('should toggle wishlist status successfully', async () => {
      // Arrange
      const productId = 'product-id';
      const wishlistData: ToggleWishlistDTO = { isWishlistStatus: true };

      const updatedProduct = Product.createProduct({
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        category: 'electronics',
        stock: 50,
        id: productId,
        isActive: true,
        isWishlistStatus: true,
        wishlistCount: 1,
      });

      mockRequest.params = { id: productId };
      mockRequest.body = wishlistData;
      mockToggleWishlistUseCase.execute.mockResolvedValue(updatedProduct);

      // Act
      await productController.toggleWishlist(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockToggleWishlistUseCase.execute).toHaveBeenCalledWith(productId, wishlistData);
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.SUCCESS,
        data: updatedProduct,
        message: PRODUCT_SUCCESS_MESSAGES.WISHLIST_TOGGLED,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors and pass them to next middleware', async () => {
      // Arrange
      const error = new Error('Product not found');
      mockRequest.params = { id: 'product-id' };
      mockRequest.body = { isWishlistStatus: true };
      mockToggleWishlistUseCase.execute.mockRejectedValue(error);

      // Act
      await productController.toggleWishlist(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      // Arrange
      const productId = 'product-id';

      mockRequest.params = { id: productId };
      mockDeleteProductUseCase.execute.mockResolvedValue(true);

      // Act
      await productController.deleteProduct(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockDeleteProductUseCase.execute).toHaveBeenCalledWith(productId);
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.NO_CONTENT);
      expect(mockResponse.send).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 when product is not found', async () => {
      // Arrange
      const productId = 'non-existent-id';

      mockRequest.params = { id: productId };
      mockDeleteProductUseCase.execute.mockResolvedValue(false);

      // Act
      await productController.deleteProduct(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.ERROR,
        message: PRODUCT_ERROR_MESSAGES.NOT_FOUND,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors and pass them to next middleware', async () => {
      // Arrange
      const error = new Error('Database error');
      mockRequest.params = { id: 'product-id' };
      mockDeleteProductUseCase.execute.mockRejectedValue(error);

      // Act
      await productController.deleteProduct(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('getWishlist', () => {
    it('should retrieve wishlist products successfully', async () => {
      // Arrange
      const mockResult = {
        products: [],
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockRequest.query = { page: '1', limit: '10' };
      mockListProductsUseCase.execute.mockResolvedValue(mockResult);

      // Act
      await productController.getWishlist(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockListProductsUseCase.execute).toHaveBeenCalledWith({
        page: '1',
        limit: '10',
        isWishlistStatus: true,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.SUCCESS,
        data: mockResult,
        message: PRODUCT_SUCCESS_MESSAGES.WISHLIST_RETRIEVED,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should retrieve wishlist products with default parameters', async () => {
      // Arrange
      const mockResult = {
        products: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockRequest.query = {};
      mockListProductsUseCase.execute.mockResolvedValue(mockResult);

      // Act
      await productController.getWishlist(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockListProductsUseCase.execute).toHaveBeenCalledWith({
        page: undefined,
        limit: undefined,
        isWishlistStatus: true,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.SUCCESS,
        data: mockResult,
        message: PRODUCT_SUCCESS_MESSAGES.WISHLIST_RETRIEVED,
      });
    });

    it('should handle errors and pass them to next middleware', async () => {
      // Arrange
      const error = new Error('Database error');
      mockRequest.query = {};
      mockListProductsUseCase.execute.mockRejectedValue(error);

      // Act
      await productController.getWishlist(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });
});
