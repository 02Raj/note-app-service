// --------------------- models/deadline.model.js ---------------------

const mongoose = require("mongoose");

const deadlineSchema = new mongoose.Schema({
  title: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: false },
  subtopicId: { type: mongoose.Schema.Types.ObjectId, ref: "Subtopic", required: false },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["pending", "completed", "missed"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Deadline", deadlineSchema);