const axios = require("axios");

const buildJobParsingPrompt = (rawText) => {
  return `
Extract job details into strict JSON:
{"companyName":"str/'Unknown Company'","skillsRequired":["str"],"contactEmail":"str/null","contactPhone":"str/null","workMode":"Remote|Hybrid|Onsite|Unknown"}
Rules: Primary job only. Return ONLY valid JSON, NO markdown.
Text:
${rawText}
`.trim();
};

const parseJobPost = async (rawText) => {
  if (!rawText) return null;
  const prompt = buildJobParsingPrompt(rawText);
  
  if (!process.env.SARVAM_API_KEY) {
    throw new Error("SARVAM_API_KEY is missing in .env");
  }

  try {
    const response = await axios.post(
      "https://api.sarvam.ai/v1/chat/completions",
      {
        model: "sarvam-105b", // Standard Sarvam model
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": process.env.SARVAM_API_KEY,
        },
      }
    );

    let content = response.data.choices[0].message.content;
    // Clean potential markdown formatting
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const result = JSON.parse(content);

    return {
      companyName: result.companyName || "Unknown Company",
      skillsRequired: Array.isArray(result.skillsRequired) ? result.skillsRequired : [],
      contactEmail: result.contactEmail || null,
      contactPhone: result.contactPhone || null,
      workMode: ["Remote", "Hybrid", "Onsite", "Unknown"].includes(result.workMode)
        ? result.workMode
        : "Unknown",
    };
  } catch (error) {
    console.error("Error calling Sarvam API:", error.response?.data || error.message);
    throw new Error("Failed to parse job post using Sarvam API");
  }
};

module.exports = {
  parseJobPost,
};
