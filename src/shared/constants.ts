/**
 * Application-wide constants for pagination and general configuration.
 */
export const APP_CONSTANTS = {
  MAX_PAGE_SIZE: 100,
};

/**
 * Standard HTTP status codes used throughout the application for consistent API responses.
 */
export enum HTTP_STATUS {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Standardized response status strings for API responses.
 */
export enum RESPONSE_STATUS {
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Standardized error messages for consistent error responses.
 */
export const ERROR_STATUS = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  UNAUTHORIZED: 'Unauthorized access',
  VALIDATION_ERROR: 'Validation error',
  DATABASE_ERROR: 'Database operation failed',
  INVALID_OBJECT_ID: 'Invalid ObjectId',
};

/**
 * Success messages for product-related operations to provide consistent user feedback.
 */
export const PRODUCT_SUCCESS_MESSAGES = {
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_RETRIEVED: 'Product retrieved successfully',
  PRODUCTS_RETRIEVED: 'Products retrieved successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  PRODUCTS_COUNT_RETRIEVED: 'Products count retrieved successfully',
  WISHLIST_TOGGLED: 'Product wishlist status updated successfully',
  WISHLIST_RETRIEVED: 'Wishlist products retrieved successfully',
  OPERATION_SUCCESSFUL: 'Operation completed successfully',
};

/**
 * Error messages for product-related operations to provide consistent error responses.
 */
export const PRODUCT_ERROR_MESSAGES = {
  NOT_AVAILABLE: 'Product is not available.',
  NOT_FOUND: 'Product not found.',
  PRODUCT_NOT_FOUND_UPDATE: 'Product not found for update.',
  PRODUCT_ID_REQ_RETRIEVE: 'Product ID is required to retrieve the product.',
  PRODUCT_ID_REQ_UPDATE: 'Product ID is required for updation.',
  PRODUCT_ID_REQ_DELETE: 'Product ID is required for deletion.',
  PRODUCT_ID_REQ_WISHLIST: 'Product ID is required for wishlist toggle.',
  PRODUCT_ID_INVALID: 'Invalid product ID format.',
};

/**
 * Validation error messages for product fields to ensure consistent validation messages.
 */
export const PRODUCT_VALIDATION_MESSAGES = {
  // Zod schema validation messages (used in ProductValidators.ts)
  NAME_MIN_LENGTH: 'Name must be at least 3 characters long',
  NAME_MAX_LENGTH: 'Name must be at most 30 characters long',
  DESCRIPTION_MIN_LENGTH: 'Description must be at least 10 characters long',
  PRICE_MIN: 'Price must be a non-negative number',
  STOCK_MIN: 'Stock must be non-negative number',
  CATEGORY_REQUIRED: 'Category is required',
  PRODUCT_ID_REQUIRED: 'Product ID is required',
  PRICE_RANGE_INVALID:
    'Price range must be valid JSON with min and max as non-negative numbers, min <= max',
  PAGE_INVALID: 'Page must be a positive integer',
  LIMIT_INVALID: 'Limit must be a positive integer between 1 and 100',
  // Domain entity validation messages
  PRODUCT_NAME_REQUIRED: 'Product name is required.',
  PRODUCT_DESCRIPTION_REQUIRED: 'Product description is required.',
  PRODUCT_PRICE_INVALID: 'Product price must be a non-negative number.',
  PRODUCT_STOCK_INVALID: 'Product stock must be a non-negative number.',
  PRODUCT_CATEGORY_REQUIRED: 'Product category is required.',
  WISHLIST_COUNT_INVALID: 'wishlistCount must be a non-negative number if provided.',
};

/**
 * Product-specific constants defining validation rules, limits, and default values.
 */
export const PRODUCT_CONSTANTS = {
  MIN_PRICE: 0,
  MAX_PRICE: 1000000,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  DEFAULT_CATEGORY: 'general',
  MIN_STOCK: 0,
  MAX_STOCK: 100000,
  MIN_WISHLIST_COUNT: 0,
  MAX_WISHLIST_COUNT: 1000000,
  MAX_WISHLIST_ITEMS_PER_USER: 100,
};

/**
 * Dependency Injection container tokens for loose coupling between application layers.
 * These string tokens are used to register and resolve dependencies in the DI container.
 */
export const DI_TOKENS = {
  PRODUCT_REPOSITORY: 'ProductRepository', // Injection token for product repository
  // Future tokens can be added here for other modules
} as const;
