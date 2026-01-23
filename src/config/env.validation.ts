import z from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  MONGO_URI: z.preprocess(
    (val) => {
      // prefer MONGO_URI, fall back to MONGO_URI from .env
      if (typeof val === 'string' && val.length) return val;
      if (typeof process.env.MONGO_URI === 'string' && process.env.MONGO_URI.length)
        return process.env.MONGO_URI;
      return val;
    },
    z
      .string()
      .optional()
      .default(process.env.MONGO_URI_DEFAULT ?? 'mongodb://localhost:27017/jollyjet')
      .refine((uri) => /^mongodb(\+srv)?:\/\/.+/.test(uri), {
        message:
          'MONGO_URI must be a valid MongoDB connection string (mongodb:// or mongodb+srv://)',
      })
  ),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Security Configuration
  SECURITY_HEADERS_ENABLED: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  GEO_BLOCKING_ENABLED: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  GEO_ALLOWED_COUNTRIES: z.string().default(''),
  GEO_BLOCKED_COUNTRIES: z.string().default('CN,RU,KP,IR'),
  IP_WHITELIST: z.string().default(''),
  IP_BLACKLIST: z.string().default(''),
});

export type IEnvConfig = z.infer<typeof envSchema>;

export const validateEnv = (): IEnvConfig => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    // Throw a clearer error including a summary of the issues
    throw new Error(
      `Invalid environment configuration: ${result.error?.issues.map((i) => `${i.path.join('.')} - ${i.message}`).join(', ')}`
    );
  }

  return result.data;
};
