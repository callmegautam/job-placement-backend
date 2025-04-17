import db from '@/db';
import { student } from '@/db/schema';
import { eq, or } from 'drizzle-orm';

export const isUserExists = async (username: string, email: string) => {
    try {
        const result = await db
            .select()
            .from(student)
            .where(or(eq(student.username, username), eq(student.email, email)));
        return result.length > 0;
    } catch (error) {
        console.log(error);
        return false;
    }
};
