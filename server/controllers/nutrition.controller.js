const Nutrition = require('../models/Nutrition.js');

// הוספת ארוחה חדשה ליומן (כולל תמונה)
exports.addMeal = async (req, res) => {
  try {
    const { userId, mealName, calories, date } = req.body;
    
    // אם הועלתה תמונה, ניקח את הנתיב שלה
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const newMeal = new Nutrition({
      userId,
      mealName,
      calories,
      date: date || Date.now(),
      imageUrl
    });

    const savedMeal = await newMeal.save();
    res.status(201).json({ message: 'הארוחה נוספה בהצלחה', meal: savedMeal });
  } catch (error) {
    res.status(400).json({ message: 'שגיאה בשמירת הארוחה', error: error.message });
  }
};

// הצגת היסטוריית הארוחות של משתמש ספציפי
exports.getUserMeals = async (req, res) => {
  try {
    const { userId } = req.params;
    const meals = await Nutrition.find({ userId });
    res.status(200).json(meals);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בשליפת הארוחות', error: error.message });
  }
};