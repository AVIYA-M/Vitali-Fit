import express from 'express';
const router = express.Router();
import * as reviewController from '../controllers/review.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

// נתיב פומבי - כולם יכולים לראות המלצות מאושרות בדף הבית
router.get('/approved', reviewController.getApprovedReviews);

// נתיב למשתמשים מחוברים בלבד (הוספת המלצה)
router.post('/', verifyToken, reviewController.addReview);

// נתיבי ניהול (מוגנים גם על ידי אימות וגם על ידי הרשאת מנהל)
router.get('/admin/all', verifyToken, isAdmin, reviewController.getAllReviewsAdmin);
router.put('/admin/:id/status', verifyToken, isAdmin, reviewController.updateReviewStatus);

export default router;