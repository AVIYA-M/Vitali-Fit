const jwt = require('jsonwebtoken');

// 1. מידלוור לאימות משתמש מחובר (בודק אם יש טוקן תקין)
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'גישה נדחתה. לא נמצא טוקן אימות.' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallback_secret_key'
    );

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'טוקן שגוי או שפג תוקפו.', error: error.message });
  }
};

// 2. מידלוור לבדיקת הרשאות מנהל (Admin) בלבד
exports.isAdmin = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'אין לך הרשאות גישה לפעולה זו (נדרש מנהל מערכת).' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: 'שגיאה בבדיקת הרשאות מנהל.', error: error.message });
  }
};