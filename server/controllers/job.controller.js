const jobService = require("../services/job.service");
const { successResponse, errorResponse } = require("../utils/responseHelper");

const parseJob = async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) return errorResponse(res, "rawText is required", 400);

    const parsedData = await jobService.parseAndPreviewJob(rawText);
    return successResponse(res, parsedData, "Job text parsed successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const createJob = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.rawText) return errorResponse(res, "rawText is required", 400);

    const newJob = await jobService.saveJobApplication(req.userId, payload);
    return successResponse(res, newJob, "Job application saved successfully", 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getMyJobs = async (req, res) => {
  try {
    const jobs = await jobService.getJobsByUser(req.userId);
    return successResponse(res, jobs, "Jobs fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return errorResponse(res, "status is required", 400);

    const updatedJob = await jobService.updateJobStatus(id, req.userId, status);
    if (!updatedJob) return errorResponse(res, "Job not found or unauthorized", 404);

    return successResponse(res, updatedJob, "Job status updated successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  parseJob,
  createJob,
  getMyJobs,
  updateStatus,
};
