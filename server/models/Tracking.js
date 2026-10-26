import mongoose from "mongoose";
import {
    MIN_ACTIVITY_DURATION_MINUTES,
    MIN_CALORIES
} from "../constants/index.js";

const trackingSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    workoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workout',
        default: null
    },

    completedAt: {
        type: Date,
        default: Date.now
    },

    durationMinutes: {
        type: Number,
        required: true,
        min: [MIN_ACTIVITY_DURATION_MINUTES, 'משך הפעילות חייב להיות לפחות דקה']
    },

    caloriesBurned: {
        type: Number,
        required: true,
        min: [MIN_CALORIES, 'מספר הקלוריות לא יכול להיות שלילי']
    }

}, {
    timestamps: true
});

export default mongoose.model('Tracking', trackingSchema);
