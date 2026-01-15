import dotenv from 'dotenv';
import { IEnvConfig, validateEnv } from './env.validation';

// Load environment variables
// Use quiet: true in non-development to avoid cluttering logs
dotenv.config({ path: '.env', quiet: process.env.NODE_ENV !== 'development' });

// Define config
const env = validateEnv();

/**
 * Main Application Configuration Interface
 */
export interface IAppConfig {
  env: IEnvConfig['NODE_ENV'];
  port: number;
  mongoUri: string;
  logLevel: IEnvConfig['LOG_LEVEL'];
}

/**
 * Application configuration object populated from validated environment variables.
 * Uses the IAppConfig interface for strong typing throughout the application.
 */
export const config: IAppConfig = {
  env: env.NODE_ENV,
  port: env.PORT,
  mongoUri: env.MONGO_URI,
  logLevel: env.LOG_LEVEL,
};

export default config;

// CORS functionality now integrated into security middleware
export * from './di-container';
export { swaggerSpec, swaggerUiOptions } from './swagger';
