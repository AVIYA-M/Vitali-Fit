import Workout from '../models/Workout.js';
import Tracking from '../models/Tracking.js';

// מונע מתווים מיוחדים בחיפוש (כמו .* או ( ) להתפרש כביטוי רגולרי
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// שליפת כל האימונים
export const getAllWorkouts = async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error);
    }
};

// הוספת אימון חדש (למנהל)
export const createWorkout = async (req, res, next) => {
    try {
        const newWorkout = new Workout(req.body);
        const savedWorkout = await newWorkout.save();

        return res.status(201).json({
            message: 'האימון נוסף בהצלחה',
            workout: savedWorkout
        });
    } catch (error) {
        next(error);
    }
};

// עריכת אימון קיים (למנהל)
export const updateWorkout = async (req, res, next) => {
    try {
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
            return res.status(404).json({
                message: 'האימון לא נמצא'
            });
        }

        return res.status(200).json({
            message: 'האימון עודכן בהצלחה',
            workout: updatedWorkout
        });
    } catch (error) {
        next(error);
    }
};

// מחיקת אימון תוך שמירת היסטוריית המעקב
export const deleteWorkout = async (req, res, next) => {
    try {
        const { id } = req.params;


        const workout = await Workout.findById(id);

        if (!workout) {
            return res.status(404).json({
                message: 'האימון לא נמצא'
            });
        }

        await Tracking.updateMany(
            { workoutId: id },
            { $unset: { workoutId: "" } }
        );

        await Workout.findByIdAndDelete(id);

        return res.status(200).json({
            message: 'האימון נמחק מהמערכת וההיסטוריה נשמרה בהצלחה'
        });
    } catch (error) {
        next(error);
    }
};

// הרשמת משתמש לאימון
export const registerForWorkout = async (req, res, next) => {
    try {
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
            return res.status(404).json({
                message: 'האימון לא נמצא'
            });
        }

        if (existingWorkout.registeredUsers.some(
            registeredUser => registeredUser.toString() === userId.toString()
        )) {
            return res.status(400).json({
                message: 'אתה כבר רשום לאימון זה'
            });
        }

        return res.status(400).json({
            message: 'האימון מלא, לא ניתן להירשם'
        });
    } catch (error) {
        next(error);
    }
};
