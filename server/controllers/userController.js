import User from '../models/User.js';
import AppError from '../utils/AppError.js';

// מחזירה את כל המשתמשים ללא סיסמאות.
export const getAllUsers = async (req, res, next) => {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
};

// מוחקת משתמש (אי אפשר למחוק את המנהל המחובר).
export const deleteUser = async (req, res, next) => {
    const userIdToDelete = req.params.id;
    if (userIdToDelete === String(req.user.userId)) {
        return next(new AppError('לא ניתן למחוק את חשבון המנהל המחובר', 400));
    }

    const deletedUser = await User.findByIdAndDelete(userIdToDelete);
    if (!deletedUser) {
        return next(new AppError('המשתמש לא נמצא', 404));
    }

    res.status(200).json({ message: 'המשתמש נמחק בהצלחה' });
};

// משנה תפקיד משתמש (אי אפשר לשנות את המנהל המחובר).
export const updateUserRole = async (req, res, next) => {
    const userIdToUpdate = req.params.id;
    const { role } = req.body; 

    if (userIdToUpdate === String(req.user.userId)) {
        return next(new AppError('לא ניתן לשנות את התפקיד של המנהל המחובר', 400));
    }

    const updatedUser = await User.findByIdAndUpdate(
        userIdToUpdate,
        { role },
        { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
        return next(new AppError('המשתמש לא נמצא', 404));
    }

    res.status(200).json({ message: 'תפקיד המשתמש עודכן', user: updatedUser });
};
