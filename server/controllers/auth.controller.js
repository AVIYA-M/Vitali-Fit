const User = require('../models/User.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. פונקציית הרשמה (Register)
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // בדיקה האם המשתמש כבר קיים במערכת לפי האימייל
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'משתמש עם אימייל זה כבר קיים במערכת.' });
    }

    // הצפנת הסיסמה בעזרת bcrypt (רמת אבטחה 10)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // יצירת משתמש חדש עם הסיסמה המוצפנת
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: role || 'user' // ברירת מחדל היא משתמש רגיל
    });

    await newUser.save();

    res.status(201).json({ 
      message: 'המשתמש נוצר בהצלחה!', 
      user: { id: newUser._id, fullName: newUser.fullName, email: newUser.email, role: newUser.role } 
    });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה ביצירת משתמש.', error: error.message });
  }
};

// 2. פונקציית התחברות (Login)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // חיפוש המשתמש לפי האימייל
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'אימייל או סיסמה שגויים.' });
    }

    // השוואת הסיסמה שהוזנה מול הסיסמה המוצפנת במסד הנתונים
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'אימייל או סיסמה שגויים.' });
    }

    // יצירת טוקן אימות (JWT) ששומר בתוכו את מזהה המשתמש והתפקיד שלו
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '1d' } // הטוקן תקף ליום אחד
    );

    res.status(200).json({
      message: 'התחברת בהצלחה!',
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בהתחברות.', error: error.message });
  }
};

// 3. שליפת כל המשתמשים (לפאנל ניהול)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // מחזיר את כל המשתמשים חוץ מהסיסמאות שלהם
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בשליפת המשתמשים.', error: error.message });
  }
};