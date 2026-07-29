const { GoogleGenAI } = require("@google/genai");

let aiClient = null;

const getAIClient = () => {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("WARNING: GEMINI_API_KEY is not set in environment variables. AI features will fail.");
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
};

/**
 * Generate a vector embedding for a given text
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} Array of 768 numbers representing the embedding
 */
const generateEmbedding = async (text) => {
  try {
    const ai = getAIClient();
    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: text,
      config: {
        outputDimensionality: 768
      }
    });
    
    // The response contains the vector array
    return response.embeddings[0].values;
  } catch (error) {
    console.error("Error generating embedding from Gemini:", error.message);
    throw new Error("Failed to generate embedding");
  }
};

const axios = require("axios");

/**
 * Merge and deduplicate an array of notes into a single optimized note.
 * @param {string} topic - The topic of the notes
 * @param {Array<string>} notesContent - Array of note contents to merge
 * @returns {Promise<string>} The merged content
 */
const deduplicateAndMergeNotes = async (topic, notesContent) => {
    try {
        if (!process.env.OPENROUTER_API_KEY) {
            throw new Error("OPENROUTER_API_KEY is not set in environment variables.");
        }

        const prompt = `
I have multiple notes on the topic: "${topic}". 
These notes might contain duplicate information, conflicting ways of explaining the same concept, or varying levels of difficulty.

Here are the notes:
${notesContent.map((n, i) => `--- NOTE ${i + 1} ---\n${n}\n`).join('\n')}

Your task is to:
1. Read and understand all these notes.
2. Remove any redundant or duplicate information.
3. Merge them into a single, comprehensive, and easy-to-understand "Master Note".
4. Format the output in Markdown. Use headings, bullet points, and code blocks where necessary.
5. Focus on making it optimal for interview preparation (clear, concise, and accurate).

Return ONLY the merged content in Markdown format, do not add conversational text.
        `;

        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            // Using a free and fast Llama 3 model from OpenRouter
            model: "meta-llama/llama-3-8b-instruct:free",
            messages: [{ role: "user", content: prompt }]
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error merging notes with OpenRouter:", error?.response?.data || error.message);
        throw new Error("Failed to merge notes with OpenRouter");
    }
};

module.exports = {
  generateEmbedding,
  deduplicateAndMergeNotes,
};
