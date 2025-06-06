// /services/revision.service.js

const Note = require("../models/note.model");

// Spaced repetition intervals in days (1 day, 3 days, 7 days, 14 days, 30 days)
const revisionIntervals = [1, 3, 7, 14, 30]; 

/**
 * Gets all notes that are due for revision today or earlier.
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
const getDueRevisionNotes = async (userId) => {
  return await Note.find({
    createdBy: userId,
    revisionDueDate: { $lte: new Date() } // $lte means "less than or equal to"
  }).sort({ revisionDueDate: 'asc' }); // Show the most overdue notes first
};

/**
 * Marks a note as 'revised' and sets the next due date.
 * @param {string} noteId 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const markNoteAsRevised = async (noteId, userId) => {
  // First, find the note and ensure it belongs to the user
  const note = await Note.findOne({ _id: noteId, createdBy: userId });

  if (!note) {
    throw new Error("Note not found or you are not authorized.");
  }

  // Calculate the next revision stage
  const currentStage = note.revisionStage || 0;
  const nextStage = currentStage + 1;

  // Calculate the next due date
  // If we have passed all stages, keep using the last interval
  const daysToAdd = revisionIntervals[Math.min(currentStage, revisionIntervals.length - 1)];
  
  const newDueDate = new Date();
  newDueDate.setDate(newDueDate.getDate() + daysToAdd);

  // Update the note's fields
  note.revisionStage = nextStage;
  note.revisionDueDate = newDueDate;
  note.lastRevisedAt = new Date();

  return await note.save();
};

module.exports = {
  getDueRevisionNotes,
  markNoteAsRevised,
};