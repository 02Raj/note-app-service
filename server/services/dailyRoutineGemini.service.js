const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Build a human-readable summary of recent logs for Gemini context
 */
const buildContext = ({ currentLog, recentLogs, streak }) => {
  const taskSummary = currentLog.tasks
    .map((t) => `- [${t.isCompleted ? "✓" : "✗"}] ${t.title} (${t.category}, ${t.priority})`)
    .join("\n");

  const historySummary = recentLogs
    .map(
      (l) =>
        `${l.date}: ${l.stats.completed}/${l.stats.total} tasks completed (${l.stats.completionRate}%)`
    )
    .join("\n");

  return `
You are a personal productivity coach analyzing a developer's daily routine tracker.

Current Date Log (${currentLog.date}):
Tasks:
${taskSummary}

Completion: ${currentLog.stats.completed}/${currentLog.stats.total} (${currentLog.stats.completionRate}%)

Last 7 Days History:
${historySummary}

Current Streak: ${streak} day(s)

The user is a developer working on: DSA, Spring Boot, System Design, PostgreSQL, microservices, freelance project bidding, and portfolio building. They struggle with consistency and often get distracted or feel lazy.

Please respond ONLY in the following JSON format (no markdown, no extra text):
{
  "thoughtOfTheDay": "<A short powerful motivational quote or thought — max 2 lines. Scientific or psychological angle preferred>",
  "consistencyAnalysis": "<2-3 sentences analyzing their consistency pattern based on the history. Be honest but kind. Mention the streak.>",
  "suggestions": [
    "<Specific, actionable suggestion 1 — related to their actual tasks>",
    "<Specific, actionable suggestion 2 — about focus or time-blocking>",
    "<Specific, actionable suggestion 3 — about the habit they're missing most>"
  ],
  "streakMessage": "<A short punchy message about their streak — motivate them to maintain or restart it>"
}
`.trim();
};

/**
 * Call Gemini API and return parsed insight object
 */
const getGeminiInsight = async ({ currentLog, recentLogs, streak }) => {
  try {
    const prompt = buildContext({ currentLog, recentLogs, streak });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
    });

    const text = response.text.trim();

    // Strip markdown code blocks if Gemini wraps response
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      thoughtOfTheDay: parsed.thoughtOfTheDay || null,
      consistencyAnalysis: parsed.consistencyAnalysis || null,
      suggestions: parsed.suggestions || [],
      streakMessage: parsed.streakMessage || null,
    };
  } catch (err) {
    console.error("Gemini insight error:", err.message);
    // Fallback if Gemini fails — don't crash the app
    return {
      thoughtOfTheDay: "Every day is a new chance to be better than yesterday.",
      consistencyAnalysis: "Keep pushing — consistency compounds over time.",
      suggestions: [
        "Time-block your DSA session first thing in the morning.",
        "Set a 25-min Pomodoro for Spring Boot study.",
        "Review your pending freelance bids before sleeping.",
      ],
      streakMessage: `You're on a ${streak}-day streak. Don't break the chain!`,
    };
  }
};

module.exports = { getGeminiInsight };