const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware.js');

router.post('/register', authController.registerUser);

router.post('/login', authController.loginUser);


router.get('/profile', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'ברוך הבא לאזור האישי שלך!',
    user: req.user 
  });
});
router.get('/admin/users', verifyToken, isAdmin, authController.getAllUsers);

module.exports = router;