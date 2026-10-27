import AppError from '../utils/AppError.js';

// בודקת אם התאריך שנבחר חל ביום שבת (שעון ירושלים).
export const isShabbatBlockingEnabled = () =>
    process.env.SHABBAT_BLOCKING_ENABLED !== 'false';

// מחזירה את מספר היום בשבוע (0=ראשון ... 6=שבת) לפי שעון ירושלים.
const getJerusalemDayNumber = (date) =>
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
        new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Jerusalem',
            weekday: 'short'
        }).format(date)
    );

export const isShabbat = (date = new Date()) =>
    getJerusalemDayNumber(date) === 6;

// יוצרת Middleware שחוסם גישה לשרת בימים שהוגדרו.
export function createDayBlocker(blockedDays) {
    return (req, res, next) => {
        if (!isShabbatBlockingEnabled()) {
            return next();
        }

        const dayNumber = getJerusalemDayNumber(new Date());

        if (blockedDays.includes(dayNumber)) {
            return next(new AppError('המערכת אינה פעילה ביום זה', 403));
        }

        return next();
    };
}
