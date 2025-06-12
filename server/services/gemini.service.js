const { GoogleGenerativeAI } = require("@google/generative-ai");
const { geminiApiKey } = require('../config/env');

// Common GenerativeAI client
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Model configured to return JSON output (for Mock Interview)
const jsonModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

// Model configured to return normal text output (for your older function)
const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Your original function to analyze preparation notes.
 * This uses the textModel.
 */
async function analyzePreparation(notes) {
  try {
    const prompt = `
      These are my preparation notes. Based on these notes, analyze my preparation.
      Please tell me:
      - What topics have I already covered?
      - Which important topics are still missing?
      - How can I improve or optimize my preparation strategy further?

      My Notes:
      ${notes}
    `;

    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();
    return analysis;
  } catch (error) {
    console.error('Error analyzing preparation:', error);
    throw new Error('AI analysis encountered an error.');
  }
}

/**
 * New service class for features requiring structured JSON output.
 * This is essential for the mock interview feature.
 */
class GeminiService {
  async generateJson(prompt) {
    // Declare the text variable outside the try block to make it accessible in the catch block
    let text = '';
    try {
      const result = await jsonModel.generateContent(prompt);
      const response = await result.response;
      text = response.text();

      // Step 1: Clean markdown formatting if present
      if (text.startsWith("```json")) {
        text = text.substring(7, text.length - 3).trim();
      }

      // Step 2: Clean trailing commas which are invalid in strict JSON
      text = text.replace(/,\s*([}\]])/g, '$1');

      return JSON.parse(text);

    } catch (error) {
      console.error("Error in Gemini Service (JSON generation):", error);
      // Log the raw text received from Gemini to make debugging easier
      console.error("RAW TEXT RECEIVED FROM GEMINI THAT CAUSED ERROR:\n", text);
      throw new Error("Failed to generate JSON content from Gemini AI.");
    }
  }
}

// Create a single, reusable instance of the new service
const geminiService = new GeminiService();

// Export both functionalities so they can be used across your application
module.exports = {
  analyzePreparation, // Your original function
  geminiService,      // The new service for the mock interview
};