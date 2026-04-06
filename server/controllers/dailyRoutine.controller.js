const routineService = require("../services/dailyRoutine.service");
const { successResponse, errorResponse } = require("../utils/responseHelper");

const createTemplate = async (req, res) => {
  try {
    const template = await routineService.createTemplate(req.user.id, req.body);
    return successResponse(res, template, "Template created", 201);
  } catch (err) {
    return errorResponse(res, err, 500);
  }
};

const getTemplates = async (req, res) => {
  try {
    const templates = await routineService.getTemplates(req.user.id);
    return successResponse(res, templates, "Templates fetched", 200);
  } catch (err) {
    return errorResponse(res, err, 500);
  }
};

const updateTemplate = async (req, res) => {
  try {
    const updated = await routineService.updateTemplate(req.user.id, req.params.templateId, req.body);
    if (!updated) return errorResponse(res, "Template not found", 404);
    return successResponse(res, updated, "Template updated", 200);
  } catch (err) {
    return errorResponse(res, err, 500);
  }
};

const deactivateTemplate = async (req, res) => {
  try {
    const updated = await routineService.deactivateTemplate(req.user.id, req.params.templateId);
    if (!updated) return errorResponse(res, "Template not found", 404);
    return successResponse(res, updated, "Template deactivated", 200);
  } catch (err) {
    return errorResponse(res, err, 500);
  }
};

const getTodayLog = async (req, res) => {
  try {
    const log = await routineService.getTodayLog(req.user.id);
    return successResponse(res, log, "Today's log fetched", 200);
  } catch (err) {
    return errorResponse(res, err, 500);
  }
};

const getLogByDate = async (req, res) => {
  try {
    const log = await routineService.getLogByDate(req.user.id, req.params.date);
    if (!log) return errorResponse(res, "No log found for this date", 404);
    return successResponse(res, log, "Log fetched", 200);
  } catch (err) {
    return errorResponse(res, err, 500);
  }
};

const addCustomTask = async (req, res) => {
  try {
    const log = await routineService.addCustomTask(req.user.id, req.body);
    return successResponse(res, log, "Task added", 201);
  } catch (err) {
    return errorResponse(res, err, 500);
  }
};

const toggleTask = async (req, res) => {
  try {
    const { date, taskIndex } = req.params;
    const log = await routineService.toggleTask(req.user.id, date, Number(taskIndex));
    return successResponse(res, log, "Task toggled", 200);
  } catch (err) {
    return errorResponse(res, err, 400);
  }
};

const getRecentLogs = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const logs = await routineService.getRecentLogs(req.user.id, days);
    return successResponse(res, logs, "Recent logs fetched", 200);
  } catch (err) {
    return errorResponse(res, err, 500);
  }
};

const getStreak = async (req, res) => {
  try {
    const streak = await routineService.getStreak(req.user.id);
    return successResponse(res, { streak }, "Streak fetched", 200);
  } catch (err) {
    return errorResponse(res, err, 500);
  }
};

const generateInsight = async (req, res) => {
  try {
    const log = await routineService.generateInsight(req.user.id, req.params.date);
    return successResponse(res, log.geminiInsight, "Insight generated", 200);
  } catch (err) {
    return errorResponse(res, err, 500);
  }
};

module.exports = {
  createTemplate,
  getTemplates,
  updateTemplate,
  deactivateTemplate,
  getTodayLog,
  getLogByDate,
  addCustomTask,
  toggleTask,
  getRecentLogs,
  getStreak,
  generateInsight,
};