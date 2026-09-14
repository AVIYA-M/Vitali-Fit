const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mealName: { type: String, required: true },
  calories: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  imageUrl: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model('Nutrition', nutritionSchema);