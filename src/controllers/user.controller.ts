import { cookieOptions } from '@/config/cookies';
import type { Request, Response } from 'express';
import db from '@/db';
import { job, jobApplication, student, studentSkill } from '@/db/schema';
import asyncHandler from '@/utils/asyncHandler';
import { generateToken } from '@/utils/jwt';
import { loginUserSchema, registerUserSchema, updateUserSchema } from '@/validators/user.validator';
import { and, desc, eq, or, sql } from 'drizzle-orm';
import { isEmailOrUsernameTaken, isStudentExist } from '@/utils/db';
import { removePassword } from '@/utils/others';

export const registerStudent = asyncHandler(async (req: Request, res: Response) => {
    const data = registerUserSchema.parse(req.body);
    const existingStudent = await isStudentExist(data.email, data.username);

    if (existingStudent) {
        return res.status(400).json({ success: false, message: 'Student already exists', data: null });
    }

    const newStudent = await db.insert(student).values(data).returning();

    return res.status(200).json({
        success: true,
        message: 'Student created successfully',
        data: removePassword(newStudent[0]),
    });
});

export const loginStudent = asyncHandler(async (req: Request, res: Response) => {
    const data = loginUserSchema.parse(req.body);

    const existingStudent = await isStudentExist(data.email, data.password);

    if (!existingStudent) {
        return res.status(400).json({ success: false, message: 'Student not found', data: null });
    }

    if (existingStudent.password !== data.password) {
        return res.status(400).json({ success: false, message: 'Invalid credentials', data: null });
    }

    const token = generateToken({ id: existingStudent.id, role: 'STUDENT' });

    return res
        .status(200)
        .cookie('authorization', token, cookieOptions)
        .json({
            success: true,
            message: 'Student logged in successfully',
            data: removePassword(existingStudent),
            token,
        });
});

export const logoutStudent = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie('authorization');
    return res.status(200).json({ success: true, message: 'Student logged out successfully', data: null });
});

export const getStudents = asyncHandler(async (req: Request, res: Response) => {
    const students = await db.select().from(student);
    const studentsWithOutPassword = students.map(({ password, ...student }) => student);
    return res
        .status(200)
        .json({ success: true, message: 'Students fetched successfully', data: studentsWithOutPassword });
});

export const getStudentById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params?.id);

    if (isNaN(id) || !id) {
        return res.status(400).json({ success: false, message: 'Valid student id is required', data: null });
    }

    const existingStudent = await db.select().from(student).where(eq(student.id, id));

    if (existingStudent.length === 0) {
        return res.status(404).json({ success: false, message: 'Student not found', data: null });
    }

    return res.status(200).json({
        success: true,
        message: 'student fetched successfully',
        data: removePassword(existingStudent[0]),
    });
});

export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params?.id);

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid student id is required',
            data: null,
        });
    }

    const data = updateUserSchema.parse(req.body);

    const students = await db.select().from(student).where(eq(student.id, id));

    if (!students) {
        return res.status(404).json({
            success: false,
            message: 'Student not found',
            data: null,
        });
    }

    const existingStudent = await isEmailOrUsernameTaken(data.email, data.username, id);
    if (existingStudent.length > 0) {
        return res.status(409).json({
            success: false,
            message: 'Email or username is already taken by another student',
            data: null,
        });
    }
    const updatedStudent = await db.update(student).set(data).where(eq(student.id, id)).returning();

    return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: removePassword(updatedStudent[0]),
    });
});

export const getStudentByUsername = asyncHandler(async (req: Request, res: Response) => {
    const username = req.params?.username as string;
    if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required', data: null });
    }

    const existingStudent = await db.select().from(student).where(eq(student.username, username));

    if (existingStudent.length === 0) {
        return res.status(404).json({ success: false, message: 'Student not found', data: null });
    }

    return res.status(200).json({
        success: true,
        message: 'Student fetched successfully',
        data: removePassword(existingStudent[0]),
    });
});

export const getMatchingJobs = asyncHandler(async (req: Request, res: Response) => {
    const studentId = Number(req.params.id);

    if (!studentId || isNaN(studentId)) {
        return res.status(400).json({
            success: false,
            message: 'Valid student ID is required',
            data: null,
        });
    }

    const [user] = await db.select().from(student).where(eq(student.id, studentId));
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Student not found',
            data: null,
        });
    }

    const userSkills = await db.select().from(studentSkill).where(eq(studentSkill.studentId, studentId));
    const skillSet = new Set(userSkills.map((s) => s.skill));

    const allJobs = await db.select().from(job);

    const matchingJobs = allJobs
        .map((job) => {
            const jobSkills = job.requiredSkills || []; // ensure schema supports this
            const matches = jobSkills.filter((skill) =>
                skillSet.has(skill as typeof skillSet extends Set<infer T> ? T : never)
            );
            return {
                ...job,
                matchScore: matches.length,
            };
        })
        .filter((job) => job.matchScore > 0)
        .sort((a, b) => {
            if (b.matchScore === a.matchScore) {
                return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
            }
            return b.matchScore - a.matchScore;
        });

    return res.status(200).json({
        success: true,
        message: 'Matching jobs fetched successfully',
        data: matchingJobs,
    });
});

export const getStudentApplications = asyncHandler(async (req: Request, res: Response) => {
    const studentId = Number(res.locals.user.id);

    if (!studentId || isNaN(studentId)) {
        return res.status(400).json({ success: false, message: 'Invalid student ID', data: null });
    }

    const applications = await db
        .select({
            application: jobApplication,
            job: job,
        })
        .from(jobApplication)
        .where(eq(jobApplication.studentId, studentId))
        .innerJoin(job, eq(jobApplication.jobId, job.id))
        .orderBy(desc(jobApplication.createdAt));

    return res.status(200).json({
        success: true,
        message: 'Applications fetched',
        data: applications,
    });
});

export const applyToJob = asyncHandler(async (req: Request, res: Response) => {
    const studentId = Number(res.locals.user.id);
    const jobId = Number(req.params?.jobId);

    if (!studentId || isNaN(studentId)) {
        return res.status(400).json({ success: false, message: 'Invalid student ID', data: null });
    }

    if (!jobId || isNaN(jobId)) {
        return res.status(400).json({ success: false, message: 'Invalid job ID', data: null });
    }

    const existing = await db
        .select()
        .from(jobApplication)
        .where(and(eq(jobApplication.studentId, studentId), eq(jobApplication.jobId, jobId)));

    if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Already applied', data: null });
    }

    const [applied] = await db.insert(jobApplication).values({ studentId, jobId }).returning();

    return res.status(200).json({
        success: true,
        message: 'Application submitted',
        data: applied,
    });
});
