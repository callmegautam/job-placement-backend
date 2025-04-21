import { cookieOptions } from '@/config/cookies';
import type { Request, Response } from 'express';
import db from '@/db';
import { company } from '@/db/schema';
import asyncHandler from '@/utils/asyncHandler';
import { generateToken } from '@/utils/jwt';
import {
    registerCompanySchema,
    loginCompanySchema,
    updateCompanySchema,
} from '@/validators/company.validator';
import { and, eq, or, sql } from 'drizzle-orm';

export const registerCompany = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, companyName, domain } = registerCompanySchema.parse(req.body);

    const existing = await db
        .select()
        .from(company)
        .where(or(eq(company.email, email), eq(company.domain, domain)));

    if (existing.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Company already exists',
            data: null,
        });
    }

    const [newCompany] = await db
        .insert(company)
        .values({
            email,
            password,
            companyName,
            domain,
        })
        .returning();

    const { password: _, ...companyData } = newCompany;

    return res.status(200).json({
        success: true,
        message: 'Company registered successfully',
        data: companyData,
    });
});

export const loginCompany = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = loginCompanySchema.parse(req.body);

    const [companyData] = await db.select().from(company).where(eq(company.email, email));

    if (!companyData) {
        return res.status(400).json({
            success: false,
            message: 'Company not found',
            data: null,
        });
    }

    if (companyData.password !== password) {
        return res.status(400).json({
            success: false,
            message: 'Invalid credentials',
            data: null,
        });
    }

    const token = generateToken({ id: companyData.id, role: 'COMPANY' });

    const { password: _, ...companyWithoutPassword } = companyData;

    return res.status(200).cookie('authorization', token, cookieOptions).json({
        success: true,
        message: 'Company logged in successfully',
        data: companyWithoutPassword,
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
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid company ID is required',
            data: null,
        });
    }

    const [companyData] = await db.select().from(company).where(eq(company.id, id));

    if (!companyData) {
        return res.status(404).json({
            success: false,
            message: 'Company not found',
            data: null,
        });
    }

    const { password: _, ...companyDataWithoutPassword } = companyData;

    return res.status(200).json({
        success: true,
        message: 'Company fetched successfully',
        data: companyDataWithoutPassword,
    });
});

export const updateCompany = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params?.id);
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid company ID is required',
            data: null,
        });
    }

    const {
        email,
        companyName,
        domain,
        description,
        website,
        address,
        linkedinUrl,
        logoUrl,
        isVerified,
        verificationStatus,
    } = updateCompanySchema.parse(req.body);

    const [companyData] = await db.select().from(company).where(eq(company.id, id));

    if (!companyData) {
        return res.status(404).json({
            success: false,
            message: 'Company not found',
            data: null,
        });
    }

    const existing = await db
        .select()
        .from(company)
        .where(
            or(
                and(eq(company.email, email), sql`${company.id} != ${id}`),
                and(eq(company.domain, domain), sql`${company.id} != ${id}`)
            )
        );

    if (existing.length > 0) {
        return res.status(409).json({
            success: false,
            message: 'Email or domain is already used by another company',
            data: null,
        });
    }

    const [newCompanyData] = await db
        .update(company)
        .set({
            email,
            companyName,
            domain,
            description,
            website,
            address,
            linkedinUrl,
            logoUrl,
            isVerified,
            verificationStatus,
        })
        .where(eq(company.id, id))
        .returning();

    return res.status(200).json({
        success: true,
        message: 'Company updated successfully',
        data: newCompanyData,
    });
});
