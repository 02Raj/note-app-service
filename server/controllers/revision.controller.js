const revisionService = require("../services/revision.service");
const { successResponse, errorResponse } = require("../utils/responseHelper");

// GET /api/revisions/due
const getDueNotes = async (req, res) => {
  try {
    const dueNotes = await revisionService.getDueRevisionNotes(req.userId);
    successResponse(res, dueNotes, "Due revision notes fetched successfully.");
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// GET /api/revisions/drill
const getDrill = async (req, res) => {
  try {
    const notes = await revisionService.getDrillNotes(req.userId);
    successResponse(res, notes, "Drill notes fetched successfully.");
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// GET /api/revisions/weak
const getWeakNotes = async (req, res) => {
  try {
    const notes = await revisionService.getWeakNotes(req.userId);
    successResponse(res, notes, "Weak notes fetched successfully.");
  } catch (error) {
    errorResponse(res, error.message);
  }
};

// POST /api/revisions/:id/complete
const markAsRevised = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body; // "got_it" | "shaky" | "forgot"
    const durationMinutes = Number(req.body.durationMinutes || 0);
    const updatedNote = await revisionService.markNoteAsRevised(
      id,
      req.userId,
      rating,
      durationMinutes
    );
    successResponse(res, updatedNote, "Note marked as revised. Next revision scheduled.");
  } catch (error) {
    errorResponse(res, error.message);
  }
};

module.exports = {
  getDueNotes,
  getDrill,
  getWeakNotes,
  markAsRevised,
};