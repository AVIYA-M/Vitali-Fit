import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    date: {
        type: Date,
        required: true
    },

    time: {
        type: String,
        required: true,
        trim: true
    },

    instructor: {
        type: String,
        required: true,
        trim: true
    },

    maxParticipants: {
        type: Number,
        required: true,
        min: [1, 'מספר המשתתפים חייב להיות לפחות 1'],
        validate: {
            validator: Number.isInteger,
            message: 'מספר המשתתפים חייב להיות מספר שלם'
        }
    },

    durationMinutes: {
        type: Number,
        required: true,
        min: [1, 'משך האימון חייב להיות לפחות דקה'],
        validate: {
            validator: Number.isInteger,
            message: 'משך האימון חייב להיות מספר שלם'
        }
    },

    estimatedCalories: {
        type: Number,
        required: true,
        min: [0, 'מספר הקלוריות לא יכול להיות שלילי']
    },

    type: {
        type: String,
        default: 'studio',
        trim: true
    },

    category: {
        type: String,
        default: 'general',
        trim: true
    },

    registeredUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]

}, {
    timestamps: true
});

export default mongoose.model('Workout', workoutSchema);

