const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", default: null },
  subtopicId: { type: mongoose.Schema.Types.ObjectId, ref: "Subtopic", default: null },
  progressPercent: { type: Number, required: true, min: 0, max: 100 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  updatedAt: { type: Date, default: Date.now },
});

// One progress per user per topic/subtopic
progressSchema.index({ topicId: 1, subtopicId: 1, updatedBy: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
