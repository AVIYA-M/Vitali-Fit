import jwt from 'jsonwebtoken';

// אימות משתמש מחובר
export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'גישה נדחתה. לא נמצא טוקן אימות.'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: 'גישה נדחתה. לא נמצא טוקן אימות.'
            });
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            console.error('שגיאה: JWT_SECRET לא מוגדר בקובץ .env');

            return res.status(500).json({
                message: 'שגיאה פנימית בשרת.'
            });
        }

        const decoded = jwt.verify(token, secret);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(403).json({
            message: 'הטוקן אינו תקין או שפג תוקפו.'
        });
    }
};

// בדיקת הרשאות מנהל בלבד
export const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'אין לך הרשאות גישה לפעולה זו.'
        });
    }

    next();
};
