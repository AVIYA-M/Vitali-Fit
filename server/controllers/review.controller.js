import Review from '../models/Review.js';

// 1. הוספת המלצה (למשתמשים מחוברים) - השדות נבדקו ב-Joi
export const addReview = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { text, name, isAnonymous } = req.body;

        // הגדרת שם התצוגה בהתאם לבחירת המשתמש
        const displayName = isAnonymous ? 'משתמש/ת אנונימי/ת' : (name || 'מתאמנת ב-VitaliFit');

        const newReview = await Review.create({
            userId,
            name: displayName,
            text,
            status: 'pending' // ממתין לאישור מנהל כברירת מחדל
        });

        res.status(201).json({
            message: 'תודה רבה! ההמלצה שלך נשלחה ותפורסם לאחר אישור.',
            review: newReview
        });
    } catch (error) {
        next(error);
    }
};

// 2. שליפת המלצות מאושרות בלבד (לדף הבית)
export const getApprovedReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ status: 'approved' })
            .sort({ createdAt: -1 })
            .limit(10); // מציג את 10 ההמלצות האחרונות

        res.status(200).json(reviews);
    } catch (error) {
        next(error);
    }
};

// 3. מנהל: שליפת כל ההמלצות (כולל ממתינות)
export const getAllReviewsAdmin = async (req, res, next) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        next(error);
    }
};

// 4. מנהל: עדכון סטטוס המלצה (אישור/דחייה) - הסטטוס נבדק ב-Joi
export const updateReviewStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const review = await Review.findByIdAndUpdate(id, { status }, { new: true });

        if (!review) {
            return res.status(404).json({ message: 'המלצה לא נמצאה.' });
        }

        res.status(200).json({ message: `הסטטוס עודכן ל-${status}`, review });
    } catch (error) {
        next(error);
    }
};
