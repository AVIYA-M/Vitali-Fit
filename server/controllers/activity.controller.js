import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { calculateCalories } from '../utils/helpers.js';
import { ACTIVITY_MET } from '../constants/index.js';

// הוספת פעילות עצמאית (סוג ומשך כבר נבדקו ב-Joi)
export const addActivity = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { activityType, durationMinutes, date } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'המשתמש לא נמצא.' });
    }

    const selectedDate = date ? new Date(date) : new Date();

    if (selectedDate.getDay() === 6) {
      return res.status(400).json({ message: 'לא ניתן להוסיף פעילות בשבת.' });
    }

    // אם אין למשתמש משקל, נשתמש ב-70 ק"ג כברירת מחדל כדי לא לקבל NaN
    const userWeight = user.weight ? Number(user.weight) : 70;

    const caloriesBurned = calculateCalories(
      userWeight,
      durationMinutes,
      ACTIVITY_MET[activityType]
    );

    const activity = await Activity.create({
      userId,
      activityType,
      durationMinutes,
      caloriesBurned,
      date: selectedDate
    });

    res.status(201).json({
      message: 'הפעילות נוספה בהצלחה.',
      activity
    });

  } catch (error) {
    next(error);
  }
};

// שליפת הפעילויות של המשתמש
export const getUserActivities = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const activities = await Activity.find({ userId }).sort({ date: -1 });
    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};
