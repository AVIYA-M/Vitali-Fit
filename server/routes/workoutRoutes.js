import express from 'express';
const router = express.Router();
import * as workoutController from '../controllers/workout.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { workoutSchema } from '../middlewares/validators/workout.validator.js';
import { idParamSchema } from '../middlewares/validators/common.validator.js';

// GET /api/workouts - שליפת כל האימונים (כולם יכולים לראות)
router.get('/', workoutController.getAllWorkouts);

// POST /api/workouts - הוספת אימון חדש (מנהלים בלבד)
router.post('/', verifyToken, isAdmin, validate(workoutSchema), workoutController.createWorkout);

// PUT /api/workouts/:id - עריכת אימון קיים (מנהלים בלבד)
router.put('/:id', verifyToken, isAdmin, validate(idParamSchema, 'params'), validate(workoutSchema), workoutController.updateWorkout);

// DELETE /api/workouts/:id - מחיקת אימון קיים ושמירת היסטוריית משתמשים (מנהלים בלבד)
router.delete('/:id', verifyToken, isAdmin, validate(idParamSchema, 'params'), workoutController.deleteWorkout);

// POST /api/workouts/:id/register - הרשמה לאימון (משתמשים מחוברים)
router.post('/:id/register', verifyToken, validate(idParamSchema, 'params'), workoutController.registerForWorkout);

export default router;
