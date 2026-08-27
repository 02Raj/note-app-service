const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: "Unknown Company",
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    contactEmail: {
      type: String,
      default: null,
    },
    contactPhone: {
      type: String,
      default: null,
    },
    workMode: {
      type: String,
      enum: ["Remote", "Hybrid", "Onsite", "Unknown"],
      default: "Unknown",
    },
    status: {
      type: String,
      enum: ["Saved", "Applied", "Contacted", "Interviewing", "Rejected", "Offer"],
      default: "Saved",
    },
    rawText: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
