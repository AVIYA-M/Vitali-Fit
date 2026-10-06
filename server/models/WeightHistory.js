const mongoose = require('mongoose');

const weightHistorySchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  weight: {
    type: Number,
    required: true,
    min: 1
  },

  date: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

module.exports = mongoose.model('WeightHistory', weightHistorySchema);