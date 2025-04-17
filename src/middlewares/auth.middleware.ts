import { verifyToken } from '@/utils/jwt';
import { Response, Request } from 'express';

export const authMiddleware = (req: Request, res: Response, next: Function) => {
    const token = req.cookies.authorization;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }

    try {
        const decoded = verifyToken(token);
        res.locals.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
    }
};
