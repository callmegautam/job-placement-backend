import db from '@/db';
import { student } from '@/db/schema';
import asyncHandler from '@/utils/asyncHandler';
import { isUserExists } from '@/utils/db';
import { registerUserSchema } from '@/validators/user.validator';

export const registerUser = asyncHandler(async (req, res) => {
    const { username, password, email, name } = registerUserSchema.parse(req.body);
    const userExists = await isUserExists(username, email);

    if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists', data: null });
    }

    const user = await db.insert(student).values({
        username,
        password,
        email,
        name,
    });

    return res.status(200).json({ success: true, message: 'User created successfully', data: user });
});
