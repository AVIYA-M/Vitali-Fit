import express from 'express';
const router = express.Router();
import * as authController from '../controllers/auth.controller.js';
import * as userController from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../middlewares/validators/auth.validator.js';

router.post('/register', validate(registerSchema), authController.registerUser);

router.post('/login', validate(loginSchema), authController.loginUser);

// מחזירה את פרטי המשתמש המחובר (דורש טוקן).
router.get('/profile', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'ברוך הבא לאזור האישי שלך!',
    user: req.user
  });
});

// נשאר לשמירת תאימות - אותה פונקציה כמו /api/admin/users
router.get('/admin/users', verifyToken, isAdmin, userController.getAllUsers);

export default router;
