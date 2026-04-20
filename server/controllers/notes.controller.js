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
    const { title, content, topicId, subtopicId, isInterviewRelevant, priority } = req.body;

    if (!title) return errorResponse(res, "Title is required", 400);

    const newNote = await createNote({
      title,
      content,
      topicId: topicId || null,
      subtopicId: subtopicId || null,
      isInterviewRelevant: typeof isInterviewRelevant === "boolean" ? isInterviewRelevant : true,
      priority: ["low", "medium", "high"].includes(priority) ? priority : "medium",
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

const { updateNoteById } = require("../services/notes.service"); // 👈 Import it

/**
 * Controller to update a note by its ID.
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    // req.body se values nikalein
    const { title, content, topicId, subtopicId, isInterviewRelevant, priority } = req.body;

    // --- SOLUTION START ---
    // Yahan check karein ki subtopicId empty to nahi hai.
    // Agar empty hai, to use null set kar dein, kyunki database null value accept kar lega.
    const finalSubtopicId = subtopicId === "" ? null : subtopicId;
    // --- SOLUTION END ---

    // updateNoteById ko cleaned data ke saath call karein
    const payload = {
      title,
      content,
      topicId,
      subtopicId: finalSubtopicId, // Yahan updated variable use karein
    };

    if (typeof isInterviewRelevant === "boolean") {
      payload.isInterviewRelevant = isInterviewRelevant;
    }

    if (["low", "medium", "high"].includes(priority)) {
      payload.priority = priority;
    }

    const updatedNote = await updateNoteById(id, req.userId, payload);

    if (!updatedNote) {
      return errorResponse(res, "Note not found or unauthorized", 404);
    }

    return successResponse(res, updatedNote, "Note updated successfully");
  } catch (error) {
    // Agar ab bhi koi error aata hai to wo yahan dikhega
    return errorResponse(res, error.message);
  }
};

const restoreDeletedNote = async (id, userId) => {
  // NOTE: canRestore flag check
  const deleted = await DeletedNote.findOne({
    originalId: id,
    deletedBy: userId,
    canRestore: true
  });

  if (!deleted) return null;

  // restore to original notes table
  await Note.create(deleted.data);

  // delete from deleted logs
  await DeletedNote.deleteOne({ originalId: id });

  return deleted.data;
};

module.exports = {
  create,
  getAll,
  getById, // Exporting the new controller function
  getByTopic,
  getBySubtopic,
  remove,
  update,
  restoreDeletedNote
};
