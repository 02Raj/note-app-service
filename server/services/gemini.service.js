const { GoogleGenAI } = require("@google/genai");

let aiClient = null;

const getAIClient = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
};

const geminiService = {
  generateJson: async (prompt) => {
    try {
      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
      });
      return JSON.parse(response.text);
    } catch (error) {
      console.error("Error in geminiService.generateJson:", error.message);
      // return empty object or throw based on how it's handled, throwing is safer
      throw new Error("Failed to generate JSON from Gemini");
    }
  },
};

module.exports = {
  geminiService,
};
