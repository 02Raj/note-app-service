const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema(
{
  hrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HR",
    required: true
  },

  type: {
    type: String,
    enum: ["CALL", "EMAIL", "WHATSAPP", "LINKEDIN", "INTERVIEW"],
    required: true
  },

  outcome: {
    type: String,
    enum: ["NO_RESPONSE", "POSITIVE", "NEGATIVE", "FOLLOW_UP"],
  },

  description: {
    type: String // "HR asked about notice period"
  },

  nextActionDate: {
    type: Date // follow-up reminder
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("Interaction", interactionSchema);
