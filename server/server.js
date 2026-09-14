const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json()); 
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully!');
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
  });


const authRoutes = require('./routes/authRoutes.js');
app.use('/api/auth', authRoutes); 


app.get('/api/status', (req, res) => {
  res.json({ message: 'VitaliFit Server is up and running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});