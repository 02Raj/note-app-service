const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  text: { type: String, default: '' },
  source: { type: String, enum: ['manual', 'ai'], default: 'manual' }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  questionText: String,
  answer: answerSchema,
  notes: { type: String, default: '' },
  elapsedTime: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  feedback: {
    strengths: [String],
    areasForImprovement: [String],
    suggestedAnswer: String
  }
}, { _id: false });

const mockInterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobProfile: { type: String, required: true },
  experience: { type: String, required: true },
  topics: [String],
  questionCount: { type: Number, default: 10 },
  timeLimit: { type: Number, default: 0 },
  customQuestions: [String],
  status: { type: String, enum: ['InProgress', 'Paused', 'Completed'], default: 'InProgress' },
  pausedAt: { type: Date },
  questions: [questionSchema],
  feedback: {
    overallSummary: String,
    detailedFeedback: [questionSchema]
  },
  score: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  finishedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('MockInterview', mockInterviewSchema);
