const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: [
        "transport",
        "food",
        "groceries",
        "utilities",
        "health",
        "education",
        "entertainment",
        "shopping",
        "rent",
        "other",
      ],
      default: "other",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "netbanking", "other"],
      default: "upi",
    },
  },
  { timestamps: true }
);

expenseSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Expense", expenseSchema);
