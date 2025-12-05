import { Types } from 'mongoose';
import {
  calculatePaginationMeta,
  createPaginatedResponse,
  errorResponse,
  formatDate,
  generateRandomString,
  getPaginationParams,
  isExpired,
  isValidEmail,
  isValidObjectId,
  sanitizeObject,
  slugify,
  successResponse,
  toObjectId,
} from '../../shared/utils';

describe('Utility Functions', () => {
  describe('isValidObjectId', () => {
    it('should return true for valid ObjectId', () => {
      const validId = new Types.ObjectId().toString();
      expect(isValidObjectId(validId)).toBe(true);
    });

    it('should return false for invalid ObjectId', () => {
      expect(isValidObjectId('invalid-id')).toBe(false);
      expect(isValidObjectId('123')).toBe(false);
      expect(isValidObjectId('')).toBe(false);
    });
  });

  describe('toObjectId', () => {
    it('should convert valid string to ObjectId', () => {
      const validId = new Types.ObjectId().toString();
      const result = toObjectId(validId);
      expect(result).toBeInstanceOf(Types.ObjectId);
      expect(result.toString()).toBe(validId);
    });

    it('should throw error for invalid ObjectId', () => {
      expect(() => toObjectId('invalid-id')).toThrow('Invalid ObjectId');
    });
  });

  describe('getPaginationParams', () => {
    it('should return default pagination params when no args provided', () => {
      const result = getPaginationParams();
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.skip).toBe(0);
    });

    it('should sanitize negative page to 1', () => {
      const result = getPaginationParams(-5, 10);
      expect(result.page).toBe(1);
      expect(result.skip).toBe(0);
    });

    it('should limit max page size to 100', () => {
      const result = getPaginationParams(1, 200);
      expect(result.limit).toBe(100);
    });

    it('should calculate skip correctly', () => {
      const result = getPaginationParams(3, 10);
      expect(result.skip).toBe(20);
    });
  });

  describe('createPaginatedResponse', () => {
    it('should create paginated response with correct structure', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = createPaginatedResponse(data, 20, 1, 10);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.pagination.total).toBe(20);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should calculate total pages correctly', () => {
      const result = createPaginatedResponse([], 25, 1, 10);
      expect(result.pagination.totalPages).toBe(3);
    });
  });

  describe('successResponse', () => {
    it('should create success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const result = successResponse(data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.message).toBeUndefined();
    });

    it('should include message when provided', () => {
      const result = successResponse({ id: 1 }, 'Success message');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Success message');
    });
  });

  describe('errorResponse', () => {
    it('should create error response with message', () => {
      const result = errorResponse('Error occurred');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Error occurred');
      expect(result.errors).toBeUndefined();
    });

    it('should include errors array when provided', () => {
      const errors = [{ field: 'email', message: 'Invalid email' }];
      const result = errorResponse('Validation failed', errors);

      expect(result.success).toBe(false);
      expect(result.errors).toEqual(errors);
    });
  });

  describe('sanitizeObject', () => {
    it('should remove null and undefined values', () => {
      const obj = { a: 1, b: null, c: undefined, d: 'test' };
      const result = sanitizeObject(obj);

      expect(result).toEqual({ a: 1, d: 'test' });
    });

    it('should keep falsy values that are not null/undefined', () => {
      const obj = { a: 0, b: false, c: '', d: null };
      const result = sanitizeObject(obj);

      expect(result).toEqual({ a: 0, b: false, c: '' });
    });
  });

  describe('slugify', () => {
    it('should convert text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(slugify('Hello @#$ World!')).toBe('hello-world');
    });

    it('should replace multiple spaces with single dash', () => {
      expect(slugify('Hello    World')).toBe('hello-world');
    });

    it('should trim dashes from start and end', () => {
      expect(slugify('  Hello World  ')).toBe('hello-world');
    });
  });

  describe('formatDate', () => {
    it('should format date to ISO string', () => {
      const date = new Date('2025-12-05T10:00:00.000Z');
      const result = formatDate(date);

      expect(result).toBe('2025-12-05T10:00:00.000Z');
    });
  });

  describe('isExpired', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date('2020-01-01');
      expect(isExpired(pastDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date('2030-01-01');
      expect(isExpired(futureDate)).toBe(false);
    });
  });

  describe('calculatePaginationMeta', () => {
    it('should calculate pagination metadata correctly', () => {
      const result = calculatePaginationMeta(50, 2, 10);

      expect(result.total).toBe(50);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(5);
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
    });
  });

  describe('generateRandomString', () => {
    it('should generate string of default length 10', () => {
      const result = generateRandomString();
      expect(result).toHaveLength(10);
    });

    it('should generate string of specified length', () => {
      const result = generateRandomString(20);
      expect(result).toHaveLength(20);
    });

    it('should only contain alphanumeric characters', () => {
      const result = generateRandomString(50);
      expect(result).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('should generate different strings on multiple calls', () => {
      const str1 = generateRandomString(20);
      const str2 = generateRandomString(20);
      expect(str1).not.toBe(str2);
    });
  });
});
