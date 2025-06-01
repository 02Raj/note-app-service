const mongoose = require("mongoose");

const subtopicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Subtopic", subtopicSchema);
