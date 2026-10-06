const Tracking = require('../models/Tracking.js');
const Workout = require('../models/Workout.js');
const Activity = require('../models/Activity.js');
const Nutrition = require('../models/Nutrition.js');
const User = require('../models/User.js');
const WeightHistory = require('../models/WeightHistory.js');


// ========================================
// תחילת שבוע לפי יום שקילה
// ========================================
function getStartOfUserWeek(date, weighInDay) {
    const dayNumbers = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6
    };

    /*
     * משתמשים ישנים יכולים להיות בלי
     * weighInDay. במקרה כזה נשתמש בראשון
     * כברירת מחדל כדי לא להפיל את השרת.
     */
    const targetDay =
        dayNumbers[weighInDay] !== undefined
            ? dayNumbers[weighInDay]
            : 0;

    const result = new Date(date);
    result.setHours(0, 0, 0, 0);

    const currentDay = result.getDay();
    let difference = currentDay - targetDay;

    if (difference < 0) {
        difference += 7;
    }

    result.setDate(result.getDate() - difference);
    return result;
}


// ========================================
// סימון אימון כהושלם
// ========================================
exports.completeWorkout = async (req, res) => {
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
        console.error('שגיאה בסימון אימון:', error);
        res.status(500).json({
            message: 'שגיאה בסימון האימון.',
            error: error.message
        });
    }
};


// ========================================
// לוח המעקב
// ========================================
exports.getTrackingDashboard = async (req, res) => {
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
        const startOfWeek = getStartOfUserWeek(
            now,
            user.weighInDay
        );

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
        const currentWeight = Number(user.weight) || 0;

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
            weighInDay: user.weighInDay || null,

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
        console.error(
            'שגיאה בלוח המעקב:',
            error
        );

        res.status(500).json({
            message: 'שגיאה בשליפת נתוני המעקב.',
            error: error.message
        });
    }
};