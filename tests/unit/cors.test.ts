import { getCorsConfig, getCorsOptions, ICorsConfig } from '@/config/cors';
import { CORS_ERROR_MESSAGES, CORS_LOG_MESSAGES } from '@/shared/constants';

describe('CORS Configuration', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.clearAllMocks();
  });

  describe('ICorsConfig Interface', () => {
    it('should define all required properties', () => {
      const config: ICorsConfig = {
        allowedOrigins: ['https://example.com'],
        allowedMethods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        exposedHeaders: ['X-Total-Count'],
        maxAge: 86400,
        credentials: true,
        originValidationEnabled: true,
        logViolations: true,
        blockNonCorsRequests: false,
      };

      expect(config.allowedOrigins).toEqual(['https://example.com']);
      expect(config.allowedMethods).toEqual(['GET', 'POST']);
      expect(config.allowedHeaders).toEqual(['Content-Type']);
      expect(config.exposedHeaders).toEqual(['X-Total-Count']);
      expect(config.maxAge).toBe(86400);
      expect(config.credentials).toBe(true);
      expect(config.originValidationEnabled).toBe(true);
      expect(config.logViolations).toBe(true);
      expect(config.blockNonCorsRequests).toBe(false);
    });
  });

  describe('Environment Configurations', () => {
    it('should return development config in development environment', () => {
      process.env.NODE_ENV = 'development';
      const config = getCorsConfig();

      expect(config.allowedOrigins).toEqual(['http://localhost:3000', 'http://localhost:3001']);
      expect(config.originValidationEnabled).toBe(false);
      expect(config.logViolations).toBe(true);
      expect(config.blockNonCorsRequests).toBe(false);
    });

    it('should return staging config in staging environment', () => {
      process.env.NODE_ENV = 'staging';
      const config = getCorsConfig();

      expect(config.allowedOrigins).toEqual(['https://staging.jollyjet.com']);
      expect(config.originValidationEnabled).toBe(true);
      expect(config.logViolations).toBe(true);
      expect(config.blockNonCorsRequests).toBe(false);
    });

    it('should return production config in production environment', () => {
      process.env.NODE_ENV = 'production';
      const config = getCorsConfig();

      expect(config.allowedOrigins).toEqual(['https://jollyjet.com', 'https://www.jollyjet.com']);
      expect(config.originValidationEnabled).toBe(true);
      expect(config.logViolations).toBe(true);
      expect(config.blockNonCorsRequests).toBe(true);
    });

    it('should default to development config when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;
      const config = getCorsConfig();

      expect(config.allowedOrigins).toEqual(['http://localhost:3000', 'http://localhost:3001']);
      expect(config.originValidationEnabled).toBe(false);
    });

    it('should throw error for invalid environment', () => {
      process.env.NODE_ENV = 'invalid';
      expect(() => getCorsConfig()).toThrow(
        CORS_ERROR_MESSAGES.CONFIG_NOT_FOUND.replace('{env}', 'invalid')
      );
    });
  });

  describe('getCorsOptions', () => {
    it('should return valid CorsOptions object', () => {
      process.env.NODE_ENV = 'development';
      const corsOptions = getCorsOptions();

      expect(corsOptions).toHaveProperty('origin');
      expect(corsOptions).toHaveProperty('methods');
      expect(corsOptions).toHaveProperty('allowedHeaders');
      expect(corsOptions).toHaveProperty('exposedHeaders');
      expect(corsOptions).toHaveProperty('credentials');
      expect(corsOptions).toHaveProperty('maxAge');
      expect(typeof corsOptions.origin).toBe('function');
    });

    it('should configure origin validation function', () => {
      process.env.NODE_ENV = 'development';
      const corsOptions = getCorsOptions();
      const mockCallback = jest.fn();

      // Test with allowed origin in development (validation disabled)
      corsOptions.origin('http://localhost:3000', mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(null, true);

      // Test with any origin in development (should allow)
      corsOptions.origin('https://any-domain.com', mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(null, true);
    });

    it('should configure origin validation for production', () => {
      process.env.NODE_ENV = 'production';
      const corsOptions = getCorsOptions();
      const mockCallback = jest.fn();

      // Test with allowed origin
      corsOptions.origin('https://jollyjet.com', mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(null, true);

      // Test with disallowed origin
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      corsOptions.origin('https://malicious.com', mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(expect.any(Error));
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        CORS_LOG_MESSAGES.VIOLATION_DETECTED.replace('{origin}', 'https://malicious.com').replace(
          '{env}',
          'production'
        )
      );
      consoleWarnSpy.mockRestore();
    });

    it('should handle null origin correctly', () => {
      process.env.NODE_ENV = 'production';
      const corsOptions = getCorsOptions();
      const mockCallback = jest.fn();

      // In production, null origin should be blocked
      corsOptions.origin(null, mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle undefined origin correctly', () => {
      process.env.NODE_ENV = 'development';
      const corsOptions = getCorsOptions();
      const mockCallback = jest.fn();

      // In development, undefined origin should be allowed
      corsOptions.origin(undefined, mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(null, true);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate configuration on getCorsOptions call', () => {
      process.env.NODE_ENV = 'development';
      expect(() => getCorsOptions()).not.toThrow();
    });

    it('should validate URL formats in allowedOrigins', () => {
      process.env.NODE_ENV = 'development';
      // The development config has valid URLs, so this should pass
      expect(() => getCorsOptions()).not.toThrow();
    });
  });

  describe('Constants Integration', () => {
    it('should use CORS_ERROR_MESSAGES constants', () => {
      expect(CORS_ERROR_MESSAGES.CONFIG_NOT_FOUND).toContain('{env}');
      expect(CORS_ERROR_MESSAGES.ORIGIN_NOT_ALLOWED).toContain('{origin}');
    });

    it('should use CORS_LOG_MESSAGES constants', () => {
      expect(CORS_LOG_MESSAGES.VIOLATION_DETECTED).toContain('{origin}');
      expect(CORS_LOG_MESSAGES.VIOLATION_DETECTED).toContain('{env}');
    });

    it('should properly replace placeholders in error messages', () => {
      const message = CORS_ERROR_MESSAGES.CONFIG_NOT_FOUND.replace('{env}', 'test');
      expect(message).toBe('CORS configuration not found for environment: test');
    });

    it('should properly replace placeholders in log messages', () => {
      const message = CORS_LOG_MESSAGES.VIOLATION_DETECTED.replace(
        '{origin}',
        'https://test.com'
      ).replace('{env}', 'production');
      expect(message).toBe(
        'CORS violation detected: https://test.com not allowed (Environment: production)'
      );
    });
  });

  describe('Origin Validation Logic', () => {
    it('should allow requests without origin when blockNonCorsRequests is false', () => {
      process.env.NODE_ENV = 'development';
      const corsOptions = getCorsOptions();
      const mockCallback = jest.fn();

      corsOptions.origin(undefined, mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(null, true);
    });

    it('should validate URL format for origins', () => {
      process.env.NODE_ENV = 'production';
      const corsOptions = getCorsOptions();
      const mockCallback = jest.fn();

      // Invalid URL format should be rejected
      corsOptions.origin('not-a-url', mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject non-HTTP protocols', () => {
      process.env.NODE_ENV = 'production';
      const corsOptions = getCorsOptions();
      const mockCallback = jest.fn();

      // Non-HTTP protocol should be rejected
      corsOptions.origin('ftp://example.com', mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in origin callback gracefully', () => {
      process.env.NODE_ENV = 'development';
      const corsOptions = getCorsOptions();
      const mockCallback = jest.fn();

      // This should not throw, even if there are internal errors
      expect(() => {
        corsOptions.origin('http://localhost:3000', mockCallback);
      }).not.toThrow();
    });

    it('should provide descriptive error messages', () => {
      process.env.NODE_ENV = 'production';
      const corsOptions = getCorsOptions();
      const mockCallback = jest.fn();

      corsOptions.origin('https://unauthorized.com', mockCallback);
      const error = mockCallback.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('not allowed by CORS policy');
    });
  });
});
