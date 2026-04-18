const foodLogService = require("../services/foodLog.service");
const { successResponse, errorResponse } = require("../utils/responseHelper");

const createFoodEntry = async (req, res) => {
  try {
    const entry = await foodLogService.addFoodEntry(req.userId, req.body);
    return successResponse(res, entry, "Food entry added successfully", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getFoodEntries = async (req, res) => {
  try {
    const data = await foodLogService.listFoodEntries(req.userId, req.query);
    return successResponse(res, data, "Food entries fetched successfully", 200);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getNutritionSummary = async (req, res) => {
  try {
    const data = await foodLogService.getNutritionSummary(req.userId, req.query);
    return successResponse(res, data, "Nutrition summary fetched successfully", 200);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getNutritionReport = async (req, res) => {
  try {
    const data = await foodLogService.getNutritionReport(req.userId);
    return successResponse(res, data, "Nutrition report fetched successfully", 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getNutritionInsight = async (req, res) => {
  try {
    const data = await foodLogService.getNutritionInsight(req.userId, req.query);
    return successResponse(res, data, "Nutrition AI insight generated successfully", 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createFoodEntry,
  getFoodEntries,
  getNutritionSummary,
  getNutritionReport,
  getNutritionInsight,
};
