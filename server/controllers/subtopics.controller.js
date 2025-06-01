const {
  createSubtopic,
  getAllSubtopics,
  getSubtopicsByTopic,
  deleteSubtopic,
} = require("../services/subtopics.service");

const { successResponse, errorResponse } = require("../utils/responseHelper");

const create = async (req, res) => {
  try {
    const { name, description, topicId } = req.body;

    if (!name) return errorResponse(res, "Name is required", 400);

    const newSubtopic = await createSubtopic({
      name,
      description,
      topicId: topicId || null,
      createdBy: req.userId,
    });

    return successResponse(res, newSubtopic, "Subtopic created successfully", 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getAll = async (req, res) => {
  try {
    const subtopics = await getAllSubtopics(req.userId);
    return successResponse(res, subtopics, "All subtopics fetched");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const subtopics = await getSubtopicsByTopic(topicId, req.userId);
    return successResponse(res, subtopics, `Subtopics for topic ${topicId} fetched`);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteSubtopic(id, req.userId);

    if (!deleted) return errorResponse(res, "Subtopic not found or unauthorized", 404);
    return successResponse(res, {}, "Subtopic deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  create,
  getAll,
  getByTopic,
  remove,
};
