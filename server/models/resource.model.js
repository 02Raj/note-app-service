// /models/resource.model.js
const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  url: { type: String, required: true }, 
  cloudinary_id: { type: String, required: true },
  fileType: { type: String }, 
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
  subtopicId: { type: mongoose.Schema.Types.ObjectId, ref: "Subtopic" },
}, { timestamps: true });

module.exports = mongoose.model("Resource", resourceSchema);