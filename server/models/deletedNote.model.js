const mongoose = require("mongoose");

const deletedNoteSchema = new mongoose.Schema({
  originalId: { type: mongoose.Schema.Types.ObjectId, required: true },
  data: { type: Object, required: true },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deletedAt: { type: Date, default: Date.now },

  // ⚠️ New Flag
  canRestore: { type: Boolean, default: true },
});

module.exports = mongoose.model("DeletedNote", deletedNoteSchema);
