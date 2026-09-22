const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware.js');

// GET /api/admin/users - שליפת כל המשתמשים (מנהל בלבד)
router.get('/users', verifyToken, isAdmin, userController.getAllUsers);

// DELETE /api/admin/users/:id - מחיקת משתמש (מנהל בלבד)
router.delete('/users/:id', verifyToken, isAdmin, userController.deleteUser);

// PATCH /api/admin/users/:id/role - עדכון תפקיד משתמש (מנהל בלבד)
router.patch('/users/:id/role', verifyToken, isAdmin, userController.updateUserRole);

module.exports = router;