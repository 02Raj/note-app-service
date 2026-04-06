const {
  getDashboard,
  getEODSummary,
  getWeeklyPattern,
  getFocusTask,
  getJobReadinessScore,
} = require("../services/daily-routine-dashboard.service");

const { successResponse, errorResponse } = require("../utils/responseHelper");

const dashboard = async (req, res) => {
  try {
    const data = await getDashboard(req.user.id);
    return successResponse(res, data, "Dashboard fetched", 200);
  } catch (err) {
    return errorResponse(res, err, 500);
  }
};

const eodSummary = async (req, res) => {
  try {
    const data = await getEODSummary(req.user.id);
    return successResponse(res, data, "EOD summary fetched", 200);
  } catch (err) {
    return errorResponse(res, err, 500);
  }
};

const weeklyPattern = async (req, res) => {
  try {
    const data = await getWeeklyPattern(req.user.id);
    return successResponse(res, data, "Weekly pattern fetched", 200);
  } catch (err) {
    return errorResponse(res, err, 500);
  }
};

const focusTask = async (req, res) => {
  try {
    const data = await getFocusTask(req.user.id);
    return successResponse(res, data, "Focus task fetched", 200);
  } catch (err) {
    return errorResponse(res, err, 500);
  }
};

const jobReadiness = async (req, res) => {
  try {
    const data = await getJobReadinessScore(req.user.id);
    return successResponse(res, data, "Job readiness fetched", 200);
  } catch (err) {
    return errorResponse(res, err, 500);
  }
};

module.exports = { dashboard, eodSummary, weeklyPattern, focusTask, jobReadiness };