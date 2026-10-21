import express from 'express';

const router = express.Router();

import * as contactController from 
    '../controllers/contact.controller.js';

import {
    verifyToken,
    isAdmin
} from '../middlewares/auth.middleware.js';

// כל אחת יכולה לשלוח פנייה
router.post(
    '/',
    contactController.createContactMessage
);

// רק מנהל יכול לצפות בפניות
router.get(
    '/admin/all',
    verifyToken,
    isAdmin,
    contactController.getAdminContactMessages
);

export default router;