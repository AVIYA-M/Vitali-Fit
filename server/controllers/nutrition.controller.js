const Nutrition = require('../models/Nutrition.js');
const { analyzeMealImage } = require('../services/nutritionAI.service');


// הוספת ארוחה באמצעות Gemini
exports.analyzeMeal = async (req, res) => {

  try {
    console.log('FILE:', req.file);
    console.log('BODY:', req.body);

    // בדיקה שהמשתמש שלח תמונה
    if (!req.file) {
      return res.status(400).json({
        message: 'לא הועלתה תמונה של הארוחה'
      });
    }


    // הנתונים שהגיעו מהטופס
    const { mealName, date } = req.body;


    if (!mealName) {
      return res.status(400).json({
        message: 'יש להזין שם ארוחה'
      });
    }

 
    console.log('מתחילים לשלוח את התמונה ל-Gemini...');
    // ניתוח התמונה באמצעות Gemini
    const nutritionData = await analyzeMealImage(
      req.file.path,
      req.file.mimetype,
      mealName
    );
    console.log('קיבלנו תשובה מ-Gemini:', nutritionData);


    // יצירת הארוחה למסד הנתונים
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

    console.error('שגיאה בניתוח הארוחה:', error);

    res.status(500).json({

      message: 'שגיאה בניתוח הארוחה',

      error: error.message

    });

  }
};



// הצגת היסטוריית הארוחות של המשתמש המחובר
exports.getUserMeals = async (req, res) => {

  try {

    const userId = req.user.userId;

    const meals = await Nutrition.find({ userId });

    res.status(200).json(meals);

  } catch (error) {

    res.status(500).json({

      message: 'שגיאה בשליפת הארוחות',

      error: error.message

    });

  }

};