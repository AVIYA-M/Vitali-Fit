import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
        enum: ['user', 'admin'],
        default: 'user'
    },

    // משקל נוכחי (ק"ג) - לא מוזן בהרשמה, מתעדכן בלוח המעקב דרך /api/weight
    // בלי השדה הזה mongoose זורק את הערך בשקט ולא שומר אותו
    weight: {
        type: Number,
        default: null
    }

}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            delete ret.password;
            return ret;
        }
    }
});

// הצפנת הסיסמה לפני שמירת משתמש במסד הנתונים
userSchema.pre('save', async function () {
    // אם הסיסמה לא השתנתה, אין צורך להצפין אותה שוב
    if (!this.isModified('password')) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.model('User', userSchema);
