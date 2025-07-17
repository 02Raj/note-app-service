
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
  lastActivityTime: { // <-- इसे जोड़ें
    type: Date,
    default: Date.now, // डिफ़ॉल्ट रूप से सेशन स्टार्ट टाइम पर सेट होगा
  }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
