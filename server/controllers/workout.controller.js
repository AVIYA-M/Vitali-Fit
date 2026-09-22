const Workout = require('../models/Workout.js');

// שליפת כל האימונים
exports.getAllWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({});
    res.status(200).json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בשליפת האימונים', error: error.message });
  }
};

// הוספת אימון חדש (למנהל)
exports.createWorkout = async (req, res) => {
  try {
    const newWorkout = new Workout(req.body);
    const savedWorkout = await newWorkout.save();
    res.status(201).json({ message: 'האימון נוסף בהצלחה', workout: savedWorkout });
  } catch (error) {
    res.status(400).json({ message: 'שגיאה ביצירת האימון', error: error.message });
  }
};

// פונקציה חדשה: הרשמת משתמש לאימון ספציפי
exports.registerForWorkout = async (req, res) => {
  try {
    const workoutId = req.params.id; // מזהה האימון מה-URL
    const userId = req.user.userId; // מזהה המשתמש שחולץ מהטוקן על ידי המידלוור

    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: 'האימון לא נמצא' });
    }

    // בדיקה: האם המשתמש כבר רשום?
    if (workout.registeredUsers.includes(userId)) {
      return res.status(400).json({ message: 'אתה כבר רשום לאימון זה' });
    }

    // בדיקה: האם יש מקום פנוי?
    if (workout.registeredUsers.length >= workout.maxParticipants) {
      return res.status(400).json({ message: 'האימון מלא, לא ניתן להירשם' });
    }

    // הכל תקין - הוספת המשתמש למערך הרשומים ושמירה במסד
    workout.registeredUsers.push(userId);
    await workout.save();

    res.status(200).json({ message: 'נרשמת לאימון בהצלחה!', workout });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בהרשמה לאימון', error: error.message });
  }
};