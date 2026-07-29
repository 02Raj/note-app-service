require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testEmbed() {
    try {
        console.log("Testing ai.models.embedContent with gemini-embedding-2 and outputDimensionality...");
        const response = await ai.models.embedContent({
            model: "gemini-embedding-2",
            contents: "Hello world",
            config: {
                outputDimensionality: 768
            }
        });
        console.log("Success! Embedding length:", response.embeddings[0].values.length);
    } catch (e) {
        console.error("Error with embedding:", e.message);
    }
}

testEmbed();
