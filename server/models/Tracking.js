import mongoose from "mongoose";

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
        min: [1, 'משך הפעילות חייב להיות לפחות דקה']
    },

    caloriesBurned: {
        type: Number,
        required: true,
        min: [0, 'מספר הקלוריות לא יכול להיות שלילי']
    }

}, {
    timestamps: true
});

export default mongoose.model('Tracking', trackingSchema);
