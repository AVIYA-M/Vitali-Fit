const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutrition.controller');
const upload = require('../middlewares/upload.middleware'); // ייבוא ה-Multer שהגדרנו קודם

// POST /api/nutrition - הוספת ארוחה חדשה כולל העלאת תמונה שדה בשם 'image'
router.post('/', upload.single('image'), nutritionController.addMeal);

// GET /api/nutrition/:userId - שליפת היסטוריית הארוחות לפי משתמש
router.get('/:userId', nutritionController.getUserMeals);

module.exports = router;