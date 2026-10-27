import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { createDayBlocker } from './middlewares/custom.middleware.js';
import { UPLOADS_DIR } from './middlewares/upload.middleware.js';
import errorHandler from './middlewares/error.middleware.js';
import AppError from './utils/AppError.js';

import authRoutes from './routes/authRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import nutritionRoutes from './routes/nutritionRoutes.js';
import adminRoutes from './routes/userRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import weightRoutes from './routes/weightRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// בדיקת משתני סביבה חובה לפני שמתחילים
// ========================================
for (const name of ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL']) {
    if (!process.env[name]) {
        console.error(`❌ חסר ${name} בקובץ .env`);
        process.exit(1);
    }
}

// ========================================
// Middlewares
// ========================================
const allowedOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new AppError('מקור הבקשה אינו מורשה.', 403));
    }
}));

// בדיקת שרת נשארת זמינה גם בזמן חסימת שבת
app.get('/api/status', (req, res) => {
    res.status(200).json({
        message: 'VitaliFit Server is up and running!'
    });
});

app.use(createDayBlocker([6]));

// כדי שהשרת יבין נתונים שנשלחים אליו (כמו קלוריות ומשקל)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({
    extended: true,
    limit: '1mb'
}));

app.use('/uploads', express.static(UPLOADS_DIR));

// ========================================
// חיבור Routes
// ========================================
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);


app.use(express.static(path.join(__dirname, '../client')));

app.use('/api', (req, res, next) => {
    next(new AppError('הנתיב המבוקש לא נמצא.', 404));
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ========================================
// Error Handler
// ========================================
app.use(errorHandler);

// ========================================
// MongoDB + Server Start
// ========================================
mongoose
    .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        retryWrites: true,
        w: 'majority'
    })
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas successfully!');

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`🌐 API: http://localhost:${PORT}/api/status`);
        });
    })
    .catch((err) => {
        console.error('❌ Database connection error:');
        console.error(err);
        process.exit(1);
    });