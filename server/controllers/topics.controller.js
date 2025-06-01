const Topic = require("../models/topic.model");
const { successResponse, errorResponse } = require("../utils/responseHelper");

const create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return errorResponse(res, "Name field is required", 400);
    }

    const newTopic = new Topic({
      name,
      createdBy: req.userId,   
      createdAt: new Date(),
    });

    const savedTopic = await newTopic.save();

    return successResponse(res, savedTopic, "Topic created successfully", 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// Get all topics
const getAll = async (req, res) => {
  try {
    const topics = await Topic.find({ createdBy: req.userId }).sort({ createdAt: -1 });
    return successResponse(res, topics, "Topics fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Topic.findOneAndDelete({ _id: id, createdBy: req.userId });

    if (!deleted) {
      return errorResponse(res, "Topic not found or not authorized", 404);
    }

    return successResponse(res, {}, "Topic deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = { create, getAll, remove };
