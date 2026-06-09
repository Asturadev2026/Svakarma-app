"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = require("dotenv");
// Load env variables
(0, dotenv_1.config)();
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string({
        required_error: 'DATABASE_URL environment variable is required',
    }).url('DATABASE_URL must be a valid URL'),
    JWT_SECRET: zod_1.z.string({
        required_error: 'JWT_SECRET environment variable is required',
    }).min(8, 'JWT_SECRET must be at least 8 characters long'),
    PORT: zod_1.z.preprocess((val) => (val ? Number(val) : 5000), zod_1.z.number().int().positive().max(65535)).default(5000),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
});
const parseEnv = () => {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        console.error('❌ Invalid environment variables:');
        console.error(JSON.stringify(result.error.format(), null, 2));
        process.exit(1);
    }
    return result.data;
};
exports.env = parseEnv();
