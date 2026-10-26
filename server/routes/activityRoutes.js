import express from 'express';
const router = express.Router();
import * as activityController from '../controllers/activity.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { activitySchema } from '../middlewares/validators/activity.validator.js';

// הוספת פעילות (כולל ולידציה של Joi)
router.post('/', verifyToken, validate(activitySchema), activityController.addActivity);

// קבלת פעילויות
router.get('/', verifyToken, activityController.getUserActivities);

export default router;
