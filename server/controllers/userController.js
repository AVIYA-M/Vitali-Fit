import User from '../models/User.js';

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const userIdToDelete = req.params.id;
        // מניעת מחיקה עצמית של המנהל המחובר
        if (userIdToDelete === String(req.user.userId)) {
            return res.status(400).json({ message: 'לא ניתן למחוק את חשבון המנהל המחובר' });
        }

        const deletedUser = await User.findByIdAndDelete(userIdToDelete);
        if (!deletedUser) return res.status(404).json({ message: 'המשתמש לא נמצא' });

        res.status(200).json({ message: 'המשתמש נמחק בהצלחה' });
    } catch (error) {
        next(error);
    }
};

export const updateUserRole = async (req, res, next) => {
    try {
        const userIdToUpdate = req.params.id;
        const { role } = req.body; // התפקיד נבדק ב-Joi (user / admin בלבד)

        // מניעת הורדת הרשאות עצמית - כדי שלא יישאר מצב בלי אף מנהל
        if (userIdToUpdate === String(req.user.userId)) {
            return res.status(400).json({ message: 'לא ניתן לשנות את התפקיד של המנהל המחובר' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userIdToUpdate,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ message: 'המשתמש לא נמצא' });

        res.status(200).json({ message: 'תפקיד המשתמש עודכן', user: updatedUser });
    } catch (error) {
        next(error);
    }
};
