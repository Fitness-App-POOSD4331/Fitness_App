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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  Id: {
    type: Number,
    unique: true
  }
});

// Auto-increment Id
runSchema.pre('save', async function(next) {
  if (this.isNew && !this.Id) {
    const lastRun = await this.constructor.findOne().sort({ Id: -1 });
    this.Id = lastRun ? lastRun.Id + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Run', runSchema, "Runs");