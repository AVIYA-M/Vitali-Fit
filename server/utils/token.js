import jwt from 'jsonwebtoken';

// יצירת טוקן התחברות - במקום קוד כפול בהרשמה ובהתחברות
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

// הפרטים של המשתמש שמותר להחזיר ללקוח (בלי סיסמה)
export function publicUser(user) {
    return {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
    };
}
