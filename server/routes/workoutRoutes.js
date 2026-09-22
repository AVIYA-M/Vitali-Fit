const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workout.controller');

// מייבאים את המידלוורים שבודקים אם המשתמש מחובר (verifyToken) ואם הוא מנהל (isAdmin)
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware.js');

// GET /api/workouts - שליפת כל האימונים (כולם יכולים לראות)
router.get('/', workoutController.getAllWorkouts);

// POST /api/workouts - הוספת אימון חדש (מנהלים בלבד!)
router.post('/', verifyToken, isAdmin, workoutController.createWorkout);

// POST /api/workouts/:id/register - הרשמה לאימון (רק משתמשים מחוברים יכולים להירשם)
router.post('/:id/register', verifyToken, workoutController.registerForWorkout);

module.exports = router;