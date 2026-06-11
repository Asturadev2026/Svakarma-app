import { z } from 'zod';
import { config } from 'dotenv';

// Load env variables
config();

const envSchema = z.object({
  DATABASE_URL: z.string({
    required_error: 'DATABASE_URL environment variable is required',
  }).url('DATABASE_URL must be a valid URL'),

  JWT_SECRET: z.string({
    required_error: 'JWT_SECRET environment variable is required',
  }).min(8, 'JWT_SECRET must be at least 8 characters long'),

  PORT: z.preprocess(
    (val) => (val ? Number(val) : 5000),
    z.number().int().positive().max(65535)
  ).default(5000),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Integrations (all optional; default to mock so the app boots with no keys)
  SMS_PROVIDER: z.enum(['mock', 'twilio']).default('mock'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),

  PAYMENT_PROVIDER: z.enum(['mock', 'razorpay']).default('mock'),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Invalid environment variables:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }

  return result.data;
};

export const env = parseEnv();
