// --------------------- controllers/deadline.controller.js ---------------------

const deadlineService = require("../services/deadline.service");
const { successResponse, errorResponse } = require("../utils/responseHelper");


exports.createDeadline = async (req, res) => {
  try {
    const data = await deadlineService.create(req.body, req.userId);
    successResponse(res, data, "Deadline created successfully");
  } catch (err) {
    errorResponse(res, err);
  }
};

exports.getDeadlines = async (req, res) => {
  try {
    const data = await deadlineService.getAll(req.userId);
    successResponse(res, data);
  } catch (err) {
    errorResponse(res, err);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const data = await deadlineService.updateStatus(req.params.id, req.body.status);
    successResponse(res, data, "Deadline status updated");
  } catch (err) {
    errorResponse(res, err);
  }
};

exports.deleteDeadline = async (req, res) => {
  try {
    await deadlineService.remove(req.params.id);
    successResponse(res, null, "Deadline deleted");
  } catch (err) {
    errorResponse(res, err);
  }
};