import { Types } from 'mongoose';
import { z, ZodType } from 'zod';
import {
  calculatePaginationMeta,
  capitalize,
  createPaginatedResponse,
  formatDate,
  generateRandomString,
  getPaginationParams,
  isEmpty,
  isExpired,
  isValidEmail,
  isValidObjectId,
  safeParseBoolean,
  safeParseFloat,
  safeParseInt,
  safeParseString,
  slugify,
  toObjectId,
  validateProductId,
  validateRequest,
} from '../../src/shared/utils';

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

  describe('safeParseInt', () => {
    it('should parse valid string to integer', () => {
      expect(safeParseInt('123')).toBe(123);
      expect(safeParseInt('0')).toBe(0);
      expect(safeParseInt('-456')).toBe(-456);
    });

    it('should return default value for invalid string', () => {
      expect(safeParseInt('abc')).toBe(0);
      expect(safeParseInt('123abc')).toBe(0);
      expect(safeParseInt('')).toBe(0);
    });

    it('should return default value for non-string types', () => {
      expect(safeParseInt(123 as unknown as string)).toBe(0);
      expect(safeParseInt(null as unknown as string)).toBe(0);
      expect(safeParseInt(undefined as unknown as string)).toBe(0);
      expect(safeParseInt(true as unknown as string)).toBe(0);
    });

    it('should use custom default value', () => {
      expect(safeParseInt('abc', 10)).toBe(10);
      expect(safeParseInt('', 5)).toBe(5);
    });
  });

  describe('safeParseFloat', () => {
    it('should parse valid string to float', () => {
      expect(safeParseFloat('123.45')).toBe(123.45);
      expect(safeParseFloat('0.0')).toBe(0);
      expect(safeParseFloat('-45.67')).toBe(-45.67);
    });

    it('should return default value for invalid string', () => {
      expect(safeParseFloat('abc')).toBe(0);
      expect(safeParseFloat('123abc')).toBe(0);
      expect(safeParseFloat('')).toBe(0);
    });

    it('should return default value for non-string types', () => {
      expect(safeParseFloat(123 as unknown as string)).toBe(0);
      expect(safeParseFloat(null as unknown as string)).toBe(0);
      expect(safeParseFloat(undefined as unknown as string)).toBe(0);
      expect(safeParseFloat(true as unknown as string)).toBe(0);
    });

    it('should use custom default value', () => {
      expect(safeParseFloat('abc', 10.5)).toBe(10.5);
      expect(safeParseFloat('', 5.5)).toBe(5.5);
    });
  });

  describe('isEmpty', () => {
    it('should return true for null/undefined', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return true for empty string', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
    });

    it('should return true for empty array', () => {
      expect(isEmpty([])).toBe(true);
    });

    it('should return true for empty plain object', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('should return true for empty Map/Set', () => {
      expect(isEmpty(new Map())).toBe(true);
      expect(isEmpty(new Set())).toBe(true);
    });

    it('should return false for non-empty values', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ key: 'value' })).toBe(false);
      expect(isEmpty(new Map([['key', 'value']]))).toBe(false);
      expect(isEmpty(new Set([1]))).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });

  describe('capitalize', () => {
    it('should capitalize string correctly', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('Hello');
      expect(capitalize('h')).toBe('H');
    });

    it('should return original value for empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('should return original value for non-string types', () => {
      expect(capitalize(123 as unknown as string)).toBe(123);
      expect(capitalize(null as unknown as string)).toBe(null);
      expect(capitalize(undefined as unknown as string)).toBe(undefined);
    });
  });

  describe('safeParseString', () => {
    it('should return string value for string input', () => {
      expect(safeParseString('hello')).toBe('hello');
      expect(safeParseString('')).toBe('');
    });

    it('should return undefined for non-string types', () => {
      expect(safeParseString(123)).toBeUndefined();
      expect(safeParseString(null)).toBeUndefined();
      expect(safeParseString(undefined)).toBeUndefined();
      expect(safeParseString(true)).toBeUndefined();
      expect(safeParseString([])).toBeUndefined();
      expect(safeParseString({})).toBeUndefined();
    });
  });

  describe('safeParseBoolean', () => {
    it('should parse "true" to true', () => {
      expect(safeParseBoolean('true')).toBe(true);
      expect(safeParseBoolean('TRUE')).toBeUndefined();
    });

    it('should parse "false" to false', () => {
      expect(safeParseBoolean('false')).toBe(false);
      expect(safeParseBoolean('FALSE')).toBeUndefined();
    });

    it('should return undefined for other string values', () => {
      expect(safeParseBoolean('')).toBeUndefined();
      expect(safeParseBoolean('abc')).toBeUndefined();
      expect(safeParseBoolean('123')).toBeUndefined();
    });

    it('should return undefined for non-string types', () => {
      expect(safeParseBoolean(true)).toBeUndefined();
      expect(safeParseBoolean(false)).toBeUndefined();
      expect(safeParseBoolean(123)).toBeUndefined();
      expect(safeParseBoolean(null)).toBeUndefined();
      expect(safeParseBoolean(undefined)).toBeUndefined();
    });
  });

  describe('validateProductId', () => {
    it('should throw error for invalid product id', () => {
      expect(() => validateProductId('', 'Product ID is required')).toThrow();
      expect(() => validateProductId('   ', 'Product ID is required')).toThrow();
      expect(() => validateProductId('invalid-id', 'Product ID is required')).toThrow();
    });

    it('should not throw error for valid product id', () => {
      const validId = new Types.ObjectId().toString();
      expect(() => validateProductId(validId, 'Product ID is required')).not.toThrow();
    });
  });

  describe('validateRequest', () => {
    it('should validate request data against Zod schema', () => {
      const schema = z.object({
        body: z.object({
          name: z.string(),
        }),
      });

      const middleware = validateRequest(schema);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockReq = { body: { name: 'test' }, query: {}, params: {} } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
      const mockNext = jest.fn();

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 422 error for invalid data', () => {
      const schema = z.object({
        body: z.object({
          name: z.string().min(3),
        }),
      });

      const middleware = validateRequest(schema);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockReq = { body: { name: 'ab' }, query: {}, params: {} } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
      const mockNext = jest.fn();

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should handle non-Zod errors', () => {
      const schema = {
        parse: () => {
          throw new Error('Non-Zod error');
        },
      } as unknown as ZodType;

      const middleware = validateRequest(schema);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockReq = { body: {}, query: {}, params: {} } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
      const mockNext = jest.fn();

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
