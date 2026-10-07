const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

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
const reviewRoutes = require('./routes/review.routes');
app.use('/api/reviews', reviewRoutes);

// ========================================
// Routes Imports
// ========================================
const authRoutes = require('./routes/authRoutes.js');
const workoutRoutes = require('./routes/workoutRoutes.js');
const nutritionRoutes = require('./routes/nutritionRoutes.js');
const adminRoutes = require('./routes/userRoutes.js');
const trackingRoutes = require('./routes/trackingRoutes.js');
const activityRoutes = require('./routes/activityRoutes.js');
const weightRoutes = require('./routes/weightRoutes.js');

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
const errorHandler = require('./middlewares/error.middleware');
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