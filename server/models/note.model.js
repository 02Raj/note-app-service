const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", default: null },
  subtopicId: { type: mongoose.Schema.Types.ObjectId, ref: "Subtopic", default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },

  isInterviewRelevant: { type: Boolean, default: true, index: true },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
    index: true,
  },

  lastRevisedAt: { type: Date },
  revisionDueDate: { type: Date, default: Date.now },
  revisionStage: { type: Number, default: 0 },
  skippedCount: { type: Number, default: 0 },
  revisionCount: { type: Number, default: 0 },
  totalRevisionMinutes: { type: Number, default: 0 },
});

module.exports = mongoose.model("Note", noteSchema);
