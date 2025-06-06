// /controllers/gemini.controller.js

const geminiService = require('../services/gemini.service');
const { getAllNotes } = require('../services/notes.service'); // 👈 Import the notes.service
const { successResponse, errorResponse } = require('../utils/responseHelper');

async function trackPreparation(req, res) {
  try {
    // Step 1: Get all of the user's notes from the database
    const userNotes = await getAllNotes(req.userId);

    // If no notes are found, send a specific message
    if (!userNotes || userNotes.length === 0) {
      return successResponse(res, { analysis: "No notes found. Please create some notes to get an analysis." }, "No notes found to analyze");
    }

    // Step 2: Format all notes into a single string
    // We will combine the title and content of each note
    const formattedNotes = userNotes
      .map(note => `Title: ${note.title}\nContent: ${note.content || 'No content provided'}`)
      .join('\n\n---\n\n'); // Separator to distinguish between notes

    // Step 3: Send the formatted notes to the Gemini service for analysis
    const analysis = await geminiService.analyzePreparation(formattedNotes);
    
    successResponse(res, { analysis }, 'Analysis successful.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
}

module.exports = {
  trackPreparation,
};