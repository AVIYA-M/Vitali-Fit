const errorHandler = (err, req, res, next) => {
    // רישום פרטי השגיאה בטרמינל לצורכי איתור תקלות
    console.error('❌ Global Error Caught:', err.stack || err.message);

    // קביעת קוד סטטוס תקין
    const statusCode =
        Number.isInteger(err.statusCode) &&
        err.statusCode >= 400 &&
        err.statusCode <= 599
            ? err.statusCode
            : 500;

    // הודעה כללית כברירת מחדל
    let message = 'שגיאת שרת פנימית';

    // שגיאות צפויות שאפשר להחזיר ללקוח
    if (statusCode < 500 && err.message) {
        message = err.message;
    }

    // החזרת תשובת JSON
    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack
        })
    });
};

export default errorHandler;

