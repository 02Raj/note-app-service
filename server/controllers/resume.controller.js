const resumeService = require('../services/resume.service.js');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Handles the resume analysis request with improved error logging.
 */
const analyzeResume = async (req, res) => {
  console.log("[DEBUG] 0. Request received in analyzeResume controller.");

  try {
    console.log("[DEBUG] 1. Checking for req.file...");

    if (!req.file) {
      console.error("[DEBUG] ERROR: req.file is missing.");
      return errorResponse(res, "No resume file uploaded.", 400);
    }

    console.log("[DEBUG] 2. req.file found. Details:", req.file);
    console.log("[DEBUG] 3. Calling resumeService.analyzeResumeAndGenerateReport...");

    // Call the service to perform the analysis
    const analysisReport = await resumeService.analyzeResumeAndGenerateReport(req.file);
    
    console.log("[DEBUG] 4. Service call successful. Report received from service.");
    console.log("[DEBUG] 5. Sending success response to client.");

    // Send a success response
    return successResponse(res, analysisReport, "Resume analyzed successfully.");

  } catch (error) {
    // Log the detailed error from the service or other operations
    console.error("--- DETAILED CATCH BLOCK ERROR in analyzeResume controller ---");
    console.error(error);
    console.error("----------------------------------------------------------");


    // Send a generic 500 error response to the client
    return errorResponse(res, error.message || "An internal server error occurred.");
  }
};

module.exports = { 
    analyzeResume 
};
