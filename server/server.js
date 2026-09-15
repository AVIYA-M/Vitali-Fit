const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const authRoutes = require('./routes/authRoutes.js');
app.use('/api/auth', authRoutes);

app.get('/api/status', (req, res) => {
  res.json({ message: 'VitaliFit Server is up and running!' });
});

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

const workoutRoutes = require('./routes/workoutRoutes.js');
const nutritionRoutes = require('./routes/nutritionRoutes.js');

app.use('/api/workouts', workoutRoutes);
app.use('/api/nutrition', nutritionRoutes);