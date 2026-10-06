const Activity = require('../models/Activity.js');
const User = require('../models/User.js');

// חישוב קלוריות לפי MET
function calculateCalories(weight, durationMinutes, met) {
  return Math.round((met * 3.5 * weight / 200) * durationMinutes);
}

// הוספת פעילות עצמאית
exports.addActivity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { activityType, durationMinutes, date } = req.body;

    if (!activityType || !durationMinutes) {
      return res.status(400).json({ message: 'יש למלא סוג פעילות ומשך פעילות.' });
    }

    const duration = Number(durationMinutes);
    if (duration <= 0) {
      return res.status(400).json({ message: 'משך הפעילות חייב להיות גדול מ-0.' });
    }

    const activityMET = {
      walking: 3.5,
      running: 8.0,
      stairs: 8.8,
      cycling: 7.5,
      homeWorkout: 5.0,
      other: 4.0
    };

    if (!activityMET[activityType]) {
      return res.status(400).json({ message: 'סוג פעילות לא תקין.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'המשתמש לא נמצא.' });
    }

    const selectedDate = date ? new Date(date) : new Date();

    if (selectedDate.getDay() === 6) {
      return res.status(400).json({ message: 'לא ניתן להוסיף פעילות בשבת.' });
    }

    // התיקון הקריטי: אם אין למשתמש משקל, נשתמש ב-70 ק"ג כברירת מחדל כדי לא לקרוס (NaN)
    const userWeight = user.weight ? Number(user.weight) : 70;

    const caloriesBurned = calculateCalories(
      userWeight,
      duration,
      activityMET[activityType]
    );

    const activity = new Activity({
      userId,
      activityType,
      durationMinutes: duration,
      caloriesBurned,
      date: selectedDate
    });

    await activity.save();

    res.status(201).json({
      message: 'הפעילות נוספה בהצלחה.',
      activity
    });

  } catch (error) {
    console.error('שגיאה בהוספת פעילות:', error);
    res.status(500).json({ message: 'שגיאה בהוספת הפעילות.', error: error.message });
  }
};

// שליפת הפעילויות של המשתמש
exports.getUserActivities = async (req, res) => {
  try {
    const userId = req.user.userId;
    const activities = await Activity.find({ userId }).sort({ date: -1 });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בשליפת הפעילויות.', error: error.message });
  }
};