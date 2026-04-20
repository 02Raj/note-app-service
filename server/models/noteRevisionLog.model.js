const mongoose = require("mongoose");

const noteRevisionLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },
    rating: {
      type: String,
      enum: ["got_it", "shaky", "forgot"],
      default: "got_it",
    },
    durationMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },
    revisedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

noteRevisionLogSchema.index({ userId: 1, revisedAt: -1 });
noteRevisionLogSchema.index({ userId: 1, noteId: 1, revisedAt: -1 });

module.exports = mongoose.model("NoteRevisionLog", noteRevisionLogSchema);
