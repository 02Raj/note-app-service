const mongoose = require('mongoose');

// This sub-schema defines the structure for detailed feedback entries.
const feedbackDetailSchema = new mongoose.Schema({
  questionText: String,
  userAnswer: String,
  strengths: [String],
  areasForImprovement: [String],
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
    detailedFeedback: [feedbackDetailSchema]
  },
  // FIX: Added the score field to the schema.
  score: {
      type: Number,
      default: 0
  }
}, { timestamps: true });

const MockInterview = mongoose.model('MockInterview', mockInterviewSchema);

module.exports = MockInterview;
