import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import { createDayBlocker } from './middlewares/custom.middleware.js';
import { UPLOADS_DIR } from './middlewares/upload.middleware.js';
import errorHandler from './middlewares/error.middleware.js';

import authRoutes from './routes/authRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import nutritionRoutes from './routes/nutritionRoutes.js';
import adminRoutes from './routes/userRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import weightRoutes from './routes/weightRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// בדיקת משתני סביבה חובה לפני שמתחילים
// ========================================
for (const name of ['MONGO_URI', 'JWT_SECRET']) {
    if (!process.env[name]) {
        console.error(`❌ חסר ${name} בקובץ .env`);
        process.exit(1);
    }
}

// ========================================
// Middlewares
// ========================================
app.use(cors());
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

// ========================================
// בדיקת שרת
// ========================================
app.get('/api/status', (req, res) => {
    res.status(200).json({
        message: 'VitaliFit Server is up and running!'
    });
});

// נתיב API שלא קיים - תשובת JSON במקום דף HTML
app.use('/api', (req, res) => {
    res.status(404).json({ message: 'הנתיב המבוקש לא נמצא.' });
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
