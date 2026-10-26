import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  activityType: {
    type: String,
    required: true,
    trim: true
  },

  durationMinutes: {
    type: Number,
    required: true,
    min: 1
  },

  caloriesBurned: {
    type: Number,
    required: true,
    min: 0
  },

  date: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);
