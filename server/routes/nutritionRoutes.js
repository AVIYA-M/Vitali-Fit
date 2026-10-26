import express from 'express';
const router = express.Router();
import * as nutritionController from '../controllers/nutrition.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { mealSchema } from '../middlewares/validators/nutrition.validator.js';

// הסדר חשוב: אימות משתמש -> העלאת תמונה -> בדיקת שדות הטופס
router.post('/analyze', verifyToken, upload.single('image'), validate(mealSchema), nutritionController.analyzeMeal);

router.get('/', verifyToken, nutritionController.getUserMeals);

export default router;
