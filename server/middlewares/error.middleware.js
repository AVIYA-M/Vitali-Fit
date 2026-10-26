import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LOGS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'logs');
const ERROR_LOG_PATH = path.join(LOGS_DIR, 'error.log');

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const logEntry = [
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
        err.stack || err.message || String(err)
    ].join('\n');

    if (process.env.NODE_ENV === 'production') {
        fs.mkdir(LOGS_DIR, { recursive: true }, mkdirError => {
            if (mkdirError) {
                console.error('Failed to create the production error log directory:', mkdirError);
                return;
            }

            fs.appendFile(ERROR_LOG_PATH, `${logEntry}\n\n`, writeError => {
                if (writeError) {
                    console.error('Failed to write the production error log:', writeError);
                }
            });
        });
    } else {
        console.error(logEntry);
    }

    let statusCode =
        Number.isInteger(err.statusCode) &&
        err.statusCode >= 400 &&
        err.statusCode <= 599
            ? err.statusCode
            : 500;

    let clientMessage = err.isOperational || statusCode < 500
        ? err.message
        : undefined;

    if (err instanceof multer.MulterError) {
        statusCode = 400;
        clientMessage =
            err.code === 'LIMIT_FILE_SIZE'
                ? 'הקובץ גדול מדי. הגודל המרבי הוא 5MB.'
                : 'שגיאה בהעלאת הקובץ.';
    }

    if (err.name === 'ValidationError' && err.errors) {
        statusCode = 400;
        clientMessage = Object.values(err.errors)
            .map(e => e.message)
            .join(', ');
    }

    if (err.name === 'CastError') {
        statusCode = 400;
        clientMessage = 'מזהה לא תקין.';
    }

    if (err.code === 11000) {
        statusCode = 400;
        clientMessage = 'הערך כבר קיים במערכת.';
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
        clientMessage = 'הטוקן אינו תקין או שפג תוקפו.';
    }

    const message = statusCode < 500 && clientMessage
        ? clientMessage
        : 'שגיאת שרת פנימית';

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message,
        ...(process.env.NODE_ENV === 'development' && err.stack && {
            stack: err.stack
        })
    });
};

export default errorHandler;
