const resourceService = require('../services/resource.service');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// File Upload karne ke liye
const uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded.', 400);
    }
    const { topicId, subtopicId } = req.body;
    // Assuming your authMiddleware adds user object as req.user
    const resource = await resourceService.saveResource(req.file, req.user.id, topicId, subtopicId);
    successResponse(res, resource, 'Resource uploaded successfully.', 201);
  } catch (error) {
    console.error("Error in uploadResource controller:", error);
    errorResponse(res, error.message);
  }
};

// Ek topic ke saare resources paane ke liye
const getResourcesByTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        // Assuming your authMiddleware adds user object as req.user
        const resources = await resourceService.getResourcesByTopic(topicId, req.user.id);
        successResponse(res, resources, 'Resources fetched successfully.');
    } catch (error) {
        console.error("Error in getResourcesByTopic controller:", error);
        errorResponse(res, error.message);
    }
};

// Ek resource ko delete karne ke liye
const deleteResource = async (req, res) => {
    try {
        const { id } = req.params; // Resource ki ID URL se lenge
        // Assuming your authMiddleware adds user object as req.user
        await resourceService.deleteResource(id, req.user.id);
        successResponse(res, null, 'Resource deleted successfully.');
    } catch (error) {
        console.error("Error in deleteResource controller:", error);
        errorResponse(res, error.message);
    }
};

// Yahaan saare functions ko export karein
module.exports = { 
    uploadResource,
    getResourcesByTopic,
    deleteResource 
};
