const mongoose = require("mongoose");

const interviewPrepPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    targetDate: {
      type: Date,
      required: true,
      index: true,
    },
    targetDays: {
      type: Number,
      required: true,
      min: 7,
      max: 365,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewPrepPlan", interviewPrepPlanSchema);
