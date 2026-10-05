const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
    required: true
  },

  completedAt: {
    type: Date,
    default: Date.now
  },

  durationMinutes: {
    type: Number,
    required: true
  },

  caloriesBurned: {
    type: Number,
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Tracking', trackingSchema);