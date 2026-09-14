const Workout = require('../models/workout.model');

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