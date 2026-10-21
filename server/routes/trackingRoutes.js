import express from 'express';

const router = express.Router();

import * as trackingController from 
    '../controllers/tracking.controller.js';

import { verifyToken } from 
    '../middlewares/auth.middleware.js';


// GET /api/tracking
// שליפת נתוני לוח המעקב
router.get(
  '/',
  verifyToken,
  trackingController.getTrackingDashboard
);


// POST /api/tracking/:workoutId/complete
// סימון אימון כהושלם
router.post(
  '/:workoutId/complete',
  verifyToken,
  trackingController.completeWorkout
);


export default router;