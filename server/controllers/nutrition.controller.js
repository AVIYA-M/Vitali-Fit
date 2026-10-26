import Nutrition from '../models/Nutrition.js';
import analyzeMealImage from '../services/nutritionAI.service.js';

export const analyzeMeal = async (req, res, next) => {
  try {
    // בדיקה שהמשתמש שלח תמונה
    if (!req.file) {
      return res.status(400).json({
        message: 'לא הועלתה תמונה של הארוחה'
      });
    }

    // הנתונים שהגיעו מהטופס (נבדקו ב-Joi)
    const { mealName, date } = req.body;

    // ניתוח התמונה באמצעות Gemini
    const nutritionData = await analyzeMealImage(
      req.file.path,
      req.file.mimetype,
      mealName
    );

    // יצירת הארוחה למסד הנתונים עם הנתיב המקומי
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

    // שמירה ב-MongoDB
    const savedMeal = await newMeal.save();

    res.status(201).json({
      message: 'הארוחה נותחה ונשמרה בהצלחה',
      meal: savedMeal
    });

  } catch (error) {
    next(error);
  }
};

// הצגת היסטוריית הארוחות של המשתמש המחובר
export const getUserMeals = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const meals = await Nutrition.find({ userId });
    res.status(200).json(meals);
  } catch (error) {
    next(error);
  }
};
