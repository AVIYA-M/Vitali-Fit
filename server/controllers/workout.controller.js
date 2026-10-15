const Workout = require('../models/Workout.js');
const Tracking = require('../models/Tracking.js');

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

// עריכת אימון קיים (למנהל - מבלי ליצור אימון חדש)
exports.updateWorkout = async (req, res) => {
  try {
    const workoutId = req.params.id;
    const updatedData = req.body;

    const updatedWorkout = await Workout.findByIdAndUpdate(workoutId, updatedData, { new: true });
    if (!updatedWorkout) {
      return res.status(404).json({ message: 'האימון לא נמצא' });
    }

    res.status(200).json({ message: 'האימון עודכן בהצלחה', workout: updatedWorkout });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בעדכון האימון', error: error.message });
  }
};

// מחיקת אימון (למנהל - תוך שמירת היסטוריית המשתמשים כנדרש)
exports.deleteWorkout = async (req, res) => {
  try {
    const workoutId = req.params.id;

    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: 'האימון לא נמצא' });
    }

    // מעדכנים רשומות מעקב קיימות כדי שהאימון לא יימחק מההיסטוריה של המשתמשים
    await Tracking.updateMany(
      { workoutId: workoutId },
      { $unset: { workoutId: "" } }
    );

    await Workout.findByIdAndDelete(workoutId);

    res.status(200).json({ message: 'האימון נמחק מהמערכת וההיסטוריה נשמרה בהצלחה' });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה במחיקת האימון', error: error.message });
  }
};

// הרשמת משתמש לאימון ספציפי
exports.registerForWorkout = async (req, res) => {
  try {
    const workoutId = req.params.id;
    const userId = req.user.userId;

    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: 'האימון לא נמצא' });
    }

    if (workout.registeredUsers.includes(userId)) {
      return res.status(400).json({ message: 'אתה כבר רשום לאימון זה' });
    }

    if (workout.registeredUsers.length >= workout.maxParticipants) {
      return res.status(400).json({ message: 'האימון מלא, לא ניתן להירשם' });
    }

    workout.registeredUsers.push(userId);
    await workout.save();

    res.status(200).json({ message: 'נרשמת לאימון בהצלחה!', workout });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בהרשמה לאימון', error: error.message });
  }
};