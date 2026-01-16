/**
 * Health Check Controller
 *
 * Provides endpoints for monitoring application health including
 * MongoDB and Redis connectivity status.
 */

import { DI_TOKENS, RESPONSE_STATUS, REDIS_CONFIG, MONGODB_CONFIG } from '@/shared/constants';
import { Logger } from '@/shared/logger';
import MongoDBConnection from '@/infrastructure/database/mongodb';
import RedisConnection from '@/infrastructure/database/redis';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { inject, injectable } from 'tsyringe';

@injectable()
export class HealthController {
  constructor(@inject(DI_TOKENS.LOGGER) private logger: Logger) {}

  /**
   * Comprehensive health check including database connections
   *
   * @openapi
   * /api/health:
   *   get:
   *     tags: [Health]
   *     summary: Complete health check
   *     description: Check application health including MongoDB and Redis connections
   *     responses:
   *       200:
   *         description: Health check completed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                   description: ISO timestamp of health check
   *                 data:
   *                   type: object
   *                   properties:
   *                     application:
   *                       type: object
   *                       properties:
   *                         status:
   *                           type: string
   *                           enum: [healthy, unhealthy]
   *                           example: healthy
   *                         uptime:
   *                           type: number
   *                           description: Application uptime in milliseconds
   *                           example: 3600000
   *                         version:
   *                           type: string
   *                           description: Application version
   *                           example: 1.0.0
   *                     databases:
   *                       type: object
   *                       properties:
   *                         mongodb:
   *                           type: object
   *                           properties:
   *                             status:
   *                               type: string
   *                               enum: [connected, disconnected, error]
   *                               example: connected
   *                             responseTime:
   *                               type: number
   *                               description: Response time in milliseconds
   *                               example: 15
   *                             lastChecked:
   *                               type: string
   *                               format: date-time
   *                               description: Timestamp of last connection check
   *                         redis:
   *                           type: object
   *                           properties:
   *                             status:
   *                               type: string
   *                               enum: [connected, disconnected, error]
   *                               example: connected
   *                             responseTime:
   *                               type: number
   *                               description: Response time in milliseconds
   *                               example: 5
   *                             lastChecked:
   *                               type: string
   *                               format: date-time
   *                               description: Timestamp of last connection check
   *       503:
   *         description: Service unavailable due to database connection issues
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  public async getHealth(req: Request, res: Response): Promise<void> {
    const _startTime = Date.now();

    try {
      // Check MongoDB connection
      const mongoHealth = await this.checkMongoDB();

      // Check Redis connection
      const redisHealth = await this.checkRedis();

      // Determine overall health status
      const dbHealthy = mongoHealth.status === 'connected' && redisHealth.status === 'connected';
      const overallStatus = dbHealthy ? 'healthy' : 'unhealthy';

      // Application info
      const appInfo = {
        status: overallStatus,
        uptime: process.uptime() * 1000, // Convert to milliseconds
        version: process.env.npm_package_version || '1.0.0',
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
      };

      // Health check result
      const healthData = {
        application: appInfo,
        databases: {
          mongodb: mongoHealth,
          redis: redisHealth,
        },
      };

      // Set appropriate HTTP status code
      const statusCode = dbHealthy ? 200 : 503;

      res.status(statusCode).json({
        status: RESPONSE_STATUS.SUCCESS,
        timestamp: new Date().toISOString(),
        data: healthData,
      });
    } catch (error) {
      this.logger.error(
        `Health check failed: ${error instanceof Error ? error.message : String(error)}`
      );

      res.status(503).json({
        status: RESPONSE_STATUS.ERROR,
        timestamp: new Date().toISOString(),
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Quick health check (liveness probe)
   *
   * @openapi
   * /api/health/ready:
   *   get:
   *     tags: [Health]
   *     summary: Readiness probe
   *     description: Quick check if application is ready to serve requests
   *     responses:
   *       200:
   *         description: Application is ready
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 ready:
   *                   type: boolean
   *                   example: true
   *       503:
   *         description: Application is not ready
   */
  public async getReadiness(req: Request, res: Response): Promise<void> {
    try {
      // Quick check - just verify the process is running
      const ready = process.uptime() > 0;

      const statusCode = ready ? 200 : 503;

      res.status(statusCode).json({
        status: RESPONSE_STATUS.SUCCESS,
        ready,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: RESPONSE_STATUS.ERROR,
        ready: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Liveness probe
   *
   * @openapi
   * /api/health/live:
   *   get:
   *     tags: [Health]
   *     summary: Liveness probe
   *     description: Check if application is alive
   *     responses:
   *       200:
   *         description: Application is alive
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 alive:
   *                   type: boolean
   *                   example: true
   */
  public async getLiveness(req: Request, res: Response): Promise<void> {
    res.json({
      status: RESPONSE_STATUS.SUCCESS,
      alive: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }

  /**
   * Check MongoDB connection health
   */
  private async checkMongoDB(): Promise<{
    status: 'connected' | 'disconnected' | 'error' | 'disabled';
    responseTime?: number;
    lastChecked: string;
    error?: string;
  }> {
    const startTime = Date.now();

    // Check if MongoDB is disabled
    if (MONGODB_CONFIG.DISABLED) {
      return {
        status: 'disabled',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }

    try {
      // Check if MongoDB is connected
      const isConnected = MongoDBConnection.getConnectionStatus();

      if (!isConnected) {
        // Try to establish connection
        await MongoDBConnection.connect();
      }

      // Perform a simple operation to verify connection
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
      }

      return {
        status: 'connected',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check Redis connection health
   */
  private async checkRedis(): Promise<{
    status: 'connected' | 'disconnected' | 'error' | 'disabled';
    responseTime?: number;
    lastChecked: string;
    error?: string;
  }> {
    const startTime = Date.now();

    // Check if Redis is disabled
    if (REDIS_CONFIG.DISABLED) {
      return {
        status: 'disabled',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }

    try {
      // Check if Redis is connected
      const isConnected = RedisConnection.getConnectionStatus();

      if (!isConnected) {
        // Try to establish connection
        await RedisConnection.connect();
      }

      // Perform a simple operation to verify connection
      const client = RedisConnection.getClient();
      await client.ping();

      return {
        status: 'connected',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
