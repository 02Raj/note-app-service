const Subtopic = require("../models/subtopic.model");

const createSubtopic = async (data) => {
  const subtopic = new Subtopic(data);
  return await subtopic.save();
};

const getAllSubtopics = async (userId) => {
  return await Subtopic.find({ createdBy: userId }).sort({ createdAt: -1 });
};

const getSubtopicsByTopic = async (topicId, userId) => {
  return await Subtopic.find({ topicId, createdBy: userId }).sort({ createdAt: -1 });
};

const deleteSubtopic = async (id, userId) => {
  return await Subtopic.findOneAndDelete({ _id: id, createdBy: userId });
};

module.exports = {
  createSubtopic,
  getAllSubtopics,
  getSubtopicsByTopic,
  deleteSubtopic,
};
