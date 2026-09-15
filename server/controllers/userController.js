const User = require('../models/User');

// רישום משתמש חדש
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    
    // בדיקה אם המשתמש כבר קיים
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'המשתמש כבר קיים במערכת' });
    }

    const newUser = new User({ fullName, email, password, role });
    await newUser.save();
    
    res.status(201).json({ 
      message: 'המשתמש נרשם בהצלחה', 
      user: { id: newUser._id, fullName: newUser.fullName, email: newUser.email, role: newUser.role } 
    });
  } catch (error) {
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
};

// שליפת כל המשתמשים (לדף ניהול המשתמשים)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
};

module.exports = { registerUser, getUsers };