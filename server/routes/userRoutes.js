import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { userRoleSchema } from '../middlewares/validators/user.validator.js';
import { idParamSchema } from '../middlewares/validators/common.validator.js';

// GET /api/admin/users - שליפת כל המשתמשים (מנהל בלבד)
router.get('/users', verifyToken, isAdmin, userController.getAllUsers);

// DELETE /api/admin/users/:id - מחיקת משתמש (מנהל בלבד)
router.delete('/users/:id', verifyToken, isAdmin, validate(idParamSchema, 'params'), userController.deleteUser);

// PATCH /api/admin/users/:id/role - עדכון תפקיד משתמש (מנהל בלבד)
router.patch('/users/:id/role', verifyToken, isAdmin, validate(idParamSchema, 'params'), validate(userRoleSchema), userController.updateUserRole);

export default router;
