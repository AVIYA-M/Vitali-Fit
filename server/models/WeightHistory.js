import mongoose from "mongoose";
import { MIN_WEIGHT } from "../constants/index.js";
const weightHistorySchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  weight: {
    type: Number,
    required: true,
    min: MIN_WEIGHT
  },

  date: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

export default mongoose.model('WeightHistory', weightHistorySchema);
