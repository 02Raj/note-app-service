const Note = require("../models/note.model");

const createNote = async (data) => {
  const note = new Note(data);
  return await note.save();
};

const getAllNotes = async (userId) => {
  return await Note.find({ createdBy: userId }).sort({ createdAt: -1 });
};

const getNotesByTopic = async (topicId, userId) => {
  return await Note.find({ topicId, createdBy: userId }).sort({ createdAt: -1 });
};

const getNotesBySubtopic = async (subtopicId, userId) => {
  return await Note.find({ subtopicId, createdBy: userId }).sort({ createdAt: -1 });
};

const deleteNote = async (id, userId) => {
  return await Note.findOneAndDelete({ _id: id, createdBy: userId });
};

module.exports = {
  createNote,
  getAllNotes,
  getNotesByTopic,
  getNotesBySubtopic,
  deleteNote,
};
