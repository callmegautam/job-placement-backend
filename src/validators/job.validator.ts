import { z } from 'zod';

export const createJobSchema = z.object({
    title: z.string(),
    description: z.string(),
    location: z.string(),
    // salary: z.(),
    type: z.string(),
    companyId: z.number(),
});

export const updateJobSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    salaryRange: z.string().optional(),
    type: z.string().optional(),
});
