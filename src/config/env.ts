import { z } from 'zod';

const schema = z.object({
    NODE_ENV: z.enum(['DEVELOPMENT', 'PRODUCTION']),
    PORT: z.coerce.number(),
    CORS_ORIGIN: z.string(),
    DB_URL: z.string(),
    JWT_SECRET: z.string(),
    JWT_EXPIRY: z.string(),
});

export default schema.parse(process.env);
