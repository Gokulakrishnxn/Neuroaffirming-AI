import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(5000),
  API_VERSION: Joi.string().default('v1'),

  DATABASE_URL: Joi.string().required(),
  MONGODB_URI: Joi.string().required(),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),

  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX: Joi.number().default(100),

  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'debug')
    .default('debug'),

  AI_MODEL: Joi.string().default('anthropic/claude-sonnet-4.6'),
  VERCEL_OIDC_TOKEN: Joi.string().optional().allow(''),
  BLOB_READ_WRITE_TOKEN: Joi.string().optional().allow(''),
}).unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation failed: ${error.message}`);
}

export const env = {
  nodeEnv: value.NODE_ENV as string,
  port: value.PORT as number,
  apiVersion: value.API_VERSION as string,
  isDev: value.NODE_ENV === 'development',
  isProd: value.NODE_ENV === 'production',
  isTest: value.NODE_ENV === 'test',

  databaseUrl: value.DATABASE_URL as string,
  mongodbUri: value.MONGODB_URI as string,

  jwt: {
    secret: value.JWT_SECRET as string,
    expiresIn: value.JWT_EXPIRES_IN as string,
    refreshSecret: value.JWT_REFRESH_SECRET as string,
    refreshExpiresIn: value.JWT_REFRESH_EXPIRES_IN as string,
  },

  cors: {
    allowedOrigins: (value.ALLOWED_ORIGINS as string).split(',').map((o: string) => o.trim()),
  },

  rateLimit: {
    windowMs: value.RATE_LIMIT_WINDOW_MS as number,
    max: value.RATE_LIMIT_MAX as number,
  },

  logLevel: value.LOG_LEVEL as string,

  ai: {
    model: value.AI_MODEL as string,
    oidcToken: value.VERCEL_OIDC_TOKEN as string,
  },

  blob: {
    readWriteToken: value.BLOB_READ_WRITE_TOKEN as string,
  },
};
