const Progress = require("../models/progress.model");

const updateOrCreateProgress = async ({ topicId, subtopicId, progressPercent, updatedBy }) => {
  const filter = { topicId: topicId || null, subtopicId: subtopicId || null, updatedBy };
  const update = { progressPercent, updatedAt: new Date() };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };

  return await Progress.findOneAndUpdate(filter, update, options);
};

const getProgressByUser = async (userId) => {
  return await Progress.find({ updatedBy: userId })
    .populate("topicId", "name")
    .populate("subtopicId", "name")
    .sort({ updatedAt: -1 });
};

module.exports = {
  updateOrCreateProgress,
  getProgressByUser,
};
