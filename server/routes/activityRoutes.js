import express from 'express';

const router =
    express.Router();

import * as activityController from 
    '../controllers/activity.controller.js';

import {
    verifyToken
} from 
    '../middlewares/auth.middleware.js';


// ========================================
// הוספת פעילות
// ========================================

router.post(
    '/',
    verifyToken,
    activityController.addActivity
);


// ========================================
// קבלת פעילויות
// ========================================

router.get(
    '/',
    verifyToken,
    activityController.getUserActivities
);


export default router;