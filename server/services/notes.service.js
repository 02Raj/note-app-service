const Note = require("../models/note.model");

/**
 * Creates a new note in the database.
 * @param {object} data - The note data.
 * @returns {Promise<Document>} The saved note document.
 */
const createNote = async (data) => {
  const note = new Note(data);
  return await note.save();
};

/**
 * Retrieves all notes created by a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array<Document>>} A promise that resolves to an array of notes.
 */
const getAllNotes = async (userId) => {
  return await Note.find({ createdBy: userId }).sort({ createdAt: -1 });
};

/**
 * Retrieves a single note by its ID, ensuring it belongs to the user.
 * @param {string} id - The ID of the note.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Document|null>} The note document or null if not found.
 */
const getNoteById = async (id, userId) => {
  return await Note.findOne({ _id: id, createdBy: userId });
};

/**
 * Retrieves all notes for a specific topic, created by a user.
 * @param {string} topicId - The ID of the topic.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array<Document>>} A promise that resolves to an array of notes.
 */
const getNotesByTopic = async (topicId, userId) => {
  return await Note.find({ topicId, createdBy: userId }).sort({ createdAt: -1 });
};

/**
 * Retrieves all notes for a specific subtopic, created by a user.
 * @param {string} subtopicId - The ID of the subtopic.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array<Document>>} A promise that resolves to an array of notes.
 */
const getNotesBySubtopic = async (subtopicId, userId) => {
  return await Note.find({ subtopicId, createdBy: userId }).sort({ createdAt: -1 });
};

/**
 * Deletes a note by its ID.
 * @param {string} id - The ID of the note to delete.
 * @param {string} userId - The ID of the user who created the note.
 * @returns {Promise<Document|null>} The deleted document or null if not found.
 */
const deleteNote = async (id, userId) => {
  return await Note.findOneAndDelete({ _id: id, createdBy: userId });
};

module.exports = {
  createNote,
  getAllNotes,
  getNoteById, // Exporting the new function
  getNotesByTopic,
  getNotesBySubtopic,
  deleteNote,
};
