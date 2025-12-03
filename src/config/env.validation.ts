import z from 'zod';
import logger from '../shared/logger';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  MONGODB_URI: z.preprocess(
    (val) => {
      // prefer MONGODB_URI, fall back to MONGO_URI from .env
      if (typeof val === 'string' && val.length) return val;
      if (typeof process.env.MONGO_URI === 'string' && process.env.MONGO_URI.length)
        return process.env.MONGO_URI;
      return val;
    },
    z
      .string()
      .min(1, 'MongoDB URI is required')
      .refine((uri) => /^mongodb(\+srv)?:\/\/.+/.test(uri), {
        message:
          'MONGODB_URI must be a valid MongoDB connection string (mongodb:// or mongodb+srv://)',
      })
  ),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export const validateEnv = (): EnvConfig => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    // Log full validation details to help debugging which variables are missing/invalid
    // `result.error.format()` returns a nested object showing each key's issue
    logger.error({ error: result }, 'Invalid environment variables.');
    // Throw a clearer error including a summary of the issues
    throw new Error(
      `Invalid environment configuration: ${result.error?.issues.map((i) => `${i.path.join('.')} - ${i.message}`).join(', ')}`
    );
  }

  return result.data;
};
