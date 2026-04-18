const dsaService = require("../services/dsa.service");
const { successResponse, errorResponse } = require("../utils/responseHelper");

const createProblem = async (req, res) => {
  try {
    const { title, leetcodeUrl, pattern, confidence } = req.body;

    if (!title || !leetcodeUrl || !pattern) {
      return errorResponse(res, "title, leetcodeUrl and pattern are required", 400);
    }

    if (confidence && ![1, 2, 3, 4].includes(Number(confidence))) {
      return errorResponse(res, "confidence must be between 1 and 4", 400);
    }

    const data = await dsaService.createProblem(req.userId, req.body);
    return successResponse(res, data, "DSA problem created successfully", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getProblems = async (req, res) => {
  try {
    const data = await dsaService.listProblems(req.userId, req.query);
    return successResponse(res, data, "DSA problems fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getProblem = async (req, res) => {
  try {
    const problem = await dsaService.getProblemById(req.userId, req.params.id);
    if (!problem) {
      return errorResponse(res, "DSA problem not found", 404);
    }

    return successResponse(res, problem, "DSA problem fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const updateProblem = async (req, res) => {
  try {
    const updated = await dsaService.updateProblem(req.userId, req.params.id, req.body);
    if (!updated) {
      return errorResponse(res, "DSA problem not found", 404);
    }

    return successResponse(res, updated, "DSA problem updated successfully");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const deleteProblem = async (req, res) => {
  try {
    const deleted = await dsaService.deleteProblem(req.userId, req.params.id);
    if (!deleted) {
      return errorResponse(res, "DSA problem not found", 404);
    }

    return successResponse(res, {}, "DSA problem deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const reviseProblem = async (req, res) => {
  try {
    const confidence = Number(req.body.confidence);
    if (![1, 2, 3, 4].includes(confidence)) {
      return errorResponse(res, "confidence must be between 1 and 4", 400);
    }

    const data = await dsaService.reviseProblem(req.userId, req.params.id, confidence);
    if (!data) {
      return errorResponse(res, "DSA problem not found", 404);
    }

    return successResponse(res, data, "Revision updated successfully");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getDueToday = async (req, res) => {
  try {
    const data = await dsaService.getDueTodayProblems(req.userId);
    return successResponse(res, data, "Due DSA revisions fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getPatterns = async (req, res) => {
  try {
    const data = await dsaService.getPatternStats(req.userId);
    return successResponse(res, data, "Pattern stats fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getDashboard = async (req, res) => {
  try {
    const data = await dsaService.getDashboard(req.userId);
    return successResponse(res, data, "DSA dashboard fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const analyze = async (req, res) => {
  try {
    const data = await dsaService.analyzeProblemWithAI(req.userId, req.body);
    return successResponse(res, data, "DSA AI analysis generated successfully");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

module.exports = {
  createProblem,
  getProblems,
  getProblem,
  updateProblem,
  deleteProblem,
  reviseProblem,
  getDueToday,
  getPatterns,
  getDashboard,
  analyze,
};
