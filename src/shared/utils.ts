import { Types } from 'mongoose';
import { ApiResponse, PaginatedResponse, PaginationMeta, PaginationParams } from '../types';
import { APP_CONSTANTS } from './constants';

/**
 * Validate if a string is a valid MongoDB ObjectId
 */
export const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

/**
 * Convert string to MongoDB ObjectId with validation
 * @throws {Error} if id is invalid
 */
export const toObjectId = (id: string): Types.ObjectId => {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ObjectId: ${id}`);
  }
  return new Types.ObjectId(id);
};

/**
 * Parse and validate pagination parameters
 * Returns sanitized page, limit, and skip values
 */
export const getPaginationParams = (page?: number, limit?: number): PaginationParams => {
  const sanitizedPage = Math.max(1, page || 1);
  const sanitizedLimit = Math.min(
    APP_CONSTANTS.MAX_PAGE_SIZE,
    Math.max(1, limit || APP_CONSTANTS.DEFAULT_PAGE_SIZE)
  );
  const skip = (sanitizedPage - 1) * sanitizedLimit;

  return {
    page: sanitizedPage,
    limit: sanitizedLimit,
    skip,
  };
};

/**
 * Create a standardized paginated response
 */
export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => {
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
 * Create a standardized success response
 */
export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
};

/**
 * Create a standardized error response
 */
export const errorResponse = (
  message: string,
  errors?: Array<{ field: string; message: string }>
): ApiResponse<never> => {
  return {
    success: false,
    message,
    ...(errors && { errors }),
  };
};

/**
 * Remove undefined and null values from an object
 */
export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key as keyof T] = value as T[keyof T];
      }
      return acc;
    },
    {} as Record<string, unknown> as Partial<T>
  );
};

/**
 * Convert text to URL-friendly slug
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

/**
 * Format date to ISO string
 */
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

/**
 * Check if a date is in the past
 */
export const isExpired = (date: Date): boolean => {
  return date.getTime() < Date.now();
};

/**
 * Calculate pagination metadata
 */
export const calculatePaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate a random alphanumeric string
 */
export const generateRandomString = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
