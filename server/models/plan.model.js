const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  topic: { type: String, required: true },
  subtopic: { type: String },
  expectedHours: { type: Number, default: 2 },
  status: {
    type: String,
    enum: ["pending", "completed", "missed"],
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Plan", planSchema);
