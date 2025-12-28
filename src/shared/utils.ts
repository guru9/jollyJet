import { randomBytes } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { ZodError, ZodType } from 'zod';
import { ERROR_STATUS, HTTP_STATUS } from './constants';

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
          message: ERROR_STATUS.VALIDATION_ERROR,
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
 * @param length - Length of the string (must be positive, default: 10)
 * @returns Random string
 */
export const generateRandomString = (length: number = 10): string => {
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

/**
 * Converts a string to a URL-friendly slug.
 * Converts to lowercase, replaces spaces with dashes, removes special characters,
 * and trims dashes from start and end.
 * @param text - Text to convert to slug
 * @returns URL-friendly slug string
 */
export const slugify = (text: string): string => {
  if (typeof text !== 'string') return '';

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, ''); // Trim dashes from start and end
};

/**
 * Validates if a string is a valid MongoDB ObjectId.
 * @param id - String to validate
 * @returns True if valid ObjectId, false otherwise
 */
export const isValidObjectId = (id: string): boolean => {
  if (typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Converts a string to MongoDB ObjectId.
 * @param id - String to convert
 * @returns ObjectId instance
 * @throws Error if invalid ObjectId
 */
export const toObjectId = (id: string): Types.ObjectId => {
  if (!isValidObjectId(id)) {
    throw new Error(ERROR_STATUS.INVALID_OBJECT_ID);
  }
  return new Types.ObjectId(id);
};

/**
 * Gets pagination parameters with validation and defaults.
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10, max: 100)
 * @returns Pagination parameters with page, limit, and skip
 */
export const getPaginationParams = (page: number = 1, limit: number = 10) => {
  const validatedPage = Math.max(1, page);
  const validatedLimit = Math.min(100, Math.max(1, limit));
  const skip = (validatedPage - 1) * validatedLimit;

  return {
    page: validatedPage,
    limit: validatedLimit,
    skip,
  };
};

/**
 * Creates a paginated response object.
 * @param data - Array of data items
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Paginated response object
 */
export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Formats a date to ISO string format.
 * @param date - Date to format
 * @returns ISO string representation of the date
 */
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

/**
 * Checks if a date is in the past (expired).
 * @param date - Date to check
 * @returns True if date is in the past, false otherwise
 */
export const isExpired = (date: Date): boolean => {
  return date < new Date();
};

/**
 * Calculates pagination metadata.
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Pagination metadata object
 */
export const calculatePaginationMeta = (total: number, page: number, limit: number) => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
  };
};

/**
 * Safely converts a value to a string.
 * Returns the string if input is a string, undefined otherwise.
 * @param value - Value to convert
 * @returns String or undefined
 */
export const safeParseString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined;
};

/**
 * Safely parses a string to a boolean.
 * Returns true for 'true', false for 'false', undefined for other values or non-strings.
 * @param value - String value to parse
 * @returns Parsed boolean or undefined
 */
export const safeParseBoolean = (value: unknown): boolean | undefined => {
  if (typeof value !== 'string') return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

/**
 * Validates if a string is a valid email address.
 * @param email - Email string to validate
 * @returns True if valid email, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  if (typeof email !== 'string') return false;

  const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;
  return emailRegex.test(email);
};
