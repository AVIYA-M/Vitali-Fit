const express = require('express');
const router = express.Router();
const { registerUser, getUsers } = require('../controllers/userController');

// נתיב להרשמה: POST /api/users/register
router.post('/register', registerUser);

// נתיב לשליפת כל המשתמשים: GET /api/users
router.get('/', getUsers);

module.exports = router;