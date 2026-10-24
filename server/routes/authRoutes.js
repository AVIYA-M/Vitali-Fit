import express from 'express';
const router = express.Router();
import * as authController from '../controllers/auth.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

// 1. ייבוא סכמות הוולידציה ופונקציית הבדיקה
import { registerSchema, loginSchema, validate } from '../middlewares/validators/auth.validator.js';

// 2. הוספת validate(Schema) לפני הפונקציה בנתיבים
router.post('/register', validate(registerSchema), authController.registerUser);

router.post('/login', validate(loginSchema), authController.loginUser);

router.get('/profile', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'ברוך הבא לאזור האישי שלך!',
    user: req.user 
  });
});

router.get('/admin/users', verifyToken, isAdmin, authController.getAllUsers);

export default router;