const planService = require("../services/plan.service");
const { successResponse, errorResponse } = require("../utils/responseHelper");

exports.generateSmartPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const { availableHoursPerDay, priorityTopics, numberOfDays } = req.body;

    const days = numberOfDays || 7; // default to 7 if not provided

    const data = await planService.createPlanFromAI(userId, availableHoursPerDay, priorityTopics, days);
    successResponse(res, data, "Smart plan generated successfully");
  } catch (err) {
    errorResponse(res, err);
  }
};


exports.markPlanStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await planService.markStatus(req.params.id, status);
    successResponse(res, updated, "Plan status updated");
  } catch (err) {
    errorResponse(res, err);
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await planService.getUserPlans(req.userId);
    successResponse(res, plans);
  } catch (err) {
    errorResponse(res, err);
  }
};

exports.getPlanProgress = async (req, res) => {
  try {
    const data = await planService.getPlanProgress(req.userId);
    successResponse(res, data);
  } catch (err) {
    errorResponse(res, err);
  }
};
