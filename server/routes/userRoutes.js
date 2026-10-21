import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

// GET /api/admin/users - שליפת כל המשתמשים (מנהל בלבד)
router.get('/users', verifyToken, isAdmin, userController.getAllUsers);

// DELETE /api/admin/users/:id - מחיקת משתמש (מנהל בלבד)
router.delete('/users/:id', verifyToken, isAdmin, userController.deleteUser);

// PATCH /api/admin/users/:id/role - עדכון תפקיד משתמש (מנהל בלבד)
router.patch('/users/:id/role', verifyToken, isAdmin, userController.updateUserRole);

export default router;