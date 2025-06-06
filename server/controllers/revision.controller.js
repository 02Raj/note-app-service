// /controllers/revision.controller.js

const revisionService = require("../services/revision.service");
const { successResponse, errorResponse } = require("../utils/responseHelper");

const getDueNotes = async (req, res) => {
  try {
    const dueNotes = await revisionService.getDueRevisionNotes(req.userId);
    successResponse(res, dueNotes, "Due revision notes fetched successfully.");
  } catch (error) {
    errorResponse(res, error.message);
  }
};

const markAsRevised = async (req, res) => {
  try {
    const { id } = req.params; // The note's ID will come from the URL
    const updatedNote = await revisionService.markNoteAsRevised(id, req.userId);
    successResponse(res, updatedNote, "Note marked as revised. Next revision scheduled.");
  } catch (error) {
    errorResponse(res, error.message);
  }
};

module.exports = {
  getDueNotes,
  markAsRevised,
};