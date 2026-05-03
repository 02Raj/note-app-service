const mongoose = require("mongoose");

const similarProblemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, trim: true, default: "" },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    whySimilar: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const revisionHistorySchema = new mongoose.Schema(
  {
    revisedAt: { type: Date, required: true, default: Date.now },
    confidence: { type: Number, min: 1, max: 4, required: true },
    revisionStage: { type: Number, default: 0, min: 0, max: 4 },
  },
  { _id: false }
);

const dsaProblemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    leetcodeNumber: { type: Number, default: null },
    leetcodeUrl: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    pattern: { type: String, required: true, trim: true },
    subPattern: { type: String, trim: true, default: "" },
    triggerSentence: { type: String, trim: true, default: "" },

    approachUsed: { type: String, trim: true, default: "" },
    keyInsight: { type: String, trim: true, default: "" },
    bruteForce: { type: String, trim: true, default: "" },
    whyOptimal: { type: String, trim: true, default: "" },
    weakPoint: { type: String, trim: true, default: "" },
    revisionNote: { type: String, trim: true, default: "" },
    commonMistakes: [{ type: String, trim: true }],

    code: { type: String, default: "" },
    language: { type: String, trim: true, default: "" },
    timeComplexity: { type: String, trim: true, default: "" },
    spaceComplexity: { type: String, trim: true, default: "" },

    solvedAt: { type: Date, default: Date.now },
    confidence: { type: Number, min: 1, max: 4, required: true },
    revisionStage: { type: Number, default: 0, min: 0, max: 4 },
    nextRevisionDate: { type: Date, required: true, index: true },
    lastRevisedAt: { type: Date, default: null },

    status: {
      type: String,
      enum: ["active", "mastered", "archived"],
      default: "active",
      index: true,
    },

    similarProblems: [similarProblemSchema],
    revisionHistory: [revisionHistorySchema],
  },
  { timestamps: true }
);

dsaProblemSchema.index({ userId: 1, pattern: 1 });
dsaProblemSchema.index({ userId: 1, status: 1, nextRevisionDate: 1 });

module.exports = mongoose.model("DsaProblem", dsaProblemSchema);
