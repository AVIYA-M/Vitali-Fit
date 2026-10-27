import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';

// מאמתת טוקן התחברות מכותרת Authorization ומציבה את המשתמש ב-req.user.
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('גישה נדחתה. לא נמצא טוקן אימות.', 401));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return next(new AppError('גישה נדחתה. לא נמצא טוקן אימות.', 401));
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        return next(new AppError('שגיאה פנימית בשרת.', 500));
    }

    req.user = jwt.verify(token, secret);
    return next();
};

// מאפשרת המשך רק למשתמש עם תפקיד מנהל.
export const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return next(new AppError('אין לך הרשאות גישה לפעולה זו.', 403));
    }

    return next();
};
