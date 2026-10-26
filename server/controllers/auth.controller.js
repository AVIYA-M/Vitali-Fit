import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { signToken, publicUser } from '../utils/token.js';

// הרשמה (הבדיקות מתבצעות ב-Joi ב-Middleware)
export const registerUser = async (req, res, next) => {
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
      token: signToken(newUser),
      user: publicUser(newUser)
    });

  } catch (error) {
    next(error);
  }
};

// התחברות
export const loginUser = async (req, res, next) => {
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

    res.status(200).json({
      message: 'התחברת בהצלחה!',
      token: signToken(user),
      user: publicUser(user)
    });

  } catch (error) {
    next(error);
  }
};
