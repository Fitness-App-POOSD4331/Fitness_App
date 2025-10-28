const mongoose = require('mongoose');

const runSchema = new mongoose.Schema({
  distance: {
    type: Number,
    required: [true, 'Please provide distance'],
    min: 0
  },
  time: {
    type: Number,
    required: [true, 'Please provide time in minutes'],
    min: 0
  },
  averagePace: {
    type: Number,
    required: [true, 'Please provide average pace'],
    min: 0
  },
  caloriesBurned: {
    type: Number,
    required: [true, 'Please provide calories burned'],
    min: 0
  },
  startTime: {
    type: Date,
    required: [true, 'Please provide start time']
  },
  finishTime: {
    type: Date,
    required: [true, 'Please provide finish time']
  },
  // Added description field
  description: {
    type: String,
    trim: true // Optional: removes whitespace from start and end
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Changed Id to ID to match your image data
  ID: {
    type: Number,
    unique: true
  }
});

// Auto-increment ID
// Updated the logic to use 'ID' instead of 'Id'
runSchema.pre('save', async function(next) {
  if (this.isNew && !this.ID) {
    const lastRun = await this.constructor.findOne().sort({ ID: -1 });
    this.ID = lastRun ? lastRun.ID + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Run', runSchema);