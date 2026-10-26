import Review from '../models/Review.js';
import AppError from '../utils/AppError.js';

export const addReview = async (req, res, next) => {
    const userId = req.user.userId;
    const { text, name, isAnonymous } = req.body;

    const displayName = isAnonymous ? 'משתמש/ת אנונימי/ת' : (name || 'מתאמנת ב-VitaliFit');

    const newReview = await Review.create({
        userId,
        name: displayName,
        text,
        status: 'pending' 
    });

    res.status(201).json({
        message: 'תודה רבה! ההמלצה שלך נשלחה ותפורסם לאחר אישור.',
        review: newReview
    });
};

export const getApprovedReviews = async (req, res, next) => {
    const reviews = await Review.find({ status: 'approved' })
        .sort({ createdAt: -1 })
        .limit(10); 

    res.status(200).json(reviews);
};

export const getAllReviewsAdmin = async (req, res, next) => {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
};

export const updateReviewStatus = async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const review = await Review.findByIdAndUpdate(id, { status }, { new: true });

    if (!review) {
        return next(new AppError('המלצה לא נמצאה.', 404));
    }

    res.status(200).json({ message: `הסטטוס עודכן ל-${status}`, review });
};
