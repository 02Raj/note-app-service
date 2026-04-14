const { GoogleGenerativeAI } = require("@google/generative-ai");
const { geminiApiKey } = require('../config/env');

// Common GenerativeAI client
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Model configured to return JSON output
const jsonModel = genAI.getGenerativeModel({
   model: "gemini-2.5-flash-preview-04-17",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

// Model configured to return normal text output
const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Your original function to analyze preparation notes.
 */
async function analyzePreparation(notes) {
  try {
    const prompt = `
      Analyze these preparation notes and provide feedback on covered topics, missing topics, and improvement strategies.
      My Notes: ${notes}
    `;
    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing preparation:', error);
    throw new Error('AI analysis encountered an error.');
  }
}

/**
 * Service class for handling all interactions with Gemini AI.
 */
class GeminiService {
  /**
   * A generic and robust function to get a JSON object from a prompt.
   */
  async generateJson(prompt) {
    let text = '';
    try {
      const result = await jsonModel.generateContent(prompt);
      const response = await result.response;
      text = response.text();

      if (text.startsWith("```json")) {
        text = text.substring(7, text.length - 3).trim();
      }
      text = text.replace(/,\s*([}\]])/g, '$1');

      return JSON.parse(text);
    } catch (error) {
      console.error("Error in Gemini Service (JSON generation):", error);
      console.error("RAW TEXT RECEIVED FROM GEMINI THAT CAUSED ERROR:\n", text);
      throw new Error("Failed to generate JSON content from Gemini AI.");
    }
  }

  /**
   * Analyzes resume text and returns a comprehensive report.
   */
  async generateResumeAnalysis(resumeText) {
    const prompt = `
      You are an expert FAANG career coach. Analyze the following resume text and return a strict JSON object with three keys: "scorecard", "opportunities", "interviewPrep".

      1.  **scorecard**: Contains "atsScore" (number 0-100), "isFaangReady" (boolean), "positivePoints" (array of strings), and "improvementAreas" (array of strings).
      2.  **opportunities**: An array of 3 real, current job openings with "jobTitle", "company", "location", and "applyLink".
      3.  **interviewPrep**: Contains "frequentlyAskedQuestions" (an array of 5 personalized technical and behavioral questions).

      Resume Text:
      ---
      ${resumeText}
      ---
    `;
    return this.generateJson(prompt);
  }

  /**
   * NEW: Analyzes content from a resource (PDF, DOCX, or link) to create smart data.
   * @param {string} resourceText - The text content of the resource.
   * @returns {Promise<object>} A structured JSON object with summary, keywords, and quiz.
   */
  async generateResourceAnalysis(resourceText) {
    const prompt = `
      You are an intelligent learning assistant. Analyze the following text content from a study resource.
      
      Your output MUST be a single, strict JSON object with the keys: "summary", "keywords", and "quiz".
      
      1.  **summary**: (string) A concise, 2-3 sentence summary of the main points.
      2.  **keywords**: (array of strings) 4-5 of the most important keywords or concepts.
      3.  **quiz**: (array of objects) Exactly 3 multiple-choice questions based on the content. Each object must have:
          - "question" (string)
          - "options" (array of 4 strings)
          - "correctAnswer" (string, which must be one of the provided options)

      Here is the content to analyze:
      ---
      ${resourceText}
      ---
    `;
    return this.generateJson(prompt);
  }
}

// Create a single, reusable instance of the service
const geminiService = new GeminiService();

// Export all functionalities
module.exports = {
  analyzePreparation,
  geminiService,
};
