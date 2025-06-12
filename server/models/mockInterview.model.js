const mongoose = require('mongoose');

// Is sub-schema mein badlaav kiya gaya hai
const feedbackDetailSchema = new mongoose.Schema({
  questionText: String,
  userAnswer: String,
  strengths: [String], // Ise String se [String] kiya (Array of Strings)
  areasForImprovement: [String], // Ise bhi String se [String] kiya
  suggestedAnswer: String
}, {_id: false});

const mockInterviewSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  jobProfile: { 
    type: String, 
    required: true 
  },
  experience: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['InProgress', 'Completed'], 
    default: 'InProgress' 
  },
  questions: [{
    questionText: String,
    userAnswer: { type: String, default: '' }
  }],
  feedback: {
    overallSummary: String,
    detailedFeedback: [feedbackDetailSchema] // Yeh upar wala naya schema use karega
  }
}, { timestamps: true });

const MockInterview = mongoose.model('MockInterview', mockInterviewSchema);
module.exports = MockInterview;