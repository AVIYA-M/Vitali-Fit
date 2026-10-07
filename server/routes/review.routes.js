const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// נתיב פומבי - כולם יכולים לראות המלצות מאושרות בדף הבית
router.get('/approved', reviewController.getApprovedReviews);

// נתיב למשתמשים מחוברים בלבד (הוספת המלצה)
router.post('/', verifyToken, reviewController.addReview);

// נתיבי ניהול (מוגנים גם על ידי אימות וגם על ידי הרשאת מנהל)
router.get('/admin/all', verifyToken, isAdmin, reviewController.getAllReviewsAdmin);
router.put('/admin/:id/status', verifyToken, isAdmin, reviewController.updateReviewStatus);

module.exports = router;