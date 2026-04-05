const Interaction = require("../models/interaction.model");

exports.createInteraction = async (data) => {
  return await Interaction.create(data);
};

exports.getInteractionsByHR = async (hrId) => {
  return await Interaction.find({ hrId }).sort({ createdAt: -1 });
};

exports.getUpcomingFollowUps = async (userHrIds) => {
  return await Interaction.find({
    hrId: { $in: userHrIds },
    nextActionDate: { $gte: new Date() }
  }).sort({ nextActionDate: 1 });
};
