/**
 * Application-wide constants for pagination, authentication, and general configuration.
 */
export const APP_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  TOKEN_EXPIRY: '24h',
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
 * Standardized response status strings for API Errors.
 */
export const ERROR_STATUS = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  UNAUTHORIZED: 'Unauthorized access',
  VALIDATION_ERROR: 'Validation error',
  DATABASE_ERROR: 'Database operation failed',
};
/**
 *
 * Success messages for product-related operations to provide consistent user feedback.
 */
export const PRODUCT_SUCCESS_MESSAGES = {
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_RETRIEVED: 'Product retrieved successfully',
  PRODUCTS_RETRIEVED: 'Products retrieved successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
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
  VALIDATION_ERROR: 'Validation error',
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
  DEFAULT_WISHLIST_STATUS: false,
};

/**
 * Order-related constants for validation and business rules.
 */
export const ORDER_CONSTANTS = {
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 100,
  CANCELLATION_WINDOW_HOURS: 24,
  MIN_ORDER_AMOUNT: 1,
};

/**
 * Regular expressions and validation rules for user input validation across the application.
 */
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  WISHLIST_NAME_REGEX: /^[a-zA-Z0-9\s\-_]{3,50}$/,
  WISHLIST_ITEM_NAME_REGEX: /^[a-zA-Z0-9\s\-_,.!]{3,100}$/,
};

/**
 * Constants specific to wishlist functionality including limits and default values.
 */
export const WISHLIST_CONSTANTS = {
  MAX_ITEMS_PER_USER: 100,
  MAX_ITEM_NAME_LENGTH: 100,
  MAX_ITEM_DESCRIPTION_LENGTH: 500,
  DEFAULT_WISHLIST_NAME: 'My Wishlist',
  WISHLIST_EXPIRY_DAYS: 30,
  MAX_WISHLIST_COUNT: 1000000,
  MIN_WISHLIST_COUNT: 0,
};

/**
 * Error messages specific to wishlist operations for consistent error handling.
 */
export const WISHLIST_ERRORS = {
  WISHLIST_ERROR: 'Wishlist operation failed',
  ALREADY_IN_WISHLIST: 'Product is already in wishlist',
  NOT_IN_WISHLIST: 'Product is not in wishlist',
  WISHLIST_LIMIT_EXCEEDED: 'Wishlist limit exceeded',
};

/**
 * Dependency Injection container tokens for loose coupling between application layers.
 * These string tokens are used to register and resolve dependencies in the DI container.
 */
export const DI_TOKENS = {
  PRODUCT_REPOSITORY: 'ProductRepository', // Injection token for product repository
  // Future tokens can be added here for other modules
} as const;
