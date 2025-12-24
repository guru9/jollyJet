import dotenv from 'dotenv';
import { validateEnv } from './env.validation';

//Load environment variables
dotenv.config({ path: '.env' });

//Define config
const env = validateEnv();

const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  mongoUri: env.MONGO_URI,
  logLevel: env.LOG_LEVEL,
};

export default config;
