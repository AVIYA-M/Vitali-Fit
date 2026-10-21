import express from 'express';
const router = express.Router();
import * as authController from '../controllers/auth.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

router.post('/register', authController.registerUser);

router.post('/login', authController.loginUser);


router.get('/profile', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'ברוך הבא לאזור האישי שלך!',
    user: req.user 
  });
});
router.get('/admin/users', verifyToken, isAdmin, authController.getAllUsers);

export default router;