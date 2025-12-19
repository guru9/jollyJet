export const APP_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  TOKEN_EXPIRY: '24h',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  VALIDATION_ERROR: 'Validation error',
  DATABASE_ERROR: 'Database operation failed',
};

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

export const ORDER_CONSTANTS = {
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 100,
  CANCELLATION_WINDOW_HOURS: 24,
  MIN_ORDER_AMOUNT: 1,
};

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

// Wishlist Constants
export const WISHLIST_CONSTANTS = {
  MAX_ITEMS_PER_USER: 100,
  MAX_ITEM_NAME_LENGTH: 100,
  MAX_ITEM_DESCRIPTION_LENGTH: 500,
  DEFAULT_WISHLIST_NAME: 'My Wishlist',
  WISHLIST_EXPIRY_DAYS: 30,
  MAX_WISHLIST_COUNT: 1000000,
  MIN_WISHLIST_COUNT: 0,
};

// Wishlist Error Messages
export const WISHLIST_ERRORS = {
  WISHLIST_ERROR: 'Wishlist operation failed',
  ALREADY_IN_WISHLIST: 'Product is already in wishlist',
  NOT_IN_WISHLIST: 'Product is not in wishlist',
  WISHLIST_LIMIT_EXCEEDED: 'Wishlist limit exceeded',
};

// DI Container Tokens for Dependency Injection
// These tokens enable loose coupling between layers through dependency injection
export const DI_TOKENS = {
  PRODUCT_REPOSITORY: 'ProductRepository', // Injection token for product repository
  // Future tokens can be added here for other modules
} as const;
