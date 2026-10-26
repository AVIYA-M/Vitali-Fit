import multer from 'multer';

const errorHandler = (err, req, res, next) => {
    // רישום פרטי השגיאה בטרמינל לצורכי איתור תקלות
    console.error('❌ Global Error Caught:', err.stack || err.message);

    // קביעת קוד סטטוס תקין
    let statusCode =
        Number.isInteger(err.statusCode) &&
        err.statusCode >= 400 &&
        err.statusCode <= 599
            ? err.statusCode
            : 500;

    let clientMessage = err.message;

    // שגיאות של העלאת קבצים (למשל קובץ גדול מדי)
    if (err instanceof multer.MulterError) {
        statusCode = 400;
        clientMessage =
            err.code === 'LIMIT_FILE_SIZE'
                ? 'הקובץ גדול מדי. הגודל המרבי הוא 5MB.'
                : 'שגיאה בהעלאת הקובץ.';
    }

    // שגיאת ולידציה של Mongoose (שדה חובה חסר, ערך מחוץ לטווח וכו')
    if (err.name === 'ValidationError' && err.errors) {
        statusCode = 400;
        clientMessage = Object.values(err.errors)
            .map(e => e.message)
            .join(', ');
    }

    // מזהה לא תקין (ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        clientMessage = 'מזהה לא תקין.';
    }

    // ערך כפול באינדקס ייחודי (למשל אימייל שכבר קיים)
    if (err.code === 11000) {
        statusCode = 400;
        clientMessage = 'הערך כבר קיים במערכת.';
    }

    // הודעה כללית כברירת מחדל
    let message = 'שגיאת שרת פנימית';

    // שגיאות צפויות שאפשר להחזיר ללקוח
    if (statusCode < 500 && clientMessage) {
        message = clientMessage;
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
