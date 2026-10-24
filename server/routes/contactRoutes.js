import express from 'express';

import * as contactController from '../controllers/contact.controller.js';

import {
verifyToken,
isAdmin
} from '../middlewares/auth.middleware.js';

import {
contactSchema,
validateContact
} from '../middlewares/validators/contact.validator.js';

const router = express.Router();

// כל אחת יכולה לשלוח פנייה, לאחר בדיקת תקינות הנתונים
router.post(
'/',
validateContact(contactSchema),
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
