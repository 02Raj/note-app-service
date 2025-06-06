// /controllers/dashboard.controller.js

const dashboardService = require("../services/dashboard.service");
const { successResponse, errorResponse } = require("../utils/responseHelper");

const getStats = async (req, res) => {
  try {
    const stats = await dashboardService.getDashboardStats(req.userId);
    successResponse(res, stats, "Dashboard statistics fetched successfully.");
  } catch (error) {
    errorResponse(res, error.message);
  }
};

module.exports = {
  getStats,
};