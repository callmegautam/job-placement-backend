import { cookieOptions } from '@/config/cookies';
import type { Request, Response } from 'express';
import db from '@/db';
import { company, job, jobApplication, student } from '@/db/schema';
import asyncHandler from '@/utils/asyncHandler';
import { generateToken } from '@/utils/jwt';
import {
    registerCompanySchema,
    loginCompanySchema,
    updateCompanySchema,
} from '@/validators/company.validator';
import { and, desc, eq, is, or, sql } from 'drizzle-orm';
import { isCompanyExist, isEmailOrDomainTaken } from '@/utils/db';
import { removePassword } from '@/utils/others';

export const registerCompany = asyncHandler(async (req: Request, res: Response) => {
    const data = registerCompanySchema.parse(req.body);

    const existingCompany = await isCompanyExist(data.email, data.domain);

    if (existingCompany) {
        return res.status(409).json({
            success: false,
            message: 'Email or domain is already used by another company',
            data: null,
        });
    }

    const newCompany = await db.insert(company).values(data).returning();

    return res.status(200).json({
        success: true,
        message: 'Company registered successfully',
        data: removePassword(newCompany[0]),
    });
});

export const loginCompany = asyncHandler(async (req: Request, res: Response) => {
    const data = loginCompanySchema.parse(req.body);

    const existingCompany = await isCompanyExist(data.email, '');

    if (!existingCompany) {
        return res.status(400).json({
            success: false,
            message: 'Company not found',
            data: null,
        });
    }

    if (existingCompany.password !== data.password) {
        return res.status(400).json({
            success: false,
            message: 'Invalid credentials',
            data: null,
        });
    }

    const token = generateToken({ id: existingCompany.id, role: 'COMPANY' });

    return res
        .status(200)
        .cookie('authorization', token, cookieOptions)
        .json({
            success: true,
            message: 'Company logged in successfully',
            data: removePassword(existingCompany),
            token,
        });
});

export const logoutCompany = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie('authorization');
    return res.status(200).json({
        success: true,
        message: 'Company logged out successfully',
        data: null,
    });
});

export const getCompanies = asyncHandler(async (req: Request, res: Response) => {
    const companies = await db.select().from(company);
    const withoutPassword = companies.map(({ password, ...rest }) => rest);
    return res.status(200).json({
        success: true,
        message: 'Companies fetched successfully',
        data: withoutPassword,
    });
});

export const getCompanyById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params?.id);
    if (isNaN(id) || !id) {
        return res.status(400).json({
            success: false,
            message: 'Valid company id is required',
            data: null,
        });
    }

    const companies = await db.select().from(company).where(eq(company.id, id));

    if (companies.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Company not found',
            data: null,
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Company fetched successfully',
        data: removePassword(companies[0]),
    });
});

export const updateCompany = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(res.locals.user.id);
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid company ID is required',
            data: null,
        });
    }

    const data = updateCompanySchema.parse(req.body);

    const companies = await db.select().from(company).where(eq(company.id, id));

    if (companies.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Company not found',
            data: null,
        });
    }

    const existingCompany = await isEmailOrDomainTaken(data.email, data.domain, id);

    if (existingCompany.length > 0) {
        return res.status(409).json({
            success: false,
            message: 'Email or domain is already used by another company',
            data: null,
        });
    }

    const updatedCompany = await db.update(company).set(data).where(eq(company.id, id)).returning();

    return res.status(200).json({
        success: true,
        message: 'Company updated successfully',
        data: removePassword(updatedCompany[0]),
    });
});

export const getApplicants = asyncHandler(async (req: Request, res: Response) => {
    const jobId = Number(req.params.jobId);

    if (!jobId || isNaN(jobId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid job ID',
            data: null,
        });
    }

    const applicants = await db
        .select({
            application: jobApplication,
            student: student,
        })
        .from(jobApplication)
        .where(eq(jobApplication.jobId, jobId))
        .innerJoin(student, eq(jobApplication.studentId, student.id));

    return res.status(200).json({
        success: true,
        message: 'Applicants fetched',
        data: applicants,
    });
});

export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.applicationId);
    const status = req.body.status; // 'SHORTLISTED', 'REJECTED', 'HIRED'

    const [updated] = await db
        .update(jobApplication)
        .set({ status })
        .where(eq(jobApplication.id, id))
        .returning();

    return res.status(200).json({
        success: true,
        message: 'Application status updated',
        data: updated,
    });
});

export const getJobs = asyncHandler(async (req: Request, res: Response) => {
    const companyId = Number(res.locals.user.id);
    if (!companyId || isNaN(companyId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid company ID',
            data: null,
        });
    }

    const jobs = await db
        .select({
            job: job,
            company: company,
        })
        .from(job)
        .where(eq(job.companyId, companyId))
        .orderBy(desc(job.createdAt));

    return res.status(200).json({
        success: true,
        message: 'Jobs fetched successfully',
        data: jobs,
    });
});
