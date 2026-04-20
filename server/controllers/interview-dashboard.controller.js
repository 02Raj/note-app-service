const interviewDashboardService = require("../services/interview-dashboard.service");
const { successResponse, errorResponse } = require("../utils/responseHelper");

const setupPlan = async (req, res) => {
  try {
    const plan = await interviewDashboardService.upsertPlan(req.userId, req.body);
    const planSnapshot = interviewDashboardService.getPlanSnapshot(plan);
    return successResponse(res, planSnapshot, "Interview prep plan saved successfully");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getOverview = async (req, res) => {
  try {
    const data = await interviewDashboardService.getInterviewOverview(req.userId);
    return successResponse(res, data, "Interview overview fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getNotesDashboard = async (req, res) => {
  try {
    const plan = await interviewDashboardService.getOrCreateDefaultPlan(req.userId);
    const planSnapshot = interviewDashboardService.getPlanSnapshot(plan);
    const data = await interviewDashboardService.getNotesDashboard(req.userId, planSnapshot);
    return successResponse(res, data, "Interview notes dashboard fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getRevisionDashboard = async (req, res) => {
  try {
    const plan = await interviewDashboardService.getOrCreateDefaultPlan(req.userId);
    const planSnapshot = interviewDashboardService.getPlanSnapshot(plan);
    const data = await interviewDashboardService.getRevisionDashboard(req.userId, planSnapshot);
    return successResponse(res, data, "Interview revision dashboard fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getDsaDashboard = async (req, res) => {
  try {
    const plan = await interviewDashboardService.getOrCreateDefaultPlan(req.userId);
    const planSnapshot = interviewDashboardService.getPlanSnapshot(plan);
    const data = await interviewDashboardService.getDsaDashboard(req.userId, planSnapshot);
    return successResponse(res, data, "Interview DSA dashboard fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  setupPlan,
  getOverview,
  getNotesDashboard,
  getRevisionDashboard,
  getDsaDashboard,
};
