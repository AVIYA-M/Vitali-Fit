const express = require('express');

const router = express.Router();

const trackingController =
  require('../controllers/tracking.controller');

const { verifyToken } =
  require('../middlewares/auth.middleware.js');


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


module.exports = router;