import dotenv from 'dotenv';
import { validateEnv } from './env.validation';

/**
 * Debug: Check if .env was loadeds
 *
 * console.log('Dotenv loaded:', dotenv.config().error ? 'FAILED' : 'SUCCESS');
 * console.log('MONGO_URI from env:', process.env.MONGO_URI);
 * console.log('PORT from env:', process.env.PORT);
 */

//Load environment variables
dotenv.config();

//Define config
const env = validateEnv();

const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  mongoUri: env.MONGODB_URI,
  logLevel: env.LOG_LEVEL,
};

export default config;
