const {
  updateOrCreateProgress,
  getProgressByUser,
} = require("../services/progress.service");

const { successResponse, errorResponse } = require("../utils/responseHelper");

const updateProgress = async (req, res) => {
  try {
    const { topicId, subtopicId, progressPercent } = req.body;

    if (progressPercent === undefined || progressPercent < 0 || progressPercent > 100)
      return errorResponse(res, "Progress must be between 0 and 100", 400);

    const progress = await updateOrCreateProgress({
      topicId,
      subtopicId,
      progressPercent,
      updatedBy: req.userId,
    });

    return successResponse(res, progress, "Progress updated");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getUserProgress = async (req, res) => {
  try {
    const progressList = await getProgressByUser(req.userId);
    return successResponse(res, progressList, "Your progress data");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  updateProgress,
  getUserProgress,
};
