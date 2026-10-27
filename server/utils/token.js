import jwt from 'jsonwebtoken';

// יוצרת טוקן התחברות (JWT) למשתמש, בתוקף ליום אחד.
export function signToken(user) {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET לא מוגדר בקובץ .env');
    }

    return jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
}

// מחזירה רק את פרטי המשתמש הבטוחים לשליחה ללקוח.
export function publicUser(user) {
    return {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
    };
}
