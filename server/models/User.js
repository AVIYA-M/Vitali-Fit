const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },

  // המשקל הנוכחי של המשתמש
  weight: {
    type: Number,
    required: true,
    min: 1
  },

  // היום שבו המשתמש נשקל בכל שבוע
  // שבת לא נכללת
  weighInDay: {
    type: String,
    enum: [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday'
    ],
    required: true
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, { timestamps: true }); 

module.exports = mongoose.model('User', userSchema);