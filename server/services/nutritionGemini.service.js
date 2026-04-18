const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = "gemini-2.5-flash-preview-04-17";

const cleanAndParse = (raw) => {
  const cleaned = (raw || "").replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
};

const estimateNutritionFromText = async ({ foodName, quantity, unit, mealType }) => {
  const prompt = `
Estimate nutrition for this food entry and return ONLY strict JSON:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "sugar": number,
  "sodium": number,
  "confidence": "high|medium|low"
}

Food: ${foodName}
Meal Type: ${mealType}
Quantity: ${quantity} ${unit}

Rules:
- Return realistic values for one entry only.
- Units for macros are grams.
- Sodium unit is milligrams.
- If uncertain, still provide best estimate.
`.trim();

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const parsed = cleanAndParse(response.text || "");

    return {
      calories: Number(parsed.calories) || 0,
      protein: Number(parsed.protein) || 0,
      carbs: Number(parsed.carbs) || 0,
      fat: Number(parsed.fat) || 0,
      fiber: Number(parsed.fiber) || 0,
      sugar: Number(parsed.sugar) || 0,
      sodium: Number(parsed.sodium) || 0,
      confidence: parsed.confidence || "low",
    };
  } catch (error) {
    console.error("Nutrition estimation Gemini error:", error.message);
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      confidence: "low",
    };
  }
};

const generateNutritionInsight = async ({ periodLabel, nutritionSummary, mealConsistency, topFoods, routineSignals }) => {
  const prompt = `
You are an expert nutrition + performance coach.
Analyze the user's nutrition and routine signals and return ONLY strict JSON:
{
  "overallAssessment": "2-3 lines",
  "calorieStatus": "under|balanced|over",
  "proteinStatus": "low|adequate|high",
  "mealConsistencyFeedback": "short text",
  "healthImpactRisks": ["3-5 points"],
  "dailyRoutineImpact": "how food pattern may affect consistency/focus",
  "actionPlan": ["5 practical steps for next 7 days"],
  "recommendedTargets": {
    "dailyCalories": number,
    "dailyProtein": number,
    "dailyWaterLiters": number
  }
}

Period: ${periodLabel}
Nutrition Summary: ${JSON.stringify(nutritionSummary, null, 2)}
Meal Consistency: ${JSON.stringify(mealConsistency, null, 2)}
Top Foods: ${JSON.stringify(topFoods, null, 2)}
Routine Signals: ${JSON.stringify(routineSignals, null, 2)}
`.trim();

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const parsed = cleanAndParse(response.text || "");

    return {
      overallAssessment: parsed.overallAssessment || "No assessment generated.",
      calorieStatus: parsed.calorieStatus || "balanced",
      proteinStatus: parsed.proteinStatus || "adequate",
      mealConsistencyFeedback: parsed.mealConsistencyFeedback || "",
      healthImpactRisks: Array.isArray(parsed.healthImpactRisks) ? parsed.healthImpactRisks : [],
      dailyRoutineImpact: parsed.dailyRoutineImpact || "",
      actionPlan: Array.isArray(parsed.actionPlan) ? parsed.actionPlan : [],
      recommendedTargets: {
        dailyCalories: Number(parsed?.recommendedTargets?.dailyCalories) || 0,
        dailyProtein: Number(parsed?.recommendedTargets?.dailyProtein) || 0,
        dailyWaterLiters: Number(parsed?.recommendedTargets?.dailyWaterLiters) || 0,
      },
    };
  } catch (error) {
    console.error("Nutrition insight Gemini error:", error.message);
    return {
      overallAssessment: "AI insight abhi generate nahi hua, lekin data save ho gaya hai.",
      calorieStatus: "balanced",
      proteinStatus: "adequate",
      mealConsistencyFeedback: "Meal timing and consistency ko track karte raho.",
      healthImpactRisks: [],
      dailyRoutineImpact: "Nutrition consistency routine consistency ko directly affect karti hai.",
      actionPlan: [
        "Breakfast skip mat karo.",
        "Har meal me protein source add karo.",
        "Street food frequency ko cap karo.",
      ],
      recommendedTargets: {
        dailyCalories: 0,
        dailyProtein: 0,
        dailyWaterLiters: 3,
      },
    };
  }
};

module.exports = {
  estimateNutritionFromText,
  generateNutritionInsight,
};
