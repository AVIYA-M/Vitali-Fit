import express from 'express';
const router = express.Router();
import * as workoutController from '../controllers/workout.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import { workoutSchema, validateWorkout } from '../middlewares/validators/workout.validator.js';

// GET /api/workouts - שליפת כל האימונים (כולם יכולים לראות)
router.get('/', workoutController.getAllWorkouts);

// POST /api/workouts - הוספת אימון חדש (מנהלים בלבד, כולל ולידציה של Joi)
router.post('/', verifyToken, isAdmin, validateWorkout(workoutSchema), workoutController.createWorkout);

// PUT /api/workouts/:id - עריכת אימון קיים (מנהלים בלבד, כולל ולידציה של Joi)
router.put('/:id', verifyToken, isAdmin, validateWorkout(workoutSchema), workoutController.updateWorkout);

// DELETE /api/workouts/:id - מחיקת אימון קיים ושמירת היסטוריית משתמשים (מנהלים בלבד)
router.delete('/:id', verifyToken, isAdmin, workoutController.deleteWorkout);

// POST /api/workouts/:id/register - הרשמה לאימון (משתמשים מחוברים)
router.post('/:id/register', verifyToken, workoutController.registerForWorkout);

export default router;