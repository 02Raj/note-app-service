
const mongoose = require('mongoose');
const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number,
  },
  lastActivityTime: { 
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
