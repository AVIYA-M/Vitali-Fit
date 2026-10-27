import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { calculateCalories } from '../utils/helpers.js';
import { ACTIVITY_MET } from '../constants/index.js';
import AppError from '../utils/AppError.js';
import {
  isShabbat,
  isShabbatBlockingEnabled
} from '../middlewares/custom.middleware.js';

// מוסיפה פעילות גופנית למשתמש ומחשבת קלוריות לפי משקל, משך וסוג הפעילות (חסום בשבת).
export const addActivity = async (req, res, next) => {
  const userId = req.user.userId;
  const { activityType, durationMinutes, date } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('המשתמש לא נמצא.', 404));
  }

  const selectedDate = date ? new Date(date) : new Date();

  if (isShabbatBlockingEnabled() && isShabbat(selectedDate)) {
    return next(new AppError('לא ניתן להוסיף פעילות בשבת.', 400));
  }

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
};

// מחזירה את כל הפעילויות של המשתמש, מהחדשה לישנה.
export const getUserActivities = async (req, res, next) => {
  const userId = req.user.userId;
  const activities = await Activity.find({ userId }).sort({ date: -1 });
  res.status(200).json(activities);
};
