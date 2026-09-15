const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middlewares בסיסיים
app.use(express.json());
app.use(cors());

// 2. הגדרת כל הראוטים במקום אחד מרוכז
const authRoutes = require('./routes/authRoutes.js');
const workoutRoutes = require('./routes/workoutRoutes.js');
const nutritionRoutes = require('./routes/nutritionRoutes.js');

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/nutrition', nutritionRoutes);

app.get('/api/status', (req, res) => {
  res.json({ message: 'VitaliFit Server is up and running!' });
});

// 3. Global Error Handler - חייב להיות תמיד אחרי כל הראוטים!
const errorHandler = require('./middlewares/error.middleware'); // ודא שהנתיב מדויק אצלך
app.use(errorHandler);

// 4. חיבור למסד הנתונים והפעלת השרת
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
    });
  })
  .catch((err) => {
    console.error('❌ Database connection error:');
    console.error(err);
    process.exit(1);
  });