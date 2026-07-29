const mongoose = require("mongoose");
const Note = require("../models/note.model");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const { generateEmbedding, deduplicateAndMergeNotes } = require("../utils/ai.util");

/**
 * Perform semantic search using Vector Embeddings
 */
const search = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return errorResponse(res, "Search query is required", 400);
        }

        // Generate embedding for the user's search query
        const queryEmbedding = await generateEmbedding(query);

        // Perform Vector Search
        const notes = await Note.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index", 
                    path: "embedding",
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: 30
                }
            },
            {
                // Filter results to only show the logged-in user's notes
                $match: { createdBy: new mongoose.Types.ObjectId(req.userId) }
            },
            {
                $limit: 5 // Top 5 results
            },
            {
                $project: {
                    title: 1,
                    content: 1,
                    topicId: 1,
                    score: { $meta: "vectorSearchScore" } // Include the similarity score
                }
            }
        ]);

        return successResponse(res, notes, "Semantic search results");
    } catch (error) {
        console.error("Vector Search Error:", error);
        return errorResponse(res, error.message);
    }
};

/**
 * Deduplicate and merge notes of a specific topic
 */
const mergeNotes = async (req, res) => {
    try {
        const { topicId, topicName } = req.body;
        if (!topicId) {
             return errorResponse(res, "topicId is required", 400);
        }
        
        // Find all notes for this topic that belong to the user
        const notes = await Note.find({ topicId, createdBy: req.userId });
        
        if (notes.length === 0) {
            return errorResponse(res, "No notes found for this topic to merge");
        }

        // Prepare content for the AI
        const notesContent = notes.map(n => `Title: ${n.title}\nContent: ${n.content || ""}`);
        
        // Use Gemini to generate a Master Note
        const mergedContent = await deduplicateAndMergeNotes(topicName || "General Topic", notesContent);
        
        return successResponse(res, { mergedContent, sourceNoteIds: notes.map(n => n._id) }, "Notes merged successfully");
    } catch (error) {
         console.error("Merge Notes Error:", error);
         return errorResponse(res, error.message);
    }
};

module.exports = {
    search,
    mergeNotes
};
