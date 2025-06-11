const {
  createNote,
  getAllNotes,
  getNoteById, // Importing the new service function
  getNotesByTopic,
  getNotesBySubtopic,
  deleteNote,
} = require("../services/notes.service");

const { successResponse, errorResponse } = require("../utils/responseHelper");

/**
 * Controller to create a new note.
 */
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

/**
 * Controller to get all notes for the logged-in user.
 */
const getAll = async (req, res) => {
  try {
    const notes = await getAllNotes(req.userId);
    return successResponse(res, notes, "All notes fetched");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/**
 * Controller to get a single note by its ID.
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await getNoteById(id, req.userId);

    if (!note) {
      return errorResponse(res, "Note not found or unauthorized", 404);
    }

    return successResponse(res, note, "Note fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/**
 * Controller to get notes by topic ID.
 */
const getByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const notes = await getNotesByTopic(topicId, req.userId);
    return successResponse(res, notes, `Notes for topic ${topicId} fetched`);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/**
 * Controller to get notes by subtopic ID.
 */
const getBySubtopic = async (req, res) => {
  try {
    const { subtopicId } = req.params;
    const notes = await getNotesBySubtopic(subtopicId, req.userId);
    return successResponse(res, notes, `Notes for subtopic ${subtopicId} fetched`);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/**
 * Controller to delete a note by its ID.
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteNote(id, req.userId);

    if (!deleted) {
      return errorResponse(res, "Note not found or unauthorized", 404);
    }
    
    return successResponse(res, {}, "Note deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  create,
  getAll,
  getById, // Exporting the new controller function
  getByTopic,
  getBySubtopic,
  remove,
};
