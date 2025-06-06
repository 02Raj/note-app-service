// /services/gemini.service.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { geminiApiKey } = require('../config/env');

const genAI = new GoogleGenerativeAI(geminiApiKey);

async function analyzePreparation(notes) {
  try {
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `
  These are my preparation notes. Based on these notes, analyze my preparation.
  Please tell me:
  - What topics have I already covered?
  - Which important topics are still missing?
  - How can I improve or optimize my preparation strategy further?

  My Notes:
  ${notes}
`;


    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing preparation:', error);
    throw new Error('AI विश्लेषण में त्रुटि हुई।');
  }
}

module.exports = {
  analyzePreparation,
};