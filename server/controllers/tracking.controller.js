import Tracking from '../models/Tracking.js';
import Workout from '../models/Workout.js';
import Activity from '../models/Activity.js';
import Nutrition from '../models/Nutrition.js';
import User from '../models/User.js';
import WeightHistory from '../models/WeightHistory.js';
import { getStartOfWeek } from '../utils/helpers.js';


// ========================================
// סימון אימון כהושלם
// ========================================
export const completeWorkout = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const workoutId = req.params.workoutId;

        const workout = await Workout.findById(workoutId);

        if (!workout) {
            return res.status(404).json({
                message: 'האימון לא נמצא.'
            });
        }

        const isRegistered =
            Array.isArray(workout.registeredUsers) &&
            workout.registeredUsers.some(
                id => String(id) === String(userId)
            );

        if (!isRegistered) {
            return res.status(403).json({
                message: 'אפשר לסמן כהושלם רק אימון שנרשמת אליו.'
            });
        }

        const existingTracking = await Tracking.findOne({
            userId,
            workoutId
        });

        if (existingTracking) {
            return res.status(400).json({
                message: 'האימון כבר סומן כהושלם.'
            });
        }

        const tracking = new Tracking({
            userId,
            workoutId,
            completedAt: new Date(),
            durationMinutes: Number(workout.durationMinutes) || 60,
            caloriesBurned: Number(workout.estimatedCalories) || 250
        });

        const savedTracking = await tracking.save();

        res.status(201).json({
            message: 'האימון סומן כהושלם בהצלחה.',
            tracking: savedTracking
        });

    } catch (error) {
        next(error);
    }
};


// ========================================
// לוח המעקב
// ========================================
export const getTrackingDashboard = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'המשתמש לא נמצא.'
            });
        }

        const now = new Date();

        // ========================================
        // שבוע
        // ========================================
        const startOfWeek = getStartOfWeek(now);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);


        // ========================================
        // אימונים
        // ========================================
        const weeklyWorkouts = await Tracking.find({
            userId,
            completedAt: {
                $gte: startOfWeek,
                $lt: endOfWeek
            }
        });

        const workoutCalories = weeklyWorkouts.reduce(
            (total, record) => {
                return total + (Number(record.caloriesBurned) || 0);
            },
            0
        );

        const workoutMinutes = weeklyWorkouts.reduce(
            (total, record) => {
                return total + (Number(record.durationMinutes) || 0);
            },
            0
        );


        // ========================================
        // פעילות נוספת
        // ========================================
        const weeklyActivities = await Activity.find({
            userId,
            date: {
                $gte: startOfWeek,
                $lt: endOfWeek
            }
        }).sort({
            date: -1
        });

        const activityCalories = weeklyActivities.reduce(
            (total, activity) => {
                return total + (Number(activity.caloriesBurned) || 0);
            },
            0
        );

        const activityMinutes = weeklyActivities.reduce(
            (total, activity) => {
                return total + (Number(activity.durationMinutes) || 0);
            },
            0
        );


        // ========================================
        // אוכל
        // ========================================
        const weeklyMeals = await Nutrition.find({
            userId,
            date: {
                $gte: startOfWeek,
                $lt: endOfWeek
            }
        });

        const foodCalories = weeklyMeals.reduce(
            (total, meal) => {
                return total + (Number(meal.calories) || 0);
            },
            0
        );


        // ========================================
        // סיכום קלורי
        // ========================================
        const totalBurnedCalories =
            workoutCalories +
            activityCalories;

        const calorieBalance =
            totalBurnedCalories -
            foodCalories;


        // ========================================
        // משקל התחלתי והפרשים
        // ========================================
        const weightHistory = await WeightHistory.find({
            userId
        }).sort({
            date: 1,
            _id: 1
        });

        let firstWeight = weightHistory.length > 0 ? weightHistory[0] : null;

        if (!firstWeight) {
            firstWeight = {
                weight: Number(user.weight) || 0
            };
        }

        const initialWeight = Number(firstWeight.weight) || 0;
        // משקל נוכחי: הערך השמור אצל המשתמש, ואם אין - השקילה האחרונה בהיסטוריה
        const lastRecord = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null;
        const currentWeight = Number(user.weight) || Number(lastRecord?.weight) || 0;

        const weightChange = Number(
            (currentWeight - initialWeight).toFixed(1)
        );

        // חישוב הפרש מהשקילה הקודמת (דרישה 1)
        let previousWeightDiff = 0;
        if (weightHistory.length >= 2) {
            const prevW = Number(weightHistory[weightHistory.length - 2].weight);
            const currentW = Number(weightHistory[weightHistory.length - 1].weight);
            previousWeightDiff = Number((currentW - prevW).toFixed(1));
        }


        // ========================================
        // היסטוריית פעילויות - 4 בלבד
        // ========================================
        const activityHistory = await Activity.find({
            userId
        })
        .sort({
            date: -1
        })
        .limit(4);


        // ========================================
        // היסטוריית אימונים
        // ========================================
        const history = await Tracking.find({
            userId
        })
        .populate(
            'workoutId',
            'title date time instructor category estimatedCalories'
        )
        .sort({
            completedAt: -1
        })
        .limit(10);


        // ========================================
        // תשובה
        // ========================================
        res.status(200).json({
            weight: currentWeight,
            initialWeight,
            weightChange,
            previousWeightDiff, // הפרש מהשקילה הקודמת

            weeklyFoodCalories: foodCalories,

            weeklyWorkoutCalories: workoutCalories,
            weeklyWorkoutMinutes: workoutMinutes,
            weeklyWorkouts: weeklyWorkouts.length,

            weeklyActivityCalories: activityCalories,
            weeklyActivityMinutes: activityMinutes,
            weeklyActivities: weeklyActivities.length,

            totalBurnedCalories,
            calorieBalance,

            activityMinutes: workoutMinutes + activityMinutes,

            history,
            activityHistory
        });

    } catch (error) {
        next(error);
    }
};
