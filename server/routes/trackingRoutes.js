import express from 'express';
const router = express.Router();
import * as trackingController from '../controllers/tracking.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { workoutIdParamSchema } from '../middlewares/validators/common.validator.js';

// GET /api/tracking - שליפת נתוני לוח המעקב
router.get('/', verifyToken, trackingController.getTrackingDashboard);

// GET /api/tracking/completed - מזהי האימונים שהמשתמש כבר סימן כהושלמו
router.get('/completed', verifyToken, trackingController.getCompletedWorkoutIds);

// POST /api/tracking/:workoutId/complete - סימון אימון כהושלם
router.post('/:workoutId/complete', verifyToken, validate(workoutIdParamSchema, 'params'), trackingController.completeWorkout);

export default router;