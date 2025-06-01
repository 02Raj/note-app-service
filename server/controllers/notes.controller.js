const {
  createNote,
  getAllNotes,
  getNotesByTopic,
  getNotesBySubtopic,
  deleteNote,
} = require("../services/notes.service");

const { successResponse, errorResponse } = require("../utils/responseHelper");

const create = async (req, res) => {
  try {
    const { title, content, topicId, subtopicId } = req.body;

    if (!title) return errorResponse(res, "Title is required", 400);

    const newNote = await createNote({
      title,
      content,
      topicId: topicId || null,
      subtopicId: subtopicId || null,
      createdBy: req.userId,
    });

    return successResponse(res, newNote, "Note created successfully", 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getAll = async (req, res) => {
  try {
    const notes = await getAllNotes(req.userId);
    return successResponse(res, notes, "All notes fetched");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const notes = await getNotesByTopic(topicId, req.userId);
    return successResponse(res, notes, `Notes for topic ${topicId} fetched`);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getBySubtopic = async (req, res) => {
  try {
    const { subtopicId } = req.params;
    const notes = await getNotesBySubtopic(subtopicId, req.userId);
    return successResponse(res, notes, `Notes for subtopic ${subtopicId} fetched`);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteNote(id, req.userId);

    if (!deleted) return errorResponse(res, "Note not found or unauthorized", 404);
    return successResponse(res, {}, "Note deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  create,
  getAll,
  getByTopic,
  getBySubtopic,
  remove,
};
