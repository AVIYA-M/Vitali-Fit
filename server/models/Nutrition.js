import mongoose from "mongoose";
const nutritionSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  mealName: {
    type: String,
    required: true
  },

  calories: {
    type: Number,
    required: true
  },

  protein: {
    type: Number,
    default: 0
  },

  carbs: {
    type: Number,
    default: 0
  },

  fats: {
    type: Number,
    default: 0
  },

  // תאריך הארוחה
  date: {
    type: Date,
    default: Date.now
  },

  imageUrl: {
    type: String,
    required: false
  }

}, { timestamps: true });

export default mongoose.model('Nutrition', nutritionSchema);
