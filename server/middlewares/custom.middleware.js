export function createDayBlocker(blockedDays) {
    return (req, res, next) => {
        if (blockedDays.includes(new Date().getDay())) {
            return res.status(403).json({
                message: 'המערכת אינה פעילה ביום זה'
            });
        }

        next();
    };
}
