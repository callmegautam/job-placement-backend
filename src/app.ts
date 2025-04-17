import { z } from 'zod';

const schema = z.object({
    NODE_ENV: z.enum(['DEVELOPMENT', 'PRODUCTION']),
    PORT: z.number(),
    DB_HOST: z.string(),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
    JWT_SECRET: z.string(),
    JWT_EXPIRY: z.number(),
});
