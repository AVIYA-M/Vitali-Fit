import mongoose from "mongoose";
import {
  ACTIVITY_TYPES,
  MIN_ACTIVITY_DURATION_MINUTES,
  MIN_CALORIES
} from "../constants/index.js";

const activitySchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  activityType: {
    type: String,
    required: true,
    trim: true,
    enum: ACTIVITY_TYPES
  },

  durationMinutes: {
    type: Number,
    required: true,
    min: MIN_ACTIVITY_DURATION_MINUTES
  },

  caloriesBurned: {
    type: Number,
    required: true,
    min: MIN_CALORIES
  },

  date: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);
