const mongoose = require("mongoose");

const foodEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack", "drink", "other"],
      required: true,
      index: true,
    },
    foodName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 0,
    },
    unit: {
      type: String,
      default: "serving",
      trim: true,
    },
    calories: {
      type: Number,
      default: 0,
      min: 0,
    },
    protein: {
      type: Number,
      default: 0,
      min: 0,
    },
    carbs: {
      type: Number,
      default: 0,
      min: 0,
    },
    fat: {
      type: Number,
      default: 0,
      min: 0,
    },
    fiber: {
      type: Number,
      default: 0,
      min: 0,
    },
    sugar: {
      type: Number,
      default: 0,
      min: 0,
    },
    sodium: {
      type: Number,
      default: 0,
      min: 0,
    },
    isEstimatedByAI: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

foodEntrySchema.index({ userId: 1, date: -1, mealType: 1 });

module.exports = mongoose.model("FoodEntry", foodEntrySchema);
