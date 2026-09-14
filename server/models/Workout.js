const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  instructor: { type: String, required: true },
  maxParticipants: { type: Number, required: true }
},
 { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);