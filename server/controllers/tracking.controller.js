import Tracking from '../models/Tracking.js';
import Workout from '../models/Workout.js';
import Activity from '../models/Activity.js';
import Nutrition from '../models/Nutrition.js';
import User from '../models/User.js';
import WeightHistory from '../models/WeightHistory.js';
import { getStartOfWeek, getWorkoutEnd } from '../utils/helpers.js';
import AppError from '../utils/AppError.js';



export const completeWorkout = async (req, res, next) => {
        const userId = req.user.userId;
        const workoutId = req.params.workoutId;

        const workout = await Workout.findById(workoutId);

        if (!workout) {
            return next(new AppError('האימון לא נמצא.', 404));
        }

        const isRegistered =
            Array.isArray(workout.registeredUsers) &&
            workout.registeredUsers.some(
                id => String(id) === String(userId)
            );

        if (!isRegistered) {
            return next(new AppError('אפשר לסמן כהושלם רק אימון שנרשמת אליו.', 403));
        }

        if (new Date() < getWorkoutEnd(workout)) {
            return next(new AppError('אפשר לסמן אימון כהושלם רק אחרי שהוא הסתיים.', 400));
        }

        const existingTracking = await Tracking.findOne({
            userId,
            workoutId
        });

        if (existingTracking) {
            return next(new AppError('האימון כבר סומן כהושלם.', 400));
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

};


export const getCompletedWorkoutIds = async (req, res, next) => {
        const records = await Tracking.find({
            userId: req.user.userId,
            workoutId: { $ne: null }
        }).select('workoutId');

        res.status(200).json(records.map(record => String(record.workoutId)));
};

export const getTrackingDashboard = async (req, res, next) => {
        const userId = req.user.userId;

        const user = await User.findById(userId);

        if (!user) {
            return next(new AppError('המשתמש לא נמצא.', 404));
        }

        const now = new Date();

        const startOfWeek = getStartOfWeek(now);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);


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


        const totalBurnedCalories =
            workoutCalories +
            activityCalories;

        const calorieBalance =
            totalBurnedCalories -
            foodCalories;


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
        const lastRecord = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null;
        const currentWeight = Number(user.weight) || Number(lastRecord?.weight) || 0;

        const weightChange = Number(
            (currentWeight - initialWeight).toFixed(1)
        );

        let previousWeightDiff = 0;
        if (weightHistory.length >= 2) {
            const prevW = Number(weightHistory[weightHistory.length - 2].weight);
            const currentW = Number(weightHistory[weightHistory.length - 1].weight);
            previousWeightDiff = Number((currentW - prevW).toFixed(1));
        }

        const activityHistory = await Activity.find({
            userId
        })
        .sort({
            date: -1
        })
        .limit(4);


 
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

        res.status(200).json({
            weight: currentWeight,
            initialWeight,
            weightChange,
            previousWeightDiff, 

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

};