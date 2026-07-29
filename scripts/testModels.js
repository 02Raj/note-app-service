require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function list() {
    try {
        const response = await ai.models.list();
        // The new SDK usually returns an iterator or an array
        for await (const model of response) {
            if (model.name.includes("embed") || model.name.includes("flash")) {
                console.log(model.name);
            }
        }
    } catch (e) {
        console.error("Error listing models:", e.message);
    }
}

list();
