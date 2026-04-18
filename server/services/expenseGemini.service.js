const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL_NAME = "gemini-2.5-flash-preview-04-17";

const buildPrompt = ({ periodLabel, summary, topExpenses, byCategory, dailyTrend }) => {
  return `
You are a practical personal finance coach.
Analyze this spending data and return ONLY strict JSON (no markdown):
{
  "overallSummary": "2-3 line summary in simple language",
  "topLeakages": ["3-5 concrete expense leakages"],
  "savingsSuggestions": ["5 action points to reduce spending"],
  "nextWeekBudgetPlan": {
    "recommendedBudget": number,
    "categoryCaps": [
      { "category": "food", "cap": number },
      { "category": "transport", "cap": number }
    ]
  },
  "riskAlert": "short warning if overspending patterns are visible"
}

Period: ${periodLabel}
Total Spent: ${summary.totalSpent}
Expense Count: ${summary.expenseCount}
Average Daily Spend: ${summary.averagePerDay}
Highest Single Expense: ${summary.highestExpense}

Category Breakdown:
${JSON.stringify(byCategory, null, 2)}

Top Expenses:
${JSON.stringify(topExpenses, null, 2)}

Daily Trend:
${JSON.stringify(dailyTrend, null, 2)}
`.trim();
};

const getExpenseInsightFromGemini = async (payload) => {
  const prompt = buildPrompt(payload);

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const rawText = (response.text || "").trim();
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      overallSummary: parsed.overallSummary || "No summary generated.",
      topLeakages: Array.isArray(parsed.topLeakages) ? parsed.topLeakages : [],
      savingsSuggestions: Array.isArray(parsed.savingsSuggestions)
        ? parsed.savingsSuggestions
        : [],
      nextWeekBudgetPlan: parsed.nextWeekBudgetPlan || {
        recommendedBudget: 0,
        categoryCaps: [],
      },
      riskAlert: parsed.riskAlert || "No major risk alert.",
    };
  } catch (error) {
    console.error("Expense Gemini insight error:", error.message);
    return {
      overallSummary:
        "Spending data available hai, but AI insight abhi generate nahi ho paya.",
      topLeakages: [],
      savingsSuggestions: [
        "Har category ke liye weekly cap set karo.",
        "Daily expense log raat me update karne ki habit banao.",
        "High-value spends pe 24-hour pause rule lagao.",
      ],
      nextWeekBudgetPlan: {
        recommendedBudget: 0,
        categoryCaps: [],
      },
      riskAlert: "AI analysis failed. Please retry.",
    };
  }
};

module.exports = { getExpenseInsightFromGemini };
