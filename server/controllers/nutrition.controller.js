import Nutrition from '../models/Nutrition.js';
import analyzeMealImage from '../services/nutritionAI.service.js';
import AppError from '../utils/AppError.js';

export const analyzeMeal = async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('לא הועלתה תמונה של הארוחה', 400));
  }

  const { mealName, date } = req.body;

  const nutritionData = await analyzeMealImage(
    req.file.path,
    req.file.mimetype,
    mealName
  );

  const newMeal = new Nutrition({
    userId: req.user.userId,
    mealName: nutritionData.mealName || mealName,
    calories: nutritionData.calories,
    protein: nutritionData.protein,
    carbs: nutritionData.carbs,
    fats: nutritionData.fats,
    date: date || Date.now(),
    imageUrl: `/uploads/${req.file.filename}`
  });

  const savedMeal = await newMeal.save();

  res.status(201).json({
    message: 'הארוחה נותחה ונשמרה בהצלחה',
    meal: savedMeal
  });
};

export const getUserMeals = async (req, res, next) => {
  const userId = req.user.userId;
  const meals = await Nutrition.find({ userId });
  res.status(200).json(meals);
};
