const express = require('express');

const router =
    express.Router();


const weightController =
    require('../controllers/weight.controller.js');


const {
    verifyToken
} =
    require('../middlewares/auth.middleware.js');


// ========================================
// עדכון משקל
// ========================================

router.post(
    '/',
    verifyToken,
    weightController.addWeight
);


// ========================================
// היסטוריית משקל
// ========================================

router.get(
    '/history',
    verifyToken,
    weightController.getWeightHistory
);


module.exports = router;