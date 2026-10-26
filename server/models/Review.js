import mongoose from 'mongoose';
import { REVIEW_STATUSES } from '../constants/index.js';
const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        default: 'אנונימי'
    },
    text: {
        type: String,
        required: [true, 'יש להזין תוכן להמלצה'],
        trim: true
    },
    status: {
        type: String,
        enum: REVIEW_STATUSES,
        default: 'pending' 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Review', reviewSchema);
