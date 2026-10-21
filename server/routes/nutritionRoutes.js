import express from 'express';
const router = express.Router();
import * as nutritionController from '../controllers/nutrition.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
router.post(
  '/analyze',
  verifyToken,
  upload.single('image'),
  nutritionController.analyzeMeal
);


router.get('/', verifyToken, nutritionController.getUserMeals);

export default router;