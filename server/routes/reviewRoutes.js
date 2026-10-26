import express from 'express';
const router = express.Router();
import * as reviewController from '../controllers/review.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { reviewSchema, reviewStatusSchema } from '../middlewares/validators/review.validator.js';
import { idParamSchema } from '../middlewares/validators/common.validator.js';

// נתיב פומבי - כולם יכולים לראות המלצות מאושרות בדף הבית
router.get('/approved', reviewController.getApprovedReviews);

// נתיב למשתמשים מחוברים בלבד (הוספת המלצה)
router.post('/', verifyToken, validate(reviewSchema), reviewController.addReview);

// נתיבי ניהול (מוגנים גם על ידי אימות וגם על ידי הרשאת מנהל)
router.get('/admin/all', verifyToken, isAdmin, reviewController.getAllReviewsAdmin);
router.put('/admin/:id/status', verifyToken, isAdmin, validate(idParamSchema, 'params'), validate(reviewStatusSchema), reviewController.updateReviewStatus);

export default router;
