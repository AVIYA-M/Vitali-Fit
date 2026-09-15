const errorHandler = (err, req, res, next) => {
    // 1. רישום הלוג לטרמינל (לצורכי מעקב ודיבוג)
    console.error('❌ Global Error Caught:', err.stack || err.message);

    // 2. קביעת קוד סטטוס (אם לא הוגדר, נחזיר 500 - שגיאת שרת כללית)
    const statusCode = err.statusCode || 500;

    // 3. החזרת תשובת JSON מסודרת ללקוח
    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: err.message || 'שגיאת שרת פנימית',
        // אם נרצה לראות את ה-stack trace רק בסביבת פיתוח:
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;