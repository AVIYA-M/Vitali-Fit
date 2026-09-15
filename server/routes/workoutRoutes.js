const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workout.controller');

// GET /api/workouts - שליפת כל האימונים
router.get('/', workoutController.getAllWorkouts);

// POST /api/workouts - הוספת אימון חדש
router.post('/', workoutController.createWorkout);

module.exports = router;