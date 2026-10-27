import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { signToken, publicUser } from '../utils/token.js';
import AppError from '../utils/AppError.js';

// הרשמת משתמש חדש: בודקת שהאימייל פנוי, שומרת ומחזירה טוקן.
export const registerUser = async (req, res, next) => {
  const { fullName, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('משתמש עם אימייל זה כבר קיים במערכת.', 400));
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
};

// התחברות: בודקת אימייל וסיסמה ומחזירה טוקן.
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('אימייל או סיסמה שגויים.', 400));
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return next(new AppError('אימייל או סיסמה שגויים.', 400));
  }

  res.status(200).json({
    message: 'התחברת בהצלחה!',
    token: signToken(user),
    user: publicUser(user)
  });
};
