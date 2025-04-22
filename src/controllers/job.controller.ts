import { Request, Response } from 'express';
import db from '@/db';
import { job, company, jobApplication } from '@/db/schema';
import asyncHandler from '@/utils/asyncHandler';
import { and, desc, eq } from 'drizzle-orm';
import { createJobSchema, updateJobSchema } from '@/validators/job.validator';

// Create a Job
export const createJob = asyncHandler(async (req: Request, res: Response) => {
    const data = createJobSchema.parse(req.body);

    const [companyData] = await db.select().from(company).where(eq(company.id, data.companyId));
    if (!companyData) {
        return res.status(404).json({
            success: false,
            message: 'Company not found',
            data: null,
        });
    }

    const [newJob] = await db.insert(job).values(data).returning();

    return res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: newJob,
    });
});

// Get All Jobs
export const getJobs = asyncHandler(async (req: Request, res: Response) => {
    const jobs = await db.select().from(job).orderBy(desc(job.createdAt));

    if (!jobs || jobs.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'No jobs found',
            data: null,
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Jobs fetched successfully',
        data: jobs,
    });
});

// Get Job By ID
export const getJobById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid job ID is required',
            data: null,
        });
    }

    const [jobData] = await db.select().from(job).where(eq(job.id, id));

    if (!jobData) {
        return res.status(404).json({
            success: false,
            message: 'Job not found',
            data: null,
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Job fetched successfully',
        data: jobData,
    });
});

// Update Job
export const updateJob = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid job ID is required',
            data: null,
        });
    }

    const jobExists = await db.select().from(job).where(eq(job.id, id));
    if (!jobExists.length) {
        return res.status(404).json({
            success: false,
            message: 'Job not found',
            data: null,
        });
    }

    const updates = updateJobSchema.parse(req.body);

    const [updatedJob] = await db.update(job).set(updates).where(eq(job.id, id)).returning();

    return res.status(200).json({
        success: true,
        message: 'Job updated successfully',
        data: updatedJob,
    });
});

// Delete Job
export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid job ID is required',
            data: null,
        });
    }

    await db.delete(job).where(eq(job.id, id));

    return res.status(200).json({
        success: true,
        message: 'Job deleted successfully',
        data: null,
    });
});
