import mongoose from 'mongoose';
import { CONTACT_MESSAGE_STATUSES } from '../constants/index.js';

const contactMessageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        maxlength: 254
    },

    subject: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
    },

    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    },

    status: {
        type: String,
        enum: CONTACT_MESSAGE_STATUSES,
        default: 'new'
    }

}, {
    timestamps: true
});

export default mongoose.model('ContactMessage', contactMessageSchema);
