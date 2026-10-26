import express from 'express';
const router = express.Router();
import * as contactController from '../controllers/contact.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { contactSchema } from '../middlewares/validators/contact.validator.js';

// כל אחת יכולה לשלוח פנייה, לאחר בדיקת תקינות הנתונים
router.post('/', validate(contactSchema), contactController.createContactMessage);

// רק מנהל יכול לצפות בפניות
router.get('/admin/all', verifyToken, isAdmin, contactController.getAdminContactMessages);

export default router;
