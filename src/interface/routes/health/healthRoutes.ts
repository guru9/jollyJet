/**
 * Health Check Routes
 *
 * Provides endpoints for application health monitoring including
 * database connectivity and service status.
 */

import { DI_TOKENS } from '@/shared/constants';
import container from '@/config/di-container';
import { Router } from 'express';
import { HealthController } from '@/interface/controllers';

const createHealthRoutes = (): Router => {
  const router = Router();

  // Get health controller from DI container
  const healthController = container.resolve<HealthController>(DI_TOKENS.HEALTH_CONTROLLER);

  /**
   * @route GET /api/health
   * @desc Comprehensive health check including database connections
   * @access Public
   */
  router.get('/', healthController.getHealth.bind(healthController));

  /**
   * @route GET /api/health/ready
   * @desc Readiness probe - check if application is ready to serve requests
   * @access Public
   */
  router.get('/ready', healthController.getReadiness.bind(healthController));

  /**
   * @route GET /api/health/live
   * @desc Liveness probe - check if application is alive
   * @access Public
   */
  router.get('/live', healthController.getLiveness.bind(healthController));

  return router;
};

export default createHealthRoutes;
