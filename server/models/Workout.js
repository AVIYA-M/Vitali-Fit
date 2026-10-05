const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  instructor: { type: String, required: true },
  maxParticipants: { type: Number, required: true },

  durationMinutes: { type: Number, required: true },
  estimatedCalories: { type: Number, required: true },

  type: { type: String, default: 'studio' },
  category: { type: String, default: 'general' },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);