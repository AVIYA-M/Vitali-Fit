import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// Middlewares
// ========================================
app.use(cors());

// שתי השורות האלו קריטיות כדי שהשרת יבין נתונים שנשלחים אליו (כמו קלוריות ומשקל)
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use('/uploads', express.static('uploads'));
import reviewRoutes from './routes/reviewRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);

// ========================================
// Routes Imports
// ========================================
import authRoutes from './routes/authRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import nutritionRoutes from './routes/nutritionRoutes.js';
import adminRoutes from './routes/userRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import weightRoutes from './routes/weightRoutes.js';

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

// ========================================
// בדיקת שרת
// ========================================
app.get('/api/status', (req, res) => {
    res.status(200).json({
        message: 'VitaliFit Server is up and running!'
    });
});

// ========================================
// Error Handler
// ========================================
import errorHandler from './middlewares/error.middleware.js';
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