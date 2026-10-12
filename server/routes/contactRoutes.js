const express = require('express');

const router = express.Router();

const contactController = require(
    '../controllers/contact.controller'
);

const {
    verifyToken,
    isAdmin
} = require('../middlewares/auth.middleware');

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

module.exports = router;