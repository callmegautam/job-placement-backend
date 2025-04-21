import { cookieOptions } from '@/config/cookies';
import type { Request, Response } from 'express';
import db from '@/db';
import { student } from '@/db/schema';
import asyncHandler from '@/utils/asyncHandler';
import { generateToken } from '@/utils/jwt';
import { loginUserSchema, registerUserSchema, updateUserSchema } from '@/validators/user.validator';
import { and, eq, or, sql } from 'drizzle-orm';
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
