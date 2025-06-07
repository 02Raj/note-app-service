// /controllers/resource.controller.js
const resourceService = require('../services/resource.service');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded.', 400);
    }
    const { topicId, subtopicId } = req.body;
    const resource = await resourceService.saveResource(req.file, req.userId, topicId, subtopicId);
    successResponse(res, resource, 'Resource uploaded successfully.', 201);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

module.exports = { uploadResource /*, getByTopic, remove */ };