/**
 * CORS Handler Middleware Tests
 *
 * Tests for CORS security handler middleware functionality, configuration,
 * request processing, and error handling.
 */

import { corsSecurityHandler } from '@/interface/middlewares/corsSecurityHandler';
import { ICorsSecurityService } from '@/domain/interfaces/security/ICorsSecurityService';
import { CORS_SECURITY, DI_TOKENS } from '@/shared/constants';
import express from 'express';
import request from 'supertest';
import { container } from 'tsyringe';

describe('CORS Handler Middleware', () => {
  let mockSecurityService: jest.Mocked<ICorsSecurityService>;
  let mockApp: express.Application;

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

  describe('Middleware Creation', () => {
    it('should create middleware function', () => {
      const middleware = corsSecurityHandler();
      expect(typeof middleware).toBe('function');
    });

    it('should accept configuration options', () => {
      const options = {
        geographicBlocking: true,
        blockedCountries: ['CN', 'RU'],
        allowedCountries: ['US', 'CA'],
        ipWhitelist: ['192.168.1.0/24'],
        ipBlacklist: ['10.0.0.0/8'],
      };

      const middleware = corsSecurityHandler(options);
      expect(typeof middleware).toBe('function');
    });

    it('should use default configuration when none provided', () => {
      const middleware = corsSecurityHandler();
      expect(typeof middleware).toBe('function');
    });
  });

  describe('Request Processing', () => {
    beforeEach(() => {
      mockApp = express();
      mockApp.use(corsSecurityHandler());
      mockApp.get('/test', (req, res) => res.status(200).json({ success: true }));
    });

    it('should process valid requests successfully', async () => {
      mockSecurityService.validateIPAddress.mockResolvedValue(true);
      mockSecurityService.checkGeographicRestrictions.mockResolvedValue(true);

      const response = await request(mockApp)
        .get('/test')
        .set('Origin', 'https://jollyjet.com')
        .set('X-Forwarded-For', '192.168.1.1');

      expect(response.status).toBe(200);
      expect(mockSecurityService.applySecurityHeaders).toHaveBeenCalled();
      expect(mockSecurityService.validateIPAddress).toHaveBeenCalledWith('192.168.1.1');
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

    it('should handle missing IP addresses gracefully', async () => {
      const response = await request(mockApp).get('/test').set('Origin', 'https://jollyjet.com');

      // Should fail-safe and allow request
      expect(response.status).toBe(200);
      expect(mockSecurityService.validateIPAddress).toHaveBeenCalledWith('unknown');
    });

    it('should handle requests without origin header', async () => {
      const response = await request(mockApp).get('/test');

      // Should allow non-CORS requests
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('IP Validation Integration', () => {
    beforeEach(() => {
      mockApp = express();
      mockApp.use(corsSecurityHandler());
      mockApp.get('/test', (req, res) => res.status(200).json({ success: true }));
    });

    it('should block requests when IP validation fails', async () => {
      mockSecurityService.validateIPAddress.mockResolvedValue(false);

      const response = await request(mockApp)
        .get('/test')
        .set('Origin', 'https://jollyjet.com')
        .set('X-Forwarded-For', '192.168.1.100');

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        status: 'error',
        message: CORS_SECURITY.MESSAGES.IP_BLOCKED,
      });
      expect(mockSecurityService.validateIPAddress).toHaveBeenCalledWith('192.168.1.100');
    });

    it('should extract IP from X-Forwarded-For header', async () => {
      mockSecurityService.validateIPAddress.mockResolvedValue(true);

      await request(mockApp)
        .get('/test')
        .set('Origin', 'https://jollyjet.com')
        .set('X-Forwarded-For', '203.0.113.10');

      expect(mockSecurityService.validateIPAddress).toHaveBeenCalledWith('203.0.113.10');
    });

    it('should extract IP from socket.remoteAddress as fallback', async () => {
      mockSecurityService.validateIPAddress.mockResolvedValue(true);

      // Mock request without X-Forwarded-For header
      const testApp = express();
      testApp.use((req, res, next) => {
        // Simulate socket.remoteAddress
        (req as any).ip = '10.0.0.1';
        next();
      });
      testApp.use(corsSecurityHandler());
      testApp.get('/test', (req, res) => res.status(200).json({ success: true }));

      await request(testApp).get('/test').set('Origin', 'https://jollyjet.com');

      expect(mockSecurityService.validateIPAddress).toHaveBeenCalledWith('10.0.0.1');
    });
  });

  describe('Geographic Blocking Integration', () => {
    beforeEach(() => {
      mockSecurityService.validateIPAddress.mockResolvedValue(true);
      mockApp = express();
      mockApp.get('/test', (req, res) => res.status(200).json({ success: true }));
    });

    it('should check geographic restrictions when enabled', async () => {
      mockApp.use(corsSecurityHandler({ geographicBlocking: true }));
      mockApp.get('/test', (req, res) => res.status(200).json({ success: true }));

      await request(mockApp)
        .get('/test')
        .set('Origin', 'https://jollyjet.com')
        .set('X-Forwarded-For', '192.168.1.1');

      expect(mockSecurityService.checkGeographicRestrictions).toHaveBeenCalledWith('192.168.1.1');
    });

    it('should skip geographic checks when disabled', async () => {
      mockApp.use(corsSecurityHandler({ geographicBlocking: false }));
      mockApp.get('/test', (req, res) => res.status(200).json({ success: true }));

      await request(mockApp)
        .get('/test')
        .set('Origin', 'https://jollyjet.com')
        .set('X-Forwarded-For', '192.168.1.1');

      expect(mockSecurityService.checkGeographicRestrictions).not.toHaveBeenCalled();
    });

    it('should block requests when geographic validation fails', async () => {
      mockSecurityService.checkGeographicRestrictions.mockResolvedValue(false);
      mockApp.use(corsSecurityHandler({ geographicBlocking: true }));
      mockApp.get('/test', (req, res) => res.status(200).json({ success: true }));

      const response = await request(mockApp)
        .get('/test')
        .set('Origin', 'https://jollyjet.com')
        .set('X-Forwarded-For', '192.168.1.1');

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        status: 'error',
        message: CORS_SECURITY.MESSAGES.GEO_BLOCKED,
      });
    });
  });

  describe('Security Headers Integration', () => {
    beforeEach(() => {
      mockApp = express();
      mockApp.use(corsSecurityHandler());
      mockApp.get('/test', (req, res) => res.status(200).json({ success: true }));
    });

    it('should apply security headers to all responses', async () => {
      await request(mockApp)
        .get('/test')
        .set('Origin', 'https://jollyjet.com')
        .set('X-Forwarded-For', '192.168.1.1');

      expect(mockSecurityService.applySecurityHeaders).toHaveBeenCalled();
    });

    it('should apply headers even for requests without origin', async () => {
      await request(mockApp).get('/test');

      expect(mockSecurityService.applySecurityHeaders).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockApp = express();
      mockApp.get('/test', (req, res) => res.status(200).json({ success: true }));
    });

    it('should handle service validation errors gracefully', async () => {
      mockSecurityService.validateIPAddress.mockRejectedValue(new Error('Service error'));
      mockApp.use(corsSecurityHandler());

      const response = await request(mockApp)
        .get('/test')
        .set('Origin', 'https://jollyjet.com')
        .set('X-Forwarded-For', '192.168.1.1');

      // Should fail-safe and continue processing
      expect(response.status).toBe(200);
    });

    it('should handle service geographic errors gracefully', async () => {
      mockSecurityService.validateIPAddress.mockResolvedValue(true);
      mockSecurityService.checkGeographicRestrictions.mockRejectedValue(new Error('Geo error'));
      mockApp.use(corsSecurityHandler({ geographicBlocking: true }));

      const response = await request(mockApp)
        .get('/test')
        .set('Origin', 'https://jollyjet.com')
        .set('X-Forwarded-For', '192.168.1.1');

      // Should fail-safe and continue processing
      expect(response.status).toBe(200);
    });

    it('should handle security headers errors gracefully', async () => {
      mockSecurityService.validateIPAddress.mockResolvedValue(true);
      mockSecurityService.applySecurityHeaders.mockImplementation(() => {
        throw new Error('Headers error');
      });
      mockApp.use(corsSecurityHandler());

      const response = await request(mockApp)
        .get('/test')
        .set('Origin', 'https://jollyjet.com')
        .set('X-Forwarded-For', '192.168.1.1');

      // Should fail-safe and continue processing
      expect(response.status).toBe(200);
    });
  });

  describe('Configuration Integration', () => {
    it('should use default options when none provided', async () => {
      const middleware = corsSecurityHandler();
      expect(typeof middleware).toBe('function');
    });

    it('should respect custom blocked countries', async () => {
      mockSecurityService.validateIPAddress.mockResolvedValue(true);
      mockSecurityService.checkGeographicRestrictions.mockResolvedValue(false);

      mockApp = express();
      mockApp.use(
        corsSecurityHandler({
          geographicBlocking: true,
          blockedCountries: ['CN', 'RU', 'KP'],
        })
      );
      mockApp.get('/test', (req, res) => res.status(200).json({ success: true }));

      const response = await request(mockApp)
        .get('/test')
        .set('Origin', 'https://jollyjet.com')
        .set('X-Forwarded-For', '192.168.1.1');

      expect(response.status).toBe(403);
      expect(mockSecurityService.checkGeographicRestrictions).toHaveBeenCalledWith('192.168.1.1');
    });

    it('should respect custom allowed countries', async () => {
      mockSecurityService.validateIPAddress.mockResolvedValue(true);
      mockSecurityService.checkGeographicRestrictions.mockResolvedValue(true);

      mockApp = express();
      mockApp.use(
        corsSecurityHandler({
          geographicBlocking: true,
          allowedCountries: ['US', 'CA', 'GB'],
        })
      );
      mockApp.get('/test', (req, res) => res.status(200).json({ success: true }));

      const response = await request(mockApp)
        .get('/test')
        .set('Origin', 'https://jollyjet.com')
        .set('X-Forwarded-For', '192.168.1.1');

      expect(response.status).toBe(200);
      expect(mockSecurityService.checkGeographicRestrictions).toHaveBeenCalledWith('192.168.1.1');
    });
  });

  describe('Integration with Express Ecosystem', () => {
    it('should work with other Express middlewares', async () => {
      const testApp = express();

      // Add some other middlewares before and after
      testApp.use((req, res, next) => {
        (req as any).middlewareTest = 'before';
        next();
      });

      testApp.use(corsSecurityHandler());

      testApp.use((req, res, next) => {
        (req as any).middlewareTest = 'after';
        next();
      });

      testApp.get('/test', (req, res) => {
        res.status(200).json({
          success: true,
          middlewareTest: (req as any).middlewareTest,
        });
      });

      const response = await request(testApp)
        .get('/test')
        .set('Origin', 'https://jollyjet.com')
        .set('X-Forwarded-For', '192.168.1.1');

      expect(response.status).toBe(200);
      expect(response.body.middlewareTest).toBe('after');
      expect(mockSecurityService.applySecurityHeaders).toHaveBeenCalled();
    });

    it('should handle multiple concurrent requests', async () => {
      mockSecurityService.validateIPAddress.mockResolvedValue(true);

      const requests = Array.from({ length: 5 }, (_, i) =>
        request(mockApp)
          .get('/test')
          .set('Origin', 'https://jollyjet.com')
          .set('X-Forwarded-For', `192.168.1.${i + 1}`)
      );

      const responses = await Promise.all(requests);

      responses.forEach((response, i) => {
        expect(response.status).toBe(200);
        expect(mockSecurityService.validateIPAddress).toHaveBeenCalledWith(`192.168.1.${i + 1}`);
      });
    });
  });
});
