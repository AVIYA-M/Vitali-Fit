import mongoose from "mongoose";
const nutritionSchema = new mongoose.Schema({

  // המשתמש שאליו שייכת הארוחה
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // שם הארוחה
  mealName: {
    type: String,
    required: true
  },

  // ערכים תזונתיים
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

  // תמונה של הארוחה
  imageUrl: {
    type: String,
    required: false
  }

}, { timestamps: true });

export default mongoose.model('Nutrition', nutritionSchema);