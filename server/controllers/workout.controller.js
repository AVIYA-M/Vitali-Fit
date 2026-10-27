import Workout from '../models/Workout.js';
import Tracking from '../models/Tracking.js';
import AppError from '../utils/AppError.js';

// מנטרלת תווים מיוחדים בטקסט חיפוש כדי שישמש בבטחה ב-regex.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// מחזירה אימונים, עם סינון לפי חיפוש בכותרת, קטגוריה וסוג.
export const getAllWorkouts = async (req, res, next) => {
        const query = {};

        const { search, category, type } = req.query;

        if (typeof search === 'string' && search.trim()) {
            query.title = { $regex: escapeRegex(search.trim()), $options: 'i' };
        }

        if (typeof category === 'string' && category) {
            query.category = category;
        }

        if (typeof type === 'string' && type) {
            query.type = type;
        }

        const workouts = await Workout.find(query);
        return res.status(200).json(workouts);
};

// יוצרת אימון חדש.
export const createWorkout = async (req, res, next) => {
        const newWorkout = new Workout(req.body);
        const savedWorkout = await newWorkout.save();

        return res.status(201).json({
            message: 'האימון נוסף בהצלחה',
            workout: savedWorkout
        });
};

// מעדכנת אימון קיים.
export const updateWorkout = async (req, res, next) => {
        const { id } = req.params;


        const updatedWorkout = await Workout.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedWorkout) {
            return next(new AppError('האימון לא נמצא', 404));
        }

        return res.status(200).json({
            message: 'האימון עודכן בהצלחה',
            workout: updatedWorkout
        });
};

// מוחקת אימון ושומרת את היסטוריית המעקב של המשתתפים.
export const deleteWorkout = async (req, res, next) => {
        const { id } = req.params;


        const workout = await Workout.findById(id);

        if (!workout) {
            return next(new AppError('האימון לא נמצא', 404));
        }

        await Tracking.updateMany(
            { workoutId: id },
            { $unset: { workoutId: "" } }
        );

        await Workout.findByIdAndDelete(id);

        return res.status(200).json({
            message: 'האימון נמחק מהמערכת וההיסטוריה נשמרה בהצלחה'
        });
};

// רושמת משתמש לאימון בצורה אטומית, בלי כפילות ובלי חריגה ממספר המקומות.
export const registerForWorkout = async (req, res, next) => {
        const { id } = req.params;
        const userId = req.user.userId;


        const workout = await Workout.findOneAndUpdate(
            {
                _id: id,
                registeredUsers: { $ne: userId },
                $expr: {
                    $lt: [
                        { $size: '$registeredUsers' },
                        '$maxParticipants'
                    ]
                }
            },
            {
                $addToSet: {
                    registeredUsers: userId
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (workout) {
            return res.status(200).json({
                message: 'נרשמת לאימון בהצלחה!',
                workout
            });
        }

        const existingWorkout = await Workout.findById(id);

        if (!existingWorkout) {
            return next(new AppError('האימון לא נמצא', 404));
        }

        if (existingWorkout.registeredUsers.some(
            registeredUser => registeredUser.toString() === userId.toString()
        )) {
            return next(new AppError('אתה כבר רשום לאימון זה', 400));
        }

        return next(new AppError('האימון מלא, לא ניתן להירשם', 400));
};
