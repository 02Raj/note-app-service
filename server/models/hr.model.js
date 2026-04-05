const mongoose = require("mongoose");

const hrSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  profileName: {
    type: String,
    required: true
  },

  company: {
    type: String
  },

  roleHiringFor: {
    type: String // e.g. Frontend Developer, Java Backend
  },

  location: {
    type: String
  },

  email: {
    type: String
  },

  phone: {
    type: String
  },

  linkedinUrl: {
    type: String
  },

  address: {
    type: String
  },

  status: {
    type: String,
    enum: ["NEW", "CONTACTED", "RESPONDED", "REJECTED", "HIRED"],
    default: "NEW"
  },

  notes: {
    type: String // free text like: "Polite HR, prefers calls after 6pm"
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("HR", hrSchema);
