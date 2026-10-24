import mongoose from 'mongoose';
import Workout from '../models/Workout.js';
import Tracking from '../models/Tracking.js';

// בדיקת תקינות מזהה האימון
const isValidWorkoutId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// שליפת כל האימונים
export const getAllWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find({});
        return res.status(200).json(workouts);
    } catch (error) {
        console.error('שגיאה בשליפת האימונים:', error);
        return res.status(500).json({
            message: 'שגיאה בשליפת האימונים'
        });
    }
};

// הוספת אימון חדש (למנהל)
export const createWorkout = async (req, res) => {
    try {
        const newWorkout = new Workout(req.body);
        const savedWorkout = await newWorkout.save();

        return res.status(201).json({
            message: 'האימון נוסף בהצלחה',
            workout: savedWorkout
        });
    } catch (error) {
        console.error('שגיאה ביצירת האימון:', error);

        return res.status(400).json({
            message: 'שגיאה ביצירת האימון',
            error: error.message
        });
    }
};

// עריכת אימון קיים (למנהל)
export const updateWorkout = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidWorkoutId(id)) {
            return res.status(400).json({
                message: 'מזהה האימון אינו תקין'
            });
        }

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
        console.error('שגיאה בעדכון האימון:', error);

        const statusCode = error.name === 'ValidationError' ||
            error.name === 'CastError' ? 400 : 500;

        return res.status(statusCode).json({
            message: 'שגיאה בעדכון האימון',
            error: error.message
        });
    }
};

// מחיקת אימון תוך שמירת היסטוריית המעקב
export const deleteWorkout = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidWorkoutId(id)) {
            return res.status(400).json({
                message: 'מזהה האימון אינו תקין'
            });
        }

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
        console.error('שגיאה במחיקת האימון:', error);

        return res.status(500).json({
            message: 'שגיאה במחיקת האימון',
            error: error.message
        });
    }
};

// הרשמת משתמש לאימון
export const registerForWorkout = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!isValidWorkoutId(id)) {
            return res.status(400).json({
                message: 'מזהה האימון אינו תקין'
            });
        }

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
        console.error('שגיאה בהרשמה לאימון:', error);

        return res.status(500).json({
            message: 'שגיאה בהרשמה לאימון',
            error: error.message
        });
    }
};
