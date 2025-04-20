import { cookieOptions } from '@/config/cookies';
import type { Request, Response } from 'express';
import db from '@/db';
import { student } from '@/db/schema';
import asyncHandler from '@/utils/asyncHandler';
import { isUserExists } from '@/utils/db';
import { generateToken } from '@/utils/jwt';
import { loginUserSchema, registerUserSchema, updateUserSchema } from '@/validators/user.validator';
import { and, eq, or, sql } from 'drizzle-orm';

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, password, email, name } = registerUserSchema.parse(req.body);
    const userExists = await isUserExists(username, email);

    if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists', data: null });
    }

    const user = await db
        .insert(student)
        .values({
            username,
            password,
            email,
            name,
        })
        .returning();

    // console.log(user);
    const { password: _, ...userData } = user[0];

    return res.status(200).json({ success: true, message: 'User created successfully', data: userData });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = loginUserSchema.parse(req.body);

    const user = await db.select().from(student).where(eq(student.email, email));

    if (user.length === 0) {
        return res.status(400).json({ success: false, message: 'User not found', data: null });
    }

    const userData = user[0];

    if (userData.password !== password) {
        return res.status(400).json({ success: false, message: 'Invalid credentials', data: null });
    }

    const token = generateToken({ id: userData.id, role: 'STUDENT' });

    const { password: _, ...userDataWithoutPassword } = userData;

    return res.status(200).cookie('authorization', token, cookieOptions).json({
        success: true,
        message: 'User logged in successfully',
        data: userDataWithoutPassword,
        token,
    });
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie('authorization');
    return res.status(200).json({ success: true, message: 'User logged out successfully', data: null });
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await db.select().from(student);
    const usersWithOutPassword = users.map(({ password, ...user }) => user);
    return res
        .status(200)
        .json({ success: true, message: 'Users fetched successfully', data: usersWithOutPassword });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params?.id);
    if (!id) {
        return res.status(400).json({ success: false, message: 'User id is required', data: null });
    }
    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'User id is not a number', data: null });
    }
    const [user] = await db.select().from(student).where(eq(student.id, id));
    const { password: _, ...userData } = user;
    return res.status(200).json({ success: true, message: 'User fetched successfully', data: user });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params?.id);

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid user id is required',
            data: null,
        });
    }

    const {
        name,
        email,
        username,
        course,
        admissionYear,
        currentYear,
        gradYear,
        collegeId,
        githubUrl,
        resumeUrl,
        avatarUrl,
    } = updateUserSchema.parse(req.body);

    const [user] = await db.select().from(student).where(eq(student.id, id));

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
            data: null,
        });
    }

    const existing = await db
        .select()
        .from(student)
        .where(
            or(
                and(eq(student.email, email), sql`${student.id} != ${id}`),
                and(eq(student.username, username), sql`${student.id} != ${id}`)
            )
        );

    if (existing.length > 0) {
        return res.status(409).json({
            success: false,
            message: 'Email or username is already taken by another user',
            data: null,
        });
    }

    const [userData] = await db
        .update(student)
        .set({
            name,
            email,
            username,
            course,
            admissionYear,
            currentYear,
            gradYear,
            collegeId,
            githubUrl,
            resumeUrl,
            avatarUrl,
        })
        .where(eq(student.id, id))
        .returning();

    return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: userData,
    });
});

export const getUserByUsername = asyncHandler(async (req: Request, res: Response) => {
    const username = req.params?.username;
    if (!username) {
        return res.status(400).json({
            success: false,
            message: 'Username is required',
            data: null,
        });
    }
    const [user] = await db.select().from(student).where(eq(student.username, username));
    const { password: _, ...userData } = user;
    return res.status(200).json({ success: true, message: 'User fetched successfully', data: userData });
});
