const express =
    require('express');

const router =
    express.Router();


const activityController =
    require(
        '../controllers/activity.controller.js'
    );


const {
    verifyToken
} =
    require(
        '../middlewares/auth.middleware.js'
    );


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


module.exports =
    router;