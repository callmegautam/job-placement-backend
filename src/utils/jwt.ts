import env from '@/config/env';
import jwt from 'jsonwebtoken';

const SECRET_KEY = env.JWT_SECRET;
const EXPIRE_IN = env.JWT_EXPIRY;

export function generateToken(payload: string | Buffer | Object): string {
    // @ts-expect-error
    return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRE_IN });
}

export function verifyToken(token: string) {
    return jwt.verify(token, SECRET_KEY);
}

export function decodeToken(token: string): Object | null {
    return jwt.decode(token);
}
