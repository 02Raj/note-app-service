const mongoose = require("mongoose");

/**
 * Task Template — defines a recurring or one-time task
 * User creates these once; they auto-generate DailyLog entries
 */
const taskTemplateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["skill", "habit", "discipline", "custom"],
      default: "custom",
    },
    isRecurring: {
      type: Boolean,
      default: true, // true = carry forward every day automatically
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    isActive: {
      type: Boolean,
      default: true, // soft delete — deactivate instead of remove
    },
    color: {
      type: String,
      default: "#6366f1", // for UI tagging
    },
  },
  { timestamps: true }
);

/**
 * Daily Log — one document per user per day
 * Auto-generated from active recurring templates + any custom tasks for that day
 */
const dailyLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // stored as "YYYY-MM-DD" for easy querying
      required: true,
    },
    tasks: [
      {
        templateId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TaskTemplate",
          default: null, // null for one-off custom tasks
        },
        title: { type: String, required: true },
        category: {
          type: String,
          enum: ["skill", "habit", "discipline", "custom"],
          default: "custom",
        },
        priority: {
          type: String,
          enum: ["high", "medium", "low"],
          default: "medium",
        },
        isRecurring: { type: Boolean, default: false },
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date, default: null },
        color: { type: String, default: "#6366f1" },
      },
    ],
    // Gemini analysis — generated once per day (on demand or at EOD)
    geminiInsight: {
      thoughtOfTheDay: { type: String, default: null },
      consistencyAnalysis: { type: String, default: null },
      suggestions: [{ type: String }],
      streakMessage: { type: String, default: null },
      generatedAt: { type: Date, default: null },
    },
    // Computed stats (updated on every task toggle)
    stats: {
      total: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 }, // 0–100
    },
    nextDayPlanReady: {
      type: Boolean,
      default: false, // flag: has next day's log been auto-created
    },
  },
  { timestamps: true }
);

// Compound unique index: one log per user per day
dailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

// Auto-compute stats before save
dailyLogSchema.pre("save", function (next) {
  const total = this.tasks.length;
  const completed = this.tasks.filter((t) => t.isCompleted).length;
  this.stats = {
    total,
    completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
  next();
});

const TaskTemplate = mongoose.model("TaskTemplate", taskTemplateSchema);
const DailyLog = mongoose.model("DailyLog", dailyLogSchema);

module.exports = { TaskTemplate, DailyLog };