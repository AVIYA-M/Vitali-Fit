import express from 'express';
const router = express.Router();
import * as weightController from '../controllers/weight.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { weightSchema } from '../middlewares/validators/weight.validator.js';

// הוספת / עדכון משקל (כולל ולידציה של Joi)
router.post('/', verifyToken, validate(weightSchema), weightController.addWeight);

// היסטוריית משקל
router.get('/history', verifyToken, weightController.getWeightHistory);

export default router;
