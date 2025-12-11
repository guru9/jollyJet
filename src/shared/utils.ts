import { randomBytes } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodType } from 'zod';
import { ERROR_MESSAGES, HTTP_STATUS } from './constants';

/**
 * Validates request data against a Zod schema.
 * Parses body, query, and params, and calls next() if valid.
 * If validation fails, sends a 422 response with error details.
 * Passes non-Zod errors to the next error handler.
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateRequest = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
          status: 'error',
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

/**
 * Creates a standardized success response object.
 * @param data - Response data
 * @param message - Optional success message
 * @param statusCode - HTTP status code (default: 200)
 * @returns Standardized response object
 */
export const createSuccessResponse = <T>(
  data: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
) => ({
  status: 'success',
  message,
  data,
  statusCode,
});

/**
 * Creates a standardized error response object.
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 500)
 * @param errors - Optional array of error details
 * @returns Standardized error response object
 */
export const createErrorResponse = (
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors?: unknown[]
) => ({
  status: 'error',
  message,
  errors,
  statusCode,
});

/**
 * Safely parses a string to an integer.
 * Returns the default value if parsing fails or input is not a string.
 * @param value - String value to parse
 * @param defaultValue - Default value if parsing fails (default: 0)
 * @returns Parsed integer or default value
 */
export const safeParseInt = (value: string, defaultValue: number = 0): number => {
  if (typeof value !== 'string') return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Safely parses a string to a float.
 * Returns the default value if parsing fails or input is not a string.
 * @param value - String value to parse
 * @param defaultValue - Default value if parsing fails (default: 0)
 * @returns Parsed float or default value
 */
export const safeParseFloat = (value: string, defaultValue: number = 0): number => {
  if (typeof value !== 'string') return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Generates a cryptographically secure random string of specified length using alphanumeric characters.
 * Uses Node.js crypto module for better security compared to Math.random().
 * Returns an empty string if length is less than or equal to 0.
 * @param length - Length of the string (must be positive)
 * @returns Random string
 */
export const generateRandomString = (length: number): string => {
  if (length <= 0) return '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
};

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, empty plain object, empty Map, empty Set).
 * For non-plain objects (e.g., functions, dates), returns false.
 * @param value - Value to check
 * @returns True if value is empty, false otherwise
 */
export const isEmpty = (value: unknown): boolean => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (typeof value === 'object' && value.constructor === Object) {
    return Object.keys(value).length === 0;
  }
  return false;
};

/**
 * Capitalizes the first letter of a string and lowercases the rest.
 * Returns the original value if input is not a string.
 * @param str - String to capitalize
 * @returns Capitalized string or original value
 */
export const capitalize = (str: string): string => {
  if (typeof str !== 'string' || !str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
