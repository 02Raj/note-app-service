// --------------------- services/deadline.service.js ---------------------

const Deadline = require("../models/deadline.model");

exports.create = async (data, userId) => {
  const newDeadline = new Deadline({ ...data, userId });
  return await newDeadline.save();
};

exports.getAll = async (userId) => {
  const now = new Date();
  // auto-update missed
  await Deadline.updateMany({ userId, dueDate: { $lt: now }, status: "pending" }, { status: "missed" });
  return await Deadline.find({ userId }).populate("topicId subtopicId").sort({ dueDate: 1 });
};

exports.updateStatus = async (id, status) => {
  const allowed = ["pending", "completed", "missed"];
  if (!allowed.includes(status)) throw new Error("Invalid status");
  return await Deadline.findByIdAndUpdate(id, { status }, { new: true });
};

exports.remove = async (id) => {
  return await Deadline.findByIdAndDelete(id);
};