const express = require('express');

const router = express.Router();

const nutritionController = require('../controllers/nutrition.controller');
const upload = require('../middlewares/upload.middleware');

const { verifyToken } = require('../middlewares/auth.middleware.js');

// POST /api/nutrition
// הוספת ארוחה חדשה - רק משתמש מחובר
router.post(
  '/analyze',
  verifyToken,
  upload.single('image'),
  nutritionController.analyzeMeal
);// GET /api/nutrition
// שליפת הארוחות של המשתמש המחובר
router.get('/',verifyToken,nutritionController.getUserMeals);

module.exports = router;