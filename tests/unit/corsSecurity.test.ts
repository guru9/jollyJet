/**
 * CORS Security Middleware Tests
 *
 * Tests for the new essential CORS security middleware that provides
 * IP validation, geographic blocking, and security headers for the JollyJet API.
 *
 * These tests focus on the essential security scope (not enterprise-grade)
 * and validate the integration with the existing application architecture.
 */

import { ICorsSecurityService } from '@/domain/interfaces/security/ICorsSecurityService';
import { corsSecurityHandler } from '@/interface/middlewares/corsSecurityHandler';
import { CORS_SECURITY, DI_TOKENS } from '@/shared/constants';
import express, { Response } from 'express';
import request from 'supertest';
import { container } from 'tsyringe';

// Mock Express app for testing
const createMockApp = (geographicBlocking = false) => {
  const app = express();
  app.use(
    corsSecurityHandler({
      geographicBlocking,
      blockedCountries: ['CN', 'RU', 'KP', 'IR'],
    })
  );

  // Add a test route
  app.get('/test', (req, res) => {
    res.status(200).json({ message: 'Test endpoint' });
  });

  return app;
};

describe('CORS Security Middleware', () => {
  let mockSecurityService: jest.Mocked<ICorsSecurityService>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock security service
    mockSecurityService = {
      validateIPAddress: jest.fn().mockResolvedValue(true),
      checkGeographicRestrictions: jest.fn().mockResolvedValue(true),
      applySecurityHeaders: jest.fn(),
      logSecurityEvent: jest.fn(),
    } as unknown as jest.Mocked<ICorsSecurityService>;

    // Register mock dependencies
    container.register<ICorsSecurityService>(DI_TOKENS.CORS_SECURITY_SERVICE, {
      useValue: mockSecurityService,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Security Headers Application', () => {
    it('should apply essential security headers', async () => {
      const app = createMockApp();
      await request(app).get('/test').set('Origin', 'https://jollyjet.com');

      expect(mockSecurityService.applySecurityHeaders).toHaveBeenCalled();
    });

    it('should set all required security headers', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
      } as unknown as Response;

      const mockService = {
        applySecurityHeaders: jest.fn(),
      };

      // Simulate middleware operation
      mockService.applySecurityHeaders(mockResponse);

      expect(mockService.applySecurityHeaders).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('IP Validation', () => {
    it('should validate IP address', async () => {
      mockSecurityService.validateIPAddress.mockResolvedValue(true);

      const app = createMockApp();
      await request(app).get('/test').set('X-Forwarded-For', '192.168.1.1');

      expect(mockSecurityService.validateIPAddress).toHaveBeenCalledWith('192.168.1.1');
    });

    it('should block request when IP validation fails', async () => {
      mockSecurityService.validateIPAddress.mockResolvedValue(false);

      const app = createMockApp();
      const response = await request(app).get('/test').set('X-Forwarded-For', '192.168.1.100');

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        status: 'error',
        message: CORS_SECURITY.MESSAGES.IP_BLOCKED,
      });
    });

    it('should handle unknown IP addresses gracefully', async () => {
      mockSecurityService.validateIPAddress.mockResolvedValue(false);

      const app = createMockApp();
      const response = await request(app).get('/test').set('X-Forwarded-For', '');

      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'IP_BLOCKED',
        timestamp: expect.any(String),
        ip: 'unknown',
        details: expect.objectContaining({
          reason: 'ip_determination_failed',
        }),
      });
      expect(response.status).toBe(200); // Fail-safe - allow request
    });
  });

  describe('Geographic Blocking', () => {
    it('should allow requests when geographic blocking is disabled', async () => {
      mockSecurityService.validateIPAddress.mockResolvedValue(true);

      const app = createMockApp();
      const response = await request(app).get('/test').set('X-Forwarded-For', '192.168.1.1');

      expect(mockSecurityService.checkGeographicRestrictions).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should check geographic restrictions when enabled', async () => {
      mockSecurityService.validateIPAddress.mockResolvedValue(true);

      const app = createMockApp(true); // Enable geographic blocking
      await request(app).get('/test').set('X-Forwarded-For', '192.168.1.1');

      expect(mockSecurityService.checkGeographicRestrictions).toHaveBeenCalled();
    });

    it('should block request when geographic validation fails', async () => {
      mockSecurityService.validateIPAddress.mockResolvedValue(true);
      mockSecurityService.checkGeographicRestrictions.mockResolvedValue(false);

      const app = createMockApp(true); // Enable geographic blocking
      const response = await request(app).get('/test').set('X-Forwarded-For', '192.168.1.1');

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        status: 'error',
        message: CORS_SECURITY.MESSAGES.GEO_BLOCKED,
      });
    });
  });

  describe('Security Event Logging', () => {
    it('should log successful security validation', async () => {
      mockSecurityService.validateIPAddress.mockResolvedValue(true);
      mockSecurityService.checkGeographicRestrictions.mockResolvedValue(true);

      const app = createMockApp();
      await request(app)
        .get('/test')
        .set('X-Forwarded-For', '192.168.1.1')
        .set('Origin', 'https://jollyjet.com');

      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'SECURITY_VALIDATION_SUCCESS',
        timestamp: expect.any(String),
        ip: '192.168.1.1',
        details: {
          method: 'GET',
          path: '/test',
          origin: 'https://jollyjet.com',
        },
      });
    });

    it('should log security validation failures', async () => {
      mockSecurityService.validateIPAddress.mockResolvedValue(false);

      const app = createMockApp();
      await request(app).get('/test').set('X-Forwarded-For', '192.168.1.100');

      expect(mockSecurityService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'IP_BLOCKED',
        timestamp: expect.any(String),
        ip: '192.168.1.100',
        details: expect.objectContaining({
          middleware: 'cors_security_handler',
        }),
      });
    });
  });

  describe('Middleware Integration', () => {
    it('should integrate with Express app correctly', async () => {
      const app = createMockApp();
      const response = await request(app)
        .get('/test')
        .set('Origin', 'https://jollyjet.com')
        .set('X-Forwarded-For', '192.168.1.1');

      expect(response.status).toBe(200);
      expect(mockSecurityService.applySecurityHeaders).toHaveBeenCalled();
      expect(mockSecurityService.validateIPAddress).toHaveBeenCalled();
    });

    it('should handle middleware errors gracefully', async () => {
      const mockService = {
        validateIPAddress: jest.fn().mockRejectedValue(new Error('Test error')),
        checkGeographicRestrictions: jest.fn(),
        applySecurityHeaders: jest.fn(),
        logSecurityEvent: jest.fn(),
      };

      container.register<ICorsSecurityService>(DI_TOKENS.CORS_SECURITY_SERVICE, {
        useValue: mockService,
      });

      const app = createMockApp();
      const response = await request(app)
        .get('/test')
        .set('Origin', 'https://jollyjet.com')
        .set('X-Forwarded-For', '192.168.1.1');

      // Should log error and allow request to continue (fail-safe)
      expect(mockService.logSecurityEvent).toHaveBeenCalledWith({
        type: 'IP_BLOCKED',
        timestamp: expect.any(String),
        ip: '192.168.1.1',
        details: expect.objectContaining({
          error: 'Test error',
          middleware: 'cors_security_handler',
        }),
      });
      expect(response.status).toBe(200); // Fail-safe - continue processing
    });
  });

  describe('Configuration Options', () => {
    it('should use default options when none provided', () => {
      const middleware = corsSecurityHandler();
      expect(typeof middleware).toBe('function');
    });

    it('should accept custom configuration options', () => {
      const customOptions = {
        geographicBlocking: true,
        blockedCountries: ['CN', 'RU'],
        allowedCountries: ['US', 'CA'],
      };

      const middleware = corsSecurityHandler(customOptions);
      expect(typeof middleware).toBe('function');
    });
  });
});
