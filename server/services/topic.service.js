const Topic = require("../models/topic.model");

const createTopic = async ({ name, userId }) => {
  const existing = await Topic.findOne({ name, createdBy: userId });
  if (existing) {
    throw new Error("Topic with the same name already exists");
  }

  const topic = new Topic({ name, createdBy: userId });
  await topic.save();
  return topic;
};

const getTopicsByUser = async (userId) => {
  return await Topic.find({ createdBy: userId }).sort({ createdAt: -1 });
};

const deleteTopic = async (id, userId) => {
  const topic = await Topic.findOneAndDelete({ _id: id, createdBy: userId });
  if (!topic) {
    throw new Error("Topic not found or unauthorized");
  }
  return topic;
};

module.exports = {
  createTopic,
  getTopicsByUser,
  deleteTopic
};
