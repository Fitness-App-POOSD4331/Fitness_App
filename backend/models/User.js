const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: [true, 'Please provide a display name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6
  },
  userName: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  // Physical attributes
  weight: {
    type: Number,
    default: 0
  },
  height: {
    type: Number,
    default: 0
  },
  age: {
    type: Number,
    default: 0
  },
  sex: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'male'
  },
  bmi: {
    type: Number,
    default: 0
  },
  // Fitness metrics
  totalDistance: {
    type: Number,
    default: 0
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  // References to other collections
  runs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Run'
  }],
  ID: {
    type: Number,
    unique: true
  }
});

// Auto-increment ID
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.ID) {
    const lastUser = await this.constructor.findOne().sort({ ID: -1 });
    this.ID = lastUser ? lastUser.ID + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('User', userSchema, "Users");