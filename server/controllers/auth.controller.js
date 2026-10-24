import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// הרשמה (הבדיקות מתבצעות כעת בעזרת Joi ב-Middleware)
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'משתמש עם אימייל זה כבר קיים במערכת.'
      });
    }

    const newUser = new User({
      fullName,
      email,
      password,
      role: 'user'
    });

    await newUser.save();

    res.status(201).json({
      message: 'המשתמש נוצר בהצלחה!',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('שגיאה בהרשמה:', error);
    res.status(500).json({
      message: 'שגיאה ביצירת משתמש.',
      error: error.message
    });
  }
};

// התחברות
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'אימייל או סיסמה שגויים.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'אימייל או סיסמה שגויים.' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'התחברת בהצלחה!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'שגיאה בהתחברות.',
      error: error.message
    });
  }
};

// שליפת כל המשתמשים למנהל
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: 'שגיאה בשליפת המשתמשים.',
      error: error.message
    });
  }
};