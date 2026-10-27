import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { USER_ROLES } from "../constants/index.js";
import Activity from "./Activity.js";
import Nutrition from "./Nutrition.js";
import Review from "./Review.js";
import Tracking from "./Tracking.js";
import WeightHistory from "./WeightHistory.js";
import Workout from "./Workout.js";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: USER_ROLES,
        default: 'user'
    },

    
    weight: {
        type: Number,
        default: null
    }

}, {
    timestamps: true,
    toJSON: {
        // מסירה את הסיסמה מכל תשובת JSON של משתמש.
        transform: (doc, ret) => {
            delete ret.password;
            return ret;
        }
    }
});

// מצפינת את הסיסמה (bcrypt) לפני שמירה, רק אם היא השתנתה.
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);
});

// אחרי מחיקת משתמש: מוחקת את כל הנתונים שלו ומסירה אותו מרשימות הנרשמים לאימונים.
userSchema.post('findOneAndDelete', async function (deletedUser) {
    if (!deletedUser) {
        return;
    }

    const userId = deletedUser._id;
    await Promise.all([
        Activity.deleteMany({ userId }),
        Nutrition.deleteMany({ userId }),
        Review.deleteMany({ userId }),
        Tracking.deleteMany({ userId }),
        WeightHistory.deleteMany({ userId }),
        Workout.updateMany(
            { registeredUsers: userId },
            { $pull: { registeredUsers: userId } }
        )
    ]);
});

export default mongoose.model('User', userSchema);
