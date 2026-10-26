import AppError from '../utils/AppError.js';

export const isShabbatBlockingEnabled = () =>
    process.env.SHABBAT_BLOCKING_ENABLED !== 'false';

const getJerusalemDayNumber = (date) =>
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
        new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Jerusalem',
            weekday: 'short'
        }).format(date)
    );

export const isShabbat = (date = new Date()) =>
    getJerusalemDayNumber(date) === 6;

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
