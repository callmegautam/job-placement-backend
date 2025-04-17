import { cookieOptions } from '@/config/cookies';
import db from '@/db';
import { student } from '@/db/schema';
import asyncHandler from '@/utils/asyncHandler';
import { isUserExists } from '@/utils/db';
import { generateToken } from '@/utils/jwt';
import { loginUserSchema, registerUserSchema } from '@/validators/user.validator';
import { eq } from 'drizzle-orm';

export const registerUser = asyncHandler(async (req, res) => {
    // console.log(req.body);
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

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = loginUserSchema.parse(req.body);

    const user = await db.select().from(student).where(eq(student.email, email));
    console.log(user);

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
