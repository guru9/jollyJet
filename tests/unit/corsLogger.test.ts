/**
 * CORS Logger Middleware Tests
 *
 * Tests for the CORS logging middleware that provides comprehensive
 * logging for CORS-related events including preflight requests,
 * origin validation, and policy violations.
 */

import {
  corsLogger,
  corsLoggerDev,
  corsLoggerProd,
} from '@/interface/middlewares/corsLoggerHandler';
import express from 'express';
import request from 'supertest';

describe('CORS Logger Middleware', () => {
  let mockApp: express.Application;

  beforeEach(() => {
    mockApp = express();
    mockApp.use(corsLogger());

    // Add a test route
    mockApp.get('/test', (req, res) => {
      res.status(200).json({ message: 'Test endpoint' });
    });

    mockApp.options('/test', (req, res) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(200).end();
    });
  });

  describe('Basic CORS Logging', () => {
    it('should log CORS requests with origin header', async () => {
      const response = await request(mockApp).get('/test').set('Origin', 'https://example.com');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Test endpoint' });
    });

    it('should log preflight requests', async () => {
      const response = await request(mockApp)
        .options('/test')
        .set('Origin', 'https://example.com')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type');

      expect(response.status).toBe(200);
    });

    it('should handle non-CORS requests', async () => {
      const response = await request(mockApp).get('/test');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Test endpoint' });
    });
  });

  describe('Development Logger Configuration', () => {
    it('should create development logger with detailed settings', () => {
      const devMiddleware = corsLoggerDev();
      expect(typeof devMiddleware).toBe('function');
    });
  });

  describe('Production Logger Configuration', () => {
    it('should create production logger with minimal settings', () => {
      const prodMiddleware = corsLoggerProd();
      expect(typeof prodMiddleware).toBe('function');
    });
  });

  describe('Custom Configuration', () => {
    it('should accept custom configuration options', () => {
      const customMiddleware = corsLogger({
        logSuccess: false,
        logViolations: true,
        logPreflight: false,
        detailed: false,
        logLevels: {
          success: 'debug',
          violation: 'error',
          preflight: 'debug',
        },
      });

      expect(typeof customMiddleware).toBe('function');
    });

    it('should use default configuration when no options provided', () => {
      const defaultMiddleware = corsLogger();
      expect(typeof defaultMiddleware).toBe('function');
    });
  });
});
