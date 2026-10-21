import express from 'express';

const router =
    express.Router();

import * as weightController from 
    '../controllers/weight.controller.js';

import { verifyToken } from '../middlewares/auth.middleware.js';
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


export default router;