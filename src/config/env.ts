import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenvConfig({
  path: `.env`,
});

// Define schema for environment variables
const envSchema = z.object({
  // Server
  PORT: z.string().default('5000'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // MongoDB
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),

  // JWT
  JWT_SECRET: z
    .string()
    .min(32, 'JWT secret must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

// Validate environment variables
const envVars = envSchema.parse(process.env);

// Export validated environment variables
export const config = {
  // Server
  port: parseInt(envVars.PORT, 10),
  nodeEnv: envVars.NODE_ENV,
  isProduction: envVars.NODE_ENV === 'production',

  // Database
  mongoUri: envVars.MONGODB_URI,

  // JWT
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
  },

  // CORS
  cors: {
    origin: envVars.CORS_ORIGIN,
  },

} as const;
