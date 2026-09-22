const User = require('../models/User.js');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'שגיאה בשליפת המשתמשים', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userIdToDelete = req.params.id;
        // מניעת מחיקה עצמית של המנהל המחובר
        if (userIdToDelete === req.user.userId) {
            return res.status(400).json({ message: 'לא ניתן למחוק את חשבון המנהל המחובר' });
        }
        
        const deletedUser = await User.findByIdAndDelete(userIdToDelete);
        if (!deletedUser) return res.status(404).json({ message: 'המשתמש לא נמצא' });
        
        res.status(200).json({ message: 'המשתמש נמחק בהצלחה' });
    } catch (error) {
        res.status(500).json({ message: 'שגיאה במחיקת המשתמש', error: error.message });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const userIdToUpdate = req.params.id;
        const { role } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(userIdToUpdate, { role }, { new: true }).select('-password');
        if (!updatedUser) return res.status(404).json({ message: 'המשתמש לא נמצא' });
        
        res.status(200).json({ message: 'תפקיד המשתמש עודכן', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'שגיאה בעדכון התפקיד', error: error.message });
    }
};